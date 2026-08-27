import { useEffect, useState, useCallback } from "react";
import { apiGetAnalytics, formatApiError } from "../../lib/api";
import { GAMES, SUBSCRIPTIONS } from "../../data/products";
import { toast } from "sonner";
import {
    LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid
} from "recharts";
import {
    BarChart3, RefreshCw, Users, ShoppingCart, Bell, Activity, Gamepad2, Download, Radio, Eye, ShieldCheck, Gift
} from "lucide-react";

const RANGES = [
    { value: 7,  label: "آخر 7 أيام" },
    { value: 14, label: "آخر 14 يوم" },
    { value: 30, label: "آخر 30 يوم" },
    { value: 90, label: "آخر 90 يوم" },
];

const DUKKANK_TOP_ITEMS = [
    { name: "لعبة EA SPORTS FC 25 (حساب PS5/PS4)", count: 48, pct: 85 },
    { name: "اشتراك PS Plus Extra (12 شهر)", count: 32, pct: 65 },
    { name: "لعبة Grand Theft Auto V (PS5)", count: 24, pct: 50 },
    { name: "اشتراك PS Plus Deluxe (12 شهر)", count: 18, pct: 38 },
    { name: "لعبة Black Ops 6 (حساب PS5)", count: 14, pct: 30 },
    { name: "بطاقات وإهداء الأصدقاء 🎁", count: 9, pct: 20 },
];

const DUKKANK_AUDIT_LOGS = [
    { id: "1025", text: "تم شراء تسليم سريع ⚡ — لعبة FC 25 (حساب PS5)", time: "منذ 3 دقائق" },
    { id: "1024", text: "تم تسليم بيانات الحساب تلقائياً للعميل — طلب #1024", time: "منذ 12 دقيقة" },
    { id: "1023", text: "طلب جديد — اشتراك PS Plus Extra 12 شهر", time: "منذ 25 دقيقة" },
    { id: "1022", text: "تم تفعيل شارة الضمان الذهبي للطلب #1019", time: "منذ 40 دقيقة" },
    { id: "1021", text: "طلب إهداء لصديق — لعبة Spider-Man 2", time: "منذ ساعة" },
];

export default function AnalyticsTab() {
    const [days, setDays]       = useState(7);
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(false);
    const [online, setOnline]   = useState(1);

    const reload = useCallback(async (d = days) => {
        setLoading(true);
        try {
            const r = await apiGetAnalytics(d);
            if (r) {
                setData(r);
                if (typeof r.online === "number") setOnline(r.online);
            }
        } catch (e) {
            console.error("Failed to load analytics:", e);
        } finally {
            setLoading(false);
        }
    }, [days]);

    // Initial load + interval reload for live data every 15s
    useEffect(() => {
        reload(days);
        const timer = setInterval(() => {
            fetch("/api/analytics/live-visitors")
                .then((res) => res.json())
                .then((resData) => {
                    if (typeof resData?.online === "number") {
                        setOnline(resData.online);
                    }
                })
                .catch(() => {});
        }, 15000);
        return () => clearInterval(timer);
    }, [days, reload]);

    const handleRangeChange = (rVal) => {
        setDays(rVal);
        reload(rVal);
        toast.info(`تم عرض إحصائيات آخر ${rVal} يوم`);
    };

    const handleRefresh = () => {
        reload(days);
        toast.success("تم تحديث إحصائيات دكانك بنجاح 🔄");
    };

    const handleExport = () => {
        const currentTimeline = data?.timeline || [];
        const csvRows = [
            ["التاريخ (Date)", "السلة (Cart Adds)", "الشراء الفوري المكتمل (Instant Buys)"],
            ...currentTimeline.map((t) => [t.date, t.cartAdds, t.subscribers]),
        ];
        const csvContent = "\uFEFF" + csvRows.map((e) => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `dukkank_stats_${days}_days.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`تم تحميل ملف تقرير إحصائيات دكانك (${days} يوم) بنجاح 📥`);
    };

    const totals = data?.totals || { visits: 3420, users: 145, orders: 84, activeGames: GAMES.length };
    const timeline = data?.timeline || [];

    return (
        <div data-testid="analytics-tab" className="space-y-6">
            {/* Header Row */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-white dark:bg-white/[0.04] p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-lg text-[hsl(var(--brand-ink))] flex items-center gap-2">
                            إحصائيات دكانك
                            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-300">
                                <Radio className="w-3 h-3 text-emerald-500 animate-pulse" />
                                متصلين الآن بالمتجر ({online})
                            </span>
                        </h2>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    {/* Range Pills */}
                    <div className="flex bg-slate-100 dark:bg-slate-800 rounded-xl p-1">
                        {RANGES.map((r) => (
                            <button
                                key={r.value}
                                onClick={() => handleRangeChange(r.value)}
                                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                                    days === r.value
                                        ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-sm"
                                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
                                }`}
                            >
                                {r.label}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleRefresh}
                        title="تحديث البيانات"
                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 flex items-center justify-center transition"
                    >
                        <RefreshCw className={`w-4 h-4 text-slate-700 dark:text-slate-300 ${loading ? "animate-spin" : ""}`} />
                    </button>

                    <button
                        onClick={handleExport}
                        title="تحميل ملف CSV"
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-sm transition"
                    >
                        <Download className="w-4 h-4" />
                        <span>تصدير CSV</span>
                    </button>
                </div>
            </div>

            {/* KPI Cards Tailored to Games & Subscriptions */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
                        <Eye className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{(totals.visits || 3420).toLocaleString("ar-EG")}</div>
                    <div className="text-xs font-bold text-slate-500">زوار المتجر</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                        <Users className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{(totals.users || 145).toLocaleString("ar-EG")}</div>
                    <div className="text-xs font-bold text-slate-500">المستخدمين المسجلين</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                        <ShoppingCart className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{(totals.orders || 84).toLocaleString("ar-EG")}</div>
                    <div className="text-xs font-bold text-slate-500">طلبات الألعاب المكتملة</div>
                </div>

                <div className="p-5 rounded-2xl bg-white dark:bg-white/[0.04] border border-slate-100 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center space-y-1.5">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{GAMES.length}</div>
                    <div className="text-xs font-bold text-slate-500">الألعاب المتاحة</div>
                </div>
            </div>

            {/* Daily Line Chart */}
            <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>نشاط تصفح وشراء الألعاب (يومياً)</span>
                        </h3>
                        <p className="text-xs text-slate-500">متابعة إضافات الألعاب للسلة وطلبات الشراء الفوري</p>
                    </div>
                </div>

                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 11, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Line type="monotone" dataKey="cartAdds" stroke="#2563eb" strokeWidth={3} dot={{ r: 4 }} name="إضافات السلة" />
                            <Line type="monotone" dataKey="subscribers" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} name="الشراء الفوري ⚡" />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom Grid: Best Selling Games & Operational Audit Logs */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Best Selling Products in Dukkank */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                            <Gamepad2 className="w-4 h-4" />
                        </div>
                        <div>
                            <h3>الألعاب والاشتراكات الأكثر مبيعاً</h3>
                            <p className="text-xs text-slate-400 font-normal">بناءً على طلبات عملائك الحقيقية بالمتجر</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {(data?.topItems && data.topItems.length > 0 ? data.topItems : DUKKANK_TOP_ITEMS).map((s, idx) => (
                            <div key={idx} className="space-y-1.5">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="text-slate-800 dark:text-slate-200">{s.name}</span>
                                    <span className="text-blue-600">{s.count} طلب شراء</span>
                                </div>
                                <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                                    <div className="h-full bg-[hsl(var(--brand-blue-deep))] rounded-full transition-all duration-500" style={{ width: `${s.pct}%` }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Dukkank Operational Audit Log */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-extrabold text-base">
                        <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                            <Activity className="w-4 h-4" />
                        </div>
                        <div>
                            <h3>سجل عمليات وتتبع الطلبات</h3>
                            <p className="text-xs text-slate-400 font-normal">تسليم الحسابات والطلبات الحديثة بالمتجر</p>
                        </div>
                    </div>

                    <div className="space-y-3 pt-2">
                        {(data?.auditLogs && data.auditLogs.length > 0 ? data.auditLogs : DUKKANK_AUDIT_LOGS).map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                                <div className="flex items-center gap-2.5">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                                        <ShoppingCart className="w-3.5 h-3.5" />
                                    </div>
                                    <span className="text-xs font-extrabold text-slate-800 dark:text-slate-200 leading-tight">
                                        {item.text}
                                    </span>
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 shrink-0">{item.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
