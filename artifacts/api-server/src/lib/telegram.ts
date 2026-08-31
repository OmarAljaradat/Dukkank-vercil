import { pool } from "./db.js";

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
  notifyCart?: boolean;
  notifyCheckout?: boolean;
  notifyWhatsApp?: boolean;
  notifyGameClick?: boolean;
  notifySearch?: boolean;
  notifyPageView?: boolean;
}

const DEFAULT_CONFIG: TelegramConfig = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN || "8809778826:AAGImBVxU-E-rez4Ic3Sy_IWlde-jxi-Htw",
  chatId: process.env.TELEGRAM_CHAT_ID || "1965859902",
  notifyCart: true,
  notifyCheckout: true,
  notifyWhatsApp: true,
  notifyGameClick: true,
  notifySearch: false,
  notifyPageView: false,
};

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let memoryConfig: TelegramConfig = { ...DEFAULT_CONFIG };

export async function getTelegramConfig(): Promise<TelegramConfig> {
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT value FROM store_config WHERE key = 'telegram_config' LIMIT 1`
      );
      if (rows.length > 0 && rows[0].value) {
        const cfg = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        memoryConfig = {
          enabled: cfg.enabled ?? true,
          botToken: cfg.botToken || process.env.TELEGRAM_BOT_TOKEN || memoryConfig.botToken || DEFAULT_CONFIG.botToken,
          chatId: cfg.chatId || process.env.TELEGRAM_CHAT_ID || memoryConfig.chatId || DEFAULT_CONFIG.chatId,
          notifyCart: cfg.notifyCart !== undefined ? !!cfg.notifyCart : true,
          notifyCheckout: cfg.notifyCheckout !== undefined ? !!cfg.notifyCheckout : true,
          notifyWhatsApp: cfg.notifyWhatsApp !== undefined ? !!cfg.notifyWhatsApp : true,
          notifyGameClick: cfg.notifyGameClick !== undefined ? !!cfg.notifyGameClick : true,
          notifySearch: cfg.notifySearch !== undefined ? !!cfg.notifySearch : false,
          notifyPageView: cfg.notifyPageView !== undefined ? !!cfg.notifyPageView : false,
        };
        return memoryConfig;
      }
    } catch (e) {
      console.warn("Could not load telegram_config from DB:", e);
    }
  }
  return memoryConfig;
}

export async function saveTelegramConfig(cfg: Partial<TelegramConfig>): Promise<TelegramConfig> {
  const current = await getTelegramConfig();
  const updated: TelegramConfig = {
    enabled: cfg.enabled !== undefined ? !!cfg.enabled : current.enabled,
    botToken: (cfg.botToken !== undefined && cfg.botToken !== "" ? cfg.botToken : current.botToken || DEFAULT_CONFIG.botToken).trim(),
    chatId: (cfg.chatId !== undefined && cfg.chatId !== "" ? cfg.chatId : current.chatId || DEFAULT_CONFIG.chatId).trim(),
    notifyCart: cfg.notifyCart !== undefined ? !!cfg.notifyCart : (current.notifyCart ?? true),
    notifyCheckout: cfg.notifyCheckout !== undefined ? !!cfg.notifyCheckout : (current.notifyCheckout ?? true),
    notifyWhatsApp: cfg.notifyWhatsApp !== undefined ? !!cfg.notifyWhatsApp : (current.notifyWhatsApp ?? true),
    notifyGameClick: cfg.notifyGameClick !== undefined ? !!cfg.notifyGameClick : (current.notifyGameClick ?? true),
    notifySearch: cfg.notifySearch !== undefined ? !!cfg.notifySearch : (current.notifySearch ?? false),
    notifyPageView: cfg.notifyPageView !== undefined ? !!cfg.notifyPageView : (current.notifyPageView ?? false),
  };

  memoryConfig = { ...updated };

  if (pool) {
    try {
      await pool.query(
        `INSERT INTO store_config (key, value, updated_at)
         VALUES ('telegram_config', $1, NOW())
         ON CONFLICT (key) DO UPDATE SET value = $1, updated_at = NOW()`,
        [JSON.stringify(updated)]
      );
    } catch (e) {
      console.error("Failed to save telegram config:", e);
    }
  }

  return updated;
}

export async function sendTelegramMessage(text: string, inlineKeyboard?: Array<Array<{ text: string; url?: string; callback_data?: string }>>) {
  const config = await getTelegramConfig();
  const token = config.botToken || DEFAULT_CONFIG.botToken;
  const chat = config.chatId || DEFAULT_CONFIG.chatId;

  if (!config.enabled || !token || !chat) {
    return { ok: false, reason: "Telegram bot not configured or disabled" };
  }

  try {
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const sanitizedKeyboard: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];
    if (inlineKeyboard && inlineKeyboard.length > 0) {
      inlineKeyboard.forEach((row) => {
        const validRow = row.filter((btn) => {
          if (btn.url) {
            return /^https?:\/\/[^\s/$.?#].[^\s]*$/i.test(btn.url);
          }
          return !!btn.callback_data;
        });
        if (validRow.length > 0) sanitizedKeyboard.push(validRow);
      });
    }

    const payload: any = {
      chat_id: chat,
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
      console.warn("Telegram send failed, retrying plain text:", data.description);
      const plainText = text.replace(/<[^>]+>/g, "");
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chat,
          text: plainText,
        }),
      });
      data = await res.json();
    }

    return data;
  } catch (err: any) {
    console.error("Telegram notification error:", err);
    return { ok: false, error: err.message };
  }
}

export async function sendTelegramActivityNotification(event: {
  sessionId: string;
  eventType: string;
  eventTitle: string;
  eventData?: any;
  pageUrl?: string;
  deviceInfo?: string;
  ipAddress?: string;
}) {
  const config = await getTelegramConfig();
  if (!config.enabled) return { ok: false, reason: "disabled" };

  const { eventType, eventTitle, eventData, pageUrl, deviceInfo } = event;

  // Filter check based on admin config preferences
  if (eventType === "add_to_cart" && config.notifyCart === false) return { ok: false };
  if (eventType === "checkout_start" && config.notifyCheckout === false) return { ok: false };
  if (eventType === "whatsapp_click" && config.notifyWhatsApp === false) return { ok: false };
  if (eventType === "game_click" && config.notifyGameClick === false) return { ok: false };
  if (eventType === "search" && !config.notifySearch) return { ok: false };
  if (eventType === "page_view" && !config.notifyPageView) return { ok: false };

  let icon = "👀";
  let actionName = eventTitle || "نشاط جديد";
  if (eventType === "add_to_cart") { icon = "🛒"; actionName = "إضافة منتج إلى السلة"; }
  else if (eventType === "checkout_start") { icon = "💳"; actionName = "بدء تعبئة بيانات الشراء والدفع"; }
  else if (eventType === "whatsapp_click") { icon = "💬"; actionName = "نقرة على زر الواتساب / الدعم الفني"; }
  else if (eventType === "game_click") { icon = "🎮"; actionName = "تصفح واختيار لعبة"; }
  else if (eventType === "search") { icon = "🔍"; actionName = "بحث في المتجر"; }
  else if (eventType === "secondary_explainer") { icon = "ℹ️"; actionName = "استعراض شرح حساب السكندري"; }

  const timeStr = new Date().toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });

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

  return await sendTelegramMessage(msg);
}

export async function sendTelegramOrderNotification(order: any) {
  try {
    const orderNum = order.order_number || `#${order.id}`;
    const custName = order.customer_name || "عميل المتجر";
    const custPhone = order.customer_phone || order.contact_whatsapp || "غير محدد";
    const custInsta = order.contact_instagram ? `@${order.contact_instagram.replace(/^@/, "")}` : null;
    const paid = parseFloat(order.customer_paid || "0").toFixed(2);
    const itemTitle = order.game_name || order.subscription_type || order.product_type || "منتج رقمي";
    const platform = order.platform ? `[${order.platform}]` : "";
    const pMethod = order.payment_platform ? `${order.payment_platform} 💳` : "بطاقة بنكية 💳";

    const messageHtml = `
🚀 <b>طلب جديد في دُكانك!</b>
━━━━━━━━━━━━━━━━━
📦 <b>رقم الطلب:</b> <code>${escapeHtml(orderNum)}</code>
👤 <b>العميل:</b> ${escapeHtml(custName)}
📞 <b>الهاتف:</b> <code>${escapeHtml(custPhone)}</code>${custInsta ? `\n📸 <b>إنستغرام:</b> ${escapeHtml(custInsta)}` : ""}
🎮 <b>المنتج:</b> ${escapeHtml(itemTitle)} ${escapeHtml(platform)}
💰 <b>المبلغ المدفوع:</b> <b>$${paid}</b> (${escapeHtml(pMethod)})
━━━━━━━━━━━━━━━━━
⚡ <i>تم استلام الطلب وتأكيد الدفع بنجاح.</i>
    `.trim();

    const inlineButtons: Array<Array<{ text: string; url?: string; callback_data?: string }>> = [];

    const actionRow: Array<{ text: string; url?: string; callback_data?: string }> = [];
    if (order.contact_whatsapp || order.customer_phone) {
      const cleanPhone = (order.contact_whatsapp || order.customer_phone).replace(/\D/g, "");
      if (cleanPhone) {
        actionRow.push({
          text: "💬 واتساب العميل",
          url: `https://wa.me/${cleanPhone}`,
        });
      }
    }
    if (order.contact_instagram) {
      const cleanInsta = order.contact_instagram.replace(/^@/, "").trim();
      if (cleanInsta) {
        actionRow.push({
          text: "📸 إنستغرام العميل",
          url: `https://instagram.com/${cleanInsta}`,
        });
      }
    }
    if (actionRow.length > 0) inlineButtons.push(actionRow);

    return await sendTelegramMessage(messageHtml, inlineButtons);
  } catch (e) {
    console.error("Failed to format/send Telegram order notification:", e);
    return { ok: false, error: e };
  }
}
