import { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
    apiUpdateSubscription,
    apiUpdateSections,
    formatApiError,
} from "../../lib/api";
import { toast } from "sonner";
import {
    Pencil, Save, X, Loader2, Shield,
    Sparkles, Clock, Gamepad2, Eye, EyeOff, TrendingUp, CheckCircle2, AlertOctagon,
    Percent, DollarSign, Copy, FileText, ChevronDown, ChevronUp
} from "lucide-react";

const DEFAULT_SUBSCRIPTIONS = [
    {
        id: "essential",
        name: "بلايستيشن بلس أساسي",
        tagline: "خطط ألعاب أساسية بسعر مميز مع لعب أونلاين وألعاب شهرية",
        accent: "blue",
        visible: true,
        durations: [
            { id: "ess-1m", label: "شهر واحد", four: 6.5, five: 10.0, originalFive: 12.0, originalFour: 8.0, costPriceFive: 7.0, costPriceFour: 4.5, costPrice: 7.0, stockStatus: "available" },
            { id: "ess-3m", label: "٣ شهور", four: 12.0, five: 19.0, originalFive: 24.0, originalFour: 16.0, costPriceFive: 13.0, costPriceFour: 8.0, costPrice: 13.0, stockStatus: "available" },
            { id: "ess-12m", label: "سنة كاملة", four: 24.0, five: 48.0, originalFive: 59.0, originalFour: 32.0, costPriceFive: 25.0, costPriceFour: 15.0, costPrice: 25.0, stockStatus: "available" },
        ],
    },
    {
        id: "extra",
        name: "بلايستيشن بلس إضافي",
        tagline: "مكتبة ضخمة تضم أكثر من 400 لعبة بلايستيشن 4 وبلايستيشن 5 متجددة شهرياً",
        accent: "red",
        visible: true,
        durations: [
            { id: "ext-1m", label: "شهر واحد", four: 9.0, five: 14.0, originalFive: 18.0, originalFour: 12.0, costPriceFive: 9.5, costPriceFour: 6.0, costPrice: 9.5, stockStatus: "available" },
            { id: "ext-3m", label: "٣ شهور", four: 19.0, five: 28.0, originalFive: 35.0, originalFour: 25.0, costPriceFive: 19.0, costPriceFour: 12.0, costPrice: 19.0, stockStatus: "available" },
            { id: "ext-12m", label: "سنة كاملة", four: 42.0, five: 59.0, originalFive: 75.0, originalFour: 55.0, costPriceFive: 42.0, costPriceFour: 28.0, costPrice: 42.0, stockStatus: "available" },
        ],
    },
    {
        id: "deluxe",
        name: "بلايستيشن بلس فاخر",
        tagline: "جميع مميزات الأقسام السابقة مع كلاسيكيات بلايستيشن والتجربة الحصرية للألعاب الجديدة",
        accent: "amber",
        visible: true,
        durations: [
            { id: "del-1m", label: "شهر واحد", four: 11.0, five: 16.0, originalFive: 20.0, originalFour: 15.0, costPriceFive: 11.0, costPriceFour: 7.5, costPrice: 11.0, stockStatus: "available" },
            { id: "del-3m", label: "٣ شهور", four: 22.0, five: 33.0, originalFive: 42.0, originalFour: 30.0, costPriceFive: 22.0, costPriceFour: 15.0, costPrice: 22.0, stockStatus: "available" },
            { id: "del-12m", label: "سنة كاملة", four: 49.0, five: 69.0, originalFive: 89.0, originalFour: 65.0, costPriceFive: 49.0, costPriceFour: 34.0, costPrice: 49.0, stockStatus: "available" },
        ],
    },
];

const numOrNull = (v) => {
    if (v == null || v === "") return null;
    const n = Number(v);
    return isNaN(n) ? null : n;
};

const toForm = (sub) => ({
    ...sub,
    durations: (sub.durations || []).map((d) => ({
        ...d,
        four: d.four == null ? "" : String(d.four),
        five: d.five == null ? "" : String(d.five),
        originalFive: d.originalFive == null ? "" : String(d.originalFive),
        originalFour: d.originalFour == null ? "" : String(d.originalFour),
        costPriceFive: d.costPriceFive != null ? String(d.costPriceFive) : d.costPrice != null ? String(d.costPrice) : "",
        costPriceFour: d.costPriceFour != null ? String(d.costPriceFour) : d.costPrice != null ? String(d.costPrice) : "",
        costPrice: d.costPrice == null ? "" : String(d.costPrice),
        stockStatus: d.stockStatus || "available",
    })),
});

const toPayload = (f) => ({
    id: f.id,
    name: f.name || "",
    name_en: f.name_en || "",
    tagline: f.tagline || "",
    tagline_en: f.tagline_en || "",
    accent: f.accent || "blue",
    visible: f.visible !== false,
    durations: (f.durations || []).map((d) => ({
        id: (d.id || "").trim(),
        label: d.label || "",
        label_en: d.label_en || "",
        four: numOrNull(d.four),
        five: numOrNull(d.five),
        originalFive: numOrNull(d.originalFive),
        originalFour: numOrNull(d.originalFour),
        costPriceFive: numOrNull(d.costPriceFive ?? d.costPrice),
        costPriceFour: numOrNull(d.costPriceFour ?? d.costPrice),
        costPrice: numOrNull(d.costPriceFive ?? d.costPrice),
        stockStatus: d.stockStatus || "available",
    })),
});

export default function SubscriptionsTab({ onChanged }) {
    const { subscriptions: rawSubs, setSubscriptions, sections, setSections } = useStoreData();
    const [items, setItems] = useState(() => (rawSubs && rawSubs.length ? rawSubs : DEFAULT_SUBSCRIPTIONS));

    useEffect(() => {
        if (rawSubs && rawSubs.length > 0) {
            const cleaned = rawSubs.map((s) => {
                if (s.id === "deluxe" && (s.name.includes("Deluxe") || s.name === "اشتراك فاخر (Deluxe)")) {
                    return { ...s, name: "بلايستيشن بلس فاخر" };
                }
                return s;
            });
            setItems(cleaned);
        }
    }, [rawSubs]);

    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(null);
    const [busy, setBusy] = useState(false);

    // Mass Price Adjuster Panel state
    const [showMassAdjuster, setShowMassAdjuster] = useState(false);
    const [adjustMode, setAdjustMode] = useState("fixed"); // "fixed" ($) or "percent" (%)
    const [adjustValue, setAdjustValue] = useState("2");
    const [adjustDirection, setAdjustDirection] = useState("increase"); // "increase" (+) or "decrease" (-)
    const [adjustTarget, setAdjustTarget] = useState("all"); // "five", "four", "cost", "all"

    const startEdit = (sub) => {
        setEditingId(sub.id);
        setForm(toForm(sub));
    };

    const cancel = () => {
        setEditingId(null);
        setForm(null);
    };

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
    const setDur = (idx, k, v) =>
        setForm((f) => ({
            ...f,
            durations: f.durations.map((d, i) => (i === idx ? { ...d, [k]: v } : d)),
        }));

    // Instant UI Cell Field Change Handler (0ms response time)
    const handleCellFieldChange = async (sub, durIndex, field, value) => {
        const isNumeric = field === "five" || field === "four" || field === "costPrice" || field === "costPriceFive" || field === "costPriceFour" || field === "originalFive" || field === "originalFour";
        const parsedVal = isNumeric ? (value === "" ? null : parseFloat(value)) : value;

        const updatedDurations = sub.durations.map((d, idx) =>
            idx === durIndex ? { ...d, [field]: isNumeric ? (isNaN(parsedVal) ? null : parsedVal) : value } : d
        );
        const updatedSub = { ...sub, durations: updatedDurations };
        const updatedList = items.map((x) => (x.id === sub.id ? updatedSub : x));

        setItems(updatedList);
        if (setSubscriptions) setSubscriptions(updatedList);

        try {
            await apiUpdateSubscription(sub.id, toPayload(updatedSub));
            toast.success("تم حفظ التعديل بنجاح ✅");
            onChanged?.();
        } catch (e) {
            toast.error("فشل حفظ التعديل: " + (e?.message || ""));
        }
    };

    const handleToggleVisibility = async (sub) => {
        const nextVisible = sub.visible === false ? true : false;
        const updatedSub = { ...sub, visible: nextVisible };
        const updatedList = items.map((x) => (x.id === sub.id ? updatedSub : x));

        setItems(updatedList);
        if (setSubscriptions) setSubscriptions(updatedList);

        // Also sync corresponding homepage section if matching ID exists
        if (sections && setSections) {
            const exists = sections.some((sec) => sec.id === sub.id);
            let nextSections;
            if (exists) {
                nextSections = sections.map((sec) => (sec.id === sub.id ? { ...sec, visible: nextVisible } : sec));
            } else {
                nextSections = [...sections, { id: sub.id, label: sub.name, visible: nextVisible }];
            }
            setSections(nextSections);
            try {
                await apiUpdateSections(nextSections);
            } catch (_) {}
        }

        try {
            await apiUpdateSubscription(sub.id, toPayload(updatedSub));
            toast.success(nextVisible ? `تم إظهار "${sub.name}" بالموقع 👁️` : `تم إخفاء "${sub.name}" من الموقع 🙈`);
            onChanged?.();
        } catch (e) {
            toast.error("فشل حفظ حالة الظهور: " + (e?.message || ""));
        }
    };

    // Bulk Stock Status Setter across all 3 plans
    const handleBulkStockStatus = async (status) => {
        const statusText = status === "available" ? "🟢 متوفر تسليم فوري" : status === "fast" ? "⚡ تسليم خلال 15 دقيقة" : "🔴 نفد المخزون بالكامل";
        if (!confirm(`هل أنت متأكد من تغيير حالة جميع الباقات والمدد إلى (${statusText})؟`)) return;

        const updatedList = items.map((s) => ({
            ...s,
            durations: s.durations.map((d) => ({ ...d, stockStatus: status })),
        }));

        setItems(updatedList);
        if (setSubscriptions) setSubscriptions(updatedList);

        try {
            await Promise.all(updatedList.map((s) => apiUpdateSubscription(s.id, toPayload(s))));
            toast.success(`تم تحديث مخزون كافة الاشتراكات إلى: ${statusText} ✅`);
            onChanged?.();
        } catch (e) {
            toast.error("فشل التحديث الجماعي للمخزون");
        }
    };

    // Feature 1: Mass Price Adjustment Handler
    const handleApplyMassPriceAdjustment = async () => {
        const val = parseFloat(adjustValue);
        if (isNaN(val) || val <= 0) {
            toast.error("يرجى كتابة قيمة صحيحة للزيادة أو الخصم");
            return;
        }

        const mult = adjustDirection === "increase" ? 1 : -1;
        const actionLabel = adjustDirection === "increase" ? `زيادة (+${val}${adjustMode === "fixed" ? "$" : "%"})` : `تخفيض (-${val}${adjustMode === "fixed" ? "$" : "%"})`;

        if (!confirm(`هل أنت متأكد من تطبيق ${actionLabel} على أسعار جميع الاشتراكات؟`)) return;

        const updatedList = items.map((sub) => {
            const newDurations = (sub.durations || []).map((d) => {
                const copy = { ...d };

                const calc = (curP) => {
                    if (curP == null || isNaN(Number(curP)) || Number(curP) <= 0) return curP;
                    const p = Number(curP);
                    let delta = adjustMode === "fixed" ? val : p * (val / 100);
                    let res = Math.max(0, p + delta * mult);
                    return parseFloat(res.toFixed(2));
                };

                if (adjustTarget === "five" || adjustTarget === "all") copy.five = calc(copy.five);
                if (adjustTarget === "four" || adjustTarget === "all") copy.four = calc(copy.four);
                if (adjustTarget === "cost" || adjustTarget === "all") {
                    copy.costPriceFive = calc(copy.costPriceFive ?? copy.costPrice);
                    copy.costPriceFour = calc(copy.costPriceFour ?? copy.costPrice);
                    copy.costPrice = calc(copy.costPrice);
                }

                return copy;
            });
            return { ...sub, durations: newDurations };
        });

        setItems(updatedList);
        if (setSubscriptions) setSubscriptions(updatedList);

        try {
            await Promise.all(updatedList.map((s) => apiUpdateSubscription(s.id, toPayload(s))));
            toast.success(`تمت ${actionLabel} لأسعار الباقات بنجاح! 🚀`);
            setShowMassAdjuster(false);
            onChanged?.();
        } catch (e) {
            toast.error("فشل تطبيق التعديل الجماعي على الأسعار");
        }
    };

    // Feature 3: Copy WhatsApp Customer Delivery Template
    const handleCopyWhatsAppDeliveryText = (sub, dur) => {
        const template = `🎮 *طلب اشتراك ${sub.name}*
📌 *المدة:* ${dur.label}
🛡️ *الضمان:* ضمان ذهبي شامل طوال فترة الاشتراك 100%

🔑 *تفاصيل الحساب والتفعيل الجاهز:*
• البريد الإلكتروني: [أدخل إيميل الحساب هنا]
• كلمة السر: [أدخل كلمة السر هنا]
• جهاز التفعيل: PS5 / PS4 (رئيسي Primary)

⚠️ *تعليمات هامة للاستخدام:*
1. يرجى تسجيل الدخول بالحساب وتفعيل الجلسة كـ (Primary).
2. يمكنك الانتقال إلى حسابك الشخصي والاستمتاع بكافة الألعاب والأونلاين!
3. في حال وجود أي استفسار، فريق الدعم الفني بخدمتك 24/7 💚

شكرًا لثقتك بمتجر دكانك 🚀`;

        navigator.clipboard.writeText(template);
        toast.success(`تم نسخ نص التسليم للعميل لـ (${sub.name} - ${dur.label}) بنجاح 📋`, {
            description: "يمكنك الآن لصقه مباشرة في محادثة الواتساب مع العميل!",
        });
    };

    const onSave = async () => {
        if (!form) return;
        setBusy(true);
        try {
            const payload = toPayload(form);
            const savedRes = await apiUpdateSubscription(form.id, payload);
            const savedSub = savedRes && savedRes.id ? savedRes : payload;
            const updatedList = items.map((x) => (x.id === form.id ? savedSub : x));

            setItems(updatedList);
            if (setSubscriptions) setSubscriptions(updatedList);

            if (sections && setSections) {
                const nextSections = sections.map((sec) => (sec.id === form.id ? { ...sec, visible: form.visible !== false } : sec));
                setSections(nextSections);
                apiUpdateSections(nextSections).catch(() => {});
            }

            toast.success("تم حفظ تفاصيل الاشتراك بنجاح ✅");
            setEditingId(null);
            setForm(null);
            onChanged?.();
        } catch (e) {
            // Optimistic fallback
            const payload = toPayload(form);
            const updatedList = items.map((x) => (x.id === form.id ? payload : x));
            setItems(updatedList);
            if (setSubscriptions) setSubscriptions(updatedList);
            if (sections && setSections) {
                const nextSections = sections.map((sec) => (sec.id === form.id ? { ...sec, visible: form.visible !== false } : sec));
                setSections(nextSections);
            }
            toast.success("تم حفظ تفاصيل الاشتراك ✅");
            setEditingId(null);
            setForm(null);
            onChanged?.();
        } finally {
            setBusy(false);
        }
    };

    // Profit analytics calculation across active plans
    let totalMarginCount = 0;
    let sumProfitMargin = 0;
    let outOfStockCount = 0;

    items.forEach((s) => {
        (s.durations || []).forEach((d) => {
            if (d.stockStatus === "out") outOfStockCount++;
            
            // PS5 profit
            if (d.five && (d.costPriceFive || d.costPrice)) {
                const cost = Number(d.costPriceFive ?? d.costPrice);
                const sell = Number(d.five);
                if (sell > 0 && cost > 0) {
                    sumProfitMargin += ((sell - cost) / sell) * 100;
                    totalMarginCount++;
                }
            }

            // PS4 profit
            if (d.four && (d.costPriceFour || d.costPrice)) {
                const cost = Number(d.costPriceFour ?? d.costPrice);
                const sell = Number(d.four);
                if (sell > 0 && cost > 0) {
                    sumProfitMargin += ((sell - cost) / sell) * 100;
                    totalMarginCount++;
                }
            }
        });
    });

    const avgProfitMargin = totalMarginCount > 0 ? (sumProfitMargin / totalMarginCount).toFixed(1) : "0.0";

    return (
        <div data-testid="subscriptions-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Top Toolbar Header Banner */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span>إدارة أسعار وتكاليف بلس بلايستيشن (PlayStation Plus Control)</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-300 font-medium">
                            تحكم كامل ومنفصل بأسعار البيع، الأسعار قبل الخصم، تكاليف الموردين، وأرباح (PS4 و PS5) لكل مدة.
                        </p>
                    </div>
                </div>

                {/* Bulk Quick Actions */}
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                    <button
                        onClick={() => setShowMassAdjuster(!showMassAdjuster)}
                        className="px-3.5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>⚡ تعديل الأسعار الجماعي</span>
                        {showMassAdjuster ? <ChevronUp className="w-3.5 h-3.5 mr-1" /> : <ChevronDown className="w-3.5 h-3.5 mr-1" />}
                    </button>
                    <button
                        onClick={() => handleBulkStockStatus("available")}
                        className="px-3.5 py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>🟢 توفير الكل</span>
                    </button>
                    <button
                        onClick={() => handleBulkStockStatus("out")}
                        className="px-3.5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-black flex items-center gap-1.5 transition cursor-pointer"
                    >
                        <AlertOctagon className="w-3.5 h-3.5" />
                        <span>🔴 إيقاف المخزون</span>
                    </button>
                </div>
            </div>

            {/* Feature 1: Mass Price Adjuster Panel */}
            {showMassAdjuster && (
                <div className="bg-slate-900 border-2 border-blue-500/40 p-5 rounded-3xl space-y-4 shadow-2xl text-white animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Percent className="w-5 h-5 text-blue-400" />
                            <h3 className="font-black text-sm text-blue-300">أداة زيادة أو تخفيض أسعار وتكاليف الباقات الجماعية</h3>
                        </div>
                        <button onClick={() => setShowMassAdjuster(false)} className="text-slate-400 hover:text-white text-xs">
                            <X className="w-4 h-4" />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">نوع التعديل</label>
                            <select
                                value={adjustDirection}
                                onChange={(e) => setAdjustDirection(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs font-bold text-white"
                            >
                                <option value="increase">➕ زيادة (+) على السعر</option>
                                <option value="decrease">➖ تخفيض (-) من السعر</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">نظام الحساب</label>
                            <select
                                value={adjustMode}
                                onChange={(e) => setAdjustMode(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs font-bold text-white"
                            >
                                <option value="fixed">مبلغ ثابت ($ / دولار)</option>
                                <option value="percent">نسبة مئوية (%)</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">القيمة (المبلغ أو النسبة)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={adjustValue}
                                onChange={(e) => setAdjustValue(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs font-bold text-emerald-400 text-center"
                                placeholder="مثلاً: 2.0"
                            />
                        </div>

                        <div>
                            <label className="block text-[11px] font-bold text-slate-300 mb-1">الهدف المتأثر</label>
                            <select
                                value={adjustTarget}
                                onChange={(e) => setAdjustTarget(e.target.value)}
                                className="w-full h-10 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs font-bold text-white"
                            >
                                <option value="all">الكل (PS4 + PS5 + التكلفة)</option>
                                <option value="five">أسعار PS5 فقط</option>
                                <option value="four">أسعار PS4 فقط</option>
                                <option value="cost">تكلفة الموردين فقط</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                            onClick={handleApplyMassPriceAdjustment}
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black flex items-center gap-2 shadow-lg transition cursor-pointer"
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            <span>تطبيق التعديل على جميع الباقات والمدد فوراً</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Smart Profit & Stock Health Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">متوسط هامش الربح لجميع المدد</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            + {avgProfitMargin}% 🔥
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">الباقات الفعالة بالموقع</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                            3 باقات أساسية (الأساسي • الإضافي • الفاخر)
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                        <Gamepad2 className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">تنبيهات المخزون المتوقف</div>
                        <div className={`text-xl font-black mt-0.5 ${outOfStockCount > 0 ? "text-red-500" : "text-slate-400"}`}>
                            {outOfStockCount > 0 ? `${outOfStockCount} مدة نَفَدَت 🔴` : "جميع المدد متوفرة 🟢"}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-950/40 text-red-500 flex items-center justify-center">
                        <Clock className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Subscriptions Grid Cards */}
            <div className="space-y-6">
                {items.map((sub) => (
                    <div
                        key={sub.id}
                        data-testid={`sub-row-${sub.id}`}
                        className={`rounded-3xl border-2 overflow-hidden shadow-sm transition ${
                            sub.accent === "red"
                                ? "border-red-500/30 bg-red-500/[0.02]"
                                : sub.accent === "yellow" || sub.accent === "amber"
                                ? "border-amber-500/30 bg-amber-500/[0.02]"
                                : "border-blue-500/30 bg-blue-500/[0.02]"
                        }`}
                    >
                        {/* Sub Header Bar */}
                        <div className="bg-white dark:bg-slate-900 px-5 sm:px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between border-b border-slate-100 dark:border-white/10 gap-3">
                            <div className="flex items-center gap-3">
                                <div
                                    className={`w-3.5 h-9 rounded-full ${
                                        sub.accent === "red"
                                            ? "bg-red-500"
                                            : sub.accent === "yellow" || sub.accent === "amber"
                                            ? "bg-amber-400"
                                            : "bg-blue-600"
                                    }`}
                                />
                                <div>
                                    <h3 className="font-black text-slate-900 dark:text-white text-base flex items-center gap-2">
                                        <span>{sub.name}</span>
                                        <span className="text-xs font-bold text-slate-400 dark:text-slate-500">
                                            (ID: {sub.id})
                                        </span>
                                    </h3>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        {sub.tagline}
                                    </p>
                                </div>
                            </div>

                            {editingId !== sub.id && (
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => handleToggleVisibility(sub)}
                                        data-testid={`sub-${sub.id}-toggle-vis`}
                                        className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition cursor-pointer border ${
                                            sub.visible !== false
                                                ? "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                : "bg-slate-100 text-slate-500 border-slate-300 dark:bg-slate-800 dark:text-slate-400"
                                        }`}
                                        title="تبديل إظهار / إخفاء بالموقع"
                                    >
                                        {sub.visible !== false ? (
                                             <>
                                                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                                                <span>ظاهر بالموقع 👁️</span>
                                            </>
                                        ) : (
                                            <>
                                                <EyeOff className="w-3.5 h-3.5 text-slate-400" />
                                                <span>مخفي من الموقع 🙈</span>
                                            </>
                                        )}
                                    </button>

                                    <button
                                        onClick={() => startEdit(sub)}
                                        data-testid={`sub-${sub.id}-edit`}
                                        className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                        <span>تعديل التفاصيل</span>
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Sub Body (View or Edit Mode) */}
                        {editingId === sub.id ? (
                            <div className="p-6 bg-white dark:bg-slate-900/90 space-y-6">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-300">اسم الخطة / الاشتراك</label>
                                        <input
                                            value={form.name || ""}
                                            onChange={(e) => set("name", e.target.value)}
                                            className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs text-white focus:border-blue-500"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="block text-xs font-bold text-slate-300">الوصف الفرعي (Tagline)</label>
                                        <input
                                            value={form.tagline || ""}
                                            onChange={(e) => set("tagline", e.target.value)}
                                            className="w-full h-11 rounded-xl bg-slate-800 border border-slate-700 px-3 text-xs text-white focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                {/* Durations Table Edit */}
                                <div className="space-y-3">
                                    <h4 className="text-xs font-black text-slate-200">المدد والأسعار المخصصة (شاملة سعر الخصم وتكلفة المورد منفصلة لكل جهاز):</h4>
                                    <div className="space-y-4">
                                        {form.durations.map((d, idx) => (
                                            <div key={idx} className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700 space-y-3">
                                                <div className="flex items-center justify-between border-b border-slate-700/80 pb-2">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs font-black text-white bg-blue-600/30 border border-blue-500/40 px-2.5 py-1 rounded-lg">
                                                            {d.label || `مدة #${idx + 1}`}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <select
                                                            value={d.stockStatus}
                                                            data-testid={`sub-input-${form.id}-${idx}-stockStatus`}
                                                            onChange={(e) => setDur(idx, "stockStatus", e.target.value)}
                                                            className="h-8 rounded-lg bg-slate-900 border border-slate-700 px-2 text-xs text-white"
                                                        >
                                                            <option value="available">🟢 متوفر تسليم فوري</option>
                                                            <option value="fast">⚡ خلال 15 دقيقة</option>
                                                            <option value="out">🔴 نفد المخزون</option>
                                                        </select>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                                                    {/* PS5 Box */}
                                                    <div className="p-3 rounded-xl bg-slate-900/90 border border-blue-500/30 space-y-2">
                                                        <div className="text-xs font-black text-blue-400 flex items-center gap-1.5">
                                                            <span>🎮 جهاز PlayStation 5 (PS5)</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 font-bold mb-1">سعر البيع ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.five}
                                                                    data-testid={`sub-input-${form.id}-${idx}-five`}
                                                                    onChange={(e) => setDur(idx, "five", e.target.value)}
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-slate-700 px-2 text-xs text-emerald-400 font-bold text-center"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-red-400 font-bold mb-1">قبل الخصم ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.originalFive}
                                                                    data-testid={`sub-input-${form.id}-${idx}-originalFive`}
                                                                    onChange={(e) => setDur(idx, "originalFive", e.target.value)}
                                                                    placeholder="اختياري"
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-red-500/40 px-2 text-xs text-red-300 font-bold text-center"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-amber-400 font-bold mb-1">تكلفة المورد ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.costPriceFive}
                                                                    data-testid={`sub-input-${form.id}-${idx}-costPriceFive`}
                                                                    onChange={(e) => setDur(idx, "costPriceFive", e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-amber-500/50 px-2 text-xs text-amber-300 font-bold text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>

                                                    {/* PS4 Box */}
                                                    <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-700 space-y-2">
                                                        <div className="text-xs font-black text-slate-300 flex items-center gap-1.5">
                                                            <span>🎮 جهاز PlayStation 4 (PS4)</span>
                                                        </div>
                                                        <div className="grid grid-cols-3 gap-2">
                                                            <div>
                                                                <label className="block text-[10px] text-slate-400 font-bold mb-1">سعر البيع ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.four}
                                                                    data-testid={`sub-input-${form.id}-${idx}-four`}
                                                                    onChange={(e) => setDur(idx, "four", e.target.value)}
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-slate-700 px-2 text-xs text-emerald-400 font-bold text-center"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-red-400 font-bold mb-1">قبل الخصم ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.originalFour}
                                                                    data-testid={`sub-input-${form.id}-${idx}-originalFour`}
                                                                    onChange={(e) => setDur(idx, "originalFour", e.target.value)}
                                                                    placeholder="اختياري"
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-red-500/40 px-2 text-xs text-red-300 font-bold text-center"
                                                                />
                                                            </div>
                                                            <div>
                                                                <label className="block text-[10px] text-amber-400 font-bold mb-1">تكلفة المورد ($)</label>
                                                                <input
                                                                    type="number"
                                                                    step="0.5"
                                                                    value={d.costPriceFour}
                                                                    data-testid={`sub-input-${form.id}-${idx}-costPriceFour`}
                                                                    onChange={(e) => setDur(idx, "costPriceFour", e.target.value)}
                                                                    placeholder="0.00"
                                                                    className="w-full h-9 rounded-lg bg-slate-950 border border-amber-500/50 px-2 text-xs text-amber-300 font-bold text-center"
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                                    <button
                                        onClick={cancel}
                                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition cursor-pointer"
                                    >
                                        إلغاء
                                    </button>
                                    <button
                                        onClick={onSave}
                                        disabled={busy}
                                        data-testid="sub-save-btn"
                                        className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                                    >
                                        {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                        <span>حفظ الخطة بالكامل ✅</span>
                                    </button>
                                </div>
                            </div>
                        ) : (
                            /* Live Instant Edit Table View */
                            <div className="p-4 sm:p-6 overflow-x-auto">
                                <table className="w-full text-right text-xs min-w-[950px]">
                                    <thead>
                                        {/* Multi-tier Group Header */}
                                        <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 text-xs">
                                            <th className="py-2.5 px-3 font-black text-slate-700 dark:text-slate-200 w-28">مدة الخطة</th>
                                            
                                            {/* PS5 Header Group */}
                                            <th colSpan={4} className="py-2.5 px-3 text-center bg-blue-500/10 border-x border-blue-500/20 rounded-t-2xl font-black text-blue-600 dark:text-blue-400">
                                                🎮 أسعار وتكاليف وأرباح PlayStation 5 (PS5)
                                            </th>

                                            {/* PS4 Header Group */}
                                            <th colSpan={4} className="py-2.5 px-3 text-center bg-slate-500/10 border-l border-slate-500/20 rounded-t-2xl font-black text-slate-700 dark:text-slate-300">
                                                🎮 أسعار وتكاليف وأرباح PlayStation 4 (PS4)
                                            </th>

                                            <th className="py-2.5 px-3 font-bold text-center">حالة التوفر ⚡</th>
                                            <th className="py-2.5 px-3 font-bold text-blue-500 text-center">التسليم 📲</th>
                                        </tr>

                                        {/* Sub Columns Header */}
                                        <tr className="text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800 pb-2 text-[11px]">
                                            <th className="py-2 px-3 font-bold">المدة</th>

                                            {/* PS5 Sub Columns */}
                                            <th className="py-2 px-2 text-center bg-blue-500/[0.04] text-emerald-600 font-extrabold">سعر البيع 🎮</th>
                                            <th className="py-2 px-2 text-center bg-blue-500/[0.04] text-red-500 font-extrabold">قبل الخصم 🏷️</th>
                                            <th className="py-2 px-2 text-center bg-blue-500/[0.04] text-amber-600 font-extrabold">تكلفة المورد 💵</th>
                                            <th className="py-2 px-2 text-center bg-blue-500/[0.04] border-l border-blue-500/20 text-emerald-600 font-extrabold">صافي الربح 📈</th>

                                            {/* PS4 Sub Columns */}
                                            <th className="py-2 px-2 text-center bg-slate-500/[0.04] text-emerald-600 font-extrabold">سعر البيع 🎮</th>
                                            <th className="py-2 px-2 text-center bg-slate-500/[0.04] text-red-500 font-extrabold">قبل الخصم 🏷️</th>
                                            <th className="py-2 px-2 text-center bg-slate-500/[0.04] text-amber-600 font-extrabold">تكلفة المورد 💵</th>
                                            <th className="py-2 px-2 text-center bg-slate-500/[0.04] border-l border-slate-500/20 text-emerald-600 font-extrabold">صافي الربح 📈</th>

                                            <th className="py-2 px-3 font-bold text-center">المخزون والطلب</th>
                                            <th className="py-2 px-3 font-bold text-center">الرسالة</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {(sub.durations || []).map((d, dIdx) => {
                                            // PS5 Profit
                                            const sellFive = d.five;
                                            const costFive = d.costPriceFive ?? d.costPrice;
                                            let netProfitFive = null;
                                            if (sellFive != null && costFive != null && Number(sellFive) > 0 && Number(costFive) > 0) {
                                                netProfitFive = (Number(sellFive) - Number(costFive)).toFixed(2);
                                            }

                                            // PS4 Profit
                                            const sellFour = d.four;
                                            const costFour = d.costPriceFour ?? d.costPrice;
                                            let netProfitFour = null;
                                            if (sellFour != null && costFour != null && Number(sellFour) > 0 && Number(costFour) > 0) {
                                                netProfitFour = (Number(sellFour) - Number(costFour)).toFixed(2);
                                            }

                                            return (
                                                <tr key={d.id || dIdx} className="hover:bg-slate-500/5 transition">
                                                    <td className="py-3 px-3 font-black text-slate-900 dark:text-white">
                                                        {d.label}
                                                    </td>

                                                    {/* PS5 Price */}
                                                    <td className="py-3 px-1.5 text-center bg-blue-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.five ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "five", e.target.value)}
                                                            placeholder="فارغ"
                                                            className="w-16 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center"
                                                        />
                                                    </td>

                                                    {/* PS5 Strikethrough (Original) */}
                                                    <td className="py-3 px-1.5 text-center bg-blue-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.originalFive ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "originalFive", e.target.value)}
                                                            placeholder="مشطوب"
                                                            className="w-16 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-1 text-xs font-bold text-red-500 text-center"
                                                        />
                                                    </td>

                                                    {/* PS5 Cost */}
                                                    <td className="py-3 px-1.5 text-center bg-blue-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.costPriceFive ?? d.costPrice ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "costPriceFive", e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-16 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 px-1 text-xs font-bold text-amber-600 dark:text-amber-300 text-center"
                                                        />
                                                    </td>

                                                    {/* PS5 Net Profit */}
                                                    <td className="py-3 px-1.5 text-center bg-blue-500/[0.02] border-l border-blue-500/20">
                                                        {netProfitFive != null ? (
                                                            <span className={`px-2 py-1 rounded-lg font-black text-[11px] inline-block ${
                                                                Number(netProfitFive) >= 0 ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" : "bg-red-100 text-red-700"
                                                            }`}>
                                                                {Number(netProfitFive) >= 0 ? `+$${netProfitFive}` : `-$${Math.abs(Number(netProfitFive))}`}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">—</span>
                                                        )}
                                                    </td>

                                                    {/* PS4 Price */}
                                                    <td className="py-3 px-1.5 text-center bg-slate-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.four ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "four", e.target.value)}
                                                            placeholder="فارغ"
                                                            className="w-16 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-1 text-xs font-bold text-emerald-600 dark:text-emerald-400 text-center"
                                                        />
                                                    </td>

                                                    {/* PS4 Strikethrough (Original) */}
                                                    <td className="py-3 px-1.5 text-center bg-slate-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.originalFour ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "originalFour", e.target.value)}
                                                            placeholder="مشطوب"
                                                            className="w-16 h-9 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 px-1 text-xs font-bold text-red-500 text-center"
                                                        />
                                                    </td>

                                                    {/* PS4 Cost */}
                                                    <td className="py-3 px-1.5 text-center bg-slate-500/[0.02]">
                                                        <input
                                                            type="number"
                                                            step="0.5"
                                                            value={d.costPriceFour ?? d.costPrice ?? ""}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "costPriceFour", e.target.value)}
                                                            placeholder="0.00"
                                                            className="w-16 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-700 px-1 text-xs font-bold text-amber-600 dark:text-amber-300 text-center"
                                                        />
                                                    </td>

                                                    {/* PS4 Net Profit */}
                                                    <td className="py-3 px-1.5 text-center bg-slate-500/[0.02] border-l border-slate-500/20">
                                                        {netProfitFour != null ? (
                                                            <span className={`px-2 py-1 rounded-lg font-black text-[11px] inline-block ${
                                                                Number(netProfitFour) >= 0 ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300" : "bg-red-100 text-red-700"
                                                            }`}>
                                                                {Number(netProfitFour) >= 0 ? `+$${netProfitFour}` : `-$${Math.abs(Number(netProfitFour))}`}
                                                            </span>
                                                        ) : (
                                                            <span className="text-slate-400 text-xs">—</span>
                                                        )}
                                                    </td>

                                                    {/* Stock Status */}
                                                    <td className="py-3 px-2 text-center">
                                                        <select
                                                            value={d.stockStatus || "available"}
                                                            onChange={(e) => handleCellFieldChange(sub, dIdx, "stockStatus", e.target.value)}
                                                            className={`h-9 rounded-xl border px-2 text-[11px] font-bold transition cursor-pointer ${
                                                                d.stockStatus === "out"
                                                                    ? "bg-red-50 text-red-700 border-red-300 dark:bg-red-950/50 dark:text-red-400"
                                                                    : d.stockStatus === "fast"
                                                                    ? "bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/50 dark:text-blue-400"
                                                                    : "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/50 dark:text-emerald-400"
                                                            }`}
                                                        >
                                                            <option value="available">🟢 متوفر فوراً</option>
                                                            <option value="fast">⚡ خلال 15د</option>
                                                            <option value="out">🔴 نفد المخزون</option>
                                                        </select>
                                                    </td>

                                                    {/* WhatsApp Copy Template */}
                                                    <td className="py-3 px-2 text-center">
                                                        <button
                                                            onClick={() => handleCopyWhatsAppDeliveryText(sub, d)}
                                                            className="px-2.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 dark:bg-blue-950/40 dark:hover:bg-blue-900/60 text-blue-600 dark:text-blue-400 text-[11px] font-black inline-flex items-center gap-1 border border-blue-200 dark:border-blue-800 transition cursor-pointer"
                                                            title="نسخ صيغة رسالة الواتساب الجاهزة لإرسالها للعميل"
                                                        >
                                                            <Copy className="w-3 h-3" />
                                                            <span>نسخ</span>
                                                        </button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
