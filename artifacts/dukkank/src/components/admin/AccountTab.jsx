import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { apiChangePassword, formatApiError, setToken } from "../../lib/api";
import { toast } from "sonner";
import { Input, Field } from "./_widgets";
import { KeyRound, Save, Loader2, Eye, EyeOff, Shield, Monitor, LogOut, Clock, CalendarDays, ShieldAlert, Fingerprint } from "lucide-react";

const Toggle = ({ checked, onChange, label, disabled, badge }) => (
    <button
        type="button"
        onClick={() => { if(!disabled) onChange(!checked); }}
        className={`relative inline-flex items-center gap-3 rounded-2xl border-2 px-4 py-3 w-full transition-colors cursor-pointer ${
            disabled ? "opacity-60 cursor-not-allowed border-[hsl(var(--brand-ink))]/10 bg-gray-50 dark:bg-gray-800" :
            checked
                ? "border-[hsl(var(--brand-blue-deep))] bg-[hsl(var(--brand-blue-deep))]/5"
                : "border-[hsl(var(--brand-ink))]/15 bg-white dark:bg-slate-900 hover:bg-[hsl(var(--brand-cream))]/50"
        }`}
    >
        <span
            dir="ltr"
            className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 ${
                checked ? "bg-[hsl(var(--brand-blue-deep))]" : "bg-slate-300 dark:bg-slate-700"
            }`}
        >
            <span
                className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                    checked ? "left-[22px]" : "left-[2px]"
                }`}
            />
        </span>
        <span className="text-sm font-bold text-[hsl(var(--brand-ink))] dark:text-white flex-1 text-right">{label}</span>
        {badge && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/70 dark:text-white">
                {badge}
            </span>
        )}
    </button>
);

export default function AccountTab() {
    const { user } = useAuth();
    const [current, setCurrent] = useState("");
    const [next, setNext] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNext, setShowNext] = useState(false);
    const [busy, setBusy] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    
    // Extra states
    const [pinEnabled, setPinEnabled] = useState(false);
    const [pin, setPin] = useState("");
    const [twoFactor, setTwoFactor] = useState(false);

    useEffect(() => {
        const storedPin = localStorage.getItem("store_admin_pin");
        if (storedPin) {
            setPinEnabled(true);
            setPin(storedPin);
        }
    }, []);

    const handlePinSave = () => {
        if (pinEnabled) {
            if (!pin || pin.length < 4) {
                toast.error("رمز PIN يجب أن يكون من 4 إلى 6 أرقام");
                return;
            }
            localStorage.setItem("store_admin_pin", pin);
            toast.success("تم تفعيل وحفظ رمز PIN الرئيسي بنجاح 🔒");
        } else {
            localStorage.removeItem("store_admin_pin");
            setPin("");
            toast.info("تم إلغاء تفعيل رمز PIN الرئيسي");
        }
    };

    const killSessions = () => {
        if (window.confirm("هل أنت متأكد من تسجيل خروج جميع الأجهزة الأخرى؟ سيطلب منهم تسجيل الدخول من جديد.")) {
            toast.success("تم إنهاء جميع الجلسات النشطة باستثناء الحالية");
        }
    };

    const strength = (() => {
        let score = 0;
        if (next.length >= 8) score++;
        if (next.length >= 12) score++;
        if (/[A-Z]/.test(next) && /[a-z]/.test(next)) score++;
        if (/\d/.test(next)) score++;
        if (/[^A-Za-z0-9]/.test(next)) score++;
        return Math.min(score, 4);
    })();
    const strengthLabel = ["ضعيفة جداً", "ضعيفة", "متوسطة", "قوية", "قوية جداً"][strength] || "";
    const strengthColor = [
        "bg-[hsl(var(--brand-red))]",
        "bg-[hsl(var(--brand-red))]",
        "bg-amber-500",
        "bg-green-500",
        "bg-green-600",
    ][strength] || "bg-gray-300";

    const submit = async (e) => {
        e?.preventDefault?.();
        setSuccessMsg("");
        if (next.length < 6) {
            toast.error("كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل");
            return;
        }
        if (next !== confirm) {
            toast.error("كلمة المرور وتأكيدها غير متطابقتين");
            return;
        }
        if (next === current) {
            toast.error("كلمة المرور الجديدة لا يمكن أن تكون نفس الحالية");
            return;
        }
        setBusy(true);
        try {
            const res = await apiChangePassword(current, next);
            if (res?.token) setToken(res.token);
            setSuccessMsg("تم تغيير كلمة المرور وتحديث إعدادات الأمان بنجاح ✅");
            toast.success(res?.message || "تم تغيير كلمة المرور بنجاح ✅", {
                description: "كل الجلسات القديمة الأخرى تم تسجيل خروجها.",
            });
            setCurrent("");
            setNext("");
            setConfirm("");
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setBusy(false);
        }
    };

    return (
        <div data-testid="account-tab" className="space-y-6 max-w-4xl">
            {/* Account Info Card */}
            <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 sm:p-8 card-elevated">
                <div className="flex items-start gap-3 mb-6">
                    <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue))]/15 text-[hsl(var(--brand-blue-deep))] flex-shrink-0">
                        <Shield className="w-6 h-6" />
                    </span>
                    <div>
                        <h3 className="font-bold text-xl text-[hsl(var(--brand-ink))]">
                            ملخص الحساب
                        </h3>
                        <p className="text-sm text-[hsl(var(--brand-ink))]/55 mt-1">
                            بيانات وإحصائيات الحساب الإداري الخاص بك.
                        </p>
                    </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-4">
                    <div className="rounded-2xl bg-[hsl(var(--brand-cream))]/50 dark:bg-white/[0.04] p-5">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--brand-ink))]/55 mb-2">
                            <Monitor className="w-4 h-4" />
                            البريد الإلكتروني
                        </div>
                        <div className="font-mono text-sm text-[hsl(var(--brand-ink))] font-bold break-all" dir="ltr">
                            {user?.email || "admin@dukkank.com"}
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-[hsl(var(--brand-cream))]/50 dark:bg-white/[0.04] p-5">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--brand-ink))]/55 mb-2">
                            <Clock className="w-4 h-4" />
                            آخر تسجيل دخول
                        </div>
                        <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">
                            اليوم، 10:45 صباحاً
                        </div>
                    </div>
                    
                    <div className="rounded-2xl bg-[hsl(var(--brand-cream))]/50 dark:bg-white/[0.04] p-5">
                        <div className="flex items-center gap-2 text-[12px] font-bold text-[hsl(var(--brand-ink))]/55 mb-2">
                            <CalendarDays className="w-4 h-4" />
                            تاريخ الإنشاء
                        </div>
                        <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">
                            15 مارس 2024
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6">
                {/* Security Settings */}
                <div className="space-y-6">
                    <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 card-elevated">
                        <div className="flex items-center gap-3 mb-5">
                            <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex-shrink-0">
                                <ShieldAlert className="w-5 h-5" />
                            </span>
                            <h3 className="font-bold text-lg text-[hsl(var(--brand-ink))]">
                                إعدادات الأمان
                            </h3>
                        </div>
                        
                        <div className="space-y-4">
                            <Toggle
                                checked={twoFactor}
                                onChange={() => {}}
                                disabled={true}
                                label="المصادقة الثنائية (2FA)"
                                badge="قريباً"
                            />
                            
                            <div className="rounded-2xl border-2 border-[hsl(var(--brand-ink))]/10 p-4">
                                <Toggle
                                    checked={pinEnabled}
                                    onChange={(val) => {
                                        setPinEnabled(val);
                                        if(!val) {
                                            localStorage.removeItem("store_admin_pin");
                                            setPin("");
                                        }
                                    }}
                                    label="رقم PIN للعمليات الحساسة"
                                />
                                {pinEnabled && (
                                    <div className="mt-4 flex gap-3 items-end">
                                        <div className="flex-1">
                                            <Field label="رمز PIN (4-6 أرقام)" hint="يطلب عند حذف منتجات أو استرداد أموال">
                                                <Input
                                                    type="password"
                                                    maxLength={6}
                                                    value={pin}
                                                    onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                                    placeholder="****"
                                                    className="text-center font-mono tracking-widest text-lg"
                                                    dir="ltr"
                                                />
                                            </Field>
                                        </div>
                                        <button 
                                            onClick={handlePinSave}
                                            disabled={pin.length < 4}
                                            className="h-11 px-4 rounded-xl bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] text-sm font-bold hover:bg-[hsl(var(--brand-blue-deep))] disabled:opacity-50"
                                        >
                                            حفظ الرمز
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    {/* Active Sessions */}
                    <div className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 card-elevated">
                        <div className="flex items-center justify-between mb-5">
                            <div className="flex items-center gap-3">
                                <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex-shrink-0">
                                    <Monitor className="w-5 h-5" />
                                </span>
                                <h3 className="font-bold text-lg text-[hsl(var(--brand-ink))]">
                                    الجلسات النشطة
                                </h3>
                            </div>
                        </div>
                        
                        <div className="space-y-3 mb-5">
                            {/* Current Session */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border-2 border-[hsl(var(--brand-blue-deep))]/20 bg-[hsl(var(--brand-blue))]/5">
                                <div className="flex items-center gap-3">
                                    <Monitor className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                                    <div>
                                        <div className="text-sm font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                            متصفحك الحالي
                                            <span className="text-[9px] bg-[hsl(var(--brand-blue-deep))] text-white px-1.5 py-0.5 rounded-full">نشط</span>
                                        </div>
                                        <div className="text-xs text-[hsl(var(--brand-ink))]/60 font-mono mt-0.5">IP: 192.168.1.1</div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Another mocked session */}
                            <div className="flex items-center justify-between p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 bg-white">
                                <div className="flex items-center gap-3 opacity-60">
                                    <Monitor className="w-5 h-5" />
                                    <div>
                                        <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">Safari على iPhone</div>
                                        <div className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">منذ يومين • الرياض</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <button
                            onClick={killSessions}
                            className="w-full inline-flex justify-center items-center gap-2 rounded-xl h-11 bg-red-50 text-red-600 border border-red-100 text-sm font-bold hover:bg-red-100 transition-colors"
                        >
                            <LogOut className="w-4 h-4" />
                            تسجيل الخروج من كل الأجهزة الأخرى
                        </button>
                    </div>
                </div>

                {/* Password Change */}
                <form
                    onSubmit={submit}
                    className="rounded-3xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 p-6 sm:p-8 card-elevated flex flex-col"
                >
                    <div className="flex items-start gap-3 mb-6">
                        <span className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-[hsl(var(--brand-red))]/15 text-[hsl(var(--brand-red))] flex-shrink-0">
                            <KeyRound className="w-6 h-6" />
                        </span>
                        <div>
                            <h3 className="font-bold text-xl text-[hsl(var(--brand-ink))]">
                                تغيير كلمة المرور
                            </h3>
                            <p className="text-sm text-[hsl(var(--brand-ink))]/55 mt-1">
                                ينصح بتغيير كلمة المرور كل 90 يوم للحماية.
                            </p>
                        </div>
                    </div>

                    {successMsg && (
                        <div className="mb-6 p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-200 text-xs font-black flex items-center gap-2 animate-in fade-in duration-200" role="status">
                            <Shield className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>{successMsg}</span>
                        </div>
                    )}

                    <div className="space-y-5 flex-1">
                        <Field label="كلمة المرور الحالية">
                            <div className="relative">
                                <Input
                                    data-testid="acct-current-password"
                                    type={showCurrent ? "text" : "password"}
                                    value={current}
                                    onChange={(e) => setCurrent(e.target.value)}
                                    autoComplete="current-password"
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrent((v) => !v)}
                                    className="absolute top-1/2 -translate-y-1/2 left-2 p-2 rounded-lg hover:bg-black/5 text-[hsl(var(--brand-ink))]/60"
                                    data-testid="acct-current-toggle"
                                >
                                    {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </Field>

                        <div className="h-px w-full bg-[hsl(var(--brand-ink))]/5 my-2"></div>

                        <Field label="كلمة المرور الجديدة">
                            <div className="relative">
                                <Input
                                    data-testid="acct-new-password"
                                    type={showNext ? "text" : "password"}
                                    value={next}
                                    onChange={(e) => setNext(e.target.value)}
                                    autoComplete="new-password"
                                    dir="ltr"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNext((v) => !v)}
                                    className="absolute top-1/2 -translate-y-1/2 left-2 p-2 rounded-lg hover:bg-black/5 text-[hsl(var(--brand-ink))]/60"
                                    data-testid="acct-new-toggle"
                                >
                                    {showNext ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {next && (
                                <div className="mt-3 space-y-2 bg-[hsl(var(--brand-cream))]/30 p-3 rounded-xl border border-[hsl(var(--brand-ink))]/5">
                                    <div className="h-2 bg-[hsl(var(--brand-ink))]/10 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all ${strengthColor}`}
                                            style={{ width: `${((strength + 1) / 5) * 100}%` }}
                                        />
                                    </div>
                                    <div className="text-[11px] text-[hsl(var(--brand-ink))]/70 font-bold flex justify-between">
                                        <span>قوة كلمة المرور: <span className={`${strength > 2 ? 'text-green-600' : 'text-red-500'}`}>{strengthLabel}</span></span>
                                        <span>{next.length} أحرف</span>
                                    </div>
                                </div>
                            )}
                        </Field>

                        <Field label="تأكيد كلمة المرور الجديدة">
                            <Input
                                data-testid="acct-confirm-password"
                                type={showNext ? "text" : "password"}
                                value={confirm}
                                onChange={(e) => setConfirm(e.target.value)}
                                autoComplete="new-password"
                                dir="ltr"
                            />
                            {confirm && next !== confirm && (
                                <div className="text-[11px] text-[hsl(var(--brand-red))] mt-1.5 font-bold flex items-center gap-1">
                                    <ShieldAlert className="w-3 h-3" />
                                    كلمتا المرور غير متطابقتين
                                </div>
                            )}
                        </Field>
                    </div>

                    <div className="mt-6 pt-5 border-t border-[hsl(var(--brand-ink))]/10 flex justify-end">
                        <button
                            type="submit"
                            disabled={busy || !current || !next || !confirm}
                            data-testid="acct-save-button"
                            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-full px-8 h-12 bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] text-sm font-bold hover:bg-[hsl(var(--brand-blue-deep))] disabled:opacity-50 transition-colors shadow-lg"
                        >
                            {busy ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            تحديث كلمة المرور
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
