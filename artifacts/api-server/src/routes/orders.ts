import { Router, type IRouter } from "express";
import { verifyToken } from "./auth.js";
import { requireAdmin, dbSave, dbLoad } from "../lib/storeDb.js";
import { sendTelegramOrderNotification, getTelegramConfig, saveTelegramConfig, sendTelegramMessage } from "../lib/telegram.js";
import pg from "pg";

const router: IRouter = Router();
const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

export interface StoreOrder {
  id: number | string;
  order_number: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  product_type: string;
  game_name?: string;
  subscription_type?: string;
  subscription_duration?: string;
  contact_instagram?: string;
  contact_whatsapp?: string;
  account_email?: string;
  account_credentials?: string;
  platform?: string;
  notes?: string;
  status: string;
  customer_paid: number;
  payment_platform?: string;
  gateway_fee?: number;
  cost_price?: number;
  supplier?: string;
  supplier_id?: number | string;
  supplier_forwarded_at?: string;
  account_received_at?: string;
  delivered_at?: string;
  completed_at?: string;
  order_source?: string;
  paytabs_tran_ref?: string;
  items_json?: any;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: number | string;
  name: string;
  phone: string;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

// In-memory fallback stores
export let storeOrders: StoreOrder[] = [
  {
    id: "ord-sample-1",
    order_number: "ORD-1001",
    customer_name: "عمر الجرادات",
    customer_phone: "962790000000",
    customer_email: "omar@example.com",
    product_type: "game",
    game_name: "Grand Theft Auto V",
    platform: "PS5",
    status: "completed",
    customer_paid: 25.0,
    payment_platform: "PayTabs",
    cost_price: 15.0,
    supplier: "مورد الألعاب الرئيسي",
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date().toISOString()
  }
];

export let suppliers: Supplier[] = [
  {
    id: 1,
    name: "مورد الألعاب الرقمية المعتمد",
    phone: "966500000000",
    notes: "تسليم فوري لحسابات بلايستيشن",
    is_active: true,
    created_at: new Date().toISOString()
  }
];

async function initDb() {
  if (!pool) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS suppliers (
        id SERIAL PRIMARY KEY,
        name VARCHAR(200) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        notes TEXT,
        is_active BOOLEAN DEFAULT true,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE TABLE IF NOT EXISTS store_orders (
        id SERIAL PRIMARY KEY,
        order_number VARCHAR(50) UNIQUE NOT NULL,
        customer_name VARCHAR(200) NOT NULL,
        customer_phone VARCHAR(50),
        customer_email VARCHAR(200),
        product_type VARCHAR(100) NOT NULL,
        game_name VARCHAR(200),
        subscription_type VARCHAR(100),
        subscription_duration VARCHAR(50),
        contact_instagram VARCHAR(100),
        contact_whatsapp VARCHAR(100),
        account_email VARCHAR(200),
        account_credentials TEXT,
        platform VARCHAR(50),
        notes TEXT,
        status VARCHAR(50) DEFAULT 'new',
        customer_paid NUMERIC(10,2) DEFAULT 0,
        payment_platform VARCHAR(50),
        gateway_fee NUMERIC(10,2) DEFAULT 0,
        cost_price NUMERIC(10,2) DEFAULT 0,
        supplier VARCHAR(200),
        supplier_id INTEGER,
        supplier_forwarded_at TIMESTAMPTZ,
        account_received_at TIMESTAMPTZ,
        delivered_at TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        order_source VARCHAR(30) DEFAULT 'manual',
        paytabs_tran_ref VARCHAR(100),
        items_json JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);

    const migrations = [
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS customer_phone VARCHAR(50)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS customer_email VARCHAR(200)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS subscription_duration VARCHAR(50)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS contact_instagram VARCHAR(100)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS contact_whatsapp VARCHAR(100)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS account_email VARCHAR(200)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS account_credentials TEXT",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS platform VARCHAR(50)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS notes TEXT",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS payment_platform VARCHAR(50)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS gateway_fee NUMERIC(10,2) DEFAULT 0",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS cost_price NUMERIC(10,2) DEFAULT 0",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS supplier VARCHAR(200)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS supplier_id INTEGER",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS supplier_forwarded_at TIMESTAMPTZ",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS account_received_at TIMESTAMPTZ",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS order_source VARCHAR(30) DEFAULT 'manual'",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS paytabs_tran_ref VARCHAR(100)",
      "ALTER TABLE store_orders ADD COLUMN IF NOT EXISTS items_json JSONB",
    ];

    for (const m of migrations) {
      try {
        await pool.query(m);
      } catch (_) {}
    }
  } catch (e) {
    console.warn("DB init warning:", (e as any)?.message);
  }
}
initDb();

// ══════════════════════════════════════════════════════════════════════════════
// ── Store Orders CRUD ────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/store-orders", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  if (pool) {
    try {
      const { rows } = await pool.query("SELECT * FROM store_orders ORDER BY created_at DESC");
      res.json(rows);
      return;
    } catch (e) {}
  }
  res.json(storeOrders);
});

router.post("/admin/store-orders", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const body = req.body || {};
  const orderNum = body.order_number || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

  if (pool) {
    try {
      const { rows } = await pool.query(
        `INSERT INTO store_orders (
          order_number, customer_name, customer_phone, customer_email, product_type,
          game_name, subscription_type, subscription_duration, contact_instagram,
          contact_whatsapp, account_email, account_credentials, platform, notes,
          status, customer_paid, payment_platform, gateway_fee, cost_price, supplier,
          supplier_id, order_source, paytabs_tran_ref, items_json
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24) RETURNING *`,
        [
          orderNum, body.customer_name || "عميل", body.customer_phone || null, body.customer_email || null,
          body.product_type || "game", body.game_name || null, body.subscription_type || null,
          body.subscription_duration || null, body.contact_instagram || null, body.contact_whatsapp || null,
          body.account_email || null, body.account_credentials || null, body.platform || null,
          body.notes || null, body.status || "new", Number(body.customer_paid) || 0,
          body.payment_platform || null, Number(body.gateway_fee) || 0, Number(body.cost_price) || 0,
          body.supplier || null, body.supplier_id || null, body.order_source || "manual",
          body.paytabs_tran_ref || null, body.items_json ? JSON.stringify(body.items_json) : null
        ]
      );
      if (rows && rows[0]) {
        await sendTelegramOrderNotification(rows[0]).catch((err) => console.error("Telegram error:", err));
        res.status(201).json(rows[0]);
        return;
      }
    } catch (e: any) {
      console.error("DB insert error in store-orders:", e?.message);
    }
  }

  const newOrder: StoreOrder = {
    id: `ord-${Date.now()}`,
    order_number: orderNum,
    customer_name: body.customer_name || "عميل",
    customer_phone: body.customer_phone,
    customer_email: body.customer_email,
    product_type: body.product_type || "game",
    game_name: body.game_name,
    subscription_type: body.subscription_type,
    subscription_duration: body.subscription_duration,
    contact_instagram: body.contact_instagram,
    contact_whatsapp: body.contact_whatsapp,
    account_email: body.account_email,
    account_credentials: body.account_credentials,
    platform: body.platform,
    notes: body.notes,
    status: body.status || "new",
    customer_paid: Number(body.customer_paid) || 0,
    payment_platform: body.payment_platform,
    gateway_fee: Number(body.gateway_fee) || 0,
    cost_price: Number(body.cost_price) || 0,
    supplier: body.supplier,
    supplier_id: body.supplier_id,
    order_source: body.order_source || "manual",
    paytabs_tran_ref: body.paytabs_tran_ref,
    items_json: body.items_json,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
  storeOrders.unshift(newOrder);
  res.status(201).json(newOrder);
});

router.put("/admin/store-orders/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const body = req.body || {};

  if (pool) {
    try {
      const { rows } = await pool.query(
        `UPDATE store_orders SET
          customer_name=COALESCE($1,customer_name),
          status=COALESCE($2,status),
          notes=COALESCE($3,notes),
          cost_price=COALESCE($4,cost_price),
          account_credentials=COALESCE($5,account_credentials),
          updated_at=NOW()
         WHERE id=$6 OR order_number=$6 RETURNING *`,
        [body.customer_name, body.status, body.notes, body.cost_price, body.account_credentials, id]
      );
      if (rows.length > 0) { res.json(rows[0]); return; }
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx === -1) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  Object.assign(storeOrders[idx], body, { updated_at: new Date().toISOString() });
  res.json(storeOrders[idx]);
});

router.delete("/admin/store-orders/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;

  if (pool) {
    try {
      await pool.query("DELETE FROM store_orders WHERE id=$1 OR order_number=$1", [id]);
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx !== -1) storeOrders.splice(idx, 1);
  res.json({ ok: true });
});

// ── Order Workflow Actions ───────────────────────────────────────────────────

router.put("/admin/store-orders/:id/forward-supplier", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const { supplier_id, cost_price } = req.body || {};
  const now = new Date().toISOString();

  if (pool) {
    try {
      const { rows } = await pool.query(
        `UPDATE store_orders SET status='supplier_sent', supplier_id=$1, cost_price=COALESCE($2,cost_price),
         supplier_forwarded_at=NOW(), updated_at=NOW() WHERE id=$3 OR order_number=$3 RETURNING *`,
        [supplier_id || null, cost_price || null, id]
      );
      if (rows.length > 0) { res.json(rows[0]); return; }
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx === -1) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  storeOrders[idx].status = "supplier_sent";
  if (supplier_id !== undefined) storeOrders[idx].supplier_id = supplier_id;
  if (cost_price !== undefined) storeOrders[idx].cost_price = Number(cost_price);
  storeOrders[idx].supplier_forwarded_at = now;
  storeOrders[idx].updated_at = now;
  res.json(storeOrders[idx]);
});

router.put("/admin/store-orders/:id/receive-account", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const { account_credentials, cost_price } = req.body || {};
  const now = new Date().toISOString();

  if (pool) {
    try {
      const { rows } = await pool.query(
        `UPDATE store_orders SET status='account_received', account_credentials=$1, cost_price=COALESCE($2,cost_price),
         account_received_at=NOW(), updated_at=NOW() WHERE id=$3 OR order_number=$3 RETURNING *`,
        [account_credentials || null, cost_price || null, id]
      );
      if (rows.length > 0) { res.json(rows[0]); return; }
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx === -1) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  storeOrders[idx].status = "account_received";
  if (account_credentials) storeOrders[idx].account_credentials = account_credentials;
  if (cost_price !== undefined) storeOrders[idx].cost_price = Number(cost_price);
  storeOrders[idx].account_received_at = now;
  storeOrders[idx].updated_at = now;
  res.json(storeOrders[idx]);
});

router.put("/admin/store-orders/:id/deliver", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const now = new Date().toISOString();

  if (pool) {
    try {
      const { rows } = await pool.query(
        `UPDATE store_orders SET status='delivered', delivered_at=NOW(), updated_at=NOW() WHERE id=$1 OR order_number=$1 RETURNING *`,
        [id]
      );
      if (rows.length > 0) { res.json(rows[0]); return; }
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx === -1) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  storeOrders[idx].status = "delivered";
  storeOrders[idx].delivered_at = now;
  storeOrders[idx].updated_at = now;
  res.json(storeOrders[idx]);
});

router.put("/admin/store-orders/:id/complete", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const now = new Date().toISOString();

  if (pool) {
    try {
      const { rows } = await pool.query(
        `UPDATE store_orders SET status='completed', completed_at=NOW(), updated_at=NOW() WHERE id=$1 OR order_number=$1 RETURNING *`,
        [id]
      );
      if (rows.length > 0) { res.json(rows[0]); return; }
    } catch (e) {}
  }

  const idx = storeOrders.findIndex(o => String(o.id) === String(id) || o.order_number === String(id));
  if (idx === -1) { res.status(404).json({ error: "الطلب غير موجود" }); return; }
  storeOrders[idx].status = "completed";
  storeOrders[idx].completed_at = now;
  storeOrders[idx].updated_at = now;
  res.json(storeOrders[idx]);
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Suppliers CRUD ───────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/suppliers", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = await dbLoad("suppliers", suppliers);
  res.json(Array.isArray(list) ? list : suppliers);
});

router.post("/admin/suppliers", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const { name, phone, notes } = req.body || {};
  if (!name || !phone) { res.status(400).json({ error: "اسم المورد ورقم الهاتف مطلوبان" }); return; }

  const list = await dbLoad("suppliers", suppliers);
  const arr = Array.isArray(list) ? [...list] : [...suppliers];

  const newSupplier: Supplier = {
    id: Date.now(),
    name: String(name).trim(),
    phone: String(phone).trim(),
    notes: notes ? String(notes).trim() : undefined,
    is_active: true,
    created_at: new Date().toISOString()
  };
  arr.unshift(newSupplier);
  await dbSave("suppliers", arr);
  res.status(201).json(newSupplier);
});

router.put("/admin/suppliers/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;
  const { name, phone, notes, is_active } = req.body || {};

  const list = await dbLoad("suppliers", suppliers);
  const arr = Array.isArray(list) ? [...list] : [...suppliers];

  const idx = arr.findIndex(s => String(s.id) === String(id));
  if (idx === -1) { res.status(404).json({ error: "المورد غير موجود" }); return; }

  arr[idx] = {
    ...arr[idx],
    ...(name !== undefined ? { name: String(name).trim() } : {}),
    ...(phone !== undefined ? { phone: String(phone).trim() } : {}),
    ...(notes !== undefined ? { notes: notes ? String(notes).trim() : undefined } : {}),
    ...(is_active !== undefined ? { is_active: !!is_active } : {})
  };
  await dbSave("suppliers", arr);
  res.json(arr[idx]);
});

router.delete("/admin/suppliers/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const id = req.params.id;

  const list = await dbLoad("suppliers", suppliers);
  const arr = Array.isArray(list) ? [...list] : [...suppliers];
  const next = arr.filter(s => String(s.id) !== String(id));
  await dbSave("suppliers", next);
  res.json({ ok: true });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Customer Profile ─────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/customer-profile/:phone", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const phone = req.params.phone;

  const matchingOrders = storeOrders.filter(
    o => o.customer_phone === phone || o.contact_whatsapp === phone
  );
  const totalSpent = matchingOrders.reduce((sum, o) => sum + (Number(o.customer_paid) || 0), 0);

  res.json({
    customer: {
      phone,
      name: matchingOrders[0]?.customer_name || "عميل دُكانك",
      email: matchingOrders[0]?.customer_email || ""
    },
    orders: matchingOrders,
    stats: {
      totalOrders: matchingOrders.length,
      totalSpent,
      completedOrders: matchingOrders.filter(o => o.status === "completed" || o.status === "delivered").length
    }
  });
});

// ══════════════════════════════════════════════════════════════════════════════
// ── Telegram Bot Configuration & Test ─────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

router.get("/admin/telegram/config", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const cfg = await getTelegramConfig();
  res.json({
    enabled: cfg.enabled,
    botToken: cfg.botToken ? `${cfg.botToken.slice(0, 6)}...${cfg.botToken.slice(-4)}` : "",
    hasToken: !!cfg.botToken,
    chatId: cfg.chatId,
  });
});

router.put("/admin/telegram/config", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const updated = await saveTelegramConfig(req.body || {});
  res.json({
    enabled: updated.enabled,
    botToken: updated.botToken ? `${updated.botToken.slice(0, 6)}...${updated.botToken.slice(-4)}` : "",
    hasToken: !!updated.botToken,
    chatId: updated.chatId,
  });
});

router.post("/admin/telegram/test", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const testMsg = `🎮 <b>اختبار إشعارات دُكانك عبر التيليجرام</b> 🚀\n\n✅ تم ربط البوت بنجاح مع لوحة التحكم!\n⏰ التاريخ: ${new Date().toLocaleString("ar-JO")}\n\nستصلك إشعارات الطلبات الجديدة هنا مباشرة مع أزرار التحويل الفوري ⚡`;
  const result: any = await sendTelegramMessage(testMsg, [
    [{ text: "🛍️ فتح المتجر", url: "https://www.dukkank.store" }],
    [{ text: "📦 إدارة الطلبات", url: "https://www.dukkank.store/admin/orders" }]
  ]);
  if (result?.ok) {
    res.json({ ok: true, message: "تم إرسال الرسالة التجريبية إلى التيليجرام بنجاح ✅" });
  } else {
    res.status(400).json({ error: result?.description || result?.error || result?.reason || "فشل إرسال الرسالة. تأكد من إدخال Bot Token و Chat ID" });
  }
});

// ── Legacy Routes (Compatibility) ────────────────────────────────────────────

router.post("/orders", (req, res) => {
  const o = req.body || {};
  res.status(201).json({ ok: true, id: `ord-${Date.now()}` });
});

router.get("/admin/orders", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json({ orders: storeOrders, total: storeOrders.length });
});

export default router;
