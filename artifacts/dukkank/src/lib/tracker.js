// Dukkank Storefront Live Visitor & Activity Tracker

function getDeviceInfo() {
  if (typeof window === "undefined" || !navigator) return "متصفح ويب";
  const ua = navigator.userAgent || "";
  if (/iPhone/i.test(ua)) return "هاتف iPhone 📱";
  if (/iPad/i.test(ua)) return "جهاز iPad 📲";
  if (/Android/i.test(ua)) return "هاتف Android 📱";
  if (/Windows/i.test(ua)) return "كمبيوتر Windows 💻";
  if (/Macintosh|Mac OS/i.test(ua)) return "كمبيوتر Mac 💻";
  if (/Linux/i.test(ua)) return "كمبيوتر Linux 💻";
  return "متصفح ويب 🌐";
}

function getSessionId() {
  if (typeof window === "undefined") return "server_session";
  try {
    let sid = sessionStorage.getItem("dukkank_visitor_sid");
    if (!sid) {
      sid = "v_" + Math.random().toString(36).substring(2, 9) + "_" + Date.now().toString(36);
      sessionStorage.setItem("dukkank_visitor_sid", sid);
    }
    return sid;
  } catch {
    return "v_" + Date.now();
  }
}

// Queue / debounce for track calls to prevent network flooding
const recentEvents = new Map();

export function trackEvent(eventType, eventTitle, eventData = {}) {
  if (typeof window === "undefined") return;

  // Deduplicate exact same event within 2 seconds
  const key = `${eventType}_${JSON.stringify(eventData)}`;
  const now = Date.now();
  if (recentEvents.has(key) && now - recentEvents.get(key) < 2000) {
    return;
  }
  recentEvents.set(key, now);

  const payload = {
    sessionId: getSessionId(),
    eventType,
    eventTitle,
    eventData,
    pageUrl: window.location.pathname + window.location.search,
    deviceInfo: getDeviceInfo(),
  };

  try {
    fetch("/api/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true,
    }).catch(() => {});
  } catch (_) {}
}

// ── Specific Tracking Helpers ──

export function trackPageView(pageUrl, title) {
  trackEvent("page_view", title ? `تصفح صفحة ${title}` : "تصفح صفحة بالمتجر", {
    url: pageUrl || window.location.pathname,
  });
}

export function trackGameClick(gameName, tier, price) {
  trackEvent("game_click", `تصفح واختيار لعبة: ${gameName}`, {
    gameName,
    tier: tier === "five" ? "PS5" : tier === "four" ? "PS4" : tier === "secondary" ? "سكندري" : tier,
    price,
  });
}

export function trackAddToCart(item) {
  trackEvent("add_to_cart", `إضافة للسلة: ${item.name || item.title}`, {
    gameName: item.name || item.title,
    tier: item.tier === "five" ? "PS5" : item.tier === "four" ? "PS4" : item.tier === "secondary" ? "سكندري" : (item.platform || item.durationLabel || item.tier),
    price: item.price,
    cartTotal: item.price,
  });
}

export function trackCheckoutStart(items = [], total = 0) {
  trackEvent("checkout_start", `بدء عملية الدفع ($${total})`, {
    itemsCount: items.length,
    cartTotal: total,
    itemsSummary: items.map(i => `${i.name || i.title} (${i.tier || i.platform})`).join(", "),
  });
}

export function trackWhatsAppClick(source = "floating_btn", extra = "") {
  trackEvent("whatsapp_click", `نقرة للتواصل عبر واتساب (${source})`, {
    source,
    extra,
  });
}

export function trackSearch(query) {
  if (!query || query.trim().length < 2) return;
  trackEvent("search", `بحث في المتجر عن: "${query.trim()}"`, {
    query: query.trim(),
  });
}

export function trackSecondaryExplainer(source = "game_card") {
  trackEvent("secondary_explainer", "استعراض شرح حساب السكندري ℹ️", {
    source,
  });
}
