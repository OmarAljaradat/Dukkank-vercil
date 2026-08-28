// Lightweight localStorage helpers with namespace prefix
const NS = "dk_";

export function lsGet(key, fallback = null) {
    try {
        const raw = localStorage.getItem(NS + key);
        return raw ? JSON.parse(raw) : fallback;
    } catch {
        return fallback;
    }
}

export function lsSet(key, value) {
    try {
        localStorage.setItem(NS + key, JSON.stringify(value));
    } catch { /* quota exceeded or private mode */ }
}

export function lsDel(key) {
    try { localStorage.removeItem(NS + key); } catch { }
}

// Orders log (client-side cache / source of truth when server is unavailable)
export function getOrders() { return lsGet("orders", []); }
export function addOrder(order) {
    const orders = getOrders();
    orders.unshift({ ...order, id: order.id || Date.now().toString(36) });
    lsSet("orders", orders.slice(0, 500));
    return orders;
}

// Coupons
export function getCoupons() { return lsGet("coupons", []); }
export function setCoupons(list) { lsSet("coupons", list); }

// Theme overrides (CSS HSL values)
export function getTheme() { return lsGet("theme", {}); }
export function setTheme(t) { lsSet("theme", t); }

// SEO settings
export function getSeo() {
    return lsGet("seo", {
        title: "دُكانك | متجر الاشتراكات والألعاب الرقمية",
        description: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.",
        keywords: "بلايستيشن بلاس, ألعاب رقمية, اشتراكات PS4 PS5, دُكانك",
        ogImage: "",
    });
}
export function setSeo(s) { lsSet("seo", s); }

// Product schedules
export function getSchedules() { return lsGet("schedules", []); }
export function setSchedules(s) { lsSet("schedules", s); }

// IP blocks (admin-side list shown in UI — actual blocking is server-side)
export function getIpBlocks() { return lsGet("ip_blocks", []); }
export function setIpBlocks(list) { lsSet("ip_blocks", list); }

// Activity log
export function getActivityLog() { return lsGet("activity", []); }
export function logActivity(action, detail = "") {
    const log = getActivityLog();
    log.unshift({ action, detail, ts: Date.now() });
    lsSet("activity", log.slice(0, 200));
}

// Abandonment popup settings
export function getPopupSettings() {
    return lsGet("popup", { enabled: true, delay: 30, message: "مهلاً! هل تريد الاستفسار عن منتجاتنا؟ تواصل معنا مباشرة على واتساب." });
}
export function setPopupSettings(s) { lsSet("popup", s); }

const LEGACY_MOCK_PHONES = new Set(["966501234567", "966559876543", "96599112233", "966543210987"]);

// Registered Users & Password Management for CRM
export function getRegisteredUsers() {
    const list = lsGet("registered_users", []);
    const cleaned = list.filter(u => u && u.phone && !LEGACY_MOCK_PHONES.has(u.phone));
    if (cleaned.length !== list.length) {
        setRegisteredUsers(cleaned);
    }
    return cleaned;
}
export function setRegisteredUsers(list) { lsSet("registered_users", list); }
export function deleteRegisteredUser(phone) {
    const list = getRegisteredUsers();
    const updated = list.filter(x => x.phone !== phone);
    setRegisteredUsers(updated);
    return true;
}
export function clearAllRegisteredUsers() {
    setRegisteredUsers([]);
    lsSet("customer_wallets", {});
    lsSet("customer_wallet_logs", {});
    lsSet("crm_customer_notes", {});
    lsSet("crm_customer_flags", {});
    lsSet("crm_customer_tags", {});
    lsSet("crm_manual_customers", []);
}
export function saveRegisteredUser(u) {
    const list = getRegisteredUsers();
    const idx = list.findIndex(x => x.phone === u.phone || (x.email && x.email === u.email));
    if (idx >= 0) {
        list[idx] = { ...list[idx], ...u };
    } else {
        list.unshift({ ...u, createdAt: Date.now() });
    }
    setRegisteredUsers(list);
}
export function updateUserPassword(phone, newPass) {
    const list = getRegisteredUsers();
    const idx = list.findIndex(x => x.phone === phone);
    if (idx >= 0) {
        list[idx].pass = newPass;
        setRegisteredUsers(list);
        return true;
    }
    return false;
}

// Customer Wallet Balance System
export function getCustomerWallets() {
    return lsGet("customer_wallets", {});
}

export function setCustomerWallets(wallets) {
    lsSet("customer_wallets", wallets);
}

export function getCustomerWalletBalance(phone) {
    const wallets = getCustomerWallets();
    return wallets[phone] !== undefined ? Number(wallets[phone]) : 0;
}

export function getCustomerWalletLogs(phone) {
    const allLogs = lsGet("customer_wallet_logs", {});
    return allLogs[phone] || [];
}

export function updateCustomerWalletBalance(phone, amount, reason = "تعديل رصيد بواسطة الأدمن") {
    const wallets = getCustomerWallets();
    const current = wallets[phone] !== undefined ? Number(wallets[phone]) : 0;
    const newBalance = Math.max(0, current + amount);
    wallets[phone] = newBalance;
    setCustomerWallets(wallets);

    // Save transaction log
    const allLogs = lsGet("customer_wallet_logs", {});
    const logs = allLogs[phone] || [];
    logs.unshift({
        id: `TX-${Date.now().toString(36).toUpperCase()}`,
        date: new Date().toLocaleDateString('ar-EG'),
        type: amount >= 0 ? "charge" : "deduct",
        amount: Math.abs(amount),
        newBalance,
        reason,
        admin: "الأدمن"
    });
    allLogs[phone] = logs.slice(0, 50);
    lsSet("customer_wallet_logs", allLogs);

    return newBalance;
}

// Apply theme overrides to document
export function applyTheme(overrides = {}) {
    let style = document.getElementById("dk-theme-override");
    if (!style) {
        style = document.createElement("style");
        style.id = "dk-theme-override";
        document.head.appendChild(style);
    }
    if (!overrides || typeof overrides !== "object") {
        style.textContent = "";
        return;
    }
    const entries = Object.entries(overrides).filter(([, v]) => v && typeof v === "string");
    if (entries.length === 0) {
        style.textContent = "";
        return;
    }
    const vars = entries.map(([k, v]) => `  --${k}: ${v} !important;`).join("\n");
    style.textContent = `
:root, html, body, #root, [data-theme] {
${vars}
}
.dark, html.dark, body.dark {
${vars}
}
`;
}
