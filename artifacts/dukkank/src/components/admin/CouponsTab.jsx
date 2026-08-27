import { useState, useEffect, useCallback } from "react";
import { getToken } from "../../lib/api";
import { useStoreData } from "../../contexts/DataContext";
import { toast } from "sonner";
import {
    Tag, Plus, Trash2, RefreshCw, Copy, X, CheckCircle2,
    Sparkles, Zap, TrendingUp, ShieldCheck, Share2, Clock, Filter,
    Eye, EyeOff, Megaphone, Flame, Gift, ArrowRight, AlertTriangle
} from "lucide-react";

function fmtExpiry(ts) {
    if (!ts) return "غير محدد (مفتوح)";
    return new Date(ts).toLocaleDateString("ar-SA", { year: "numeric", month: "short", day: "numeric" });
}

export default function CouponsTab({ onChanged }) {
    const { games, subscriptions, promo, setPromo } = useStoreData();
    const [coupons, setCoupons]   = useState([]);
    const [loading, setLoading]   = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showPromoConfig, setShowPromoConfig] = useState(false);
    const [filterStatus, setFilterStatus] = useState("all");

    // Promo Banner State Form
    const [promoForm, setPromoForm] = useState({
        enabled: promo?.enabled ?? true,
        title: promo?.title || "⚡ عرض فلاش محدود — خصم 15% على جميع الألعاب والاشتراكات!",
        subtitle: promo?.subtitle || "استخدم كود الخصم: DUKKAN15 في السلة عند إتمام الطلب",
        ctaLabel: promo?.ctaLabel || "تسوق العروض الآن 🛒",
        ctaHref: promo?.ctaHref || "#games",
        endsAt: promo?.endsAt || "",
    });

    useEffect(() => {
        if (promo) {
            setPromoForm({
                enabled: promo.enabled ?? true,
                title: promo.title || "⚡ عرض فلاش محدود — خصم 15% على جميع الألعاب والاشتراكات!",
                subtitle: promo.subtitle || "استخدم كود الخصم: DUKKAN15 في السلة عند إتمام الطلب",
                ctaLabel: promo.ctaLabel || "تسوق العروض الآن 🛒",
                ctaHref: promo.ctaHref || "#games",
                endsAt: promo.endsAt || "",
            });
        }
    }, [promo]);

    // Save Promo Banner Handler
    const handleSavePromo = (updated) => {
        const newForm = updated || promoForm;
        const fullPromo = {
            ...(promo || {}),
            ...newForm,
            headerBanner: {
                ...(promo?.headerBanner || {}),
                enabled: newForm.enabled,
                title: newForm.title,
                buttonText: newForm.ctaLabel,
            },
            flashSale: {
                ...(promo?.flashSale || {}),
                enabled: newForm.enabled,
                title: newForm.title,
                subtitle: newForm.subtitle,
            }
        };
        setPromo(fullPromo);
        toast.success("تم تحديث ونشر شريط العروض الفلاش بالمتجر بنجاح 🟢");
        onChanged?.();
    };

    // Toggle Promo Banner Immediately
    const togglePromoEnabled = () => {
        const nextEnabled = !promoForm.enabled;
        const newPromoForm = { ...promoForm, enabled: nextEnabled };
        const fullPromo = {
            ...(promo || {}),
            ...newPromoForm,
            enabled: nextEnabled,
            headerBanner: {
                ...(promo?.headerBanner || {}),
                enabled: nextEnabled,
            },
            flashSale: {
                ...(promo?.flashSale || {}),
                enabled: nextEnabled,
            }
        };
        setPromoForm(newPromoForm);
        setPromo(fullPromo);
        toast.success(nextEnabled ? "🟢 تم إظهار وتفعيل شريط العروض بالمتجر!" : "🙈 تم إخفاء شريط العروض بالكامل من المتجر!");
        onChanged?.();
    };

    // Quick Promo Presets
    const applyPromoPreset = (title, subtitle, ctaLabel, ctaHref, hours = 48) => {
        const d = new Date();
        d.setHours(d.getHours() + hours);
        const endsAtIso = d.toISOString().split("T")[0];
        const newPromo = {
            enabled: true,
            title,
            subtitle,
            ctaLabel,
            ctaHref,
            endsAt: endsAtIso,
        };
        setPromoForm(newPromo);
        setPromo(newPromo);
        toast.success(`⚡ تم تفعيل العرض الفلاش: "${title}" فوراً في المتجر!`);
        onChanged?.();
    };

    // Coupon Form State
    const [form, setForm] = useState({
        code: "",
        type: "percentage",
        value: 10,
        minOrder: 0,
        maxUses: "",
        expiresAt: "",
        target: "all",
        targetItemId: "",
    });

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const r = await fetch("/api/admin/coupons", { headers: { Authorization: `Bearer ${getToken()}` } });
            if (r.ok) setCoupons(await r.json());
        } catch { /* ignore */ }
        setLoading(false);
    }, []);

    useEffect(() => { load(); }, [load]);

    // Quick Preset Generators for Coupons
    const applyPreset = (code, type, value, minOrder = 0) => {
        setForm({
            code,
            type,
            value,
            minOrder,
            maxUses: 100,
            expiresAt: "",
            target: "all",
            targetItemId: "",
        });
        setShowForm(true);
        toast.info(`تم التعبئة الجاهزة لكود "${code}"! عيّن التفاصيل وانقر حفظ.`);
    };

    const setQuickExpiry = (hours) => {
        const d = new Date();
        d.setHours(d.getHours() + hours);
        const isoDate = d.toISOString().split("T")[0];
        setForm((prev) => ({ ...prev, expiresAt: isoDate }));
        toast.success(`تم تحديد انتهاء الكوبون خلال ${hours} ساعة ⏱️`);
    };

    const generateRandomCode = () => {
        const rand = "DUKKAN-" + Math.random().toString(36).substring(2, 6).toUpperCase();
        setForm((prev) => ({ ...prev, code: rand }));
        toast.success(`تم توليد كود مميز تلقائياً: ${rand}`);
    };

    const create = async (e) => {
        e.preventDefault();
        try {
            const r = await fetch("/api/admin/coupons", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({
                    ...form,
                    maxUses: form.maxUses ? Number(form.maxUses) : null,
                    expiresAt: form.expiresAt ? new Date(form.expiresAt).getTime() : null,
                }),
            });
            const j = await r.json();
            if (!r.ok) { toast.error(j.error || "فشل إنشاء الكوبون"); return; }
            setCoupons((p) => [j, ...p]);
            setForm({ code: "", type: "percentage", value: 10, minOrder: 0, maxUses: "", expiresAt: "", target: "all", targetItemId: "" });
            setShowForm(false);
            toast.success(`تم إنشاء كوبون الخصم (${j.code}) بنجاح ✅`);
            onChanged?.();
        } catch { toast.error("فشل إنشاء الكوبون"); }
    };

    const toggle = async (id, active) => {
        try {
            await fetch(`/api/admin/coupons/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${getToken()}` },
                body: JSON.stringify({ active: !active }),
            });
            setCoupons((p) => p.map((c) => (c.id === id ? { ...c, active: !active } : c)));
            toast.success(active ? "تم تعطيل الكوبون 🔴" : "تم تفعيل الكوبون 🟢");
            onChanged?.();
        } catch { toast.error("فشل التحديث"); }
    };

    const remove = async (id) => {
        if (!confirm("هل أنت تأكد من حذف هذا الكوبون؟")) return;
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${getToken()}` } });
            setCoupons((p) => p.filter((c) => c.id !== id));
            toast.success("تم حذف الكوبون بنجاح ✅");
            onChanged?.();
        } catch { toast.error("فشل الحذف"); }
    };

    // Copy WhatsApp Promotional Announcement Text
    const copyWhatsAppPromoText = (coupon) => {
        const valueText = coupon.type === "percentage" ? `${coupon.value}%` : `$${coupon.value}`;
        const minOrderText = coupon.minOrder > 0 ? ` عند الشراء بقيمة $${coupon.minOrder} أو أكثر` : "";

        let itemText = "";
        if (coupon.target === "specific_game" && coupon.targetItemId) {
            const g = (games || []).find((x) => x.id === coupon.targetItemId);
            if (g) itemText = ` المخصص للعبة (${g.name})`;
        } else if (coupon.target === "specific_sub" && coupon.targetItemId) {
            const s = (subscriptions || []).find((x) => x.id === coupon.targetItemId);
            if (s) itemText = ` المخصص لااشتراك (${s.name})`;
        }

        const promoText = `🎉 *عرض خاص وحصري من متجر دُكانك!*

🔥 *كود الخصم:* \`${coupon.code}\`${itemText}
💰 *قيمة الخصم:* ${valueText} خصم مباشر على طلبك${minOrderText}!

⚡ *طريقة الاستخدام:*
1. ادخل المتجر واضِف منتجاتك للسلة 🛒
2. ادخل كود الخصم \`${coupon.code}\` في صفحة الدفع
3. استمتع بالخصم والتسليم الفوري! 🚀

⏳ *سارع بالتسوق الآن قبل نفاد الكمية!*
🔗 https://dukkank.com`;

        navigator.clipboard.writeText(promoText);
        toast.success(`تم نسخ إعلان الواتساب الترويجي للكوبون (${coupon.code}) 📋`);
    };

    // Filtered coupons list
    const filteredCoupons = coupons.filter((c) => {
        const isExpired = c.expiresAt && Date.now() > new Date(c.expiresAt).getTime();
        if (filterStatus === "active") return c.active && !isExpired;
        if (filterStatus === "inactive") return !c.active;
        if (filterStatus === "expired") return isExpired;
        return true;
    });

    const activeCouponsCount = coupons.filter((c) => c.active !== false && (!c.expiresAt || Date.now() <= new Date(c.expiresAt).getTime())).length;
    const totalUsesCount = coupons.reduce((acc, c) => acc + (c.usedCount || 0), 0);

    return (
        <div data-testid="coupons-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Top Bar Header Control */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-pink-500/20 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
                        <Tag className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span>إدارة الكوبونات وشريط العروض الفلاش (Coupons & Offers)</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-300 font-medium">
                            أنشئ كود الخصم بالـ % أو بالمبلغ المباشر، وفعّل شريط العروض العلوي بالصفحة بنقرة واحدة.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                        type="button"
                        onClick={togglePromoEnabled}
                        className={`px-4 py-2.5 rounded-xl font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow ${
                            promoForm.enabled
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700"
                        }`}
                    >
                        {promoForm.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span>شريط العروض العلوي: {promoForm.enabled ? "مفعّل 🟢" : "مخفي 🙈"}</span>
                    </button>

                    <button
                        type="button"
                        onClick={() => setShowForm(!showForm)}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>إنشاء كوبون جديد ➕</span>
                    </button>

                    <button
                        type="button"
                        onClick={load}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer border border-slate-700"
                        title="تحديث القائمة"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* ⚡ FLASH SALE PROMO BANNER CONTROLLER CARD */}
            <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-red-950 border-2 border-red-500/40 p-5 sm:p-6 text-white shadow-xl space-y-4">
                <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3 flex-wrap">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                            <Flame className="w-5 h-5 animate-pulse" />
                        </div>
                        <div>
                            <h3 className="font-black text-sm text-white flex items-center gap-2">
                                <span>شريط العروض الفلاش العلوي بالمتجر (Flash Sale Top Banner)</span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                                    LIVE TOP BANNER
                                </span>
                            </h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                يظهر في أعلى كافة صفحات المتجر مع عداد تنازلي حماسي لحث الزبائن على الشراء!
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowPromoConfig(!showPromoConfig)}
                        className="text-xs font-bold text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                        <span>{showPromoConfig ? "إغلاق التعديل ✕" : "تعديل تفاصيل العرض العلوي ✏️"}</span>
                    </button>
                </div>

                {/* Quick Flash Presets */}
                <div className="space-y-2">
                    <div className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-amber-400" />
                        <span>قوالب عروض علوية جاهزة بنقرة واحدة (Flash Sale Presets):</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        <button
                            type="button"
                            onClick={() => applyPromoPreset(
                                "🔥 عرض الجمعة الكبرى — خصم 20% على جميع الألعاب والاشتراكات!",
                                "استخدم الكود: BLACKFRIDAY في السلة عند إتمام الطلب",
                                "تسوق الآن واخصم 20% 🛒",
                                "#games",
                                48
                            )}
                            className="p-3 rounded-2xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-right transition cursor-pointer space-y-1"
                        >
                            <div className="font-black text-red-400 text-xs">🔥 عرض الجمعة الكبرى (20%)</div>
                            <div className="text-[10px] text-slate-400">ينتهي خلال 48 ساعة • كود BLACKFRIDAY</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyPromoPreset(
                                "⚽ انطلاقة الموسم الكروي EA FC 27 — خصم 15% مباشر!",
                                "ادخل الكود: EAFVIP27 واحصل على تسليم فوري لحسابك الأصلي",
                                "اطلب نسختك الآن ⚡",
                                "#gamelaunch",
                                72
                            )}
                            className="p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-right transition cursor-pointer space-y-1"
                        >
                            <div className="font-black text-emerald-400 text-xs">⚽ عرض موسم EA FC 27 (15%)</div>
                            <div className="text-[10px] text-slate-400">ينتهي خلال 3 أيام • كود EAFVIP27</div>
                        </button>

                        <button
                            type="button"
                            onClick={() => applyPromoPreset(
                                "🎁 خصم الترحيب للعملاء الجدد — خصم $5 مباشر على أول طلب!",
                                "استخدم كود الخصم: WELCOME5 بالسلة عند الشراء",
                                "احصل على خصمك 🎁",
                                "#essential",
                                168
                            )}
                            className="p-3 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-right transition cursor-pointer space-y-1"
                        >
                            <div className="font-black text-amber-400 text-xs">🎁 خصم الترحيب ($5)</div>
                            <div className="text-[10px] text-slate-400">ينتهي خلال أسبوع • كود WELCOME5</div>
                        </button>
                    </div>
                </div>

                {/* Extended Promo Form Config */}
                {showPromoConfig && (
                    <div className="pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">عنوان العرض العلوي *</label>
                                <input
                                    type="text"
                                    value={promoForm.title}
                                    onChange={(e) => setPromoForm({ ...promoForm, title: e.target.value })}
                                    placeholder="مثال: 🔥 خصم خاص 20% على جميع الألعاب!"
                                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">الوصف الفرعي والكود</label>
                                <input
                                    type="text"
                                    value={promoForm.subtitle}
                                    onChange={(e) => setPromoForm({ ...promoForm, subtitle: e.target.value })}
                                    placeholder="مثال: استخدم الكود DUKKAN20"
                                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">نص زر الشراء</label>
                                <input
                                    type="text"
                                    value={promoForm.ctaLabel}
                                    onChange={(e) => setPromoForm({ ...promoForm, ctaLabel: e.target.value })}
                                    placeholder="مثال: تسوق العروض الآن 🛒"
                                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-300 mb-1">تاريخ ووقت انتهاء العرض العداد</label>
                                <input
                                    type="date"
                                    value={promoForm.endsAt}
                                    onChange={(e) => setPromoForm({ ...promoForm, endsAt: e.target.value })}
                                    className="w-full h-10 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div className="flex justify-end pt-2">
                            <button
                                type="button"
                                onClick={() => handleSavePromo()}
                                className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow"
                            >
                                <CheckCircle2 className="w-4 h-4" />
                                <span>حفظ ونشر العرض العلوي فوراً ✅</span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Presets Bar for Coupons */}
            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 space-y-2 shadow">
                <div className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                    <span>مولّد أكواد الخصم السريع (قوالب أزرار جاهزة بنقرة واحدة):</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap text-xs">
                    <button
                        type="button"
                        onClick={() => applyPreset("WELCOME10", "percentage", 10, 0)}
                        className="px-3.5 py-1.5 rounded-xl bg-pink-500/10 hover:bg-pink-500/20 text-pink-300 border border-pink-500/30 font-bold transition cursor-pointer"
                    >
                        🎟️ للعميل الجديد (WELCOME10 - 10%)
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset("RAMADAN15", "percentage", 15, 20)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold transition cursor-pointer"
                    >
                        🌙 للمواسم والأعياد (RAMADAN15 - 15%)
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset("SAVE5", "fixed", 5, 25)}
                        className="px-3.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition cursor-pointer"
                    >
                        💰 خصم $5 مباشر (SAVE5 - $5)
                    </button>
                    <button
                        type="button"
                        onClick={() => applyPreset("EAFVIP27", "percentage", 15, 30)}
                        className="px-3.5 py-1.5 rounded-xl bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold transition cursor-pointer"
                    >
                        ⚽ خصم EA FC 27 (EAFVIP27 - 15%)
                    </button>
                </div>
            </div>

            {/* Smart Analytics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">الكوبونات النشطة الفعالة</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {activeCouponsCount} كوبون فعّال 🟢
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <ShieldCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">إجمالي مرات استخدام الكوبونات</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                            {totalUsesCount} استخدام 📊
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">حملات الترويج والواتساب</div>
                        <div className="text-xl font-black text-amber-500 mt-0.5">
                            جاهز لنشر الإعلانات 📢
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                        <Share2 className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Create Coupon Form */}
            {showForm && (
                <form onSubmit={create} className="rounded-3xl bg-slate-900 text-white border-2 border-blue-500/40 p-6 space-y-5 shadow-2xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Tag className="w-5 h-5 text-blue-400" />
                            <h3 className="font-black text-base text-blue-300">إنشاء كود خصم ترويجي جديد</h3>
                        </div>
                        <button type="button" onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-slate-300">كود الخصم *</label>
                                <button type="button" onClick={generateRandomCode} className="text-[10px] text-amber-400 font-bold hover:underline">
                                    ✨ توليد كود تلقائي
                                </button>
                            </div>
                            <input
                                required
                                value={form.code}
                                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                                placeholder="مثلاً: SAVE20"
                                dir="ltr"
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm font-mono font-black uppercase text-amber-400 tracking-wider focus:border-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">نوع الخصم</label>
                            <select
                                value={form.type}
                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                            >
                                <option value="percentage">نسبة مئوية (%)</option>
                                <option value="fixed">مبلغ ثابت ($ / دولار)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">قيمة الخصم</label>
                            <input
                                type="number"
                                min="1"
                                required
                                value={form.value}
                                onChange={(e) => setForm({ ...form, value: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-sm font-black text-emerald-400"
                                placeholder="مثال: 15"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">تخصيص الكوبون وتحديده</label>
                            <select
                                value={form.target}
                                onChange={(e) => setForm({ ...form, target: e.target.value, targetItemId: "" })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                            >
                                <option value="all">🌐 جميع المنتجات بالسلة</option>
                                <option value="games">🎮 قسم الألعاب فقط</option>
                                <option value="subscriptions">📦 قسم الاشتراكات فقط</option>
                                <option value="specific_game">🎯 لعبة معينة ومحددة</option>
                                <option value="specific_sub">👑 اشتراك معين ومحدد</option>
                            </select>
                        </div>

                        {form.target === "specific_game" && (
                            <div>
                                <label className="block text-xs font-bold text-amber-400 mb-1">اختر اللعبة المحددة للخصم</label>
                                <select
                                    value={form.targetItemId}
                                    onChange={(e) => setForm({ ...form, targetItemId: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-amber-500/50 bg-slate-800 px-3 text-xs font-bold text-amber-300"
                                >
                                    <option value="">-- اختر اللعبة --</option>
                                    {(games || []).map((g) => (
                                        <option key={g.id} value={g.id}>{g.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {form.target === "specific_sub" && (
                            <div>
                                <label className="block text-xs font-bold text-amber-400 mb-1">اختر الاشتراك المحدد للخصم</label>
                                <select
                                    value={form.targetItemId}
                                    onChange={(e) => setForm({ ...form, targetItemId: e.target.value })}
                                    className="w-full h-11 rounded-xl border border-amber-500/50 bg-slate-800 px-3 text-xs font-bold text-amber-300"
                                >
                                    <option value="">-- اختر الاشتراك --</option>
                                    {(subscriptions || []).map((s) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأدنى للطلب ($)</label>
                            <input
                                type="number"
                                min="0"
                                value={form.minOrder}
                                onChange={(e) => setForm({ ...form, minOrder: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white"
                                placeholder="0 = لا يوجد حد"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">الحد الأقصى لعدد الاستخدامات</label>
                            <input
                                type="number"
                                min="1"
                                value={form.maxUses}
                                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
                                placeholder="فارغ = غير محدود (مفتوح)"
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white"
                            />
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-slate-300">تاريخ انتهاء الصلاحية</label>
                                <div className="flex items-center gap-1 text-[10px] text-amber-400 font-bold">
                                    <button type="button" onClick={() => setQuickExpiry(24)} className="hover:underline">24س</button>
                                    <span>•</span>
                                    <button type="button" onClick={() => setQuickExpiry(48)} className="hover:underline">48س</button>
                                    <span>•</span>
                                    <button type="button" onClick={() => setQuickExpiry(168)} className="hover:underline">أسبوع</button>
                                </div>
                            </div>
                            <input
                                type="date"
                                value={form.expiresAt}
                                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs text-white"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setShowForm(false)}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>حفظ وإطلاق الكوبون فوراً ✅</span>
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Tabs Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Filter className="w-4 h-4 text-blue-500" />
                    <span>تصفية الكوبونات:</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "all" ? "bg-blue-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        الكل ({coupons.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("active")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "active" ? "bg-emerald-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        النشطة الفعالة 🟢
                    </button>
                    <button
                        onClick={() => setFilterStatus("inactive")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "inactive" ? "bg-slate-700 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        المعطلة 🔴
                    </button>
                    <button
                        onClick={() => setFilterStatus("expired")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "expired" ? "bg-red-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        المنتهية ⏳
                    </button>
                </div>
            </div>

            {/* Coupons Grid Cards */}
            {loading ? (
                <div className="flex justify-center py-12">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : filteredCoupons.length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8">
                    <Tag className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-40" />
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">لا توجد كوبونات تطابق هذا الفلتر حالياً</p>
                    <p className="text-xs text-slate-500 mt-1">جرّب تغيير التصفية أو أنشئ كوبون ترويجي جديد من الأعلى.</p>
                </div>
            ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                    {filteredCoupons.map((c) => {
                        const isExpired = c.expiresAt && Date.now() > new Date(c.expiresAt).getTime();
                        const isMaxedOut = c.maxUses != null && c.usedCount >= c.maxUses;
                        const isInactive = !c.active || isExpired || isMaxedOut;

                        let targetBadge = "🌐 جميع المنتجات بالسلة";
                        if (c.target === "games") targetBadge = "🎮 الألعاب فقط";
                        else if (c.target === "subscriptions") targetBadge = "📦 الاشتراكات فقط";
                        else if (c.target === "specific_game" && c.targetItemId) {
                            const g = (games || []).find((x) => x.id === c.targetItemId);
                            targetBadge = `🎯 لعبة: ${g ? g.name : c.targetItemId}`;
                        } else if (c.target === "specific_sub" && c.targetItemId) {
                            const s = (subscriptions || []).find((x) => x.id === c.targetItemId);
                            targetBadge = `👑 اشتراك: ${s ? s.name : c.targetItemId}`;
                        }

                        return (
                            <div
                                key={c.id}
                                className={`rounded-3xl bg-white dark:bg-slate-900 border-2 p-5 shadow-sm transition space-y-4 ${
                                    isInactive
                                        ? "border-slate-300 dark:border-slate-800 opacity-60"
                                        : "border-pink-500/30 bg-pink-500/[0.01] hover:border-pink-500/60"
                                }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <code className="text-xl font-black text-pink-600 dark:text-pink-400 font-mono tracking-wider bg-pink-50 dark:bg-pink-950/40 px-3 py-1 rounded-xl border border-pink-200 dark:border-pink-800">
                                                {c.code}
                                            </code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(c.code);
                                                    toast.success(`تم نسخ كود الخصم: ${c.code} 📋`);
                                                }}
                                                className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                                                title="نسخ كود الخصم"
                                            >
                                                <Copy className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <div className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 pt-1">
                                            {c.type === "percentage" ? `خصم ${c.value}% على الطلب 🔥` : `خصم مباشر $${c.value} 💵`}
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <button
                                            onClick={() => toggle(c.id, c.active)}
                                            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1 border transition cursor-pointer ${
                                                c.active
                                                    ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                                            }`}
                                        >
                                            {c.active ? "مفعّل 🟢" : "معطّل 🔴"}
                                        </button>
                                        <button
                                            onClick={() => remove(c.id)}
                                            className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 transition cursor-pointer"
                                            title="حذف الكوبون"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <span className="inline-flex items-center gap-1 text-[11px] font-extrabold px-3 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                                        {targetBadge}
                                    </span>
                                </div>

                                <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center justify-between">
                                        <span>استخدامات الكوبون:</span>
                                        <span className="font-bold text-slate-900 dark:text-white">
                                            {c.usedCount || 0} {c.maxUses ? `/ ${c.maxUses}` : "مرة (غير محدود)"}
                                        </span>
                                    </div>

                                    {c.maxUses && (
                                        <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
                                            <div
                                                className="h-full bg-pink-500 rounded-full transition-all"
                                                style={{ width: `${Math.min(100, ((c.usedCount || 0) / c.maxUses) * 100)}%` }}
                                            />
                                        </div>
                                    )}

                                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px]">
                                        {c.minOrder > 0 ? (
                                            <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">
                                                حد أدنى: ${c.minOrder}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400">بدون حد أدنى</span>
                                        )}

                                        <span>الصلاحية: {fmtExpiry(c.expiresAt)}</span>
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <button
                                        onClick={() => copyWhatsAppPromoText(c)}
                                        className="w-full py-2.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center justify-center gap-2 transition cursor-pointer"
                                    >
                                        <Share2 className="w-3.5 h-3.5" />
                                        <span>📢 نسخ إعلان الخصم جاهز للواتساب</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
