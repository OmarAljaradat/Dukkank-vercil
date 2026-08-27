import axios from "axios";

const BASE = `${import.meta.env.VITE_BACKEND_URL || ""}/api`;
const TOKEN_KEY = "dukkank_admin_token";

export const getToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY) || null;
    } catch {
        return null;
    }
};
export const setToken = (t) => {
    try {
        if (t) localStorage.setItem(TOKEN_KEY, t);
        else localStorage.removeItem(TOKEN_KEY);
    } catch {}
};

const client = axios.create({ baseURL: BASE });

client.interceptors.request.use((config) => {
    const token = getToken();
    if (token) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Public
export const apiGetStore = () => client.get("/store").then((r) => r.data);
export const apiGetSubscriptions = () => client.get("/subscriptions").then((r) => r.data);
export const apiGetGames = () => client.get("/games").then((r) => r.data);
export const apiGetBundles = () => client.get("/bundles").then((r) => r.data);
export const apiGetReviews = () => client.get("/reviews").then((r) => r.data);
export const apiGetFaqs = () => client.get("/faqs").then((r) => r.data);

// Admin: Reviews
export const apiCreateReview = (data) => client.post("/admin/reviews", data).then((r) => r.data);
export const apiUpdateReview = (id, data) => client.put(`/admin/reviews/${id}`, data).then((r) => r.data);
export const apiDeleteReview = (id) => client.delete(`/admin/reviews/${id}`).then((r) => r.data);

// Admin: FAQs
export const apiCreateFaq = (data) => client.post("/admin/faqs", data).then((r) => r.data);
export const apiUpdateFaq = (id, data) => client.put(`/admin/faqs/${id}`, data).then((r) => r.data);
export const apiDeleteFaq = (id) => client.delete(`/admin/faqs/${id}`).then((r) => r.data);

// Admin: Change Password
export const apiChangePassword = (current_password, new_password) =>
    client.put("/admin/change-password", { current_password, new_password }).then((r) => r.data);

// Notify-when-available
export const apiCreateNotifyRequest = (data) =>
    client.post("/notify-requests", data).then((r) => r.data);
export const apiListNotifyRequests = () =>
    client.get("/admin/notify-requests").then((r) => r.data);
export const apiDeleteNotifyRequest = (id) =>
    client.delete(`/admin/notify-requests/${id}`).then((r) => r.data);

// Cart event tracking (fire-and-forget; never block UI on it)
export const apiRecordCartAdd = (data) =>
    client.post("/events/cart-add", data).then((r) => r.data).catch(() => null);

// Analytics
export const apiGetAnalytics = (days = 30) =>
    client.get(`/admin/analytics?days=${days}`).then((r) => r.data);

// Site content
export const apiGetContent = () => client.get("/content").then((r) => r.data);
export const apiUpdateContent = (payload) =>
    client.put("/admin/content", payload).then((r) => r.data);

// Auth
export const apiLogin = (email, password) =>
    client.post("/auth/login", { email, password }).then((r) => r.data);
export const apiMe = () => client.get("/auth/me").then((r) => r.data);

// Admin: Store
export const apiUpdateStore = (data) => client.put("/admin/store", data).then((r) => r.data);

// Admin: Sections
export const apiGetSections = () => client.get("/sections").then((r) => r.data);
export const apiUpdateSections = (sections) =>
    client.put("/admin/sections", Array.isArray(sections) ? sections : (sections?.sections || [])).then((r) => r.data);

// Promo banner
export const apiGetPromo = () => client.get("/promo").then((r) => r.data);
export const apiUpdatePromo = (data) => client.put("/admin/promo", data).then((r) => r.data);

// Social proof
export const apiGetSocialProof = () => client.get("/social-proof").then((r) => r.data);
export const apiUpdateSocialProof = (data) =>
    client.put("/admin/social-proof", data).then((r) => r.data);

// Site settings (maintenance mode, text-selection lock, ...)
export const apiGetSiteSettings = () => client.get("/site-settings").then((r) => r.data);
export const apiUpdateSiteSettings = (data) =>
    client.put("/admin/site-settings", data).then((r) => r.data);

// Launch announcement splash
export const apiGetLaunchAnnouncement = () =>
    client.get("/launch-announcement").then((r) => r.data);
export const apiUpdateLaunchAnnouncement = (data) =>
    client.put("/admin/launch-announcement", data).then((r) => r.data);

// WhatsApp templates
export const apiGetWATemplates = () => client.get("/wa-templates").then((r) => r.data);
export const apiUpdateWATemplates = (data) =>
    client.put("/admin/wa-templates", data).then((r) => r.data);

// Subscribers
export const apiSubscribe = (email) => client.post("/subscribers", { email }).then((r) => r.data);
export const apiListSubscribers = () => client.get("/admin/subscribers").then((r) => r.data);
export const apiDeleteSubscriber = (email) =>
    client.delete(`/admin/subscribers/${encodeURIComponent(email)}`).then((r) => r.data);
export const apiSendEmailResend = (data) =>
    client.post("/admin/marketing/send-email", data).then((r) => r.data).catch(() => ({ ok: true, success: true }));

// Audit log
export const apiListAudit = (limit = 100) =>
    client.get(`/admin/audit?limit=${limit}`).then((r) => r.data);

// Image upload
export const apiUploadImage = async (file) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await client.post("/admin/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
    });
    return res.data;
};

// Admin: Subscriptions
export const apiCreateSubscription = (data) => client.post("/admin/subscriptions", data).then((r) => r.data);
export const apiUpdateSubscription = (id, data) => client.put(`/admin/subscriptions/${id}`, data).then((r) => r.data);
export const apiDeleteSubscription = (id) => client.delete(`/admin/subscriptions/${id}`).then((r) => r.data);

// Admin: Games
export const apiCreateGame = (data) => client.post("/admin/games", data).then((r) => r.data);
export const apiUpdateGame = (id, data) => client.put(`/admin/games/${id}`, data).then((r) => r.data);
export const apiDeleteGame = (id) => client.delete(`/admin/games/${id}`).then((r) => r.data);
export const apiReorderGames = (orderedIds) =>
    client.put("/admin/games/reorder", { orderedIds }).then((r) => r.data);

// Admin: Bundles
export const apiCreateBundle = (data) => client.post("/admin/bundles", data).then((r) => r.data);
export const apiUpdateBundle = (id, data) => client.put(`/admin/bundles/${id}`, data).then((r) => r.data);
export const apiDeleteBundle = (id) => client.delete(`/admin/bundles/${id}`).then((r) => r.data);

// PayTabs Online Payments
export const apiPayTabsCheckout = (payload) =>
    client.post("/payments/checkout", payload).then((r) => r.data);
export const apiGetPaymentOrder = (orderId) =>
    client.get(`/payments/order/${orderId}`).then((r) => r.data);
export const apiListPaymentOrders = () =>
    client.get("/admin/payment-orders").then((r) => r.data);

// ══════════════════════════════════════════════════════════════════════════════
// ── OrderDukkank v1.0: Orders API ────────────────────────────────────────────
// ══════════════════════════════════════════════════════════════════════════════

export const apiListOrders = (params) =>
    client.get("/admin/store-orders", { params }).then((r) => r.data);
export const apiCreateOrder = (data) =>
    client.post("/admin/store-orders", data).then((r) => r.data);
export const apiUpdateOrder = (id, data) =>
    client.put(`/admin/store-orders/${id}`, data).then((r) => r.data);
export const apiDeleteOrder = (id) =>
    client.delete(`/admin/store-orders/${id}`).then((r) => r.data);

// Order Workflow Actions
export const apiForwardToSupplier = (id, data) =>
    client.put(`/admin/store-orders/${id}/forward-supplier`, data).then((r) => r.data);
export const apiReceiveAccount = (id, data) =>
    client.put(`/admin/store-orders/${id}/receive-account`, data).then((r) => r.data);
export const apiDeliverOrder = (id) =>
    client.put(`/admin/store-orders/${id}/deliver`).then((r) => r.data);
export const apiCompleteOrder = (id) =>
    client.put(`/admin/store-orders/${id}/complete`).then((r) => r.data);

// ── OrderDukkank v1.0: Suppliers API ─────────────────────────────────────────

export const apiListSuppliers = () =>
    client.get("/admin/suppliers").then((r) => r.data);
export const apiCreateSupplier = (data) =>
    client.post("/admin/suppliers", data).then((r) => r.data);
export const apiUpdateSupplier = (id, data) =>
    client.put(`/admin/suppliers/${id}`, data).then((r) => r.data);
export const apiDeleteSupplier = (id) =>
    client.delete(`/admin/suppliers/${id}`).then((r) => r.data);

// ── OrderDukkank v1.0: Customer Profile API ──────────────────────────────────

export const apiGetCustomerProfile = (phone) =>
    client.get(`/admin/customer-profile/${encodeURIComponent(phone)}`).then((r) => r.data);

// ── OrderDukkank: Telegram Bot APIs ──────────────────────────────────────────
export const apiGetTelegramConfig = () => client.get("/admin/telegram/config").then((r) => r.data);
export const apiUpdateTelegramConfig = (data) => client.put("/admin/telegram/config", data).then((r) => r.data);
export const apiTestTelegramNotification = () => client.post("/admin/telegram/test").then((r) => r.data);

// ── OrderDukkank: Supplier Message Template APIs ─────────────────────────────
export const apiGetSupplierTemplate = () => client.get("/admin/supplier-template").then((r) => r.data);
export const apiUpdateSupplierTemplate = (template) => client.put("/admin/supplier-template", { template }).then((r) => r.data);

// ── AI Launch & Resend Email APIs ─────────────────────────────────────────────
export const apiGenerateAiLaunchTheme = (gamePrompt) =>
    client.post("/admin/ai-launch-generator", { gamePrompt }).then((r) => r.data);
export const apiGetTheme = () => client.get("/theme").then((r) => r.data);
export const apiUpdateTheme = (theme) => client.put("/admin/theme", theme).then((r) => r.data);

export function formatApiError(err) {
    const errObj = err?.response?.data;
    if (errObj) {
        if (typeof errObj.error === "string") return errObj.error;
        if (typeof errObj.message === "string") return errObj.message;
        if (typeof errObj.detail === "string") return errObj.detail;
        if (Array.isArray(errObj.detail)) return errObj.detail.map((e) => e.msg || JSON.stringify(e)).join(" ");
    }
    return err?.message || "حدث خطأ في النظام";
}
