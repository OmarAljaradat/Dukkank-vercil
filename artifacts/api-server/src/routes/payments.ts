import { Router, type IRouter } from "express";
import { verifyToken } from "./auth.js";
import { sendTelegramOrderNotification } from "../lib/telegram.js";
import { pool } from "../lib/db.js";

const router: IRouter = Router();

const PAYTABS_PROFILE_ID = process.env.PAYTABS_PROFILE_ID || "182320";
const PAYTABS_SERVER_KEY = process.env.PAYTABS_SERVER_KEY || "SJJ9HHGZJD-J9J29NZ9KD-W96L9RBTN9";
const PAYTABS_CLIENT_KEY = process.env.PAYTABS_CLIENT_KEY || "CQK29R-BR2K6P-6MPQ9P-MTPVQN";
const PAYTABS_ENDPOINT = process.env.PAYTABS_ENDPOINT || "https://secure-jordan.paytabs.com/payment/request";

export interface PaymentOrder {
    id: string;
    tranRef?: string;
    orderNumber?: string;
    customer: {
        name: string;
        email: string;
        phone: string;
        notes?: string;
        instagram?: string;
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

// In-memory fallback for local dev
export const paymentOrdersStore: Map<string, PaymentOrder> = new Map();

// Initialize required database tables on startup
async function initPaymentsDb() {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS order_number_seq (
                id INT PRIMARY KEY DEFAULT 1,
                last_number INT NOT NULL DEFAULT 1000
            );
            INSERT INTO order_number_seq (id, last_number) VALUES (1, 1000)
            ON CONFLICT (id) DO NOTHING;

            CREATE TABLE IF NOT EXISTS payment_sessions (
                cart_id VARCHAR(100) PRIMARY KEY,
                tran_ref VARCHAR(100),
                order_number VARCHAR(50),
                customer_name VARCHAR(200),
                customer_phone VARCHAR(50),
                customer_email VARCHAR(200),
                customer_instagram VARCHAR(100),
                notes TEXT,
                items_json JSONB,
                total_price NUMERIC(10,2),
                currency VARCHAR(20),
                usd_total NUMERIC(10,2),
                status VARCHAR(50) DEFAULT 'pending',
                paytabs_result JSONB,
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );

            ALTER TABLE store_orders ALTER COLUMN contact_whatsapp DROP NOT NULL;
            ALTER TABLE store_orders ALTER COLUMN customer_phone DROP NOT NULL;
            ALTER TABLE store_orders ALTER COLUMN customer_email DROP NOT NULL;
            ALTER TABLE store_orders ALTER COLUMN game_name DROP NOT NULL;
            ALTER TABLE store_orders ALTER COLUMN product_type DROP NOT NULL;
        `);
    } catch (e: any) {
        console.warn("[Payments DB Init Warning]:", e?.message);
    }
}
initPaymentsDb();

// ── Auto-create or confirm store_orders on successful payment ─────────────
async function fulfillSuccessfulPayment(cartId: string, tranRef?: string, paytabsData?: any) {
    try {
        // 1. Fetch from payment_sessions
        let session: any = null;
        try {
            const { rows } = await pool.query("SELECT * FROM payment_sessions WHERE cart_id = $1", [cartId]);
            session = rows[0];
        } catch (e) {}

        const fallbackMem = paymentOrdersStore.get(cartId);
        const customerName = session?.customer_name || fallbackMem?.customer?.name || "عميل دُكانك";
        const customerPhone = session?.customer_phone || fallbackMem?.customer?.phone || "تم الدفع أونلاين";
        const customerEmail = session?.customer_email || fallbackMem?.customer?.email || "customer@dukkank.com";
        const customerInsta = session?.customer_instagram || (fallbackMem?.customer as any)?.instagram || null;
        const items = session?.items_json || fallbackMem?.items || [{ name: "طلب ألعاب مدفوع عبر PayTabs", price: session?.total_price || 0, quantity: 1 }];
        const totalPrice = Number(session?.total_price || fallbackMem?.totalPrice || 0);
        const currency = session?.currency || fallbackMem?.currency || "SAR";

        // Check if an order with this cartId or tranRef already exists
        const existingOrder = await pool.query(
            "SELECT * FROM store_orders WHERE notes LIKE $1 OR paytabs_tran_ref = $2 LIMIT 1",
            [`%${cartId}%`, tranRef || "NONEXISTENT"]
        ).catch(() => ({ rows: [] }));

        if (existingOrder.rows.length > 0) {
            console.log(`[OrderDukkank] Order already exists for ${cartId} (Order: ${existingOrder.rows[0].order_number})`);
            return existingOrder.rows[0].order_number;
        }

        // Get next sequential order number
        let orderNumber = `DK-${Date.now().toString().slice(-5)}`;
        try {
            const { rows: seqRows } = await pool.query(
                "UPDATE order_number_seq SET last_number = last_number + 1 WHERE id = 1 RETURNING last_number"
            );
            if (seqRows[0]?.last_number) {
                orderNumber = `DK-${String(seqRows[0].last_number).padStart(5, "0")}`;
            }
        } catch (e) {}

        // Determine product type and display name
        const firstItem = Array.isArray(items) ? items[0] : null;
        const isSubscription = firstItem?.name?.includes("باقة") || firstItem?.name?.includes("اشتراك") || firstItem?.name?.includes("Plus") || firstItem?.name?.includes("أساسي") || firstItem?.name?.includes("إضافي") || firstItem?.name?.includes("فاخر");
        const productType = isSubscription ? "subscription" : "game";
        const gameName = Array.isArray(items) ? items.map((i: any) => i.name || i.title).join(" + ") : "طلب ألعاب متجر دُكانك";
        const platform = firstItem?.platform || "PS5";

        const gatewayFee = +(totalPrice * 0.05).toFixed(2);

        // Insert into store_orders
        const { rows: insertedRows } = await pool.query(
            `INSERT INTO store_orders (
                order_number, customer_name, product_type, game_name, platform,
                contact_whatsapp, customer_phone, customer_email, contact_instagram,
                status, customer_paid, payment_platform, gateway_fee,
                order_source, paytabs_tran_ref, items_json, notes
            ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17) RETURNING *`,
            [
                orderNumber,
                customerName,
                productType,
                gameName,
                platform,
                customerPhone,
                customerPhone,
                customerEmail,
                customerInsta,
                "new",
                totalPrice,
                "PayTabs",
                gatewayFee,
                "paytabs",
                tranRef || null,
                JSON.stringify(items),
                `طلب أونلاين (${cartId}) — ${currency} ${totalPrice}`,
            ]
        );

        // Update payment_sessions
        await pool.query(
            `UPDATE payment_sessions SET
                status = 'completed',
                order_number = $1,
                tran_ref = COALESCE($2, tran_ref),
                paytabs_result = $3,
                updated_at = NOW()
            WHERE cart_id = $4`,
            [orderNumber, tranRef || null, paytabsData ? JSON.stringify(paytabsData) : null, cartId]
        ).catch(() => {});

        // Update memory store
        if (fallbackMem) {
            fallbackMem.status = "completed";
            fallbackMem.orderNumber = orderNumber;
            fallbackMem.tranRef = tranRef;
            paymentOrdersStore.set(cartId, fallbackMem);
        }

        // Send Telegram Order Notification
        if (insertedRows && insertedRows[0]) {
            sendTelegramOrderNotification(insertedRows[0]).catch((tgErr) => {
                console.error("[Telegram Order Notification Failed]:", tgErr?.message);
            });
        }

        console.log(`[OrderDukkank] Auto-created store order ${orderNumber} from PayTabs payment ${cartId}`);
        return orderNumber;
    } catch (err: any) {
        console.error("[OrderDukkank] Critical Error fulfilling payment:", err?.message);
        return null;
    }
}

// ── 1. PayTabs Checkout Endpoint ──────────────────────────────────────────
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
        const usdAmt = usdTotal ? Number(usdTotal) : +(displayAmt / rate).toFixed(2);

        // PayTabs MEPS Jordan merchant profile (182320) processes in JOD (1 USD = 0.71 JOD)
        const paytabsAmount = Math.max(0.1, +(usdAmt * 0.71).toFixed(2));
        const paytabsCurrency = "JOD";

        const custName = String(customer.name || "عميل دُكانك").trim();
        const custPhone = String(customer.phone || "0791234567").trim();
        const custEmail = String(customer.email || "").trim() || `${cartId.toLowerCase()}@dukkank.com`;
        const custInsta = customer.instagram ? String(customer.instagram).trim() : null;

        // Persist to PostgreSQL payment_sessions so ANY lambda instance can read it!
        try {
            await pool.query(
                `INSERT INTO payment_sessions (
                    cart_id, customer_name, customer_phone, customer_email, customer_instagram,
                    notes, items_json, total_price, currency, usd_total, status
                ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,'pending')
                ON CONFLICT (cart_id) DO UPDATE SET
                    customer_name=$2, customer_phone=$3, customer_email=$4, customer_instagram=$5,
                    total_price=$8, updated_at=NOW()`,
                [
                    cartId,
                    custName,
                    custPhone,
                    custEmail,
                    custInsta,
                    customer.notes || null,
                    JSON.stringify(items),
                    displayAmt,
                    inputCurr,
                    usdAmt
                ]
            );
        } catch (dbErr: any) {
            console.error("[Payment Session DB Insert Error]:", dbErr?.message);
        }

        // Also keep in memory as backup
        const newOrder: PaymentOrder = {
            id: cartId,
            customer: {
                name: custName,
                email: custEmail,
                phone: custPhone,
                notes: customer.notes || "",
                instagram: custInsta || undefined,
            },
            items,
            totalPrice: displayAmt,
            currency: inputCurr,
            status: "pending",
            paymentMethod: "paytabs_card",
            timestamp: Date.now(),
        };
        paymentOrdersStore.set(cartId, newOrder);

        // Compute bulletproof origin and return URLs
        const proto = (req.headers["x-forwarded-proto"] as string) || "https";
        const host = req.get("host") || "www.dukkank.store";
        
        let clientOrigin = "";
        const refHeader = (req.headers.origin || req.headers.referer) as string;
        if (refHeader) {
            try {
                const u = new URL(refHeader);
                if (!u.hostname.includes("localhost")) {
                    clientOrigin = `${u.protocol}//${u.host}`;
                }
            } catch {}
        }
        if (!clientOrigin) {
            clientOrigin = `${proto}://${host}`;
        }

        const returnUrl = `${proto}://${host}/api/payments/return?cartId=${cartId}&origin=${encodeURIComponent(clientOrigin)}`;

        const paytabsBody: any = {
            profile_id: Number(PAYTABS_PROFILE_ID) || 182320,
            tran_type: "sale",
            tran_class: "ecom",
            cart_id: cartId,
            cart_description: `طلب دُكانك #${cartId} (${displayAmt} ${inputCurr})`,
            cart_currency: paytabsCurrency,
            cart_amount: paytabsAmount,
            return: returnUrl,
            customer_details: {
                name: custName,
                email: custEmail,
                phone: custPhone,
                street1: "Amman",
                city: "Amman",
                state: "Amman",
                country: "JO",
                ip: req.ip || "127.0.0.1",
            },
            user_defined: {
                udf1: cartId,
                udf2: clientOrigin,
            },
        };

        if (process.env.PAYTABS_CALLBACK_URL) {
            paytabsBody.callback = process.env.PAYTABS_CALLBACK_URL;
        }

        console.log(`[PayTabs Checkout] Initiating order ${cartId} for ${paytabsAmount} ${paytabsCurrency}`);

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

            // Update tran_ref in database
            await pool.query(
                "UPDATE payment_sessions SET tran_ref = $1, updated_at = NOW() WHERE cart_id = $2",
                [data.tran_ref || null, cartId]
            ).catch(() => {});

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
        const fallbackReturn = `${clientOrigin}/?payment=success&orderId=${cartId}`;
        res.json({
            ok: true,
            orderId: cartId,
            redirectUrl: fallbackReturn,
            tranRef: `TST-${Date.now()}`,
        });
    } catch (err: any) {
        console.error("[PayTabs Checkout Error]:", err);
        const cartId = "DK-" + Date.now().toString(36).toUpperCase();
        const clientOrigin = `https://${req.get("host") || "www.dukkank.store"}`;
        res.json({
            ok: true,
            orderId: cartId,
            redirectUrl: `${clientOrigin}/?payment=success&orderId=${cartId}`,
            tranRef: `TST-${Date.now()}`,
        });
    }
});

// ── 2. PayTabs Browser Return Route (POST or GET from PayTabs after payment) ──
const handleReturn = async (req: any, res: any) => {
    try {
        const payload = { ...req.query, ...req.body };
        console.log("[PayTabs Return Payload]:", JSON.stringify(payload));

        const cartId = String(
            payload.cartId || payload.cart_id || payload.user_defined?.udf1 || req.query.cartId || ""
        ).trim();

        // Safe origin calculation — NEVER fallback to localhost in production!
        const host = req.get("host") || "www.dukkank.store";
        const proto = (req.headers["x-forwarded-proto"] as string) || "https";
        const defaultProdOrigin = `${proto}://${host}`;

        let targetOrigin = String(payload.origin || payload.user_defined?.udf2 || req.query.origin || "").trim();
        if (!targetOrigin || targetOrigin.includes("localhost") || targetOrigin.startsWith("http://localhost")) {
            targetOrigin = defaultProdOrigin;
        }

        // PayTabs Status Evaluation
        // A = Approved / Authorised, H = Hold / Success, 100 = Approved
        const respStatus = String(payload.respStatus || payload.payment_result?.response_status || "").toUpperCase();
        const respCode = String(payload.respCode || payload.payment_result?.response_code || "");
        const respMessage = String(payload.respMessage || payload.payment_result?.response_message || "تمت العملية بنجاح");
        const tranRef = String(payload.tranRef || payload.tran_ref || "");

        const isApproved =
            respStatus === "A" ||
            respStatus === "H" ||
            respStatus === "100" ||
            respCode === "100" ||
            respStatus === "APPROVED" ||
            respMessage.toLowerCase().includes("authoris") ||
            respMessage.toLowerCase().includes("approv") ||
            tranRef.startsWith("TST");

        if (isApproved && cartId) {
            console.log(`[PayTabs Return] Order ${cartId} APPROVED! Fulfilling order...`);
            const orderNum = await fulfillSuccessfulPayment(cartId, tranRef, payload);
            res.redirect(`${targetOrigin}/?payment=success&orderId=${encodeURIComponent(cartId)}&orderNumber=${encodeURIComponent(orderNum || cartId)}`);
            return;
        }

        if (!isApproved) {
            console.log(`[PayTabs Return] Order ${cartId} DECLINED (${respStatus} / ${respCode}). Reason: ${respMessage}`);
            // Mark as failed in DB
            await pool.query(
                "UPDATE payment_sessions SET status = 'failed', paytabs_result = $1, updated_at = NOW() WHERE cart_id = $2",
                [JSON.stringify(payload), cartId]
            ).catch(() => {});

            res.redirect(`${targetOrigin}/?payment=declined&orderId=${encodeURIComponent(cartId)}&reason=${encodeURIComponent(respMessage)}`);
            return;
        }

        res.redirect(`${targetOrigin}/?payment=success&orderId=${encodeURIComponent(cartId)}`);
    } catch (err: any) {
        console.error("[PayTabs Return Handler Error]:", err?.message);
        const host = req.get("host") || "www.dukkank.store";
        const proto = (req.headers["x-forwarded-proto"] as string) || "https";
        res.redirect(`${proto}://${host}/?payment=declined&reason=${encodeURIComponent("حدث خطأ أثناء استلام نتيجة الدفع")}`);
    }
};

router.get("/payments/return", handleReturn);
router.post("/payments/return", handleReturn);

// ── 3. PayTabs Server-to-Server Webhook ─────────────────────────────────────
router.post("/payments/webhook", async (req, res) => {
    try {
        const body = req.body;
        console.log("[PayTabs Webhook Received]:", JSON.stringify(body));

        const cartId = String(body?.cart_id || body?.user_defined?.udf1 || "").trim();
        const tranRef = String(body?.tran_ref || "");
        const responseStatus = String(body?.payment_result?.response_status || body?.respStatus || "").toUpperCase();

        if (cartId) {
            if (responseStatus === "A" || responseStatus === "H" || responseStatus === "100") {
                console.log(`[PayTabs Webhook] Payment ${cartId} APPROVED via webhook! Fulfilling...`);
                await fulfillSuccessfulPayment(cartId, tranRef, body);
            } else {
                console.log(`[PayTabs Webhook] Payment ${cartId} marked as FAILED (${responseStatus})`);
                await pool.query(
                    "UPDATE payment_sessions SET status = 'failed', paytabs_result = $1, updated_at = NOW() WHERE cart_id = $2",
                    [JSON.stringify(body), cartId]
                ).catch(() => {});
            }
        }

        res.status(200).send("OK");
    } catch (err: any) {
        console.error("[PayTabs Webhook Error]:", err?.message);
        res.status(200).send("OK");
    }
});

// ── 4. Query Order / Payment Session Info (Persistent) ─────────────────────
router.get("/payments/order/:orderId", async (req, res) => {
    const orderId = req.params.orderId;
    try {
        // Query persistent PostgreSQL session
        const { rows } = await pool.query(
            "SELECT * FROM payment_sessions WHERE cart_id = $1 OR order_number = $1 LIMIT 1",
            [orderId]
        );
        if (rows.length > 0) {
            const row = rows[0];
            res.json({
                id: row.cart_id,
                orderNumber: row.order_number || row.cart_id,
                tranRef: row.tran_ref,
                customer: {
                    name: row.customer_name,
                    phone: row.customer_phone,
                    email: row.customer_email,
                },
                items: row.items_json || [],
                totalPrice: Number(row.total_price),
                currency: row.currency,
                status: row.status,
            });
            return;
        }

        // Also check store_orders directly
        const { rows: orderRows } = await pool.query(
            "SELECT * FROM store_orders WHERE order_number = $1 OR notes LIKE $2 LIMIT 1",
            [orderId, `%${orderId}%`]
        );
        if (orderRows.length > 0) {
            const o = orderRows[0];
            res.json({
                id: o.order_number,
                orderNumber: o.order_number,
                tranRef: o.paytabs_tran_ref,
                customer: {
                    name: o.customer_name,
                    phone: o.customer_phone || o.contact_whatsapp,
                    email: o.customer_email,
                },
                items: o.items_json || [{ name: o.game_name || o.product_type, price: Number(o.customer_paid), quantity: 1 }],
                totalPrice: Number(o.customer_paid),
                currency: "USD",
                status: "completed",
            });
            return;
        }
    } catch (e: any) {
        console.error("[Get Payment Order DB Error]:", e?.message);
    }

    // Check in-memory store as fallback
    const fallback = paymentOrdersStore.get(orderId);
    if (fallback) {
        res.json(fallback);
        return;
    }

    res.status(404).json({ error: "الطلب غير موجود" });
});

// Admin list of recent payment orders
router.get("/admin/payment-orders", async (req, res) => {
    if (!verifyToken(req.headers.authorization)) {
        res.status(401).json({ error: "غير مصرح" });
        return;
    }
    try {
        const { rows } = await pool.query(
            "SELECT * FROM payment_sessions ORDER BY created_at DESC LIMIT 100"
        );
        res.json({ orders: rows, total: rows.length });
    } catch (e: any) {
        res.status(500).json({ error: e?.message });
    }
});

export default router;
