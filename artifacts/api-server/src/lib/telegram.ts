import { pool } from "./db.js";

export interface TelegramConfig {
  enabled: boolean;
  botToken: string;
  chatId: string;
}

const DEFAULT_CONFIG: TelegramConfig = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
};

function escapeHtml(str: string): string {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

let memoryConfig: TelegramConfig = {
  enabled: true,
  botToken: process.env.TELEGRAM_BOT_TOKEN || "",
  chatId: process.env.TELEGRAM_CHAT_ID || "",
};

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
          botToken: cfg.botToken || process.env.TELEGRAM_BOT_TOKEN || memoryConfig.botToken || "",
          chatId: cfg.chatId || process.env.TELEGRAM_CHAT_ID || memoryConfig.chatId || "",
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
    botToken: (cfg.botToken !== undefined ? cfg.botToken : current.botToken).trim(),
    chatId: (cfg.chatId !== undefined ? cfg.chatId : current.chatId).trim(),
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
  if (!config.enabled || !config.botToken || !config.chatId) {
    return { ok: false, reason: "Telegram bot not configured or disabled" };
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken}/sendMessage`;

    // Filter and sanitize keyboard buttons to ensure valid HTTP/HTTPS URLs
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
      chat_id: config.chatId,
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

    let data = await res.json();

    // If HTML parsing or keyboard failed, retry with plain text and no keyboard as fallback
    if (!data.ok) {
      console.warn("Telegram send failed, retrying plain text:", data.description);
      const plainText = text.replace(/<[^>]+>/g, "");
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: config.chatId,
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

export async function sendTelegramOrderNotification(order: any) {
  try {
    const orderNum = order.order_number || `#${order.id}`;
    const customerName = escapeHtml(order.customer_name || "عميل دُكانك");
    const cleanPhone = (order.customer_phone || order.contact_whatsapp || "").replace(/\D/g, "");
    const rawPhone = escapeHtml(order.customer_phone || order.contact_whatsapp || "غير محدد");
    const igRaw = (order.contact_instagram || "").replace(/^@/, "").trim();
    const game = escapeHtml(order.game_name || order.subscription_type || order.product_type || "منتج رقمي");
    const platform = order.platform ? escapeHtml(`(${order.platform})`) : "";
    const paid = order.customer_paid ? `$${parseFloat(order.customer_paid).toFixed(2)}` : "—";
    const payment = escapeHtml(order.payment_platform || "دفع إلكتروني");

    // Fetch suppliers from DB if available
    let suppliers: Array<{ id: number; name: string; phone: string }> = [];
    if (pool) {
      try {
        const { rows } = await pool.query(
          "SELECT id, name, phone FROM suppliers WHERE is_active = true ORDER BY id ASC LIMIT 3"
        );
        suppliers = rows;
      } catch (_) {}
    }

    // Default supplier if no suppliers configured yet
    if (suppliers.length === 0) {
      suppliers = [{ id: 1, name: "المورد", phone: "962775585112" }];
    }

    const qrRequestText = encodeURIComponent(
      `مرحباً أخي ${order.customer_name || "العميل"} 🎮\nشكراً لشرائك من متجر دُكانك ⚡\n\nلتسليم وتفعيل طلبك (${order.game_name || "الطلب"}) فوراً:\nيرجى فتح شاشة السوني واختيار (تسجيل الدخول عبر كود QR) وتصوير الكود وإرساله لنا هنا 📸`
    );

    const supplierMsgText = (supName: string) => encodeURIComponent(
      `السلام عليكم أخي ${supName} 👋\nطلب حساب جديد من متجر دُكانك 🎮:\n\nالطلب: ${order.game_name || "حساب"} ${order.platform || ""}\nرقم الطلب: #${orderNum}\n\nيرجى تجهيز الحساب والتكلفة وإرساله ⚡`
    );

    const messageHtml = `🔥 <b>طلب شراء جديد في دُكانك!</b>

📦 <b>رقم الطلب:</b> <code>${escapeHtml(orderNum)}</code>
👤 <b>العميل:</b> <b>${customerName}</b>
📱 <b>الهاتف:</b> <code>${rawPhone}</code>
${igRaw ? `📸 <b>إنستغرام:</b> @${escapeHtml(igRaw)}\n` : ""}🎮 <b>المنتج:</b> <b>${game}</b> ${platform}
💰 <b>المبلغ:</b> <b>${paid}</b>
💳 <b>طريقة الدفع:</b> ${payment}
⏱️ <b>الحالة:</b> طلب جديد وبانتظار التنفيذ ⚡

───────────────
<b>👇 مسار التواصل والتنفيذ:</b>`;

    const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

    // ROW 1: Customer Direct Communication
    const row1: Array<{ text: string; url: string }> = [];
    if (igRaw) {
      row1.push({
        text: `📸 إنستغرام (@${igRaw})`,
        url: `https://instagram.com/${igRaw}`,
      });
    }
    if (cleanPhone && cleanPhone.length >= 8) {
      row1.push({
        text: `📲 واتساب (طلب QR)`,
        url: `https://wa.me/${cleanPhone}?text=${qrRequestText}`,
      });
    }
    if (row1.length > 0) inlineButtons.push(row1);

    // ROW 2: Suppliers WhatsApp
    suppliers.forEach((sup) => {
      const supClean = (sup.phone || "").replace(/\D/g, "");
      if (supClean && supClean.length >= 8) {
        inlineButtons.push([
          {
            text: `📦 تحويل للمورد: ${sup.name} 📲`,
            url: `https://wa.me/${supClean}?text=${supplierMsgText(sup.name)}`,
          },
        ]);
      }
    });

    // ROW 3: Store Admin Dashboard Link
    inlineButtons.push([
      {
        text: `🚀 فتح الطلب في لوحة التحكم`,
        url: `https://www.dukkank.store/admin/orders`,
      },
    ]);

    return await sendTelegramMessage(messageHtml, inlineButtons);
  } catch (e: any) {
    console.error("Failed to format/send Telegram order notification:", e);
    return { ok: false, error: e.message };
  }
}
