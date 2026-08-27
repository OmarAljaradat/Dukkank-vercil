import { Router, type IRouter } from "express";
import { DEFAULT_REVIEWS, DEFAULT_FAQS, dbLoad, dbSave, requireAdmin } from "../lib/storeDb.js";

const router: IRouter = Router();

// ── REVIEWS ──────────────────────────────────────────────────────────────────

// Public: Get Reviews
router.get("/reviews", async (_req, res) => {
  const list = await dbLoad("reviews", DEFAULT_REVIEWS);
  res.json([...list].sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99)));
});

// Admin: Add Review
router.post("/admin/reviews", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("reviews", DEFAULT_REVIEWS);
  const r = { ...req.body, id: Date.now() };
  current.push(r);
  await dbSave("reviews", current);
  res.json(r);
});

// Admin: Update Review
router.put("/admin/reviews/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("reviews", DEFAULT_REVIEWS);
  const id = Number(req.params.id);
  const idx = current.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...req.body };
    await dbSave("reviews", current);
    res.json(current[idx]);
  } else {
    res.status(404).json({ error: "التقييم غير موجود" });
  }
});

// Admin: Delete Review
router.delete("/admin/reviews/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("reviews", DEFAULT_REVIEWS);
  const id = Number(req.params.id);
  const idx = current.findIndex((x: any) => x.id === id);
  if (idx !== -1) {
    current.splice(idx, 1);
    await dbSave("reviews", current);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "التقييم غير موجود" });
  }
});

// ── FAQS ─────────────────────────────────────────────────────────────────────

// Public: Get FAQs
router.get("/faqs", async (_req, res) => {
  const list = await dbLoad("faqs", DEFAULT_FAQS);
  res.json([...list].sort((a: any, b: any) => (a.order ?? 99) - (b.order ?? 99)));
});

// Admin: Bulk update FAQs list
router.put("/admin/faqs", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const list = Array.isArray(req.body) ? req.body : req.body?.faqs;
  if (list) {
    await dbSave("faqs", list);
    res.json(list);
  } else {
    res.status(400).json({ error: "بيانات الأسئلة غير صحيحة" });
  }
});

// Admin: Add FAQ
router.post("/admin/faqs", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("faqs", DEFAULT_FAQS);
  const f = { ...req.body, id: req.body?.id || `faq-${Date.now()}` };
  current.push(f);
  await dbSave("faqs", current);
  res.json(f);
});

// Admin: Update FAQ
router.put("/admin/faqs/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("faqs", DEFAULT_FAQS);
  const targetId = String(req.params.id);
  const idx = current.findIndex((x: any) => String(x.id) === targetId);
  if (idx !== -1) {
    current[idx] = { ...current[idx], ...req.body };
    await dbSave("faqs", current);
    res.json(current[idx]);
  } else {
    res.status(404).json({ error: "السؤال غير موجود" });
  }
});

// Admin: Delete FAQ
router.delete("/admin/faqs/:id", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  const current = await dbLoad("faqs", DEFAULT_FAQS);
  const targetId = String(req.params.id);
  const idx = current.findIndex((x: any) => String(x.id) === targetId);
  if (idx !== -1) {
    current.splice(idx, 1);
    await dbSave("faqs", current);
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: "السؤال غير موجود" });
  }
});

export default router;
