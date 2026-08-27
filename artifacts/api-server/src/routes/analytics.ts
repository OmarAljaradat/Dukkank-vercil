import { Router, type IRouter } from "express";
import { verifyToken } from "./auth.js";
import pg from "pg";
import { DEFAULT_GAMES } from "../lib/storeDb.js";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const router: IRouter = Router();

// In-memory set of sessions seen today to prevent duplicate visit counts on heartbeat
const seenSessionsToday = new Set<string>();

// Reset seen sessions daily
setInterval(() => {
  seenSessionsToday.clear();
}, 24 * 60 * 60 * 1000);

// ==========================================
// 1. Visitor Heartbeat Ping (Client Calls Every 60s)
// ==========================================
router.post("/analytics/heartbeat", async (req, res) => {
  try {
    const { sessionId } = req.body || {};
    if (!sessionId) {
      res.json({ ok: true });
      return;
    }

    const ip = (req.headers["x-forwarded-for"] as string || req.socket.remoteAddress || "").split(",")[0].trim();
    const userAgent = (req.headers["user-agent"] as string) || "";

    // 1. Update/Insert visitor session
    await pool.query(`
      INSERT INTO visitor_sessions (session_id, ip, user_agent, last_seen, created_at)
      VALUES ($1, $2, $3, NOW(), NOW())
      ON CONFLICT (session_id) DO UPDATE SET last_seen = NOW()
    `, [sessionId, ip, userAgent]).catch(() => {});

    // 2. Increment daily visit if new session today
    const todayStr = new Date().toISOString().slice(0, 10);
    const sessionKey = `${todayStr}_${sessionId}`;

    if (!seenSessionsToday.has(sessionKey)) {
      seenSessionsToday.add(sessionKey);
      await pool.query(`
        INSERT INTO analytics_daily (date, visits, cart_adds, subscribers)
        VALUES (CURRENT_DATE, 1, 0, 0)
        ON CONFLICT (date) DO UPDATE SET visits = analytics_daily.visits + 1
      `).catch(() => {});
    }

    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// ==========================================
// 2. Cart Add Event Tracking
// ==========================================
router.post("/analytics/cart-event", async (_req, res) => {
  try {
    await pool.query(`
      INSERT INTO analytics_daily (date, visits, cart_adds, subscribers)
      VALUES (CURRENT_DATE, 0, 1, 0)
      ON CONFLICT (date) DO UPDATE SET cart_adds = analytics_daily.cart_adds + 1
    `).catch(() => {});
    res.json({ ok: true });
  } catch {
    res.json({ ok: true });
  }
});

// ==========================================
// 3. Live Online Visitors Count (Public / Polling)
// ==========================================
router.get("/analytics/live-visitors", async (_req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT COUNT(DISTINCT session_id) as online
      FROM visitor_sessions
      WHERE last_seen > NOW() - INTERVAL '3 minutes'
    `);
    const count = Math.max(1, parseInt(rows[0]?.online || "1", 10));
    res.json({ online: count });
  } catch {
    res.json({ online: 1 });
  }
});

// ==========================================
// 4. Full Admin Analytics Center
// ==========================================
router.get("/admin/analytics", async (req, res) => {
  const email = verifyToken(req.headers.authorization);
  if (!email) {
    res.status(401).json({ error: "غير مصرح" });
    return;
  }

  const days = Math.min(Number(req.query.days) || 7, 365);

  try {
    // Parallel database queries for real data
    const [
      onlineRes,
      customersRes,
      ordersRes,
      totalsRes,
      timelineRes,
      topItemsRes,
      recentOrdersRes,
      gamesRes
    ] = await Promise.all([
      // 1. Real online visitors in last 3 minutes
      pool.query(`
        SELECT COUNT(DISTINCT session_id) as online
        FROM visitor_sessions
        WHERE last_seen > NOW() - INTERVAL '3 minutes'
      `).catch(() => ({ rows: [{ online: "1" }] })),

      // 2. Real registered customers count
      pool.query(`
        SELECT COUNT(*) as total_customers FROM customers
      `).catch(() => ({ rows: [{ total_customers: "0" }] })),

      // 3. Real completed orders count
      pool.query(`
        SELECT 
          COUNT(*) as total_orders,
          COUNT(*) FILTER (WHERE status IN ('completed', 'delivered')) as completed_orders
        FROM store_orders
      `).catch(() => ({ rows: [{ total_orders: "0", completed_orders: "0" }] })),

      // 4. Real total visits from daily analytics
      pool.query(`
        SELECT
          COALESCE(SUM(visits), 0) AS visits,
          COALESCE(SUM(cart_adds), 0) AS cart_adds,
          COALESCE(SUM(subscribers), 0) AS subscribers
        FROM analytics_daily
      `).catch(() => ({ rows: [{ visits: "0", cart_adds: "0", subscribers: "0" }] })),

      // 5. Real timeline for requested range
      pool.query(`
        WITH dates AS (
          SELECT generate_series(
            CURRENT_DATE - ($1 - 1) * INTERVAL '1 day',
            CURRENT_DATE,
            '1 day'::interval
          )::date AS date
        )
        SELECT
          d.date,
          COALESCE(a.visits, 0) AS visits,
          COALESCE(a.cart_adds, 0) AS cart_adds,
          COALESCE(a.subscribers, 0) AS subscribers
        FROM dates d
        LEFT JOIN analytics_daily a ON a.date = d.date
        ORDER BY d.date ASC
      `, [days]).catch(() => ({ rows: [] })),

      // 6. Real Top Selling Items from store_orders
      pool.query(`
        SELECT COALESCE(game_name, product_type, 'طلب متجر') as name, COUNT(*) as count
        FROM store_orders
        WHERE game_name IS NOT NULL OR product_type IS NOT NULL
        GROUP BY name
        ORDER BY count DESC
        LIMIT 6
      `).catch(() => ({ rows: [] })),

      // 7. Recent Orders Log from store_orders
      pool.query(`
        SELECT id, order_number, customer_name, COALESCE(game_name, product_type, 'طلب جديد') as product, status, created_at
        FROM store_orders
        ORDER BY created_at DESC
        LIMIT 8
      `).catch(() => ({ rows: [] })),

      // 8. Active games count from store_config
      pool.query(`
        SELECT value FROM store_config WHERE key = 'games' LIMIT 1
      `).catch(() => ({ rows: [] }))
    ]);

    // Parse Games count
    let activeGamesCount = DEFAULT_GAMES.length;
    if (gamesRes.rows.length > 0 && Array.isArray(gamesRes.rows[0].value)) {
      activeGamesCount = gamesRes.rows[0].value.length;
    }

    const onlineCount = Math.max(1, parseInt(onlineRes.rows[0]?.online || "1", 10));
    const registeredUsersCount = parseInt(customersRes.rows[0]?.total_customers || "0", 10);
    const completedOrdersCount = parseInt(ordersRes.rows[0]?.completed_orders || "0", 10);
    const totalVisitsCount = parseInt(totalsRes.rows[0]?.visits || "0", 10);

    const timeline = timelineRes.rows.map((r: any) => ({
      date: r.date instanceof Date
        ? r.date.toISOString().slice(5, 10)
        : String(r.date).slice(5, 10),
      visits: Number(r.visits) || 0,
      cartAdds: Number(r.cart_adds) || 0,
      subscribers: Number(r.subscribers) || 0,
    }));

    // Top items
    const topItems = topItemsRes.rows.length > 0
      ? topItemsRes.rows.map((r: any) => ({
          name: r.name,
          count: parseInt(r.count, 10),
          pct: Math.max(15, Math.min(100, Math.round((parseInt(r.count, 10) / Math.max(1, completedOrdersCount)) * 100)))
        }))
      : [
          { name: "Marvel's Spider-Man 2 (عربي)", count: 0, pct: 10 },
          { name: "EA Sports FC 26 (حساب PS5)", count: 0, pct: 10 },
          { name: "اشتراك PS Plus Extra (12 شهر)", count: 0, pct: 10 },
          { name: "Grand Theft Auto V (PS5)", count: 0, pct: 10 }
        ];

    // Format audit/order logs
    const auditLogs = recentOrdersRes.rows.map((r: any) => {
      const timeAgo = formatRelativeTime(new Date(r.created_at));
      return {
        id: r.order_number || String(r.id),
        text: `طلب #${r.order_number || r.id} — ${r.product} (${r.customer_name || 'عميل'})`,
        time: timeAgo
      };
    });

    res.json({
      online: onlineCount,
      totals: {
        visits: totalVisitsCount,
        users: registeredUsersCount,
        orders: completedOrdersCount,
        activeGames: activeGamesCount
      },
      timeline,
      topItems,
      auditLogs
    });

  } catch (e: any) {
    res.status(500).json({ error: e.message });
  }
});

function formatRelativeTime(date: Date): string {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / (1000 * 60));
  if (diffMin < 1) return "الآن";
  if (diffMin < 60) return `منذ ${diffMin} دقيقة`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `منذ ${diffHours} ساعة`;
  const diffDays = Math.floor(diffHours / 24);
  return `منذ ${diffDays} يوم`;
}

export default router;
