import { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { apiUpdateSections, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import {
    GripVertical, Eye, EyeOff, Save, ArrowUp, ArrowDown, Loader2,
    Sparkles, Flame, Crown, Package, Layers, RefreshCw, CheckCircle2, RotateCcw
} from "lucide-react";

const REMOVED_SECTION_IDS = ["bundles", "bundleBuilder", "recommender", "emailSignup", "promoBanner"];

const SECTION_TITLES_AR = {
    hero: "الواجهة الرئيسية والبانر الترحيبي (Hero)",
    gamelaunch: "إعلان إطلاق الألعاب الكبرى (Launch Banner)",
    essential: "اشتراكات بلايستيشن بلس الأساسي (PS Plus Essential)",
    extra: "اشتراكات بلايستيشن بلس إكسترا (PS Plus Extra)",
    deluxe: "اشتراكات بلايستيشن بلس ديلوكس (PS Plus Deluxe)",
    comparison: "جدول مقارنة باقات واشتراكات بلس",
    games: "متجر الألعاب الرقمية والمخزون الحصري",
    howItWorks: "خطوات الشراء والتفعيل الفوري",
    goldenGuarantee: "قسم الضمان الذهبي والأمان",
    aboutStore: "عن متجر دُكانك ومميزاتنا",
    reviews: "آراء وتقييمات العملاء الموثوقة",
    faq: "الأسئلة الشائعة والدعم الفني المباشر",
};

const SECTION_CATEGORIES = {
    hero: { label: "الواجهة الرئيسية 🚀", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    gamelaunch: { label: "افتتاحية المتجر 📢", color: "bg-purple-500/10 text-purple-600 border-purple-500/20" },
    essential: { label: "اشتراكات 📦", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    extra: { label: "اشتراكات 📦", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    deluxe: { label: "اشتراكات 📦", color: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20" },
    comparison: { label: "مقارنة ⚖️", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
    games: { label: "الألعاب والمخزون 🎮", color: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    howItWorks: { label: "طريقة الشراء 🪜", color: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
    aboutStore: { label: "عن المتجر 🏪", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    goldenGuarantee: { label: "الضمان الذهبي 🏅", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    reviews: { label: "ثقة وزبائن ⭐", color: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
    faq: { label: "دعم وأسئلة ❓", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" },
};

export default function SectionsTab({ onChanged }) {
    const { sections, setSections } = useStoreData();
    const [items, setItems] = useState(() => (sections || []).filter((s) => !REMOVED_SECTION_IDS.includes(s.id)));
    const [saving, setSaving] = useState(false);
    const [dragIdx, setDragIdx] = useState(null);
    const [hoverIdx, setHoverIdx] = useState(null);

    useEffect(() => {
        setItems((sections || []).filter((s) => !REMOVED_SECTION_IDS.includes(s.id)));
    }, [sections]);

    const dirty = JSON.stringify(items) !== JSON.stringify((sections || []).filter((s) => !REMOVED_SECTION_IDS.includes(s.id)));

    const autoSaveSections = async (newItems) => {
        setItems(newItems);
        if (setSections) setSections(newItems);
        try {
            await apiUpdateSections(
                newItems.map((s) => ({
                    id: s.id,
                    label: s.label || s.name || s.id,
                    name: s.name || s.label || s.id,
                    visible: s.visible !== false,
                }))
            );
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        }
    };

    const moveTo = (from, to) => {
        if (from === to || to < 0 || to >= items.length) return;
        const next = [...items];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        autoSaveSections(next);
    };

    const moveUp = (i) => moveTo(i, i - 1);
    const moveDown = (i) => moveTo(i, i + 1);

    const toggleVisible = async (i) => {
        const next = items.map((s, idx) => (idx === i ? { ...s, visible: !s.visible } : s));
        const item = next[i];
        toast.success(item.visible ? `تم إظهار قسم "${item.label || item.id}" بالموقع 👁️` : `تم إخفاء قسم "${item.label || item.id}" من الموقع 🙈`);
        await autoSaveSections(next);
    };

    const showAll = async () => {
        const next = items.map((s) => ({ ...s, visible: true }));
        toast.success("تم إظهار كافة الأقسام 👁️");
        await autoSaveSections(next);
    };

    const hideNonEssential = async () => {
        const essentialKeys = ["gamelaunch", "games", "essential", "reviews"];
        const next = items.map((s) => ({ ...s, visible: essentialKeys.includes(s.id) }));
        toast.info("تم ترك الأقسام الأساسية فقط وإخفاء الباقي 👁️‍🗨️");
        await autoSaveSections(next);
    };

    // Preset Layouts
    const applyPresetGamesFirst = () => {
        const orderKeys = ["gamelaunch", "games", "essential", "extra", "deluxe", "comparison", "howItWorks", "goldenGuarantee", "aboutStore", "reviews", "faq"];
        reorderListByKeys(orderKeys);
        toast.success("تم تطبيق قالب: الألعاب والمخزون أولاً 🔥");
    };

    const applyPresetSubscriptionsFirst = () => {
        const orderKeys = ["essential", "extra", "deluxe", "comparison", "games", "gamelaunch", "howItWorks", "goldenGuarantee", "aboutStore", "reviews", "faq"];
        reorderListByKeys(orderKeys);
        toast.success("تم تطبيق قالب: الاشتراكات والـ PS Plus أولاً 💎");
    };

    const applyPresetGuaranteeFirst = () => {
        const orderKeys = ["goldenGuarantee", "aboutStore", "howItWorks", "reviews", "games", "essential", "extra", "deluxe", "comparison", "gamelaunch", "faq"];
        reorderListByKeys(orderKeys);
        toast.success("تم تطبيق قالب: الضمان الذهبي وثقة العملاء أولاً ⭐");
    };

    const reorderListByKeys = async (keys) => {
        const map = new Map(items.map((it) => [it.id, it]));
        const reordered = [];
        keys.forEach((k) => {
            if (map.has(k)) {
                reordered.push({ ...map.get(k), visible: true });
                map.delete(k);
            }
        });
        // Append any remaining items
        map.forEach((val) => reordered.push(val));
        await autoSaveSections(reordered);
    };

    const onDragStart = (e, idx) => {
        setDragIdx(idx);
        e.dataTransfer.effectAllowed = "move";
        e.dataTransfer.setData("text/plain", String(idx));
    };
    const onDragOver = (e, idx) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setHoverIdx(idx);
    };
    const onDragLeave = () => setHoverIdx(null);
    const onDrop = (e, idx) => {
        e.preventDefault();
        if (dragIdx === null) return;
        moveTo(dragIdx, idx);
        setDragIdx(null);
        setHoverIdx(null);
    };
    const onDragEnd = () => {
        setDragIdx(null);
        setHoverIdx(null);
    };

    const onSave = async () => {
        setSaving(true);
        try {
            await apiUpdateSections(
                items.map((s) => ({
                    id: s.id,
                    label: s.label || s.name || s.id,
                    name: s.name || s.label || s.id,
                    visible: s.visible !== false,
                })),
            );
            toast.success("تم حفظ ترتيب الأقسام بنجاح 💾");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    const onReset = () => setItems(sections);

    const visibleCount = items.filter((i) => i.visible).length;

    return (
        <div data-testid="sections-tab" className="space-y-5">
            {/* Header Control Card */}
            <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                            <Layers className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>ترتيب وإخفاء أقسام الصفحة الرئيسية</span>
                                <Sparkles className="w-4 h-4 text-indigo-400" />
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                اسحب الأقسام سحباً وإفلاتاً (Drag & Drop) أو استخدم الأسهم لتحديد الترتيب المثالي بالمتجر.
                            </p>
                        </div>
                    </div>

                    {/* Progress Meter */}
                    <div className="bg-slate-800 border border-slate-700 px-4 py-2.5 rounded-2xl shrink-0 flex items-center gap-3">
                        <div>
                            <div className="text-[11px] font-bold text-slate-400">الأقسام الظاهرة بالمتجر:</div>
                            <div className="text-sm font-black text-emerald-400">
                                {visibleCount} من أصل {items.length} قسم 🟢
                            </div>
                        </div>
                    </div>
                </div>

                {/* Preset Layout Buttons */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                        <span className="font-bold text-slate-400">قوالب الترتيب الذكية بنقرة واحدة:</span>
                        <button
                            onClick={applyPresetGamesFirst}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            <Flame className="w-3.5 h-3.5" />
                            <span>الألعاب والأكثر مبيعاً أولاً 🔥</span>
                        </button>
                        <button
                            onClick={applyPresetSubscriptionsFirst}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-400 border border-indigo-500/30 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            <Crown className="w-3.5 h-3.5" />
                            <span>الاشتراكات والـ PS Plus أولاً 💎</span>
                        </button>
                        <button
                            onClick={applyPresetGuaranteeFirst}
                            className="px-3 py-1.5 rounded-xl bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 border border-amber-500/30 font-bold transition cursor-pointer flex items-center gap-1"
                        >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>الضمان الذهبي وثقة العملاء أولاً ⭐</span>
                        </button>
                    </div>

                    {/* Bulk Visibility Actions */}
                    <div className="flex items-center gap-2 text-xs">
                        <button
                            onClick={showAll}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold transition cursor-pointer"
                        >
                            إظهار الكل 👁️
                        </button>
                        <button
                            onClick={hideNonEssential}
                            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-bold transition cursor-pointer"
                        >
                            ترك الأساسيات فقط 👁️‍🗨️
                        </button>
                    </div>
                </div>
            </div>

            {/* Draggable Sections List */}
            <ol className="space-y-2.5">
                {items.map((s, i) => {
                    const cat = SECTION_CATEGORIES[s.id] || { label: "قسم فرعي", color: "bg-slate-500/10 text-slate-600 border-slate-500/20" };

                    return (
                        <li
                            key={s.id}
                            draggable
                            onDragStart={(e) => onDragStart(e, i)}
                            onDragOver={(e) => onDragOver(e, i)}
                            onDragLeave={onDragLeave}
                            onDrop={(e) => onDrop(e, i)}
                            onDragEnd={onDragEnd}
                            data-testid={`section-row-${s.id}`}
                            className={`group rounded-2xl border-2 bg-white dark:bg-slate-900 px-4 py-3.5 flex items-center gap-3.5 transition-all shadow-sm cursor-grab active:cursor-grabbing ${
                                !s.visible ? "opacity-55 bg-slate-50/60 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800" : "border-slate-200 dark:border-slate-800 hover:border-blue-500/40"
                            } ${
                                hoverIdx === i && dragIdx !== i
                                    ? "border-blue-600 bg-blue-50/30 dark:bg-blue-950/30 shadow-md scale-[1.01]"
                                    : ""
                            } ${dragIdx === i ? "opacity-30 scale-95" : ""}`}
                        >
                            <GripVertical className="w-5 h-5 text-slate-400 group-hover:text-blue-500 shrink-0 transition" />

                            <span className="inline-flex items-center justify-center min-w-[30px] h-8 px-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-black text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                                #{i + 1}
                            </span>

                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                        {SECTION_TITLES_AR[s.id] || s.label || s.name || s.id}
                                    </span>
                                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${cat.color}`}>
                                        {cat.label}
                                    </span>
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 mt-0.5" dir="ltr">
                                    id: {s.id}
                                </div>
                            </div>

                            <div className="flex items-center gap-1.5 shrink-0">
                                <button
                                    onClick={() => moveUp(i)}
                                    disabled={i === 0}
                                    aria-label="رفع"
                                    title="رفع لأعلى"
                                    data-testid={`section-${s.id}-up`}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ArrowUp className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => moveDown(i)}
                                    disabled={i === items.length - 1}
                                    aria-label="إنزال"
                                    title="إنزال لأسفل"
                                    data-testid={`section-${s.id}-down`}
                                    className="w-9 h-9 rounded-xl flex items-center justify-center bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white text-slate-600 dark:text-slate-300 transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                                >
                                    <ArrowDown className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => toggleVisible(i)}
                                    aria-label={s.visible ? "إخفاء" : "إظهار"}
                                    title={s.visible ? "إخفاء القسم" : "إظهار القسم"}
                                    data-testid={`section-${s.id}-toggle`}
                                    className={`px-3 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer ${
                                        s.visible
                                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                                            : "bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20"
                                    }`}
                                >
                                    {s.visible ? (
                                        <>
                                            <Eye className="w-4 h-4" />
                                            <span>ظاهر 🟢</span>
                                        </>
                                    ) : (
                                        <>
                                            <EyeOff className="w-4 h-4" />
                                            <span>مخفي 🔴</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </li>
                    );
                })}
            </ol>

            {/* Bottom Floating Save Controls */}
            <div className="sticky bottom-4 flex items-center justify-between gap-3 bg-slate-900/90 backdrop-blur-md p-4 rounded-2xl border border-slate-800 shadow-2xl z-20">
                <div className="text-xs font-bold text-slate-300 hidden sm:block">
                    {dirty ? "⚠️ هناك تغييرات غير محفوظة في ترتيب الأقسام" : "✅ جميع التغييرات مطبقة ومحفوظة بالكامل"}
                </div>

                <div className="flex items-center gap-2.5 mr-auto">
                    <button
                        onClick={onReset}
                        disabled={!dirty || saving}
                        data-testid="sections-reset"
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                    >
                        <RotateCcw className="w-4 h-4" />
                        <span>تراجع 🔄</span>
                    </button>

                    <button
                        onClick={onSave}
                        disabled={!dirty || saving}
                        data-testid="sections-save"
                        className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition shadow-lg disabled:opacity-50 cursor-pointer flex items-center gap-2"
                    >
                        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        <span>حفظ الترتيب الفوري 💾</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
