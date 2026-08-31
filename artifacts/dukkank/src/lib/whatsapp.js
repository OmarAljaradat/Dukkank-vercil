import { trackWhatsAppClick } from "./tracker";
import { STORE as FALLBACK_STORE } from "../data/products";

const fmtPriceUSD = (n) =>
    Number.isInteger(n) ? `${n}$` : `${n.toFixed(2).replace(/\.00$/, "")}$`;

// Generate unique order number: DK-YYMMDD-XXXX
export function generateOrderNumber() {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let rand = "";
    for (let i = 0; i < 4; i++) {
        rand += chars[Math.floor(Math.random() * chars.length)];
    }
    return `DK-${yy}${mm}${dd}-${rand}`;
}

// Replace template variables: {storeName}, {productName}, {price}
function applyTemplate(tpl, vars = {}) {
    if (!tpl) return "";
    return tpl.replace(/\{(\w+)\}/g, (match, key) => {
        if (vars[key] != null) return String(vars[key]);
        return match;
    });
}

const DEFAULT_TEMPLATES = {
    general: "السلام عليكم 👋\nأود الاستفسار عن منتجات متجر {storeName}.",
    productInquiry: "السلام عليكم 👋\nشفت {productName} في متجركم وأبغى أطلبه.\n\nهل لا يزال متوفر؟",
    orderHeader: "السلام عليكم 👋\nأرغب بطلب من متجر *{storeName}*:",
    orderFooter: "شكراً لكم 🌟",
};

export function buildOrderMessage(items, format, currencyCode, store = FALLBACK_STORE, templates = DEFAULT_TEMPLATES) {
    const s = store || FALLBACK_STORE;
    const t = { ...DEFAULT_TEMPLATES, ...(templates || {}) };
    const storeName = s.name || "";

    if (!items || items.length === 0) {
        return applyTemplate(t.general, { storeName });
    }

    const orderNumber = generateOrderNumber();
    const fmt = format || fmtPriceUSD;
    const lines = [applyTemplate(t.orderHeader, { storeName }), ""];

    // Order number — prominently displayed
    lines.push(`🔖 رقم الطلب: *${orderNumber}*`);
    lines.push("");

    let total = 0;

    items.forEach((item, idx) => {
        const qty = item.quantity || 1;
        const lineTotal = item.price * qty;
        total += lineTotal;
        lines.push(`${idx + 1}. *${item.title}*`);
        if (item.subtitle) lines.push(`   • ${item.subtitle}`);
        lines.push(
            `   • الكمية: ${qty}  —  السعر: ${fmt(item.price)}  —  المجموع: ${fmt(lineTotal)}`,
        );
        lines.push("");
    });

    lines.push(`*الإجمالي: ${fmt(total)}*${currencyCode ? ` (${currencyCode})` : ""}`);
    lines.push("");
    lines.push(applyTemplate(t.orderFooter, { storeName }));
    return lines.join("\n");
}

export function openWhatsApp(message, store = FALLBACK_STORE) {
    const s = store || FALLBACK_STORE;
    const url = `https://wa.me/${s.whatsapp}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
}

// Default greeting (no specific product) — uses "general" template
export function quickInquiry(productLine, store = FALLBACK_STORE, templates = DEFAULT_TEMPLATES) {
    const s = store || FALLBACK_STORE;
    const t = { ...DEFAULT_TEMPLATES, ...(templates || {}) };
    const msg = productLine
        ? applyTemplate(t.productInquiry, { storeName: s.name || "", productName: productLine })
        : applyTemplate(t.general, { storeName: s.name || "" });
    openWhatsApp(msg, s);
}

// Specific product inquiry — uses "productInquiry" template
export function productInquiry(productName, store = FALLBACK_STORE, templates = DEFAULT_TEMPLATES, extra = "") {
    const s = store || FALLBACK_STORE;
    const t = { ...DEFAULT_TEMPLATES, ...(templates || {}) };
    let msg = applyTemplate(t.productInquiry, { storeName: s.name || "", productName });
    if (extra) msg += `\n\n${extra}`;
    openWhatsApp(msg, s);
}

export { fmtPriceUSD, applyTemplate, DEFAULT_TEMPLATES };
