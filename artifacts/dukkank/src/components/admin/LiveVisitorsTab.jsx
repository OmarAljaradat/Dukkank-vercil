import { useState, useEffect, useRef } from "react";
import { getToken } from "../../lib/api";
import { toast } from "sonner";
import {
    Activity,
    Radio,
    RefreshCw,
    Send,
    Trash2,
    ShoppingBag,
    CreditCard,
    MessageCircle,
    Gamepad2,
    Search,
    Smartphone,
    Monitor,
    Globe,
    Clock,
    Eye,
    Shield,
    CheckCircle2,
    Play,
    Pause,
    Sparkles,
    Info,
} from "lucide-react";

const EVENT_TYPE_CONFIG = {
    all: { label: "جميع الحركات", icon: Activity, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/20" },
    add_to_cart: { label: "إضافة للسلة 🛒", icon: ShoppingBag, color: "text-emerald-500", bg: "bg-emerald-500/10 border-emerald-500/20" },
    checkout_start: { label: "بدء الدفع 💳", icon: CreditCard, color: "text-blue-500", bg: "bg-blue-500/10 border-blue-500/20" },
    whatsapp_click: { label: "نقرة واتساب 💬", icon: MessageCircle, color: "text-green-500", bg: "bg-green-500/10 border-green-500/20" },
    game_click: { label: "تصفح الألعاب 🎮", icon: Gamepad2, color: "text-purple-500", bg: "bg-purple-500/10 border-purple-500/20" },
    search: { label: "عمليات البحث 🔍", icon: Search, color: "text-amber-500", bg: "bg-amber-500/10 border-amber-500/20" },
    secondary_explainer: { label: "شرح السكندري ℹ️", icon: Info, color: "text-cyan-500", bg: "bg-cyan-500/10 border-cyan-500/20" },
    page_view: { label: "زيارات الصفحات 👁️", icon: Eye, color: "text-indigo-500", bg: "bg-indigo-500/10 border-indigo-500/20" },
};

function formatTime(isoStr) {
    if (!isoStr) return "";
    try {
        const d = new Date(isoStr);
        return d.toLocaleTimeString("ar-JO", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
    } catch {
        return "";
    }
}

function getRelativeTime(isoStr) {
    if (!isoStr) return "";
    try {
        const diff = Math.floor((Date.now() - new Date(isoStr).getTime()) / 1000);
        if (diff < 5) return "الآن ⚡";
        if (diff < 60) return `قبل ${diff} ثانية`;
        if (diff < 3600) return `قبل ${Math.floor(diff / 60)} دقيقة`;
        return `قبل ${Math.floor(diff / 3600)} ساعة`;
    } catch {
        return "";
    }
}

export default function LiveVisitorsTab() {
    const [events, setEvents] = useState([]);
    const [onlineCount, setOnlineCount] = useState(0);
    const [filterType, setFilterType] = useState("all");
    const [selectedSession, setSelectedSession] = useState(null);
    const [isLive, setIsLive] = useState(true);
    const [loading, setLoading] = useState(true);
    const [testingTg, setTestingTg] = useState(false);
    const [savingTg, setSavingTg] = useState(false);

    // Telegram Activity Preferences
    const [tgConfig, setTgConfig] = useState({
        enabled: true,
        notifyCart: true,
        notifyCheckout: true,
        notifyWhatsApp: true,
        notifyGameClick: true,
        notifySearch: false,
        notifyPageView: true,
    });

    const isLiveRef = useRef(isLive);
    isLiveRef.current = isLive;

    const fetchEvents = async () => {
        try {
            const token = getToken();
            const res = await fetch(`/api/admin/visitor-events?limit=100&type=${filterType}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setEvents(data.events || []);
                setOnlineCount(data.onlineCount || 0);
            }
        } catch (_) {} finally {
            setLoading(false);
        }
    };

    const fetchTgConfig = async () => {
        try {
            const token = getToken();
            const res = await fetch("/api/admin/telegram/tracking-config", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.ok) {
                const data = await res.json();
                setTgConfig((prev) => ({ ...prev, ...data }));
            }
        } catch (_) {}
    };

    useEffect(() => {
        fetchEvents();
        fetchTgConfig();
    }, [filterType]);

    // Live Polling every 3.5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            if (isLiveRef.current) {
                fetchEvents();
            }
        }, 3500);
        return () => clearInterval(interval);
    }, [filterType]);

    const handleSaveTgToggle = async (key, val) => {
        const updated = { ...tgConfig, [key]: val };
        setTgConfig(updated);
        setSavingTg(true);
        try {
            const token = getToken();
            await fetch("/api/admin/telegram/tracking-config", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(updated),
            });
            toast.success("تم تحديث خيارات إشعارات التيليجرام 💾");
        } catch (e) {
            toast.error("فشل حفظ الإعدادات");
        } finally {
            setSavingTg(false);
        }
    };

    const handleTestTelegramActivity = async () => {
        setTestingTg(true);
        try {
            const token = getToken();
            const res = await fetch("/api/admin/telegram/test-activity", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message || "تم إرسال إشعار الرادار التجريبي للتيليجرام! 📲");
            } else {
                toast.error(data.error || "فشل الإرسال - تحقق من إعدادات التيليجرام");
            }
        } catch (e) {
            toast.error("خطأ في الاتصال بالتيليجرام");
        } finally {
            setTestingTg(false);
        }
    };

    const handleClearEvents = async () => {
        if (!window.confirm("هل أنت متأكد من مسح سجل حركات الزوار بالكامل؟")) return;
        try {
            const token = getToken();
            await fetch("/api/admin/visitor-events", {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });
            setEvents([]);
            toast.success("تم مسح السجل بنجاح 🗑️");
        } catch {
            toast.error("فشل مسح السجل");
        }
    };

    const filteredList = selectedSession
        ? events.filter((e) => e.sessionId === selectedSession)
        : events;

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Live Banner & Radar Counter */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Card 1: Active Visitors Radar */}
                <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <span className="relative flex h-3.5 w-3.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
                            </span>
                            <span className="text-xs font-black text-emerald-400 uppercase tracking-wider">رادار المتجر المباشر</span>
                        </div>
                        <Radio className="w-5 h-5 text-emerald-400 animate-pulse" />
                    </div>

                    <div className="flex items-baseline gap-3">
                        <span className="text-4xl font-black text-white tracking-tight">{onlineCount}</span>
                        <span className="text-xs font-bold text-emerald-200/80">زائر متواجدون الآن بالمتجر</span>
                    </div>

                    <p className="text-[11px] text-slate-400 mt-2">
                        يتم رصد وتحديث حركات العملاء في الوقت الفعلي كل 3 ثوانٍ ⚡
                    </p>
                </div>

                {/* Card 2: Live Activity Stream Status */}
                <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 p-6 shadow-sm flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-blue-500" />
                            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">سجل التفاعلات اللحظي</h3>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsLive(!isLive)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                                isLive
                                    ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                                    : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                            }`}
                        >
                            {isLive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                            <span>{isLive ? "البث المباشر يعمل" : "موقوف مؤقتاً"}</span>
                        </button>
                    </div>

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 dark:border-white/5">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">إجمالي الحركات المسجلة:</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400">{events.length}</span>
                    </div>
                </div>

                {/* Card 3: Telegram Dispatcher Status */}
                <div className="rounded-3xl bg-gradient-to-br from-sky-950 via-slate-900 to-blue-950 border border-sky-500/30 p-6 text-white shadow-xl flex flex-col justify-between">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Send className="w-5 h-5 text-sky-400" />
                            <h3 className="font-extrabold text-sm text-white">إشعارات التيليجرام الفورية</h3>
                        </div>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 border border-sky-500/30">
                            مربوط 🤖
                        </span>
                    </div>

                    <p className="text-[11px] text-sky-200/80 mt-1">
                        يصلك تنبيه فوري على التيليجرام لكل حركة مهمة يقوم بها العميل (سلة، دفع، واتساب).
                    </p>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
                        <button
                            type="button"
                            disabled={testingTg}
                            onClick={handleTestTelegramActivity}
                            className="flex items-center gap-1.5 text-xs font-bold text-sky-300 hover:text-white transition-colors"
                        >
                            <Send className="w-3.5 h-3.5" />
                            <span>{testingTg ? "جاري الإرسال..." : "إرسال تنبيه تجريبي 📲"}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Telegram Notification Filters Settings Bar */}
            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-slate-200 dark:border-white/10 p-5 shadow-sm space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-amber-500" />
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-white">
                            تخصيص الإشعارات المرسلة إلى التيليجرام عند حركات الزائر:
                        </h4>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">اضغط لتفعيل أو إلغاء إشعار أي حدث</span>
                </div>

                <div className="flex flex-wrap gap-2 pt-1">
                    {[
                        { key: "notifyCart", label: "🛒 إضافة إلى السلة", val: tgConfig.notifyCart },
                        { key: "notifyCheckout", label: "💳 بدء الدفع", val: tgConfig.notifyCheckout },
                        { key: "notifyWhatsApp", label: "💬 نقرة واتساب", val: tgConfig.notifyWhatsApp },
                        { key: "notifyGameClick", label: "🎮 تصفح لعبة وفئاتها", val: tgConfig.notifyGameClick },
                        { key: "notifySearch", label: "🔍 عمليات البحث", val: tgConfig.notifySearch },
                        { key: "notifyPageView", label: "👁️ زيارات الصفحات", val: tgConfig.notifyPageView },
                    ].map((item) => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => handleSaveTgToggle(item.key, !item.val)}
                            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition-all border ${
                                item.val
                                    ? "bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30 shadow-sm"
                                    : "bg-slate-100 dark:bg-white/5 text-slate-400 border-transparent hover:border-slate-300"
                            }`}
                        >
                            <span>{item.val ? "✓" : "✕"}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Filter Pills & Actions */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                {/* Event Category Filters */}
                <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
                    {Object.entries(EVENT_TYPE_CONFIG).map(([key, cfg]) => {
                        const Icon = cfg.icon;
                        const isSelected = filterType === key;
                        const count = key === "all" ? events.length : events.filter((e) => e.eventType === key).length;

                        return (
                            <button
                                key={key}
                                type="button"
                                onClick={() => {
                                    setFilterType(key);
                                    setSelectedSession(null);
                                }}
                                className={`flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all border ${
                                    isSelected
                                        ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-transparent shadow-md scale-[1.02]"
                                        : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border-slate-200 dark:border-white/10 hover:border-slate-300"
                                }`}
                            >
                                <Icon className="w-3.5 h-3.5" />
                                <span>{cfg.label}</span>
                                <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${isSelected ? "bg-white/20 dark:bg-black/20" : "bg-slate-100 dark:bg-white/10"}`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Right controls: Refresh & Clear */}
                <div className="flex items-center gap-2 shrink-0">
                    {selectedSession && (
                        <button
                            type="button"
                            onClick={() => setSelectedSession(null)}
                            className="px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-500/20"
                        >
                            إلغاء فلتر الجلسة (عرض الكل) ✕
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={fetchEvents}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                        <span>تحديث</span>
                    </button>
                    <button
                        type="button"
                        onClick={handleClearEvents}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-red-50 hover:bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/40 text-xs font-bold transition-colors shadow-sm"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>مسح</span>
                    </button>
                </div>
            </div>

            {/* Events Stream Feed */}
            {filteredList.length === 0 ? (
                <div className="text-center py-20 bg-white dark:bg-white/[0.03] rounded-3xl border border-slate-200 dark:border-white/10 p-8 shadow-sm">
                    <Radio className="w-12 h-12 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                    <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {loading ? "جاري تحميل نبض الزوار..." : "لا توجد حركات مسجلة حالياً ضمن هذا الفلتر"}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                        بمجرد تصفح أي عميل للمتجر أو النقر على لعبة أو إضافة للسلة، ستظهر حركته هنا فوراً 🚀
                    </p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredList.map((evt, idx) => {
                        const typeCfg = EVENT_TYPE_CONFIG[evt.eventType] || EVENT_TYPE_CONFIG.all;
                        const Icon = typeCfg.icon;
                        const data = evt.eventData || {};

                        return (
                            <div
                                key={evt.id || idx}
                                className="group bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200/80 dark:border-white/10 p-4 shadow-sm hover:shadow-md hover:border-blue-400/50 transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                                {/* Left Section: Event Icon + Main Title + Subtitle details */}
                                <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border ${typeCfg.bg}`}>
                                        <Icon className={`w-5 h-5 ${typeCfg.color}`} />
                                    </div>

                                    <div className="min-w-0 space-y-1">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                                {evt.eventTitle}
                                            </h4>

                                            {data.tier && (
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                                                    فئة: {data.tier}
                                                </span>
                                            )}

                                            {data.price && (
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                                                    ${data.price}
                                                </span>
                                            )}

                                            {data.cartTotal && (
                                                <span className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                                                    مجموع: ${data.cartTotal}
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-medium flex-wrap">
                                            {/* Device Info */}
                                            <span className="flex items-center gap-1">
                                                {evt.deviceInfo?.includes("iPhone") || evt.deviceInfo?.includes("Android") ? (
                                                    <Smartphone className="w-3.5 h-3.5 text-slate-500" />
                                                ) : (
                                                    <Monitor className="w-3.5 h-3.5 text-slate-500" />
                                                )}
                                                <span>{evt.deviceInfo || "متصفح ويب"}</span>
                                            </span>

                                            {/* Page URL */}
                                            <span className="flex items-center gap-1">
                                                <Globe className="w-3.5 h-3.5 text-slate-500" />
                                                <span className="font-mono text-slate-500">{evt.pageUrl || "/"}</span>
                                            </span>

                                            {/* Session ID link to filter all actions of this user */}
                                            <button
                                                type="button"
                                                onClick={() => setSelectedSession(evt.sessionId)}
                                                className="font-mono text-[10px] text-blue-500 hover:underline bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded"
                                            >
                                                جلسة: {evt.sessionId?.slice(0, 12)}...
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Section: Timestamps */}
                                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 dark:border-white/5 shrink-0">
                                    <span className="text-xs font-black text-slate-800 dark:text-slate-200">
                                        {formatTime(evt.createdAt)}
                                    </span>
                                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                        {getRelativeTime(evt.createdAt)}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
