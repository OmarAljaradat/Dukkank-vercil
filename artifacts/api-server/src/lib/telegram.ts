import { pool } from "./db.js";

export interface BotConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

export interface RadarBotConfig extends BotConfig {
  notifyCart?: boolean;
  notifyCheckout?: boolean;
  notifyWhatsApp?: boolean;
  notifyGameClick?: boolean;
  notifySearch?: boolean;
  notifyPageView?: boolean;
}

export interface DualTelegramConfig {
  ordersBot: BotConfig;
  radarBot: RadarBotConfig;
}

const DEFAULT_ORDERS_BOT: BotConfig = {
  enabled: true,
  botToken: process.env.ORDERS_TELEGRAM_BOT_TOKEN || "8510906546:AAHtxyyIJ9-tXyA7Keua_0n9GHSthtSIaEU",
  chatId: process.env.ORDERS_TELEGRAM_CHAT_ID || "1965859902",
};

const DEFAULT_RADAR_BOT: RadarBotConfig = {
  enabled: true,
  botToken: process.env.RADAR_TELEGRAM_BOT_TOKEN || "8928288709:AAGqgWtJfHzWWhE77rsEgI-lgJh99AR8l5A",
  chatId: process.env.RADAR_TELEGRAM_CHAT_ID || "1965859902",
  notifyCart: true,
  notifyCheckout: true,
  notifyWhatsApp: true,
  notifyGameClick: true,
  notifySearch: false,
  notifyPageView: true,
};

let memoryConfig: DualTelegramConfig = {
  ordersBot: { ...DEFAULT_ORDERS_BOT },
  radarBot: { ...DEFAULT_RADAR_BOT },
};

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function getDualTelegramConfig(): Promise<DualTelegramConfig> {
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT value FROM store_config WHERE key = 'dual_telegram_config' OR key = 'telegram_config' ORDER BY key DESC LIMIT 1`
      );
      if (rows.length > 0 && rows[0].value) {
        const cfg = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        if (cfg.ordersBot || cfg.radarBot) {
          memoryConfig = {
            ordersBot: {
              enabled: cfg.ordersBot?.enabled ?? true,
              botToken: cfg.ordersBot?.botToken || DEFAULT_ORDERS_BOT.botToken,
              chatId: cfg.ordersBot?.chatId || DEFAULT_ORDERS_BOT.chatId,
            },
            radarBot: {
              enabled: cfg.radarBot?.enabled ?? true,
              botToken: (cfg.radarBot?.botToken && !cfg.radarBot.botToken.startsWith("8809778826")) ? cfg.radarBot.botToken : DEFAULT_RADAR_BOT.botToken,
              chatId: cfg.radarBot?.chatId || DEFAULT_RADAR_BOT.chatId,
              notifyCart: cfg.radarBot?.notifyCart !== undefined ? !!cfg.radarBot.notifyCart : true,
              notifyCheckout: cfg.radarBot?.notifyCheckout !== undefined ? !!cfg.radarBot.notifyCheckout : true,
              notifyWhatsApp: cfg.radarBot?.notifyWhatsApp !== undefined ? !!cfg.radarBot.notifyWhatsApp : true,
              notifyGameClick: cfg.radarBot?.notifyGameClick !== undefined ? !!cfg.radarBot.notifyGameClick : true,
              notifySearch: cfg.radarBot?.notifySearch !== undefined ? !!cfg.radarBot.notifySearch : false,
              notifyPageView: cfg.radarBot?.notifyPageView !== undefined ? !!cfg.radarBot.notifyPageView : true,
            },
          };
          return memoryConfig;
        }
      }
    } catch (e) {
      console.warn("Could not load dual_telegram_config from DB:", e);
    }
  }
  return memoryConfig;
}

export async function saveDualTelegramConfig(cfg: Partial<DualTelegramConfig>): Promise<DualTelegramConfig> {
  const current = await getDualTelegramConfig();
  const updated: DualTelegramConfig = {
    ordersBot: {
      enabled: cfg.ordersBot?.enabled !== undefined ? !!cfg.ordersBot.enabled : current.ordersBot.enabled,
      botToken: (cfg.ordersBot?.botToken !== undefined && cfg.ordersBot.botToken !== "" ? cfg.ordersBot.botToken : current.ordersBot.botToken || DEFAULT_ORDERS_BOT.botToken).trim(),
      chatId: (cfg.ordersBot?.chatId !== undefined && cfg.ordersBot.chatId !== "" ? cfg.ordersBot.chatId : current.ordersBot.chatId || DEFAULT_ORDERS_BOT.chatId).trim(),
    },
    radarBot: {
      enabled: cfg.radarBot?.enabled !== undefined ? !!cfg.radarBot.enabled : current.radarBot.enabled,
      botToken: (cfg.radarBot?.botToken !== undefined && cfg.radarBot.botToken !== "" ? cfg.radarBot.botToken : current.radarBot.botToken || DEFAULT_RADAR_BOT.botToken).trim(),
      chatId: (cfg.radarBot?.chatId !== undefined && cfg.radarBot.chatId !== "" ? cfg.radarBot.chatId : current.radarBot.chatId || DEFAULT_RADAR_BOT.chatId).trim(),
      notifyCart: cfg.radarBot?.notifyCart !== undefined ? !!cfg.radarBot.notifyCart : current.radarBot.notifyCart,
      notifyCheckout: cfg.radarBot?.notifyCheckout !== undefined ? !!cfg.radarBot.notifyCheckout : current.radarBot.notifyCheckout,
      notifyWhatsApp: cfg.radarBot?.notifyWhatsApp !== undefined ? !!cfg.radarBot.notifyWhatsApp : current.radarBot.notifyWhatsApp,
      notifyGameClick: cfg.radarBot?.notifyGameClick !== undefined ? !!cfg.radarBot.notifyGameClick : current.radarBot.notifyGameClick,
      notifySearch: cfg.radarBot?.notifySearch !== undefined ? !!cfg.radarBot.notifySearch : current.radarBot.notifySearch,
      notifyPageView: cfg.radarBot?.notifyPageView !== undefined ? !!cfg.radarBot.notifyPageView : current.radarBot.notifyPageView,
    },
  };

  memoryConfig = { ...updated };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO store_config (key, value, updated_at)
         VALUES ('dual_telegram_config', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify(updated)]
      );
    } catch (e) {
      console.error("Failed to save dual_telegram_config:", e);
    }
  }

  return updated;
}

// Low-level sender
async function postToTelegram(botToken: string, chatId: string, text: string, inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>) {
  if (!botToken || !chatId) return { ok: false, reason: "Missing token or chatId" };
  try {
    const url = `https://api.telegram.org/bot${botToken}/sendMessage`;

    const sanitizedKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
    if (inlineKeyboard && inlineKeyboard.length > 0) {
      inlineKeyboard.forEach((row) => {
        const validRow = row.filter((btn) => {
          if (btn.url) return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(btn.url);
          return !!btn.callback_data;
        });
        if (validRow.length > 0) sanitizedKeyboard.push(validRow);
      });
    }

    const payload: any = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };
    if (sanitizedKeyboard.length > 0) {
      payload.reply_markup = { inline_keyboard: sanitizedKeyboard };
    }

    let res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    let data: any = await res.json();

    if (!data.ok) {
      const plainText = text.replace(/<[^>]+>/g, "");
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: plainText }),
      });
      data = await res.json();
    }
    return data;
  } catch (err: any) {
    return { ok: false, error: err.message };
  }
}

// ── 1. Orders Bot Dispatcher ──
export async function sendTelegramOrderNotification(order: any) {
  try {
    const config = await getDualTelegramConfig();
    const { enabled, botToken, chatId } = config.ordersBot;
    const token = botToken || DEFAULT_ORDERS_BOT.botToken;
    const chat = chatId || DEFAULT_ORDERS_BOT.chatId;

    if (!enabled || !token || !chat) {
      return { ok: false, reason: "Orders bot not configured" };
    }

    const orderNum = order.order_number || `#${order.id}`;
    const custName = order.customer_name || "عميل المتجر";
    const custPhone = order.customer_phone || order.contact_whatsapp || "غير محدد";
    const custInsta = order.contact_instagram ? `@${order.contact_instagram.replace(/^@/, "")}` : null;
    const paid = parseFloat(order.customer_paid || "0").toFixed(2);
    const itemTitle = order.game_name || order.subscription_type || order.product_type || "منتج رقمي";
    const platform = order.platform ? `[${order.platform}]` : "";
    const pMethod = order.payment_platform ? `${order.payment_platform} 💳` : "بطاقة بنكية 💳";

    const messageHtml = `
🚀 <b>طلب شراء جديد في متجر دُكانك! 📦</b>
━━━━━━━━━━━━━━━━━
📦 <b>رقم الطلب:</b> <code>${escapeHtml(orderNum)}</code>
👤 <b>العميل:</b> ${escapeHtml(custName)}
📞 <b>الهاتف:</b> <code>${escapeHtml(custPhone)}</code>${custInsta ? `\n📸 <b>إنستغرام:</b> ${escapeHtml(custInsta)}` : ""}
🎮 <b>المنتج:</b> ${escapeHtml(itemTitle)} ${escapeHtml(platform)}
💰 <b>المبلغ المدفوع:</b> <b>$${paid}</b> (${escapeHtml(pMethod)})
━━━━━━━━━━━━━━━━━
⚡ <i>تم استلام وتأكيد الدفع وجاهز للتسليم.</i>
    `.trim();

    const inlineButtons: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
    const actionRow: Array<{ text: string; url?: string; callback_data?: string }> = [];

    if (order.contact_whatsapp || order.customer_phone) {
      const cleanPhone = (order.contact_whatsapp || order.customer_phone).replace(/\D/g, "");
      if (cleanPhone) {
        actionRow.push({ text: "💬 واتساب العميل", url: `https://wa.me/${cleanPhone}` });
      }
    }
    if (order.contact_instagram) {
      const cleanInsta = order.contact_instagram.replace(/^@/, "").trim();
      if (cleanInsta) {
        actionRow.push({ text: "📸 إنستغرام العميل", url: `https://instagram.com/${cleanInsta}` });
      }
    }
    if (actionRow.length > 0) inlineButtons.push(actionRow);

    return await postToTelegram(token, chat, messageHtml, inlineButtons);
  } catch (e) {
    console.error("Orders Telegram notification failed:", e);
    return { ok: false, error: e };
  }
}

// Geo-lookup cache to avoid hammering the API
const geoCache = new Map<string, { city: string; country: string; flag: string; org: string; ts: number }>();

async function geoLookup(ip: string): Promise<{ city: string; country: string; flag: string; org: string }> {
  const blank = { city: "غير معروف", country: "غير معروف", flag: "🌍", org: "" };
  if (!ip || ip === "::1" || ip.startsWith("127.") || ip.startsWith("192.168.") || ip.startsWith("10.")) return blank;

  const cached = geoCache.get(ip);
  if (cached && Date.now() - cached.ts < 3600_000) return cached;

  try {
    const res = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "dukkank-store/1.0" },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return blank;
    const d = await res.json() as any;
    const countryCode = (d.country_code || "").toUpperCase();
    // Convert country code to flag emoji
    const flag = countryCode.length === 2
      ? [...countryCode].map(c => String.fromCodePoint(0x1F1E6 + c.charCodeAt(0) - 65)).join("")
      : "🌍";
    const result = {
      city: d.city || d.region || "غير معروف",
      country: d.country_name || "غير معروف",
      flag,
      org: (d.org || "").replace(/^AS\d+\s*/, "").slice(0, 40),
      ts: Date.now(),
    };
    geoCache.set(ip, result);
    return result;
  } catch {
    return blank;
  }
}

function parseDevice(deviceInfo: string = ""): { device: string; os: string; browser: string } {
  const ua = deviceInfo.toLowerCase();
  let device = "🖥️ حاسوب";
  if (/iphone/.test(ua)) device = "📱 iPhone";
  else if (/ipad/.test(ua)) device = "📟 iPad";
  else if (/android.*mobile/.test(ua)) device = "📱 Android";
  else if (/android/.test(ua)) device = "📟 Android Tablet";

  let os = "غير محدد";
  if (/windows/.test(ua)) os = "Windows";
  else if (/mac os/.test(ua)) os = "macOS";
  else if (/iphone os/.test(ua) || /ios/.test(ua)) os = "iOS";
  else if (/android/.test(ua)) os = "Android";
  else if (/linux/.test(ua)) os = "Linux";

  let browser = "متصفح";
  if (/chrome/.test(ua) && !/edg/.test(ua)) browser = "Chrome";
  else if (/firefox/.test(ua)) browser = "Firefox";
  else if (/safari/.test(ua) && !/chrome/.test(ua)) browser = "Safari";
  else if (/edg/.test(ua)) browser = "Edge";
  else if (/samsung/.test(ua)) browser = "Samsung Browser";

  return { device, os, browser };
}

// ── 2. Radar & Activity Bot Dispatcher ──
export async function sendTelegramActivityNotification(event: {
  sessionId: string;
  eventType: string;
  eventTitle: string;
  eventData?: any;
  pageUrl?: string;
  deviceInfo?: string;
  ipAddress?: string;
}) {
  const config = await getDualTelegramConfig();
  const { enabled, botToken, chatId, notifyCart, notifyCheckout, notifyWhatsApp, notifyGameClick, notifySearch, notifyPageView } = config.radarBot;
  const token = botToken || DEFAULT_RADAR_BOT.botToken;
  const chat = chatId || DEFAULT_RADAR_BOT.chatId;

  if (!enabled || !token || !chat) return { ok: false, reason: "Radar bot not configured" };

  const { eventType, eventTitle, eventData, pageUrl, deviceInfo, ipAddress } = event;

  if (eventType === "add_to_cart" && notifyCart === false) return { ok: false };
  if (eventType === "checkout_start" && notifyCheckout === false) return { ok: false };
  if (eventType === "whatsapp_click" && notifyWhatsApp === false) return { ok: false };
  if (eventType === "game_click" && notifyGameClick === false) return { ok: false };
  if (eventType === "search" && !notifySearch) return { ok: false };
  if (eventType === "page_view" && !notifyPageView) return { ok: false };

  const now = new Date();
  const timeStr = now.toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true });
  const dateStr = now.toLocaleDateString("ar-JO", { weekday: "long", day: "numeric", month: "long" });

  // For page_view: rich message with geo + device
  if (eventType === "page_view") {
    const [geo, devParsed] = await Promise.all([
      geoLookup(ipAddress || ""),
      Promise.resolve(parseDevice(deviceInfo)),
    ]);

    const sourcePath = pageUrl || "/";
    const source = eventData?.source && eventData.source !== "direct" ? eventData.source : null;
    const refLine = source ? `\n🔗 <b>المصدر:</b> ${escapeHtml(source)}` : "";

    const msg = `👤 <b>زائر جديد دخل المتجر!</b>
━━━━━━━━━━━━━━━━━
${geo.flag} <b>الموقع:</b> ${escapeHtml(geo.city)} — ${escapeHtml(geo.country)}
${geo.org ? `🏢 <b>المزود:</b> ${escapeHtml(geo.org)}\n` : ""}${devParsed.device} <b>الجهاز:</b> ${devParsed.os} | ${devParsed.browser}
🌐 <b>الصفحة:</b> <code>${escapeHtml(sourcePath)}</code>${refLine}
━━━━━━━━━━━━━━━━━
⏰ <b>الوقت:</b> ${timeStr}
📅 <b>التاريخ:</b> ${dateStr}`;

    return await postToTelegram(token, chat, msg);
  }

  // Other events — existing format
  let icon = "👀";
  let actionName = eventTitle || "نشاط جديد";
  if (eventType === "add_to_cart") { icon = "🛒"; actionName = "إضافة منتج إلى السلة"; }
  else if (eventType === "checkout_start") { icon = "💳"; actionName = "بدء تعبئة بيانات الشراء والدفع"; }
  else if (eventType === "whatsapp_click") { icon = "💬"; actionName = "نقرة على زر الواتساب / الدعم الفني"; }
  else if (eventType === "game_click") { icon = "🎮"; actionName = "تصفح واختيار لعبة"; }
  else if (eventType === "search") { icon = "🔍"; actionName = "بحث في المتجر"; }
  else if (eventType === "secondary_explainer") { icon = "ℹ️"; actionName = "استعراض شرح حساب السكندري"; }

  let dataLines = "";
  if (eventData) {
    if (eventData.gameName) dataLines += `\n🎮 <b>اللعبة:</b> ${escapeHtml(eventData.gameName)}`;
    if (eventData.tier) dataLines += `\n🏷️ <b>الفئة:</b> ${escapeHtml(eventData.tier)}`;
    if (eventData.price) dataLines += `\n💰 <b>السعر:</b> $${eventData.price}`;
    if (eventData.cartTotal) dataLines += `\n💵 <b>مجموع السلة:</b> $${eventData.cartTotal}`;
    if (eventData.itemsCount) dataLines += `\n📦 <b>عدد المنتجات:</b> ${eventData.itemsCount}`;
    if (eventData.query) dataLines += `\n🔎 <b>عبارة البحث:</b> <code>${escapeHtml(eventData.query)}</code>`;
    if (eventData.source) dataLines += `\n📍 <b>المصدر:</b> ${escapeHtml(eventData.source)}`;
  }

  const msg = `${icon} <b>رادار زوار متجر دُكانك 📡</b>
━━━━━━━━━━━━━━━━━
📍 <b>الحدث:</b> ${escapeHtml(actionName)}${dataLines}
📱 <b>الجهاز:</b> ${escapeHtml(deviceInfo || "متصفح ويب")}
🌐 <b>الصفحة:</b> <code>${escapeHtml(pageUrl || "/")}</code>
⏱️ <b>التوقيت:</b> ${timeStr}`;

  return await postToTelegram(token, chat, msg);
}

// Backward-compatibility generic sender
export async function sendTelegramMessage(text: string, inlineKeyboard?: any) {
  const config = await getDualTelegramConfig();
  const token = config.ordersBot.botToken || DEFAULT_ORDERS_BOT.botToken;
  const chat = config.ordersBot.chatId || DEFAULT_ORDERS_BOT.chatId;
  return await postToTelegram(token, chat, text, inlineKeyboard);
}

export async function getTelegramConfig() {
  const dual = await getDualTelegramConfig();
  return {
    enabled: dual.ordersBot.enabled,
    botToken: dual.ordersBot.botToken,
    chatId: dual.ordersBot.chatId,
    ...dual.radarBot,
  };
}

export async function saveTelegramConfig(cfg: any) {
  const dual: Partial<DualTelegramConfig> = {
    ordersBot: {
      enabled: cfg.ordersEnabled !== undefined ? !!cfg.ordersEnabled : (cfg.enabled ?? true),
      botToken: cfg.ordersBotToken !== undefined ? cfg.ordersBotToken : (cfg.botToken || DEFAULT_ORDERS_BOT.botToken),
      chatId: cfg.ordersChatId !== undefined ? cfg.ordersChatId : (cfg.chatId || "1965859902"),
    },
    radarBot: {
      enabled: cfg.radarEnabled !== undefined ? !!cfg.radarEnabled : (cfg.enabled ?? true),
      botToken: cfg.radarBotToken !== undefined ? cfg.radarBotToken : (cfg.botToken || DEFAULT_RADAR_BOT.botToken),
      chatId: cfg.radarChatId !== undefined ? cfg.radarChatId : (cfg.chatId || DEFAULT_RADAR_BOT.chatId),
      notifyCart: cfg.notifyCart,
      notifyCheckout: cfg.notifyCheckout,
      notifyWhatsApp: cfg.notifyWhatsApp,
      notifyGameClick: cfg.notifyGameClick,
      notifySearch: cfg.notifySearch,
      notifyPageView: cfg.notifyPageView,
    },
  };
  return await saveDualTelegramConfig(dual);
}
