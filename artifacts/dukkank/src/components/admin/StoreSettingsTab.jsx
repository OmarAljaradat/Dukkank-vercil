import { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { apiUpdateStore, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Save, Loader2 } from "lucide-react";

const Field = ({ label, hint, children }) => (
    <label className="block">
        <span className="block text-xs font-bold text-[hsl(var(--brand-ink))]/70 mb-1.5">
            {label}
        </span>
        {children}
        {hint && (
            <span className="block text-[11px] text-[hsl(var(--brand-ink))]/50 mt-1">
                {hint}
            </span>
        )}
    </label>
);

const Input = (props) => (
    <input
        {...props}
        className={`w-full h-11 rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white px-4 text-sm font-medium focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none ${
            props.className || ""
        }`}
    />
);

export default function StoreSettingsTab({ onSaved }) {
    const { store } = useStoreData();
    const [form, setForm] = useState(store);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        setForm(store);
    }, [store]);

    const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

    const onSave = async () => {
        setSaving(true);
        try {
            await apiUpdateStore({
                name: form.name || "",
                name_en: form.name_en || "",
                tagline: form.tagline || "",
                tagline_en: form.tagline_en || "",
                whatsapp: form.whatsapp || "",
                whatsappDisplay: form.whatsappDisplay || "",
                instagram: form.instagram || "",
            });
            toast.success("تم حفظ إعدادات المتجر");
            onSaved?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div
            data-testid="store-settings-tab"
            className="rounded-3xl bg-white border border-[hsl(var(--brand-ink))]/10 p-5 sm:p-8 card-elevated"
        >
            <h2 className="text-xl font-bold text-[hsl(var(--brand-ink))] mb-1">
                إعدادات المتجر
            </h2>
            <p className="text-sm text-[hsl(var(--brand-ink))]/60 mb-6">
                اسم المتجر، رقم الواتساب، روابط التواصل. تنعكس في كل الموقع تلقائياً.
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
                <Field label="اسم المتجر">
                    <Input
                        data-testid="store-name-input"
                        value={form.name || ""}
                        onChange={(e) => set("name", e.target.value)}
                    />
                </Field>

                <Field label="الشعار/التاجلاين">
                    <Input
                        data-testid="store-tagline-input"
                        value={form.tagline || ""}
                        onChange={(e) => set("tagline", e.target.value)}
                    />
                </Field>

                <Field
                    label="رقم واتساب (دولي بدون +)"
                    hint="مثال: 962775585112"
                >
                    <Input
                        data-testid="store-whatsapp-input"
                        value={form.whatsapp || ""}
                        onChange={(e) => set("whatsapp", e.target.value)}
                        dir="ltr"
                        inputMode="numeric"
                    />
                </Field>
                <Field
                    label="رقم العرض"
                    hint="الرقم اللي يظهر للعميل"
                >
                    <Input
                        data-testid="store-whatsapp-display-input"
                        value={form.whatsappDisplay || ""}
                        onChange={(e) => set("whatsappDisplay", e.target.value)}
                        dir="ltr"
                    />
                </Field>

                <Field label="رابط Instagram (اختياري)">
                    <Input
                        data-testid="store-instagram-input"
                        value={form.instagram || ""}
                        onChange={(e) => set("instagram", e.target.value)}
                        dir="ltr"
                        placeholder="https://www.instagram.com/..."
                    />
                </Field>
            </div>

            {/* ── Telegram Bot Settings Section ── */}
            <div className="mt-8 pt-6 border-t border-[hsl(var(--brand-ink))]/10">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🤖</span>
                    <div>
                        <h3 className="text-base font-bold text-[hsl(var(--brand-ink))]">
                            إشعارات بوت التيليجرام للطلبات الفورية
                        </h3>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60">
                            يمكنك أيضاً ضبط التوكن ومعرف المحادثة مباشرة من أعلى صفحة (إدارة الطلبات).
                        </p>
                    </div>
                </div>
            </div>

            <div className="mt-7 flex justify-end">
                <button
                    onClick={onSave}
                    disabled={saving}
                    data-testid="store-save-button"
                    className="inline-flex items-center gap-2 rounded-full px-6 h-11 bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] text-sm font-bold hover:bg-[hsl(var(--brand-blue-deep))] transition-colors disabled:opacity-50"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    حفظ
                </button>
            </div>
        </div>
    );
}
