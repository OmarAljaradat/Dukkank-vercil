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

    let suppliers: Array<{ id: number; name: string; phone: string }> = [];
    if (pool) {
      try {
        const { rows } = await pool.query(
          "SELECT id, name, phone FROM suppliers WHERE is_active = true ORDER BY id ASC LIMIT 3"
        );
        suppliers = rows;
      } catch (_) {}
    }

    if (suppliers.length === 0) {
      suppliers = [{ id: 1, name: "المورد المعتمد", phone: "962775585112" }];
    }

    let customTemplate = `السلام عليكم أخي {supplier_name} 👋
طلب حساب جديد من متجر دُكانك 🎮:

🏷️ اللعبة / المنتج: *{game_name}* ({platform})
📦 رقم الطلب: *#{order_number}*

يرجى تجهيز بيانات الحساب (الإيميل، الباسوورد، أكواد الأمان) والتكلفة وإرسالها أول ما يجهز ⚡`;

    if (pool) {
      try {
        const { rows: tRows } = await pool.query("SELECT value FROM store_config WHERE key = 'supplier_message_template' LIMIT 1");
        if (tRows.length > 0 && tRows[0].value) {
          const val = typeof tRows[0].value === "string" ? JSON.parse(tRows[0].value) : tRows[0].value;
          if (val.template) customTemplate = val.template;
        }
      } catch (_) {}
    }

    const formatSupplierMessage = (supName: string) => {
      const t = customTemplate
        .replace(/\{supplier_name\}/g, supName)
        .replace(/\{game_name\}/g, order.game_name || order.product_type || "منتج")
        .replace(/\{platform\}/g, order.platform || "PS5")
        .replace(/\{order_number\}/g, String(orderNum).replace(/^#/, ""))
        .replace(/\{customer_name\}/g, order.customer_name || "عميل")
        .replace(/\{paid\}/g, paid);
      return encodeURIComponent(t);
    };

    const qrRequestText = encodeURIComponent(
      `مرحباً أخي ${order.customer_name || "العميل"} 🎮\nشكراً لشرائك من متجر دُكانك ⚡\n\nلتسليم وتفعيل طلبك (${order.game_name || "الطلب"}) فوراً:\nيرجى فتح شاشة السوني واختيار (تسجيل الدخول عبر كود QR) وتصوير الكود وإرساله لنا هنا 📸`
    );

    const messageHtml = `🔥 <b>طلب شراء جديد #${escapeHtml(orderNum)}</b>

🎮 <b>المنتج:</b> <b>${game}</b> ${platform}
👤 <b>العميل:</b> <b>${customerName}</b>
📱 <b>الهاتف:</b> <code>${rawPhone}</code>
${igRaw ? `📸 <b>إنستغرام:</b> @${escapeHtml(igRaw)}\n` : ""}💰 <b>المبلغ المدفوع:</b> <b>${paid}</b> (${payment})

──────────────────
<b>📋 مراحل تنفيذ الطلب بالترتيب:</b>

<b>1️⃣ المرحلة الأولى: إرسال الطلب للمورد</b>
إرسال بيانات اللعبة للمورد على الواتساب لمعرفة التكلفة وتجهيز الحساب.

<b>2️⃣ المرحلة الثانية: استلام وتسجيل بيانات الحساب</b>
تسجيل إيميل وباسوورد الحساب وأكواد الأمان والتكلفة بالموقع.

<b>3️⃣ المرحلة الثالثة: تسليم العميل وإكمال الطلب</b>
طلب كود الدخول (QR) عبر واتساب أو إنستغرام وتسليم الحساب للعميل.`;

    const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

    // 1️⃣ STEP 1: Suppliers Forwarding
    suppliers.forEach((sup) => {
      const supClean = (sup.phone || "").replace(/\D/g, "");
      if (supClean && supClean.length >= 8) {
        inlineButtons.push([
          {
            text: `1️⃣ 🚚 إرسال للمورد: ${sup.name} (واتساب)`,
            url: `https://wa.me/${supClean}?text=${formatSupplierMessage(sup.name)}`,
          },
        ]);
      }
    });

    // 2️⃣ STEP 2: Enter Account Credentials in Website
    inlineButtons.push([
      {
        text: `2️⃣ 📝 تسجيل بيانات الحساب والتكلفة بالموقع`,
        url: `https://www.dukkank.store/admin/orders`,
      },
    ]);

    // 3️⃣ STEP 3: Customer Communication & Delivery
    const customerButtons: Array<{ text: string; url: string }> = [];
    if (igRaw) {
      customerButtons.push({
        text: `3️⃣ 📸 إنستغرام العميل`,
        url: `https://instagram.com/${igRaw}`,
      });
    }
    if (cleanPhone && cleanPhone.length >= 8) {
      customerButtons.push({
        text: `3️⃣ 📲 واتساب العميل (طلب QR)`,
        url: `https://wa.me/${cleanPhone}?text=${qrRequestText}`,
      });
    }
    if (customerButtons.length > 0) inlineButtons.push(customerButtons);

    return await sendTelegramMessage(messageHtml, inlineButtons);
  } catch (e: any) {
    console.error("Failed to format/send Telegram order notification:", e);
    return { ok: false, error: e.message };
  }
}
