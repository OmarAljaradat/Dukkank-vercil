import { useState, useEffect, useRef } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { apiUpdateSiteSettings, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Save, Loader2, Wrench, Shield, Eye, Lock, ShieldCheck, Sparkles, BookOpen } from "lucide-react";
import { MaintenanceOverlay } from "../MaintenanceOverlay";

const Field = ({ label, hint, children }) => (
    <label className="block">
        <span className="block text-xs font-bold text-slate-800 dark:text-slate-200 mb-1.5">{label}</span>
        {children}
        {hint && <span className="block text-[11px] text-slate-500 mt-1">{hint}</span>}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className={`w-full h-11 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 text-sm font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition ${
            props.className || ""
        }`}
    />
);

const FastToggle = ({ checked, onChange, title, subtitle }) => (
    <div
        onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onChange(!checked);
        }}
        className={`p-4 rounded-2xl border-2 transition-all cursor-pointer select-none flex items-center justify-between gap-3 ${
            checked
                ? "border-emerald-500/50 bg-emerald-500/10 dark:bg-emerald-950/30 shadow-sm ring-2 ring-emerald-500/20"
                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700"
        }`}
    >
        <div className="space-y-0.5 min-w-0 flex-1">
            <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-900 dark:text-white">{title}</span>
                {checked ? (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                        مفعّل 🟢
                    </span>
                ) : (
                    <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                        معطّل ⚪
                    </span>
                )}
            </div>
            {subtitle && <p className="text-[11px] text-slate-500 font-medium truncate">{subtitle}</p>}
        </div>

        <button
            type="button"
            dir="ltr"
            className={`relative inline-block w-12 h-6 rounded-full transition-colors shrink-0 ${
                checked ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
            }`}
        >
            <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    checked ? "left-[26px]" : "left-[2px]"
                }`}
            />
        </button>
    </div>
);

export default function SiteSettingsTab({ onChanged }) {
    const { siteSettings, setSiteSettings } = useStoreData();
    const isInitialized = useRef(false);

    const [maintEnabled, setMaintEnabled] = useState(false);
    const [maintTitle, setMaintTitle] = useState("الموقع تحت الصيانة");
    const [maintMessage, setMaintMessage] = useState("");
    const [maintReturn, setMaintReturn] = useState("");
    
    const [disableSelection, setDisableSelection] = useState(false);
    const [disableRightClick, setDisableRightClick] = useState(false);
    const [disableScreenshot, setDisableScreenshot] = useState(false);

    const [preview, setPreview] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (!siteSettings || isInitialized.current) return;
        isInitialized.current = true;
        const m = siteSettings.maintenanceMode || {};
        setMaintEnabled(!!m.enabled);
        setMaintTitle(m.title || "الموقع تحت الصيانة");
        setMaintMessage(m.message || "");
        setMaintReturn(m.estimatedReturn || "");
        
        setDisableSelection(!!siteSettings.disableTextSelection);
        setDisableRightClick(!!siteSettings.disableRightClick);
        setDisableScreenshot(!!siteSettings.disableScreenshot);
    }, [siteSettings]);

    const onSave = async () => {
        setSaving(true);
        try {
            const payload = {
                ...(siteSettings || {}),
                maintenanceMode: {
                    enabled: maintEnabled,
                    title: maintTitle,
                    message: maintMessage,
                    estimatedReturn: maintReturn,
                    showCountdown: false,
                },
                disableTextSelection: disableSelection,
                disableRightClick: disableRightClick,
                disableScreenshot: disableScreenshot,
            };
            if (setSiteSettings) setSiteSettings(payload);
            await apiUpdateSiteSettings(payload);
            toast.success("تم حفظ إعدادات وضع الصيانة وحماية الموقع بنجاح ✅");
            onChanged?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-6 text-right dir-rtl" dir="rtl" data-testid="site-settings-tab">
            {/* Header Title */}
            <div className="bg-slate-900 text-white p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                        <Wrench className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span>وضع الصيانة وحماية المتجر (Maintenance & Security)</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            التحكم في إغلاق المتجر المؤقت للصيانة، وحماية نصوص وصور المتجر من النسخ والسرقة.
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>حفظ التعديلات فوراً ✅</span>
                </button>
            </div>

            {/* MAINTENANCE MODE SECTION */}
            <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center font-bold">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                                قفل المتجر وشاشة وضع الصيانة (Maintenance Mode)
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">
                                عند تفعيل الصيانة يرى الزائر شاشة اعتذار مؤقتة بينما يدخل الأدمن للمتجر بشكل طبيعي.
                            </p>
                        </div>
                    </div>

                    <button
                        type="button"
                        onClick={() => setPreview(true)}
                        className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
                    >
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span>معاينة شاشة الصيانة</span>
                    </button>
                </div>

                <div className="max-w-md">
                    <FastToggle
                        checked={maintEnabled}
                        onChange={setMaintEnabled}
                        title="حالة وضع الصيانة"
                        subtitle="تفعيل أو تعطيل قفل المتجر للزوار"
                    />
                </div>

                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                    <Field label="عنوان شاشة الصيانة" hint="مثال: متجر دُكانك تحت التحديثات الدورية">
                        <Input
                            value={maintTitle}
                            onChange={(e) => setMaintTitle(e.target.value)}
                            placeholder="الموقع تحت الصيانة"
                        />
                    </Field>
                    <Field label="الوقت المتوقع للعودة (اختياري)" hint="مثال: خلال 30 دقيقة • الساعة 8 مساءً">
                        <Input
                            value={maintReturn}
                            onChange={(e) => setMaintReturn(e.target.value)}
                            placeholder="خلال ساعة"
                        />
                    </Field>
                </div>

                <div>
                    <Field label="رسالة التوضيح للزوار">
                        <textarea
                            value={maintMessage}
                            onChange={(e) => setMaintMessage(e.target.value)}
                            rows={3}
                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-4 py-3 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition resize-y"
                            placeholder="نعمل حالياً على إضافة ألعاب وحسابات جديدة وتطوير تجربة التسوق. سنعود إليكم بأقرب وقت!"
                        />
                    </Field>
                </div>
            </section>

            {/* PROTECTION SETTINGS SECTION */}
            <section className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
                <div className="flex items-center gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                        <Shield className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-base font-black text-slate-900 dark:text-white">
                            حماية المحتوى ومنع السرقة (Content Shield)
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                            أدوات لحماية النصوص والأسعار والصور من النسخ المباشر من قبل المتاجر المنافسة.
                        </p>
                    </div>
                </div>
                
                <div className="grid sm:grid-cols-1 md:grid-cols-3 gap-3.5">
                    <FastToggle
                        checked={disableSelection}
                        onChange={setDisableSelection}
                        title="منع تحديد ونسخ النصوص"
                        subtitle="يعطل إمكانية تظليل النصوص ونسخها"
                    />
                    <FastToggle
                        checked={disableRightClick}
                        onChange={setDisableRightClick}
                        title="تعطيل الزر الأيمن للفأرة"
                        subtitle="يمنع قائمة الفحص وسرقة الصور"
                    />
                    <FastToggle
                        checked={disableScreenshot}
                        onChange={setDisableScreenshot}
                        title="تشويش أثناء محاولة الطباعة"
                        subtitle="يضيف حماية ضد سحب كامل الصفحة"
                    />
                </div>
            </section>

            {/* NOTICE CARD REDIRECTING POLICIES TO CONTENT TAB */}
            <div className="rounded-3xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/30 p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div className="space-y-0.5">
                        <h4 className="text-sm font-black text-slate-900 dark:text-white">
                            هل تبحث عن تعديل نصوص (السياسات والشروط والضمان)؟ 📜
                        </h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            تم نقل تحرير السياسات إلى مكانها الطبيعي في <strong>(المحتوى والتصميم ➔ محتوى نصوص الموقع ➔ سياسات وشروط المتجر)</strong> مع معاينة حية كاملة.
                        </p>
                    </div>
                </div>
            </div>

            {/* Bottom Save Bar */}
            <div className="flex justify-end pt-2">
                <button
                    type="button"
                    onClick={onSave}
                    disabled={saving}
                    className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xl transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>حفظ التعديلات فوراً ✅</span>
                </button>
            </div>

            {/* Maintenance Preview Overlay Modal */}
            {preview && (
                <MaintenanceOverlay
                    maintenance={{
                        enabled: true,
                        title: maintTitle || "الموقع تحت الصيانة",
                        message: maintMessage || "نعمل على تحسينات جديدة لخدمتكم بشكل أفضل.",
                        estimatedReturn: maintReturn || "",
                        showCountdown: false,
                    }}
                    onClose={() => setPreview(false)}
                />
            )}
        </div>
    );
}
