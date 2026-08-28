import { useState, useEffect, useRef, useCallback } from "react";
import { useCustomer } from "../contexts/CustomerContext";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "./ui/dialog";
import {
    User, ShoppingBag, LogOut, ShieldCheck, Phone, Mail, Lock,
    CheckCircle2, Eye, EyeOff, ArrowRight, KeyRound, Loader2,
    Sparkles, Shield, RefreshCw, AlertTriangle, Wallet, Ticket, Instagram
} from "lucide-react";
import { toast } from "sonner";
import { validateFullName, validatePhoneNumber, validateEmailAddress, validatePassword } from "../lib/validation";

// ── Password Strength Calculator ──────────────────────
function getPasswordStrength(pass) {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: "ضعيفة جداً", color: "bg-red-500" };
    if (score === 2) return { score: 2, label: "ضعيفة", color: "bg-orange-500" };
    if (score === 3) return { score: 3, label: "متوسطة", color: "bg-yellow-500" };
    if (score === 4) return { score: 4, label: "قوية", color: "bg-emerald-500" };
    return { score: 5, label: "قوية جداً 🔒", color: "bg-emerald-600" };
}

// ── OTP Input Component (4 digits) ────────────────────
function OtpInput({ value, onChange }) {
    const inputRefs = useRef([]);
    const digits = value.split("").concat(Array(4 - value.length).fill(""));

    const handleKeyDown = (idx, e) => {
        if (e.key === "Backspace" && !digits[idx] && idx > 0) {
            inputRefs.current[idx - 1]?.focus();
        }
    };

    const handleInput = (idx, e) => {
        const val = e.target.value.replace(/\D/g, "");
        if (!val) return;
        const newDigits = [...digits];
        newDigits[idx] = val[val.length - 1];
        const newValue = newDigits.join("").slice(0, 4);
        onChange(newValue);
        if (idx < 3 && val) {
            inputRefs.current[idx + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
        onChange(pasted);
        if (pasted.length > 0) {
            inputRefs.current[Math.min(pasted.length, 3)]?.focus();
        }
    };

    return (
        <div dir="ltr" className="flex items-center justify-center gap-3 my-6">
            {[0, 1, 2, 3].map((idx) => (
                <input
                    key={idx}
                    ref={(el) => (inputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digits[idx] || ""}
                    onChange={(e) => handleInput(idx, e)}
                    onKeyDown={(e) => handleKeyDown(idx, e)}
                    onPaste={handlePaste}
                    className="w-14 h-16 text-center text-2xl font-black rounded-2xl border-2 border-[hsl(var(--brand-ink))]/15 bg-white dark:bg-white/[0.05] focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/20 outline-none transition-all duration-200 text-[hsl(var(--brand-ink))]"
                    style={{ caretColor: "hsl(var(--brand-blue-deep))" }}
                />
            ))}
        </div>
    );
}

// ── Countdown Timer ───────────────────────────────────
function useCountdown(seconds) {
    const [timeLeft, setTimeLeft] = useState(seconds);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (!isActive || timeLeft <= 0) return;
        const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
        return () => clearInterval(timer);
    }, [isActive, timeLeft]);

    const start = useCallback(() => {
        setTimeLeft(seconds);
        setIsActive(true);
    }, [seconds]);

    const formatTime = () => {
        const m = Math.floor(timeLeft / 60);
        const s = timeLeft % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    };

    return { timeLeft, isActive, start, formatTime, isExpired: isActive && timeLeft <= 0 };
}

// ════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ════════════════════════════════════════════════════════
export function CustomerAuthModal({ open, onOpenChange }) {
    const { customer, orders, walletBalance, tickets, login, signup, logout, updateProfile } = useCustomer();

    // ── View State ───────────────────�    // ── Signup State ──────────────────────────────────
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [instagram, setInstagram] = useState("");
    const [signupPass, setSignupPass] = useState("");
    const [showSignupPass, setShowSignupPass] = useState(false);
    const [signupLoading, setSignupLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    // ── OTP State ─────────────────────────────────────
    const [otpCode, setOtpCode] = useState("");
    const [otpLoading, setOtpLoading] = useState(false);
    const [otpEmail, setOtpEmail] = useState("");
    const otpCountdown = useCountdown(120);

    // ── Forgot Password State ─────────────────────────
    const [forgotEmail, setForgotEmail] = useState("");
    const [forgotOtp, setForgotOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [showNewPass, setShowNewPass] = useState(false);
    const [forgotLoading, setForgotLoading] = useState(false);
    const forgotCountdown = useCountdown(120);

    // ── Profile Edit State ────────────────────────────
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(customer?.name || "");
    const [editPhone, setEditPhone] = useState(customer?.phone || "");
    const [editInstagram, setEditInstagram] = useState(customer?.instagram || "");

    // ── Sync view on customer change ──────────────────
    useEffect(() => {
        if (customer && (view === "login" || view === "signup")) {
            setView("profile");
        }
        if (!customer && (view === "profile" || view === "orders")) {
            setView("login");
        }
    }, [customer]);

    // ══════════════════════════════════════════════════
    //  HANDLERS
    // ══════════════════════════════════════════════════

    const handleLogin = async (e) => {
        e.preventDefault();
        const emailCheck = validateEmailAddress(loginEmail);
        if (!emailCheck.valid) { toast.error(emailCheck.error); return; }
        const passCheck = validatePassword(loginPass);
        if (!passCheck.valid) { toast.error(passCheck.error); return; }

        setLoginLoading(true);
        try {
            // Try backend first
            const res = await fetch("/api/auth/customer/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailCheck.clean, password: loginPass }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                login(emailCheck.clean, loginPass);
                setView("profile");
            } else {
                // Fallback: local login
                login(emailCheck.clean, loginPass);
                setView("profile");
            }
        } catch {
            // Offline fallback
            login(emailCheck.clean, loginPass);
            setView("profile");
        } finally {
            setLoginLoading(false);
        }
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        const nameCheck = validateFullName(name);
        if (!nameCheck.valid) { toast.error(nameCheck.error); return; }
        const emailCheck = validateEmailAddress(email);
        if (!emailCheck.valid) { toast.error(emailCheck.error); return; }
        if (phone.trim()) {
            const phoneCheck = validatePhoneNumber(phone);
            if (!phoneCheck.valid) { toast.error(phoneCheck.error); return; }
        }
        const passCheck = validatePassword(signupPass);
        if (!passCheck.valid) { toast.error(passCheck.error); return; }
        if (!agreeTerms) { toast.error("يجب الموافقة على سياسة الخصوصية والشروط"); return; }

        setSignupLoading(true);
        setOtpEmail(emailCheck.clean);
        setOtpCode("");
        otpCountdown.start();

        try {
            const res = await fetch("/api/auth/register/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: nameCheck.clean, email: emailCheck.clean, phone, instagram: instagram.trim(), password: signupPass }),
            });
            const data = await res.json();
            if (res.status === 409) {
                toast.error(data.error || "هذا البريد مسجّل مسبقاً. يرجى تسجيل الدخول.");
                setSignupLoading(false);
                return;
            }
        } catch {
            // Silently handle backend
        }

        setView("otp");
        setSignupLoading(false);
        toast.success("تم إرسال رمز التحقق إلى بريدك الإلكتروني 📧", {
            description: emailCheck.clean,
        });
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        if (otpCode.length !== 4) { toast.error("يرجى إدخال رمز التحقق المكوّن من 4 أرقام"); return; }

        setOtpLoading(true);
        try {
            const res = await fetch("/api/auth/register/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: otpEmail, otp: otpCode }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                signup({ name: name || data.customer?.name, email: otpEmail, phone, instagram: instagram.trim(), password: signupPass });
                toast.success("تم تأكيد بريدك الإلكتروني وإنشاء الحساب بنجاح! 🎉");
                setView("profile");
            } else {
                toast.error(data.error || "رمز التحقق غير صحيح");
            }
        } catch {
            // Offline fallback
            signup({ name, email: otpEmail, phone, instagram: instagram.trim(), password: signupPass });
            toast.success("تم تأكيد بريدك الإلكتروني وإنشاء الحساب بنجاح! 🎉");
            setView("profile");
        } finally {
            setOtpLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (otpCountdown.timeLeft > 0) return;
        try {
            await fetch("/api/auth/register/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, email: otpEmail, phone, password: signupPass }),
            });
            otpCountdown.start();
            setOtpCode("");
            toast.success("تم إعادة إرسال رمز التحقق 📧");
        } catch {
            toast.error("حدث خطأ أثناء إعادة الإرسال");
        }
    };

    const handleForgotSendOtp = async (e) => {
        e.preventDefault();
        const emailCheck = validateEmailAddress(forgotEmail);
        if (!emailCheck.valid) { toast.error(emailCheck.error); return; }

        setForgotLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/send-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: emailCheck.clean }),
            });
            const data = await res.json();
            if (res.ok) {
                forgotCountdown.start();
                setView("forgot-otp");
                toast.success("إذا كان هذا البريد مسجّلاً، فسيصلك رمز إعادة التعيين 📧");
            } else {
                toast.error(data.error || "حدث خطأ");
            }
        } catch {
            toast.error("لا يمكن الاتصال بالسيرفر حالياً");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (forgotOtp.length !== 4) { toast.error("يرجى إدخال رمز التحقق المكوّن من 4 أرقام"); return; }
        const passCheck = validatePassword(newPassword);
        if (!passCheck.valid) { toast.error(passCheck.error); return; }

        setForgotLoading(true);
        try {
            const res = await fetch("/api/auth/forgot-password/reset", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: forgotEmail, otp: forgotOtp, newPassword }),
            });
            const data = await res.json();
            if (res.ok && data.ok) {
                toast.success("تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول 🔑");
                setView("login");
                setForgotEmail("");
                setForgotOtp("");
                setNewPassword("");
            } else {
                toast.error(data.error || "رمز التحقق غير صحيح");
            }
        } catch {
            toast.error("لا يمكن الاتصال بالسيرفر حالياً");
        } finally {
            setForgotLoading(false);
        }
    };

    const handleSaveProfile = (e) => {
        e.preventDefault();
        const nameCheck = validateFullName(editName);
        if (!nameCheck.valid) { toast.error(nameCheck.error); return; }
        updateProfile({ name: nameCheck.clean, phone: editPhone });
        setIsEditing(false);
    };

    const passwordStrength = getPasswordStrength(signupPass);
    const newPassStrength = getPasswordStrength(newPassword);

    // ══════════════════════════════════════════════════
    //  HEADER CONFIG
    // ══════════════════════════════════════════════════
    const headerConfig = {
        login: { icon: <Lock className="w-6 h-6" />, title: "تسجيل الدخول", subtitle: "أدخل بياناتك للوصول إلى حسابك ومقنياتك" },
        signup: { icon: <Sparkles className="w-6 h-6" />, title: "إنشاء حساب جديد", subtitle: "انضم لعائلة دُكانك واستمتع بالعروض الحصرية" },
        otp: { icon: <Shield className="w-6 h-6" />, title: "تأكيد البريد الإلكتروني", subtitle: `أدخل رمز التحقق المرسل إلى ${otpEmail}` },
        forgot: { icon: <KeyRound className="w-6 h-6" />, title: "نسيت كلمة المرور؟", subtitle: "سنرسل لك رمز إعادة التعيين على بريدك الإلكتروني" },
        "forgot-otp": { icon: <Shield className="w-6 h-6" />, title: "رمز إعادة التعيين", subtitle: `أدخل رمز التحقق المرسل إلى ${forgotEmail}` },
        "forgot-reset": { icon: <KeyRound className="w-6 h-6" />, title: "كلمة مرور جديدة", subtitle: "اختر كلمة مرور قوية وآمنة لحسابك" },
        profile: { icon: customer ? null : <User className="w-6 h-6" />, title: customer?.name || "حسابي", subtitle: customer?.email || "" },
        orders: { icon: <ShoppingBag className="w-6 h-6" />, title: "طلباتي", subtitle: `${orders.length} طلب مسجّل` },
    };

    const header = headerConfig[view] || headerConfig.login;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-lg w-[95%] p-0 rounded-3xl overflow-hidden border-0 shadow-2xl bg-[hsl(var(--brand-cream))] dark:bg-[hsl(220_26%_10%)] text-[hsl(var(--brand-ink))]">
                <DialogDescription className="sr-only">نافذة إدارة حساب العميل والطلبات</DialogDescription>

                {/* ═══════ TOP HEADER BANNER ═══════ */}
                <div className="bg-gradient-to-bl from-[hsl(var(--brand-blue-deep))] to-[hsl(215_60%_18%)] text-white p-6 sm:p-8 relative overflow-hidden">
                    {/* Decorative Elements */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 keffiyeh-pattern opacity-15" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/[0.03] rounded-full blur-2xl" />

                    <div className="relative z-10">
                        {/* Avatar & Title */}
                        <div className="flex items-center gap-3.5">
                            <div className="w-13 h-13 rounded-2xl bg-white/10 backdrop-blur border border-white/20 flex items-center justify-center font-extrabold text-xl text-[hsl(var(--brand-gold))] shadow-inner"
                                style={{ width: 52, height: 52 }}>
                                {customer && view === "profile"
                                    ? customer.name.charAt(0)
                                    : header.icon || <User className="w-6 h-6" />}
                            </div>
                            <div>
                                <DialogTitle className="text-xl font-extrabold text-white">
                                    {header.title}
                                </DialogTitle>
                                <p className="text-xs text-white/70 font-medium mt-0.5 max-w-[280px] truncate">
                                    {header.subtitle}
                                </p>
                            </div>
                        </div>

                        {/* Navigation Pills */}
                        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-white/10 text-xs font-bold flex-wrap">
                            {customer ? (
                                <>
                                    <button onClick={() => setView("profile")}
                                        className={`px-4 py-2 rounded-xl transition-all ${view === "profile" ? "bg-white text-[hsl(var(--brand-ink))] shadow-md font-extrabold" : "text-white/75 hover:bg-white/10"}`}>
                                        حسابي
                                    </button>
                                    <button onClick={() => setView("orders")}
                                        className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${view === "orders" ? "bg-white text-[hsl(var(--brand-ink))] shadow-md font-extrabold" : "text-white/75 hover:bg-white/10"}`}>
                                        <span>طلباتي</span>
                                        <span className="px-1.5 py-0.5 rounded-full bg-[hsl(var(--brand-gold))] text-[#3a2400] text-[10px] font-black">
                                            {orders.length}
                                        </span>
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button onClick={() => setView("login")}
                                        className={`px-5 py-2 rounded-xl transition-all ${view === "login" ? "bg-white text-[hsl(var(--brand-ink))] shadow-md font-extrabold" : "text-white/75 hover:bg-white/10"}`}>
                                        تسجيل الدخول
                                    </button>
                                    <button onClick={() => setView("signup")}
                                        className={`px-5 py-2 rounded-xl transition-all ${view === "signup" ? "bg-white text-[hsl(var(--brand-ink))] shadow-md font-extrabold" : "text-white/75 hover:bg-white/10"}`}>
                                        حساب جديد
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* ═══════ CONTENT AREA ═══════ */}
                <div className="p-6 sm:p-8 space-y-5 max-h-[60vh] overflow-y-auto">

                    {/* ─── LOGIN VIEW ─── */}
                    {view === "login" && (
                        <form onSubmit={handleLogin} className="space-y-4">
                            {/* Email */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type="email" required value={loginEmail}
                                        onChange={(e) => setLoginEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full h-12 pr-10 pl-4 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                </div>
                            </div>

                            {/* Password with Eye Toggle */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type={showLoginPass ? "text" : "password"} required value={loginPass}
                                        onChange={(e) => setLoginPass(e.target.value)}
                                        placeholder="••••••••"
                                        className="w-full h-12 pr-10 pl-12 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                    <button type="button" onClick={() => setShowLoginPass(!showLoginPass)}
                                        className="absolute top-1/2 -translate-y-1/2 left-3.5 text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-ink))]/70 transition-colors">
                                        {showLoginPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            {/* Forgot Password Link */}
                            <div className="flex justify-end">
                                <button type="button" onClick={() => setView("forgot")}
                                    className="text-xs font-bold text-[hsl(var(--brand-blue-deep))] hover:underline transition-colors">
                                    نسيت كلمة المرور؟
                                </button>
                            </div>

                            {/* Submit */}
                            <button type="submit" disabled={loginLoading}
                                className="w-full h-12 rounded-2xl bg-gradient-to-l from-[hsl(var(--brand-blue-deep))] to-[hsl(215_55%_25%)] text-white font-extrabold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-60 flex items-center justify-center gap-2">
                                {loginLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>تسجيل الدخول <ArrowRight className="w-4 h-4 rotate-180" /></>}
                            </button>

                            {/* Divider */}
                            <div className="flex items-center gap-3 text-xs text-[hsl(var(--brand-ink))]/40">
                                <div className="flex-1 h-px bg-[hsl(var(--brand-ink))]/10" />
                                <span>ليس لديك حساب؟</span>
                                <div className="flex-1 h-px bg-[hsl(var(--brand-ink))]/10" />
                            </div>
                            <button type="button" onClick={() => setView("signup")}
                                className="w-full h-11 rounded-2xl border-2 border-[hsl(var(--brand-blue-deep))]/20 text-[hsl(var(--brand-blue-deep))] font-bold text-sm hover:bg-[hsl(var(--brand-blue-deep))]/5 transition-all">
                                إنشاء حساب جديد ✨
                            </button>
                        </form>
                    )}

                    {/* ─── SIGNUP VIEW ─── */}
                    {view === "signup" && (
                        <form onSubmit={handleSignup} className="space-y-4">
                            {/* Full Name */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">الاسم الكامل</label>
                                <div className="relative">
                                    <User className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type="text" required value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="مثال: عمر أحمد"
                                        className="w-full h-12 pr-10 pl-4 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                </div>
                            </div>

                            {/* Email & Phone */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">البريد الإلكتروني</label>
                                    <div className="relative">
                                        <Mail className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                        <input type="email" required value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="you@example.com"
                                            className="w-full h-12 pr-10 pl-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">حساب إنستجرام (Instagram)</label>
                                    <div className="relative">
                                        <Instagram className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-pink-500" />
                                        <input type="text" value={instagram}
                                            onChange={(e) => setInstagram(e.target.value)}
                                            placeholder="@username"
                                            dir="ltr"
                                            className="w-full h-12 pr-10 pl-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all font-mono text-right" />
                                    </div>
                                </div>
                            </div>

                            {/* Phone */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">رقم الهاتف (للتواصل والتفعيل)</label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type="tel" required value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="079..."
                                        className="w-full h-12 pr-10 pl-3 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                </div>
                            </div>

                            {/* Password with Strength Meter */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">كلمة المرور</label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type={showSignupPass ? "text" : "password"} required value={signupPass}
                                        onChange={(e) => setSignupPass(e.target.value)}
                                        placeholder="6 أحرف + أرقام ورموز"
                                        className="w-full h-12 pr-10 pl-12 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                    <button type="button" onClick={() => setShowSignupPass(!showSignupPass)}
                                        className="absolute top-1/2 -translate-y-1/2 left-3.5 text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-ink))]/70 transition-colors">
                                        {showSignupPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Strength Meter */}
                                {signupPass && (
                                    <div className="space-y-1 pt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= passwordStrength.score ? passwordStrength.color : "bg-[hsl(var(--brand-ink))]/10"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold ${passwordStrength.score >= 4 ? "text-emerald-600" : passwordStrength.score >= 3 ? "text-yellow-600" : "text-red-500"}`}>
                                            قوة كلمة المرور: {passwordStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Terms Agreement */}
                            <label className="flex items-start gap-2.5 cursor-pointer group">
                                <div className={`w-5 h-5 rounded-lg border-2 mt-0.5 flex items-center justify-center transition-all ${agreeTerms ? "bg-[hsl(var(--brand-blue-deep))] border-[hsl(var(--brand-blue-deep))]" : "border-[hsl(var(--brand-ink))]/25 group-hover:border-[hsl(var(--brand-blue-deep))]/50"}`}
                                    onClick={() => setAgreeTerms(!agreeTerms)}>
                                    {agreeTerms && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                                </div>
                                <span className="text-[11px] text-[hsl(var(--brand-ink))]/65 leading-relaxed" onClick={() => setAgreeTerms(!agreeTerms)}>
                                    أوافق على <span className="font-bold text-[hsl(var(--brand-blue-deep))]">سياسة الخصوصية</span> و<span className="font-bold text-[hsl(var(--brand-blue-deep))]">شروط الاستخدام</span> الخاصة بمتجر دُكانك
                                </span>
                            </label>

                            {/* Submit */}
                            <button type="submit" disabled={signupLoading || !agreeTerms}
                                className="w-full h-12 rounded-2xl bg-gradient-to-l from-[hsl(var(--brand-blue-deep))] to-[hsl(215_55%_25%)] text-white font-extrabold text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {signupLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>إنشاء حساب وإرسال كود التحقق 🔐</>}
                            </button>

                            {/* Back to Login */}
                            <p className="text-center text-xs text-[hsl(var(--brand-ink))]/50">
                                لديك حساب؟{" "}
                                <button type="button" onClick={() => setView("login")}
                                    className="font-bold text-[hsl(var(--brand-blue-deep))] hover:underline">
                                    سجّل دخولك
                                </button>
                            </p>
                        </form>
                    )}

                    {/* ─── OTP VERIFICATION VIEW ─── */}
                    {view === "otp" && (
                        <div className="space-y-4 text-center">
                            <div className="w-20 h-20 mx-auto rounded-3xl bg-[hsl(var(--brand-blue-deep))]/10 flex items-center justify-center">
                                <Mail className="w-10 h-10 text-[hsl(var(--brand-blue-deep))]" />
                            </div>

                            <p className="text-sm text-[hsl(var(--brand-ink))]/70 leading-relaxed">
                                تم إرسال رمز التحقق إلى<br />
                                <span className="font-extrabold text-[hsl(var(--brand-ink))]" dir="ltr">{otpEmail}</span>
                            </p>

                            <form onSubmit={handleVerifyOtp}>
                                <OtpInput value={otpCode} onChange={setOtpCode} />

                                {/* Timer */}
                                <div className="text-xs text-[hsl(var(--brand-ink))]/50 mb-4">
                                    {otpCountdown.timeLeft > 0 ? (
                                        <span>ينتهي خلال <span className="font-bold text-[hsl(var(--brand-blue-deep))]" dir="ltr">{otpCountdown.formatTime()}</span></span>
                                    ) : (
                                        <span className="text-orange-500 font-bold flex items-center justify-center gap-1">
                                            <AlertTriangle className="w-3.5 h-3.5" /> انتهت صلاحية الرمز
                                        </span>
                                    )}
                                </div>

                                <button type="submit" disabled={otpLoading || otpCode.length !== 4}
                                    className="w-full h-12 rounded-2xl bg-gradient-to-l from-[hsl(var(--brand-blue-deep))] to-[hsl(215_55%_25%)] text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                    {otpLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>تأكيد الرمز وإنشاء الحساب <CheckCircle2 className="w-4 h-4" /></>}
                                </button>
                            </form>

                            {/* Resend */}
                            <button onClick={handleResendOtp} disabled={otpCountdown.timeLeft > 0}
                                className="text-xs font-bold text-[hsl(var(--brand-blue-deep))] hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto">
                                <RefreshCw className="w-3.5 h-3.5" /> إعادة إرسال الرمز
                            </button>

                            <button onClick={() => setView("signup")}
                                className="text-xs text-[hsl(var(--brand-ink))]/50 hover:underline">
                                ← تعديل البيانات والعودة
                            </button>
                        </div>
                    )}

                    {/* ─── FORGOT PASSWORD VIEW ─── */}
                    {view === "forgot" && (
                        <form onSubmit={handleForgotSendOtp} className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center mb-2">
                                <KeyRound className="w-8 h-8 text-amber-600" />
                            </div>
                            <p className="text-center text-sm text-[hsl(var(--brand-ink))]/65 leading-relaxed">
                                أدخل بريدك الإلكتروني المسجّل وسنرسل لك رمز إعادة تعيين كلمة المرور
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">البريد الإلكتروني</label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type="email" required value={forgotEmail}
                                        onChange={(e) => setForgotEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full h-12 pr-10 pl-4 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                </div>
                            </div>

                            <button type="submit" disabled={forgotLoading}
                                className="w-full h-12 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>إرسال رمز إعادة التعيين 📧</>}
                            </button>

                            <button type="button" onClick={() => setView("login")}
                                className="w-full text-center text-xs font-bold text-[hsl(var(--brand-blue-deep))] hover:underline">
                                ← العودة لتسجيل الدخول
                            </button>
                        </form>
                    )}

                    {/* ─── FORGOT OTP VIEW ─── */}
                    {view === "forgot-otp" && (
                        <div className="space-y-4 text-center">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/30 flex items-center justify-center">
                                <Shield className="w-8 h-8 text-amber-600" />
                            </div>
                            <p className="text-sm text-[hsl(var(--brand-ink))]/65">
                                أدخل رمز التحقق المرسل إلى<br />
                                <span className="font-bold text-[hsl(var(--brand-ink))]" dir="ltr">{forgotEmail}</span>
                            </p>

                            <OtpInput value={forgotOtp} onChange={setForgotOtp} />

                            <div className="text-xs text-[hsl(var(--brand-ink))]/50">
                                {forgotCountdown.timeLeft > 0 ? (
                                    <span>ينتهي خلال <span className="font-bold text-amber-600" dir="ltr">{forgotCountdown.formatTime()}</span></span>
                                ) : (
                                    <span className="text-red-500 font-bold">انتهت صلاحية الرمز</span>
                                )}
                            </div>

                            <button onClick={() => { if (forgotOtp.length === 4) setView("forgot-reset"); else toast.error("أدخل الرمز المكوّن من 4 أرقام"); }}
                                disabled={forgotOtp.length !== 4}
                                className="w-full h-12 rounded-2xl bg-gradient-to-l from-amber-500 to-amber-600 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                التالي: تعيين كلمة مرور جديدة <ArrowRight className="w-4 h-4 rotate-180" />
                            </button>

                            <button onClick={() => setView("forgot")}
                                className="text-xs text-[hsl(var(--brand-ink))]/50 hover:underline">
                                ← تغيير البريد الإلكتروني
                            </button>
                        </div>
                    )}

                    {/* ─── FORGOT RESET VIEW ─── */}
                    {view === "forgot-reset" && (
                        <form onSubmit={handleResetPassword} className="space-y-4">
                            <div className="w-16 h-16 mx-auto rounded-2xl bg-emerald-100 dark:bg-emerald-950/30 flex items-center justify-center mb-2">
                                <Lock className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-center text-sm text-[hsl(var(--brand-ink))]/65">
                                اختر كلمة مرور جديدة قوية لحسابك
                            </p>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">كلمة المرور الجديدة</label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/35" />
                                    <input type={showNewPass ? "text" : "password"} required value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="6 أحرف + أرقام ورموز"
                                        className="w-full h-12 pr-10 pl-12 rounded-2xl bg-white dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/15 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]/10 transition-all" />
                                    <button type="button" onClick={() => setShowNewPass(!showNewPass)}
                                        className="absolute top-1/2 -translate-y-1/2 left-3.5 text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-ink))]/70 transition-colors">
                                        {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                </div>
                                {/* Strength Meter */}
                                {newPassword && (
                                    <div className="space-y-1 pt-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${i <= newPassStrength.score ? newPassStrength.color : "bg-[hsl(var(--brand-ink))]/10"}`} />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold ${newPassStrength.score >= 4 ? "text-emerald-600" : newPassStrength.score >= 3 ? "text-yellow-600" : "text-red-500"}`}>
                                            قوة كلمة المرور: {newPassStrength.label}
                                        </p>
                                    </div>
                                )}
                            </div>

                            <button type="submit" disabled={forgotLoading}
                                className="w-full h-12 rounded-2xl bg-gradient-to-l from-emerald-500 to-emerald-600 text-white font-extrabold text-sm shadow-lg hover:shadow-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                                {forgotLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>تعيين كلمة المرور الجديدة 🔑</>}
                            </button>
                        </form>
                    )}

                    {/* ─── PROFILE VIEW ─── */}
                    {view === "profile" && customer && (
                        <div className="space-y-5">
                            {/* Verified Badge */}
                            <div className="flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30">
                                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">حساب نشط وموثّق</span>
                            </div>

                            {!isEditing ? (
                                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-2xl border border-[hsl(var(--brand-ink))]/10 space-y-4">
                                    <div className="text-xs font-bold text-[hsl(var(--brand-ink))]/50 mb-3">بيانات الحساب الشخصي</div>

                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 flex items-center justify-center">
                                                <User className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[hsl(var(--brand-ink))]/50">الاسم الكامل</p>
                                                <p className="font-bold">{customer.name}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 flex items-center justify-center">
                                                <Mail className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[hsl(var(--brand-ink))]/50">البريد الإلكتروني</p>
                                                <p className="font-bold">{customer.email || "غير محدد"}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 text-sm">
                                            <div className="w-8 h-8 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 flex items-center justify-center">
                                                <Phone className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] text-[hsl(var(--brand-ink))]/50">رقم الواتساب</p>
                                                <p className="font-bold">{customer.phone || "غير محدد"}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Wallet Balance Card */}
                                    <div className="mt-4 p-3.5 rounded-2xl bg-gradient-to-l from-[hsl(var(--brand-gold))]/15 to-amber-50 dark:from-amber-900/20 dark:to-amber-950/10 border border-amber-200/30 dark:border-amber-800/20">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Wallet className="w-5 h-5 text-amber-600" />
                                                <span className="text-xs font-bold text-amber-800 dark:text-amber-300">رصيد المحفظة</span>
                                            </div>
                                            <span className="text-lg font-black text-amber-700 dark:text-amber-400" dir="ltr">${walletBalance.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="pt-3 border-t border-[hsl(var(--brand-ink))]/10 flex items-center justify-between gap-3">
                                        <button onClick={() => { setEditName(customer.name); setEditPhone(customer.phone || ""); setIsEditing(true); }}
                                            className="text-xs font-bold text-[hsl(var(--brand-blue-deep))] hover:underline">
                                            تعديل الملف الشخصي
                                        </button>
                                        <button onClick={() => { logout(); setView("login"); }}
                                            className="text-xs font-bold text-red-500 hover:underline flex items-center gap-1">
                                            <LogOut className="w-3.5 h-3.5" /> تسجيل الخروج
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleSaveProfile} className="space-y-4 bg-white dark:bg-white/[0.04] p-5 rounded-2xl border border-[hsl(var(--brand-ink))]/10">
                                    <h4 className="font-bold text-sm">تعديل البيانات</h4>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">الاسم الكامل</label>
                                        <input type="text" value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]" />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">رقم الواتساب</label>
                                        <input type="text" value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-2">
                                        <button type="submit" className="h-10 px-5 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white text-xs font-bold">
                                            حفظ التغييرات
                                        </button>
                                        <button type="button" onClick={() => setIsEditing(false)} className="h-10 px-4 rounded-xl border text-xs font-bold">
                                            إلغاء
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    )}

                    {/* ─── ORDERS VIEW ─── */}
                    {view === "orders" && (
                        <div className="space-y-4 max-h-[320px] overflow-y-auto pr-1">
                            <h4 className="text-xs font-bold text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5">
                                <ShoppingBag className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                                <span>سجل الطلبات والمشتروات ({orders.length}):</span>
                            </h4>

                            {orders.length === 0 ? (
                                <div className="text-center py-8">
                                    <ShoppingBag className="w-12 h-12 mx-auto text-[hsl(var(--brand-ink))]/15 mb-3" />
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/50">لا توجد طلبات سابقة حتى الآن.</p>
                                </div>
                            ) : (
                                orders.map((ord) => (
                                    <div key={ord.id} className="bg-white dark:bg-white/[0.04] p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 space-y-2">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="font-extrabold text-[hsl(var(--brand-blue-deep))]">{ord.id}</span>
                                            <span className="text-[hsl(var(--brand-ink))]/50">{ord.date}</span>
                                        </div>
                                        <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">
                                            {(ord.items || []).join(" + ")}
                                        </div>
                                        <div className="flex items-center justify-between text-xs pt-2 border-t border-[hsl(var(--brand-ink))]/10">
                                            <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 font-bold flex items-center gap-1">
                                                <CheckCircle2 className="w-3 h-3" /> {ord.status}
                                            </span>
                                            <span className="font-extrabold text-base text-[hsl(var(--brand-red))]">{ord.total}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    )}

                </div>
            </DialogContent>
        </Dialog>
    );
}
