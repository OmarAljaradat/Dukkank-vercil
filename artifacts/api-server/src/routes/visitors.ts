import { Router, type IRouter } from "express";
import { isBlocked } from "./security.js";
import { recordVisit } from "./insights.js";
import { sendTelegramActivityNotification, getTelegramConfig, saveTelegramConfig, sendTelegramMessage } from "../lib/telegram.js";
import { verifyToken } from "./auth.js";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router: IRouter = Router();

const TTL_MS = 3 * 60 * 1000; // 3 minutes active window
const sessions = new Map<string, { lastSeen: number; source: string; ip: string; deviceInfo?: string }>();

// In-memory ring buffer for the latest 500 events
interface VisitorEvent {
  id: string;
  sessionId: string;
  eventType: string;
  eventTitle: string;
  eventData?: any;
  pageUrl?: string;
  deviceInfo?: string;
  ip?: string;
  createdAt: string;
}

const memoryEvents: VisitorEvent[] = [];
const MAX_MEMORY_EVENTS = 500;

function pushMemoryEvent(event: VisitorEvent) {
  memoryEvents.unshift(event);
  if (memoryEvents.length > MAX_MEMORY_EVENTS) {
    memoryEvents.pop();
  }
}

async function initSessionsAndEvents() {
  try {
    await pool.query(`CREATE TABLE IF NOT EXISTS visitor_sessions (
      session_id TEXT PRIMARY KEY,
      last_seen  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      source     TEXT DEFAULT 'direct',
      ip         TEXT DEFAULT '',
      device_info TEXT DEFAULT ''
    )`);

    await pool.query(`CREATE TABLE IF NOT EXISTS visitor_events (
      id BIGSERIAL PRIMARY KEY,
      session_id TEXT NOT NULL,
      event_type TEXT NOT NULL,
      event_title TEXT NOT NULL,
      event_data JSONB,
      page_url TEXT,
      device_info TEXT,
      ip TEXT,
      created_at TIMESTAMPTZ DEFAULT NOW()
    )`);

    await pool.query(`CREATE INDEX IF NOT EXISTS idx_visitor_events_created ON visitor_events (created_at DESC)`);

    const cutoff = new Date(Date.now() - TTL_MS).toISOString();
    const { rows } = await pool.query(
      "SELECT session_id, EXTRACT(EPOCH FROM last_seen)*1000 AS ts, source, ip, device_info FROM visitor_sessions WHERE last_seen > $1",
      [cutoff]
    );
    for (const r of rows) {
      sessions.set(r.session_id, {
        lastSeen: Number(r.ts),
        source: r.source || "direct",
        ip: r.ip || "",
        deviceInfo: r.device_info || "",
      });
    }

    // Pre-populate memory events from DB
    const { rows: dbEvents } = await pool.query(
      "SELECT id, session_id, event_type, event_title, event_data, page_url, device_info, ip, created_at FROM visitor_events ORDER BY created_at DESC LIMIT 100"
    );
    for (const d of dbEvents) {
      memoryEvents.push({
        id: String(d.id),
        sessionId: d.session_id,
        eventType: d.event_type,
        eventTitle: d.event_title,
        eventData: d.event_data,
        pageUrl: d.page_url,
        deviceInfo: d.device_info,
        ip: d.ip,
        createdAt: d.created_at ? new Date(d.created_at).toISOString() : new Date().toISOString(),
      });
    }
  } catch (e) {
    console.warn("Visitors DB init notice:", e);
  }
}
initSessionsAndEvents();

function prune() {
  const now = Date.now();
  for (const [id, s] of sessions) {
    if (now - s.lastSeen > TTL_MS) sessions.delete(id);
  }
}

function getClientIP(req: any): string {
  return (req.headers["x-forwarded-for"] as string || "").split(",")[0].trim() ||
    req.socket?.remoteAddress || "";
}

function requireAdmin(req: any, res: any): boolean {
  const email = verifyToken(req.headers.authorization);
  if (!email) {
    res.status(401).json({ error: "غير مصرح - يرجى تسجيل الدخول كمسؤول" });
    return false;
  }
  return true;
}

// ══════════════════════════════════════════════════════════════════════════════
// ── Public Tracking Endpoints ────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Heartbeat
router.post("/visitors/heartbeat", (req, res) => {
  const ip = getClientIP(req);
  if (ip && isBlocked(ip)) { res.status(403).json({ blocked: true }); return; }

  const sid = (req.body?.sessionId as string) || "";
  if (!sid || sid.length > 128) { res.status(400).json({ error: "invalid sessionId" }); return; }

  const isNew = !sessions.has(sid);
  const source = String(req.body?.source || "direct").slice(0, 64);
  const deviceInfo = String(req.body?.deviceInfo || "").slice(0, 100);

  sessions.set(sid, {
    lastSeen: Date.now(),
    source,
    ip,
    deviceInfo,
  });
  prune();

  pool.query(
    `INSERT INTO visitor_sessions (session_id, last_seen, source, ip, device_info)
     VALUES ($1, NOW(), $2, $3, $4)
     ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW(), device_info = COALESCE(NULLIF($4, ''), visitor_sessions.device_info)`,
    [sid, source, ip, deviceInfo]
  ).catch(() => {});

  if (isNew) {
    const hour = new Date().getHours();
    recordVisit(hour, source);
  }

  res.json({ online: sessions.size });
});

// Live Visitors Count
router.get("/visitors/count", (_req, res) => {
  prune();
  res.json({ online: sessions.size });
});

// Main Event Tracker: Accepts any visitor action
async function handleTrack(req: any, res: any) {
  try {
    const ip = getClientIP(req);
    if (ip && isBlocked(ip)) { res.status(403).json({ blocked: true }); return; }

    const {
      sessionId = `v_${Date.now()}`,
      eventType = "general",
      eventTitle = "نشاط",
      eventData = {},
      pageUrl = "/",
      deviceInfo = "متصفح ويب",
    } = req.body || {};

    const sid = String(sessionId).slice(0, 128);
    const type = String(eventType).slice(0, 50);
    const title = String(eventTitle).slice(0, 200);
    const url = String(pageUrl).slice(0, 255);
    const device = String(deviceInfo).slice(0, 150);

    // Keep session alive
    sessions.set(sid, {
      lastSeen: Date.now(),
      source: eventData?.source || "direct",
      ip,
      deviceInfo: device,
    });
    prune();

    const newEvent: VisitorEvent = {
      id: `evt_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
      sessionId: sid,
      eventType: type,
      eventTitle: title,
      eventData,
      pageUrl: url,
      deviceInfo: device,
      ip,
      createdAt: new Date().toISOString(),
    };

    // 1. Store in memory buffer
    pushMemoryEvent(newEvent);

    // 2. Persist to DB async
    pool.query(
      `INSERT INTO visitor_events (session_id, event_type, event_title, event_data, page_url, device_info, ip)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [sid, type, title, JSON.stringify(eventData), url, device, ip]
    ).catch(() => {});

    // 3. Send Telegram Activity Notification
    sendTelegramActivityNotification({
      sessionId: sid,
      eventType: type,
      eventTitle: title,
      eventData,
      pageUrl: url,
      deviceInfo: device,
      ipAddress: ip,
    }).catch((err) => console.warn("Telegram activity notify error:", err));

    res.json({ ok: true, online: sessions.size });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

router.post("/track", handleTrack);
router.post("/visitors/track", handleTrack);

// ══════════════════════════════════════════════════════════════════════════════
// ── Admin Endpoints ──────────────────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

// Get live visitor events
router.get("/admin/visitor-events", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 100, 200);
    const filterType = req.query.type as string;

    // Use DB if available, fallback to memory
    try {
      let query = "SELECT id, session_id, event_type, event_title, event_data, page_url, device_info, ip, created_at FROM visitor_events";
      const params: any[] = [];

      if (filterType && filterType !== "all") {
        query += " WHERE event_type = $1";
        params.push(filterType);
      }
      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const { rows } = await pool.query(query, params);
      const events = rows.map((d: any) => ({
        id: String(d.id),
        sessionId: d.session_id,
        eventType: d.event_type,
        eventTitle: d.event_title,
        eventData: d.event_data,
        pageUrl: d.page_url,
        deviceInfo: d.device_info,
        ip: d.ip,
        createdAt: d.created_at,
      }));

      prune();
      res.json({
        events,
        onlineCount: sessions.size,
        activeSessions: Array.from(sessions.entries()).map(([id, data]) => ({
          sessionId: id,
          ...data,
        })),
      });
      return;
    } catch (_) {
      // Memory fallback
      let events = memoryEvents;
      if (filterType && filterType !== "all") {
        events = events.filter((e) => e.eventType === filterType);
      }
      prune();
      res.json({
        events: events.slice(0, limit),
        onlineCount: sessions.size,
        activeSessions: Array.from(sessions.entries()).map(([id, data]) => ({
          sessionId: id,
          ...data,
        })),
      });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Visitor Stats & Radar Summary
router.get("/admin/visitor-stats", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    prune();
    const online = sessions.size;

    let totalToday = 0;
    let typeBreakdown: Record<string, number> = {};

    try {
      const { rows: todayRows } = await pool.query(
        "SELECT event_type, COUNT(*) as count FROM visitor_events WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY event_type"
      );
      for (const r of todayRows) {
        typeBreakdown[r.event_type] = parseInt(r.count);
        totalToday += parseInt(r.count);
      }
    } catch (_) {
      // Memory fallback
      memoryEvents.forEach((e) => {
        typeBreakdown[e.eventType] = (typeBreakdown[e.eventType] || 0) + 1;
        totalToday++;
      });
    }

    res.json({
      online,
      totalToday,
      typeBreakdown,
    });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Clear Visitor Events Log
router.delete("/admin/visitor-events", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    memoryEvents.length = 0;
    await pool.query("TRUNCATE TABLE visitor_events").catch(() => {});
    res.json({ ok: true });
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Telegram Tracking Config
router.get("/admin/telegram/tracking-config", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const cfg = await getTelegramConfig();
    res.json(cfg);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

router.put("/admin/telegram/tracking-config", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const updated = await saveTelegramConfig(req.body || {});
    res.json(updated);
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

// Test Activity Telegram Alert
router.post("/admin/telegram/test-activity", async (req, res) => {
  if (!requireAdmin(req, res)) return;
  try {
    const result = await sendTelegramActivityNotification({
      sessionId: "test_admin_session",
      eventType: "add_to_cart",
      eventTitle: "إضافة لعبة إلى السلة (فحص تجريبي)",
      eventData: {
        gameName: "Grand Theft Auto VI (GTA 6)",
        tier: "سكندري (اللعب من الحساب نفسه)",
        price: "26.00",
        cartTotal: "26.00",
        itemsCount: 1,
      },
      pageUrl: "/",
      deviceInfo: "هاتف iPhone 16 Pro (Safari)",
    });

    if (result.ok) {
      res.json({ ok: true, message: "تم إرسال إشعار الرادار التجريبي إلى التيليجرام بنجاح! 📲" });
    } else {
      res.status(400).json({ error: result.reason || result.error || "فشل الإرسال - تحقق من التوكن والشات آي دي" });
    }
  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

export default router;
