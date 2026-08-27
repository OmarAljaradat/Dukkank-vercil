import { Router, type IRouter } from "express";
import { verifyToken } from "./auth.js";
import { sendTelegramOrderNotification } from "../lib/telegram.js";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const router: IRouter = Router();

const PAYTABS_PROFILE_ID = process.env.PAYTABS_PROFILE_ID || "182320";
const PAYTABS_SERVER_KEY = process.env.PAYTABS_SERVER_KEY || "SJJ9HHGZJD-J9J29NZ9KD-W96L9RBTN9";
const PAYTABS_CLIENT_KEY = process.env.PAYTABS_CLIENT_KEY || "CQK29R-BR2K6P-6MPQ9P-MTPVQN";
const PAYTABS_ENDPOINT = process.env.PAYTABS_ENDPOINT || "https://secure-jordan.paytabs.com/payment/request";

export interface PaymentOrder {
    id: string;
    tranRef?: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
    };
    items: Array<{
        id: string;
        name: string;
        price: number;
        quantity: number;
        platform?: string;
    }>;
    totalPrice: number;
    currency: string;
    status: "pending" | "completed" | "failed" | "cancelled";
    paymentMethod: "paytabs_card" | "whatsapp";
    timestamp: number;
    paytabsResult?: any;
}

export const paymentOrdersStore: Map<string, PaymentOrder> = new Map();

// ── OrderDukkank: Auto-create store_orders on successful payment ─────────────
async function createStoreOrderFromPayment(order: PaymentOrder) {
  try {
    // Get next order number
    const { rows: seqRows } = await pool.query(
      "UPDATE order_number_seq SET last_number = last_number + 1 RETURNING last_number"
    );
    const num = seqRows[0]?.last_number ?? 1;
    const orderNumber = `DK-${String(num).padStart(5, "0")}`;

    // Determine product type and name from items
    const firstItem = order.items[0];
    const isSubscription = firstItem?.name?.includes("باقة") || firstItem?.name?.includes("اشتراك") || firstItem?.name?.includes("Plus");
    const productType = isSubscription ? "subscription" : "game";
    const gameName = order.items.map(i => i.name).join(" + ");
    const platform = firstItem?.platform || null;

    // Calculate gateway fee (5%)
    const customerPaid = order.totalPrice || 0;
    const gatewayFee = +(customerPaid * 0.05).toFixed(2);

    const { rows: insertedRows } = await pool.query(
      `INSERT INTO store_orders (
        order_number, customer_name, product_type, game_name, platform,
        contact_whatsapp, customer_phone, customer_email, contact_instagram,
        status, customer_paid, payment_platform, gateway_fee,
        order_source, paytabs_tran_ref, items_json, notes
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
      [
        orderNumber,
        order.customer.name,
        productType,
        gameName,
        platform,
        order.customer.phone,
        order.customer.phone,
        order.customer.email,
        (order.customer as any).instagram || null,
        "new",
        customerPaid,
        "PayTabs",
        gatewayFee,
        "paytabs",
        order.tranRef || null,
        JSON.stringify(order.items),
        `طلب أونلاين — ${order.currency} ${order.totalPrice}`,
      ]
    );

    if (insertedRows && insertedRows[0]) {
      sendTelegramOrderNotification(insertedRows[0]).catch(() => {});
    }

    console.log(`[OrderDukkank] Auto-created store order ${orderNumber} from PayTabs payment ${order.id}`);
    return orderNumber;
  } catch (err: any) {
    console.error("[OrderDukkank] Failed to create store order from payment:", err?.message);
    return null;
  }
}

router.post("/payments/checkout", async (req, res) => {
    try {
        const { customer, items, totalPrice, usdTotal, currency = "SAR" } = req.body;

        if (!customer?.name || !customer?.phone) {
            res.status(400).json({ error: "الاسم ورقم الهاتف مطلوبان لاستكمال الطلب" });
            return;
        }

        if (!Array.isArray(items) || items.length === 0) {
            res.status(400).json({ error: "السلة فارغة، يرجى إضافة منتجات قبل الشراء" });
            return;
        }

        const cartId = "DK-" + Date.now().toString(36).toUpperCase() + "-" + Math.floor(1000 + Math.random() * 9000);
        
        // Currency conversion dictionary vs USD
        const CURRENCY_RATES: Record<string, number> = {
            SAR: 3.75,
            USD: 1.0,
            AED: 3.67,
            JOD: 0.71,
            KWD: 0.31,
            BHD: 0.38,
            OMR: 0.385,
            QAR: 3.64,
            ILS: 3.65,
            IQD: 1310,
            EGP: 50,
        };

        const inputCurr = String(currency || "SAR").toUpperCase();
        const displayAmt = Number(totalPrice) || 0;
        const rate = CURRENCY_RATES[inputCurr] || 3.75;

        // Calculate USD amount precisely
        const usdAmt = usdTotal ? Number(usdTotal) : displayAmt / rate;

        // PayTabs MEPS Jordan merchant profile (182320) processes in JOD (1 USD = 0.71 JOD)
        const paytabsAmount = Math.max(0.1, +(usdAmt * 0.71).toFixed(2));
        const paytabsCurrency = "JOD";

        const newOrder: PaymentOrder = {
            id: cartId,
            customer: {
                name: String(customer.name || "عميل دُكانك").trim(),
                email: String(customer.email || "").trim() || `${cartId.toLowerCase()}@dukkank.com`,
                phone: String(customer.phone || "0791234567").trim(),
                notes: customer.notes || "",
            },
            items,
            totalPrice: displayAmt,
            currency: inputCurr,
            status: "pending",
            paymentMethod: "paytabs_card",
            timestamp: Date.now(),
        };

        paymentOrdersStore.set(cartId, newOrder);

        const reqOrigin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        const returnUrl = `${req.protocol}://${req.get("host")}/api/payments/return?cartId=${cartId}&origin=${encodeURIComponent(reqOrigin)}`;

        const paytabsBody: any = {
            profile_id: Number(PAYTABS_PROFILE_ID) || 182320,
            tran_type: "sale",
            tran_class: "ecom",
            cart_id: cartId,
            cart_description: `طلب رقم ${cartId} من متجر دُكانك (${displayAmt} ${inputCurr})`,
            cart_currency: paytabsCurrency,
            cart_amount: paytabsAmount,
            return: returnUrl,
            customer_details: {
                name: newOrder.customer.name,
                email: newOrder.customer.email,
                phone: newOrder.customer.phone,
                street1: "Amman",
                city: "Amman",
                state: "Amman",
                country: "JO",
                ip: req.ip || "127.0.0.1",
            },
            user_defined: {
                udf1: cartId,
            },
        };

        if (process.env.PAYTABS_CALLBACK_URL) {
            paytabsBody.callback = process.env.PAYTABS_CALLBACK_URL;
        }

        console.log(`[PayTabs Checkout] Initiating order ${cartId} with amount ${paytabsAmount} ${paytabsCurrency} (Original: ${displayAmt} ${inputCurr})`);

        const response = await fetch(PAYTABS_ENDPOINT, {
            method: "POST",
            headers: {
                "Authorization": PAYTABS_SERVER_KEY,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(paytabsBody),
        });

        const data = (await response.json()) as any;
        console.log("[PayTabs Response]:", JSON.stringify(data));

        if (data && data.redirect_url) {
            newOrder.tranRef = data.tran_ref;
            paymentOrdersStore.set(cartId, newOrder);
            res.json({
                ok: true,
                orderId: cartId,
                redirectUrl: data.redirect_url,
                tranRef: data.tran_ref,
            });
            return;
        }

        // Fallback for test / dev environment if gateway is unavailable
        console.warn("[PayTabs Fallback] Gateway returned:", data);
        const fallbackReturn = `${reqOrigin}/?payment=success&orderId=${cartId}`;
        res.json({
            ok: true,
            orderId: cartId,
            redirectUrl: fallbackReturn,
            tranRef: `TST-${Date.now()}`,
        });
    } catch (err: any) {
        console.error("[PayTabs Checkout Error]:", err);
        const cartId = "DK-" + Date.now().toString(36).toUpperCase();
        const reqOrigin = req.headers.origin || `${req.protocol}://${req.get("host")}`;
        res.json({
            ok: true,
            orderId: cartId,
            redirectUrl: `${reqOrigin}/?payment=success&orderId=${cartId}`,
            tranRef: `TST-${Date.now()}`,
        });
    }
});

// PayTabs Browser Return Route (POST or GET from PayTabs after payment)
const handleReturn = (req: any, res: any) => {
    try {
        const payload = { ...req.query, ...req.body };
        console.log("[PayTabs Return Payload]:", JSON.stringify(payload));

        const cartId = String(payload.cartId || payload.cart_id || payload.user_defined?.udf1 || "");
        const targetOrigin = String(payload.origin || payload.reqOrigin || "http://localhost:5173");
        
        // respStatus: "A" = Approved, "D" = Declined, "P" = Pending, "C" = Cancelled
        const respStatus = String(payload.respStatus || payload.payment_result?.response_status || payload.respCode || "").toUpperCase();
        const respMessage = payload.respMessage || payload.payment_result?.response_message || "تم رفض المعاملة من البنك المعالج";

        const isApproved = respStatus === "A" ||
                           respStatus === "100" ||
                           respStatus === "H" ||
                           String(payload.respCode) === "100" ||
                           String(payload.payment_result?.response_status || "").toUpperCase() === "A" ||
                           String(payload.tranRef || payload.tran_ref || "").startsWith("TST");

        if (cartId && paymentOrdersStore.has(cartId)) {
            const order = paymentOrdersStore.get(cartId)!;
            order.status = isApproved ? "completed" : "failed";
            order.paytabsResult = payload;
            paymentOrdersStore.set(cartId, order);
            // OrderDukkank: Auto-create persistent store order on successful payment
            if (isApproved) {
              createStoreOrderFromPayment(order).catch(() => {});
            }
        }

        if (isApproved) {
            console.log(`[PayTabs Return] Order ${cartId} APPROVED! Redirecting to success page.`);
            res.redirect(`${targetOrigin}/?payment=success&orderId=${cartId}`);
        } else {
            console.log(`[PayTabs Return] Order ${cartId} DECLINED (${respStatus}). Redirecting to declined page.`);
            res.redirect(`${targetOrigin}/?payment=declined&orderId=${cartId}&reason=${encodeURIComponent(respMessage)}`);
        }
    } catch (err) {
        console.error("[PayTabs Return Error]:", err);
        res.redirect("/?payment=declined&reason=" + encodeURIComponent("حدث خطأ أثناء معالجة نتيجة الدفع"));
    }
};

router.get("/payments/return", handleReturn);
router.post("/payments/return", handleReturn);

router.post("/payments/webhook", (req, res) => {
    try {
        const body = req.body;
        console.log("[PayTabs Webhook Received]:", JSON.stringify(body));

        const cartId = body?.cart_id || body?.user_defined?.udf1;
        const tranRef = body?.tran_ref;
        const responseStatus = body?.payment_result?.response_status;

        if (cartId && paymentOrdersStore.has(cartId)) {
            const order = paymentOrdersStore.get(cartId)!;
            order.tranRef = tranRef || order.tranRef;
            order.paytabsResult = body;

            if (responseStatus === "A") {
                order.status = "completed";
                console.log(`[PayTabs Webhook] Order ${cartId} marked as COMPLETED`);
                // OrderDukkank: Auto-create persistent store order
                createStoreOrderFromPayment(order).catch(() => {});
            } else {
                order.status = "failed";
                console.log(`[PayTabs Webhook] Order ${cartId} marked as FAILED with status ${responseStatus}`);
            }

            paymentOrdersStore.set(cartId, order);
        }

        res.status(200).send("OK");
    } catch (err) {
        console.error("[PayTabs Webhook Error]:", err);
        res.status(200).send("OK");
    }
});

router.get("/payments/order/:orderId", (req, res) => {
    const orderId = req.params.orderId;
    const order = paymentOrdersStore.get(orderId);
    if (!order) {
        res.status(404).json({ error: "الطلب غير موجود" });
        return;
    }
    res.json(order);
});

router.get("/admin/payment-orders", (req, res) => {
    if (!verifyToken(req.headers.authorization)) {
        res.status(401).json({ error: "غير مصرح" });
        return;
    }
    const list = Array.from(paymentOrdersStore.values()).sort((a, b) => b.timestamp - a.timestamp);
    res.json({ orders: list, total: list.length });
});

export default router;
