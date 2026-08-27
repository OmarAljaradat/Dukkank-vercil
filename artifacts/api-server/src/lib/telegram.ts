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

    // 1. Fetch active suppliers to create direct WhatsApp buttons
    let suppliers: Array<{ id: number; name: string; phone: string }> = [];
    if (pool) {
      try {
        const { rows } = await pool.query(
          "SELECT id, name, phone FROM suppliers WHERE is_active = true ORDER BY id ASC LIMIT 4"
        );
        suppliers = rows;
      } catch (_) {}
    }

    // Default supplier if no suppliers in DB
    if (suppliers.length === 0) {
      suppliers = [{ id: 1, name: "المورد المعتمد", phone: "962775585112" }];
    }

    // Formatted Customer WhatsApp Message asking for Sony QR Code
    const qrRequestMsg = encodeURIComponent(
      `مرحباً أخي ${customerName} 🎮\nشكراً لشرائك من متجر *دُكانك* ⚡\n\nلتسليم وتفعيل طلبك (${game}) فوراً:\nيرجى فتح جهازك السوني واختيار (تسجيل الدخول عبر كود QR) وتصوير الكود وإرساله لنا هنا 📸.\n\nفريقنا جاهز لإدخالك الحساب وتفعيله بجهازك بأمان تام 🚀`
    );

    // Formatted Supplier WhatsApp Message
    const getSupplierMsg = (supName: string) => encodeURIComponent(
      `السلام عليكم أخي ${supName} 👋\nطلب حساب جديد من متجر *دُكانك* 🎮:\n\n🏷️ اللعبة / الاشتراك: *${game}* ${platform}\n📦 رقم الطلب: *#${orderNum}*\n\nيرجى تجهيز بيانات الحساب (الإيميل، الباسوورد، أكواد الأمان) والتكلفة وإرسالها أول ما يجهز ⚡`
    );

    const messageHtml = `🔥 <b>طلب شراء جديد في دُكانك!</b>

📦 <b>رقم الطلب:</b> <code>${orderNum}</code>
👤 <b>العميل:</b> <b>${customerName}</b>
📱 <b>الهاتف / واتساب:</b> <code>${rawPhone}</code>
${igRaw ? `📸 <b>إنستغرام العميل:</b> @${igRaw}\n` : ""}🎮 <b>المنتج:</b> <b>${game}</b> ${platform}
💰 <b>المبلغ المدفوع:</b> <b>${paid}</b>
💳 <b>وسيلة الدفع:</b> ${payment}
⏱️ <b>حالة الطلب:</b> طلب جديد وبانتظار التنفيذ ⚡

───────────────
<b>👇 مسار التنفيذ والأتمتة السريعة:</b>`;

    const inlineButtons: Array<Array<{ text: string; url: string }>> = [];

    // ROW 1: Customer Direct Communication (Instagram + WhatsApp)
    const customerRow: Array<{ text: string; url: string }> = [];
    if (igRaw) {
      customerRow.push({
        text: `📸 إنستغرام العميل (@${igRaw})`,
        url: `https://instagram.com/${igRaw}`,
      });
    }
    if (phone) {
      customerRow.push({
        text: `📲 واتساب العميل (طلب QR)`,
        url: `https://wa.me/${phone}?text=${qrRequestMsg}`,
      });
    } else if (!igRaw) {
      customerRow.push({
        text: `📲 مراسلة العميل واتساب`,
        url: `https://wa.me/?text=${qrRequestMsg}`,
      });
    }
    if (customerRow.length > 0) inlineButtons.push(customerRow);

    // ROW 2: Forward to Supplier via WhatsApp (for each active supplier)
    suppliers.forEach((sup) => {
      const supCleanPhone = (sup.phone || "").replace(/\D/g, "");
      if (supCleanPhone) {
        inlineButtons.push([
          {
            text: `📦 تحويل للمورد: ${sup.name} 📲`,
            url: `https://wa.me/${supCleanPhone}?text=${getSupplierMsg(sup.name)}`,
          },
        ]);
      }
    });

    // ROW 3: Quick Action & Website Admin Link
    inlineButtons.push([
      {
        text: `🚀 فتح الطلب في لوحة التحكم (الموقع)`,
        url: `https://www.dukkank.store/admin/orders`,
      },
    ]);

    return await sendTelegramMessage(messageHtml, inlineButtons);
  } catch (e: any) {
    console.error("Failed to format/send Telegram order notification:", e);
    return { ok: false, error: e.message };
  }
}
