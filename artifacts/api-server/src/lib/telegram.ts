import pg from "pg";

const pool = process.env.DATABASE_URL ? new pg.Pool({ connectionString: process.env.DATABASE_URL }) : null;

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

export async function getTelegramConfig(): Promise<TelegramConfig> {
  if (pool) {
    try {
      const { rows } = await pool.query(
        `SELECT value FROM store_config WHERE key = 'telegram_config' LIMIT 1`
      );
      if (rows.length > 0 && rows[0].value) {
        const cfg = typeof rows[0].value === "string" ? JSON.parse(rows[0].value) : rows[0].value;
        return {
          enabled: cfg.enabled ?? true,
          botToken: cfg.botToken || process.env.TELEGRAM_BOT_TOKEN || "",
          chatId: cfg.chatId || process.env.TELEGRAM_CHAT_ID || "",
        };
      }
    } catch (e) {
      console.warn("Could not load telegram_config from DB:", e);
    }
  }
  return DEFAULT_CONFIG;
}

export async function saveTelegramConfig(cfg: Partial<TelegramConfig>): Promise<TelegramConfig> {
  const current = await getTelegramConfig();
  const updated: TelegramConfig = {
    enabled: cfg.enabled !== undefined ? !!cfg.enabled : current.enabled,
    botToken: (cfg.botToken !== undefined ? cfg.botToken : current.botToken).trim(),
    chatId: (cfg.chatId !== undefined ? cfg.chatId : current.chatId).trim(),
  };

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
    const payload: any = {
      chat_id: config.chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: false,
    };

    if (inlineKeyboard && inlineKeyboard.length > 0) {
      payload.reply_markup = {
        inline_keyboard: inlineKeyboard,
      };
    }

    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    return data;
  } catch (err: any) {
    console.error("Telegram notification error:", err);
    return { ok: false, error: err.message };
  }
}

export async function sendTelegramOrderNotification(order: any) {
  try {
    const orderNum = order.order_number || `#${order.id}`;
    const customerName = order.customer_name || "عميل دُكانك";
    const phone = (order.customer_phone || order.contact_whatsapp || "").replace(/\D/g, "");
    const rawPhone = order.customer_phone || order.contact_whatsapp || "غير محدد";
    const igRaw = (order.contact_instagram || "").replace(/^@/, "").trim();
    const game = order.game_name || order.subscription_type || order.product_type || "منتج رقمي";
    const platform = order.platform ? `(${order.platform})` : "";
    const paid = order.customer_paid ? `$${parseFloat(order.customer_paid).toFixed(2)}` : "—";
    const payment = order.payment_platform || "دفع إلكتروني";

    const qrRequestMsg = encodeURIComponent(
      `مرحباً أخي ${customerName} 🎮\nشكراً لشرائك من متجر *دُكانك* ⚡\n\nلتسليم وتفعيل طلبك (${game}) فوراً:\nيرجى فتح جهازك السوني واختيار (تسجيل الدخول عبر كود QR) وتصوير الكود وإرساله لنا هنا 📸.\n\nفريقنا جاهز لإدخالك الحساب وتفعيله بأمان تام 🚀`
    );

    const messageHtml = `🔥 <b>طلب شراء جديد في دُكانك!</b>

📦 <b>رقم الطلب:</b> <code>${orderNum}</code>
👤 <b>العميل:</b> ${customerName}
📱 <b>الهاتف:</b> <code>${rawPhone}</code>
${igRaw ? `📸 <b>إنستغرام:</b> @${igRaw}\n` : ""}🎮 <b>المنتج:</b> <b>${game}</b> ${platform}
💰 <b>المبلغ:</b> <b>${paid}</b>
💳 <b>طريقة الدفع:</b> ${payment}
⏱️ <b>الحالة:</b> طلب جديد وبانتظار التنفيذ ⚡`;

    const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

    const row1: Array<{ text: string; url: string }> = [];
    if (igRaw) {
      row1.push({
        text: `💬 إنستغرام العميل (@${igRaw})`,
        url: `https://instagram.com/${igRaw}`,
      });
    }
    if (phone) {
      row1.push({
        text: `📲 واتساب العميل (طلب QR)`,
        url: `https://wa.me/${phone}?text=${qrRequestMsg}`,
      });
    }
    if (row1.length > 0) inlineButtons.push(row1);

    const row2: Array<{ text: string; url: string }> = [
      {
        text: `🚀 فتح الطلب في لوحة التحكم`,
        url: `https://www.dukkank.store/admin/orders`,
      },
    ];
    inlineButtons.push(row2);

    return await sendTelegramMessage(messageHtml, inlineButtons);
  } catch (e: any) {
    console.error("Failed to format/send Telegram order notification:", e);
    return { ok: false, error: e.message };
  }
}
