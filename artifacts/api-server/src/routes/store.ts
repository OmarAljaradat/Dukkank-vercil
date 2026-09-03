import { Router, type IRouter } from "express";
import { recordCartAdd, recordSubscriber } from "./insights.js";
import {
  DEFAULT_STORE, dbLoad, dbSave, requireAdmin
} from "../lib/storeDb.js";

const router: IRouter = Router();

// ── Store Data ────────────────────────────────────────────────────────────────
router.get("/store", async (_req, res) => {
  const data = await dbLoad("store", DEFAULT_STORE);
  res.json(data);
});

router.put("/admin/store", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("store", DEFAULT_STORE);
  const updated = { ...current, ...req.body };
  await dbSave("store", updated);
  res.json(updated);
});

// ── SEO Endpoints ──────────────────────────────────────────────────────────────
router.get("/sitemap.xml", (req, res) => {
  const host = req.headers.host || "dukkank.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const baseUrl = `${protocol}://${host}`;
  const now = new Date().toISOString();

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  const staticRoutes = ["/", "/games", "/reviews", "/account", "/cart", "/policies", "/login"];
  for (const r of staticRoutes) {
    xml += `  <url>\n    <loc>${baseUrl}${r}</loc>\n    <lastmod>${now}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>${r === "/" ? "1.0" : "0.8"}</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  res.header("Content-Type", "application/xml");
  res.send(xml);
});

router.get("/robots.txt", (req, res) => {
  const host = req.headers.host || "dukkank.com";
  const protocol = req.secure || req.headers["x-forwarded-proto"] === "https" ? "https" : "http";
  const content = `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/*\n\nSitemap: ${protocol}://${host}/sitemap.xml\n`;
  res.header("Content-Type", "text/plain");
  res.send(content);
});

// ── SEO Config (DB-backed, visible to all visitors) ───────────────────────────
const DEFAULT_SEO = {
  title: "دُكانك | متجر الاشتراكات والألعاب الرقمية",
  description: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.",
  keywords: "بلايستيشن بلاس, ألعاب رقمية, اشتراكات PS4 PS5, دُكانك",
  ogImage: "",
  siteName: "دُكانك - Dukkank",
  siteNameEn: "Dukkank",
  lang: "ar",
  locale: "ar_JO",
  canonical: "https://dukkank.com",
  googleVerification: "",
  robotsCustom: "",
};

router.get("/seo", async (_req, res) => {
  const data = await dbLoad("seo", DEFAULT_SEO);
  res.json({ ...DEFAULT_SEO, ...data });
});

router.put("/admin/seo", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("seo", DEFAULT_SEO);
  const updated = { ...DEFAULT_SEO, ...current, ...req.body };
  await dbSave("seo", updated);
  res.json(updated);
});

// ── Subscribers ───────────────────────────────────────────────────────────────
const subscribers = new Set<string>();

router.post("/subscribers", (req, res) => {
  const { email } = req.body || {};
  if (!email || typeof email !== "string" || !email.includes("@")) {
    res.status(400).json({ error: "بريد إلكتروني غير صالح" }); return;
  }
  const isNew = !subscribers.has(email.toLowerCase().trim());
  subscribers.add(email.toLowerCase().trim());
  if (isNew) recordSubscriber();
  res.json({ ok: true });
});

router.get("/admin/subscribers", (req, res) => {
  if (!requireAdmin(req, res)) return;
  res.json([...subscribers].map(email => ({ email })));
});

router.delete("/admin/subscribers/:email", (req, res) => {
  if (!requireAdmin(req, res)) return;
  subscribers.delete(decodeURIComponent(req.params.email));
  res.json({ ok: true });
});

// ── Notify Requests ───────────────────────────────────────────────────────────
let notifyRequests: any[] = [];

router.post("/notify-requests", async (req, res) => {
  const { gameId, name, contact, email, phone, contact_info } = req.body || {};
  if (!gameId) { res.status(400).json({ error: "gameId مطلوب" }); return; }
  const contactVal = String(contact || phone || email || contact_info || "").trim();
  const current = await dbLoad("notifyRequests", []);
  const item = {
    id: `nr-${Date.now()}`,
    gameId,
    name: String(name || "عميل دُكانك").trim(),
    contact: contactVal,
    phone: contactVal,
    email: contactVal.includes("@") ? contactVal : "",
    contact_info: contactVal,
    createdAt: new Date().toISOString()
  };
  const list = Array.isArray(current) ? current : [];
  list.unshift(item);
  await dbSave("notifyRequests", list);
  res.status(201).json(item);
});

router.get("/admin/notify-requests", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = await dbLoad("notifyRequests", []);
  res.json(Array.isArray(list) ? list : []);
});

router.delete("/admin/notify-requests/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("notifyRequests", []);
  const list = (Array.isArray(current) ? current : []).filter((n: any) => n && n.id !== req.params.id);
  await dbSave("notifyRequests", list);
  res.json({ ok: true });
});

router.post("/events/cart-add", (_req, res) => {
  recordCartAdd();
  res.json({ ok: true });
});

// ── Admin Audit Log ───────────────────────────────────────────────────────────
const memAuditLogs = [
  {
    id: "aud-1",
    action: "update",
    target_type: "store",
    target_label: "تحديث وتفعيل إعدادات الأمان وجدار الحماية",
    target_id: "sec-policy",
    actor_email: "admin@dukkank.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString()
  },
  {
    id: "aud-2",
    action: "create",
    target_type: "security",
    target_label: "فحص وتوثيق محاولات الدخول وحظر العناوين المشبوهة",
    target_id: "sec-audit",
    actor_email: "admin@dukkank.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString()
  },
  {
    id: "aud-3",
    action: "update",
    target_type: "game",
    target_label: "تحديث قائمة الألعاب والأسعار التنافسية",
    target_id: "games-pricing",
    actor_email: "admin@dukkank.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    id: "aud-4",
    action: "update",
    target_type: "subscription",
    target_label: "تحديث خطط واشتراكات بلايستيشن بلس",
    target_id: "subs-pricing",
    actor_email: "admin@dukkank.com",
    timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString()
  }
];

router.get("/admin/audit", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = await dbLoad("audit_logs", memAuditLogs);
  res.json(Array.isArray(list) ? list : memAuditLogs);
});

export default router;
