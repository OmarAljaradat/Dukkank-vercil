import { Router, type IRouter } from "express";
import pg from "pg";
import { verifyToken } from "./auth.js";

const router: IRouter = Router();
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

const blockedIPs = new Map<string, { id: string; ip: string; reason: string; timestamp: string }>();

async function initSecurityDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS security_ip_blocks (
        id VARCHAR(100) PRIMARY KEY,
        ip VARCHAR(100) NOT NULL UNIQUE,
        reason TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);
    const { rows } = await pool.query("SELECT * FROM security_ip_blocks ORDER BY created_at DESC");
    rows.forEach(r => {
      blockedIPs.set(r.ip, { id: r.id, ip: r.ip, reason: r.reason, timestamp: r.created_at });
    });
  } catch (_) {}
}
initSecurityDb();

export function isBlocked(ip: string): boolean {
  if (!ip) return false;
  const clean = ip.replace("::ffff:", "").trim();
  return blockedIPs.has(clean) || blockedIPs.has(ip);
}

router.get("/admin/ip-blocks", async (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  try {
    const { rows } = await pool.query("SELECT * FROM security_ip_blocks ORDER BY created_at DESC");
    res.json(rows.map(r => ({ id: r.id, ip: r.ip, reason: r.reason || "حظر عام", timestamp: r.created_at })));
  } catch {
    res.json([...blockedIPs.values()]);
  }
});

router.post("/admin/ip-blocks", async (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const ip = String(req.body?.ip || "").trim();
  const reason = String(req.body?.reason || "حظر يدوي من الإدارة").trim();
  if (!ip) { res.status(400).json({ error: "ip required" }); return; }
  const id = `ip-${Date.now()}`;
  try {
    await pool.query(
      "INSERT INTO security_ip_blocks (id, ip, reason) VALUES ($1, $2, $3) ON CONFLICT (ip) DO UPDATE SET reason = $3",
      [id, ip, reason]
    );
  } catch (_) {}
  blockedIPs.set(ip, { id, ip, reason, timestamp: new Date().toISOString() });
  res.json({ ok: true, item: { id, ip, reason } });
});

router.delete("/admin/ip-blocks/:idOrIp", async (req, res) => {
  if (!verifyToken(req.headers.authorization)) { res.status(401).json({ error: "غير مصرح" }); return; }
  const param = decodeURIComponent(req.params.idOrIp);
  try {
    await pool.query("DELETE FROM security_ip_blocks WHERE id = $1 OR ip = $1", [param]);
  } catch (_) {}
  blockedIPs.delete(param);
  for (const [k, v] of blockedIPs.entries()) {
    if (v.id === param || v.ip === param) blockedIPs.delete(k);
  }
  res.json({ ok: true });
});

export default router;
