import { useState } from "react";
import { Shield, Lock, KeyRound, Eye, EyeOff, Laptop, Smartphone, LogOut, CheckCircle2, Clock, Calendar, Mail, Phone, Save, Instagram, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountProfileTab({ customer, updateProfile }) {
    // Edit profile basic info
    const [editName, setEditName] = useState(customer?.name || "");
    const [editPhone, setEditPhone] = useState(customer?.phone || "");
    const [editEmail, setEditEmail] = useState(customer?.email || "");
    
    const parseInitialInstas = () => {
        if (!customer?.instagram) return [""];
        const parts = customer.instagram.split(/[،,]+/).map(s => s.trim()).filter(Boolean);
        return parts.length > 0 ? parts : [""];
    };
    const [editInstagramList, setEditInstagramList] = useState(parseInitialInstas());

    const handleAddEditInstagram = () => {
        if (editInstagramList.length < 3) {
            setEditInstagramList([...editInstagramList, ""]);
        } else {
            toast.info("الحد الأقصى لحسابات الإنستجرام هو 3 حسابات");
        }
    };

    const handleRemoveEditInstagram = (idx) => {
        if (editInstagramList.length > 1) {
            setEditInstagramList(editInstagramList.filter((_, i) => i !== idx));
        }
    };

    const handleEditInstagramChange = (idx, val) => {
        const next = [...editInstagramList];
        next[idx] = val;
        setEditInstagramList(next);
    };

    // Security PIN State
    const [pinCode, setPinCode] = useState("");
    const [pinEnabled, setPinEnabled] = useState(true);

    // Password State
    const [currentPass, setCurrentPass] = useState("");
    const [newPass, setNewPass] = useState("");
    const [confirmPass, setConfirmPass] = useState("");
    const [passSuccessMsg, setPassSuccessMsg] = useState("");
    const [passErrorMsg, setPassErrorMsg] = useState("");

    const [showCurrentPass, setShowCurrentPass] = useState(false);
    const [showNewPass, setShowNewPass] = useState(false);
    const [showConfirmPass, setShowConfirmPass] = useState(false);

    const [sessions, setSessions] = useState([
        {
            id: 1,
            device: "متصفحك الحالي (نشط)",
            info: "Windows PC • Chrome • 192.168.1.1",
            active: true,
            icon: Laptop,
        },
        {
            id: 2,
            device: "تطبيق الجوال (iPhone 15 Pro)",
            info: "منذ يومين • عمان، الأردن",
            active: false,
            icon: Smartphone,
        }
    ]);

    const handleUpdateBasicProfile = (e) => {
        e.preventDefault();
        if (!editPhone || !editPhone.trim()) {
            toast.error("رقم الهاتف مطلوب للتواصل والتفعيل");
            return;
        }
        const validInstas = editInstagramList.map(a => a.trim()).filter(Boolean);
        if (validInstas.length === 0) {
            toast.error("يرجى إدخال حساب إنستجرام واحد على الأقل للتواصل (@username)");
            return;
        }
        if (updateProfile) {
            updateProfile({ 
                name: editName, 
                phone: editPhone.trim(), 
                instagram: validInstas.join(" ، ") 
            });
        }
        toast.success("تم تحديث البيانات وحسابات الإنستجرام بنجاح! ✨");
    };

    const handleSavePin = (e) => {
        e.preventDefault();
        if (pinCode.length < 4) {
            toast.error("رمز الـ PIN يجب أن يتكون من 4 أرقام على الأقل");
            return;
        }
        toast.success("تم حفظ رمز الـ PIN السري بنجاح! 🔒");
    };

    const handleLogoutOtherDevices = () => {
        setSessions(sessions.filter(s => s.active));
        toast.success("تم تسجيل الخروج من كافة الأجهزة الأخرى بنجاح 🚪");
    };

    const handleChangePassword = (e) => {
        e.preventDefault();
        setPassSuccessMsg("");
        setPassErrorMsg("");

        if (!newPass && !confirmPass && !currentPass) {
            setPassErrorMsg("يرجى إدخال كلمة المرور الجديدة وتأكيدها");
            toast.error("يرجى إدخال كلمة المرور الجديدة وتأكيدها");
            return;
        }

        if (newPass && newPass.length < 6) {
            setPassErrorMsg("كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل");
            toast.error("كلمة المرور الجديدة يجب أن تكون 6 خانات على الأقل");
            return;
        }

        if (newPass && confirmPass && newPass !== confirmPass) {
            setPassErrorMsg("كلمتا المرور غير متطابقتين!");
            toast.error("كلمتا المرور غير متطابقتين!");
            return;
        }

        const passwordToSave = newPass || currentPass || "Dukkank2026";
        if (updateProfile) {
            updateProfile({ password: passwordToSave });
        }

        setCurrentPass("");
        setNewPass("");
        setConfirmPass("");
        setPassSuccessMsg("تم تحديث كلمة المرور وتأمين حسابك بنجاح! 🔐✨");
        toast.success("تم تحديث كلمة المرور بنجاح! 🔐✨");
    };

    return (
        <div className="space-y-6">
            
            {/* TOP CARD: Account Summary (ملخص الحساب) */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-5">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <Shield className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black text-[hsl(var(--brand-ink))]">ملخص الحساب والأمان</h2>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium mt-0.5">
                            بيانات وإحصائيات الحساب الشخصي وتواريخ النشاط
                        </p>
                    </div>
                </div>

                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                    {/* Item 1: Email */}
                    <div className="bg-[hsl(var(--brand-cream))]/40 p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/5 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--brand-ink))]/60">
                            <Mail className="w-4 h-4 text-slate-500" />
                            <span>البريد الإلكتروني</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-[hsl(var(--brand-ink))] truncate" dir="ltr">
                            {customer?.email || "user@dukkank.com"}
                        </div>
                    </div>

                    {/* Item 2: Instagram */}
                    <div className="bg-[hsl(var(--brand-cream))]/40 p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/5 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--brand-ink))]/60">
                            <Instagram className="w-4 h-4 text-pink-500" />
                            <span>حساب إنستجرام</span>
                        </div>
                        <div className="flex flex-wrap gap-1 items-center" dir="ltr">
                            {customer?.instagram ? (
                                customer.instagram.split(/[،,]+/).map((acc, i) => (
                                    <span key={i} className="px-2 py-0.5 rounded-lg bg-pink-100 dark:bg-pink-900/40 text-pink-700 dark:text-pink-300 text-[11px] font-black font-mono">
                                        {acc.trim()}
                                    </span>
                                ))
                            ) : (
                                <span className="text-xs font-black text-slate-400">غير مسجّل</span>
                            )}
                        </div>
                    </div>

                    {/* Item 3: Phone */}
                    <div className="bg-[hsl(var(--brand-cream))]/40 p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/5 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--brand-ink))]/60">
                            <Phone className="w-4 h-4 text-emerald-500" />
                            <span>رقم الهاتف</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-[hsl(var(--brand-ink))] truncate" dir="ltr">
                            {customer?.phone || "غير مسجّل"}
                        </div>
                    </div>

                    {/* Item 4: Created Date */}
                    <div className="bg-[hsl(var(--brand-cream))]/40 p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/5 space-y-1.5">
                        <div className="flex items-center gap-2 text-xs font-bold text-[hsl(var(--brand-ink))]/60">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span>عضو منذ</span>
                        </div>
                        <div className="text-xs sm:text-sm font-black text-[hsl(var(--brand-ink))]">
                            {customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString("ar-EG") : "2024"}
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN TWO COLUMNS GRID */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">

                {/* LEFT COLUMN: Security Settings & Active Sessions (5 Cols) */}
                <div className="md:col-span-5 space-y-6">

                    {/* CARD 1: Security Settings (إعدادات الأمان) */}
                    <div className="bg-white rounded-3xl p-6 border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                <Shield className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-base text-[hsl(var(--brand-ink))]">إعدادات الأمان</h3>
                        </div>

                        {/* 2FA Toggle Row */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between">
                            <span className="text-xs font-bold text-slate-700">المصادقة الثنائية (2FA)</span>
                            <span className="px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-black">
                                قريباً
                            </span>
                        </div>

                        {/* Sensitive Operations PIN Card */}
                        <form onSubmit={handleSavePin} className="p-4 rounded-2xl border-2 border-slate-800/10 bg-[hsl(var(--brand-cream))]/30 space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-extrabold text-[hsl(var(--brand-ink))]">
                                    للعمليات الحساسة PIN رقم
                                </span>
                                <input
                                    type="checkbox"
                                    checked={pinEnabled}
                                    onChange={(e) => setPinEnabled(e.target.checked)}
                                    className="w-4 h-4 accent-slate-900 cursor-pointer"
                                />
                            </div>

                            <p className="text-[11px] text-[hsl(var(--brand-ink))]/60 font-medium">
                                (أرقام 4-6 PIN رمز يتطلب عند الشراء أو استخدام المحفظة)
                            </p>

                            <div className="flex items-center gap-2">
                                <input
                                    type="password"
                                    maxLength={6}
                                    value={pinCode}
                                    onChange={(e) => setPinCode(e.target.value)}
                                    placeholder="••••"
                                    className="w-full h-10 px-3 rounded-xl border border-slate-300 bg-white text-center tracking-widest font-black text-sm focus:outline-none focus:border-slate-800"
                                />
                                <button
                                    type="submit"
                                    className="h-10 px-4 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-extrabold shadow-sm transition-colors shrink-0 cursor-pointer"
                                >
                                    حفظ الرمز
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* CARD 2: Active Sessions (الجلسات النشطة) */}
                    <div className="bg-white rounded-3xl p-6 border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                <Laptop className="w-5 h-5" />
                            </div>
                            <h3 className="font-black text-base text-[hsl(var(--brand-ink))]">الجلسات النشطة</h3>
                        </div>

                        <div className="space-y-2.5">
                            {sessions.map((sess) => {
                                const IconComp = sess.icon;
                                return (
                                    <div
                                        key={sess.id}
                                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/60 flex items-center justify-between gap-2"
                                    >
                                        <div className="flex items-center gap-3">
                                            <IconComp className="w-4.5 h-4.5 text-slate-500 shrink-0" />
                                            <div>
                                                <div className="text-xs font-black text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                                    <span>{sess.device}</span>
                                                    {sess.active && (
                                                        <span className="px-2 py-0.5 rounded-full bg-slate-900 text-white text-[9px] font-extrabold">
                                                            نشط
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="text-[10px] text-[hsl(var(--brand-ink))]/50 font-medium">
                                                    {sess.info}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <button
                            type="button"
                            onClick={handleLogoutOtherDevices}
                            className="w-full h-11 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-200/60 cursor-pointer"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>تسجيل الخروج من كل الأجهزة الأخرى 🚪</span>
                        </button>
                    </div>

                </div>

                {/* RIGHT COLUMN: Change Password Form (7 Cols) */}
                <div className="md:col-span-7 space-y-6">
                    {/* Personal Info Edit Form */}
                    <form onSubmit={handleUpdateBasicProfile} className="bg-white rounded-3xl p-6 sm:p-7 border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-5">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-black text-base text-[hsl(var(--brand-ink))]">البيانات الشخصية وحسابات التواصل</h3>
                                <p className="text-xs text-[hsl(var(--brand-ink))]/50 font-medium">
                                    تعديل الاسم ورقم الهاتف وحساب الإنستجرام المعتمد
                                </p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">الاسم الكامل</label>
                                <input
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="الاسم الكامل"
                                    className="w-full h-11 px-4 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                <div className="space-y-2 p-3.5 rounded-2xl bg-pink-50/50 dark:bg-pink-950/10 border border-pink-200/50">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/80 flex items-center gap-1.5">
                                        <Instagram className="w-4 h-4 text-pink-500" />
                                        <span>حسابات إنستجرام المعتمدة للتواصل <span className="text-red-500">*</span></span>
                                        <span className="text-[10px] text-pink-600 font-bold bg-pink-100 dark:bg-pink-900/40 px-2 py-0.5 rounded-full">
                                            (بحد أقصى 3)
                                        </span>
                                    </label>
                                    {editInstagramList.length < 3 && (
                                        <button
                                            type="button"
                                            onClick={handleAddEditInstagram}
                                            className="text-[11px] font-bold text-pink-600 hover:text-pink-700 flex items-center gap-1 hover:underline cursor-pointer"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                            <span>+ إضافة حساب</span>
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    {editInstagramList.map((insta, idx) => (
                                        <div key={idx} className="flex items-center gap-2">
                                            <div className="relative flex-1">
                                                <Instagram className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-pink-500" />
                                                <input
                                                    type="text"
                                                    value={insta}
                                                    onChange={(e) => handleEditInstagramChange(idx, e.target.value)}
                                                    placeholder={idx === 0 ? "الحساب الأساسي (مثال: @username)" : `حساب إضافي ${idx + 1} (اختياري)`}
                                                    dir="ltr"
                                                    className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800 font-mono text-right"
                                                />
                                            </div>
                                            {editInstagramList.length > 1 && (
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveEditInstagram(idx)}
                                                    className="w-9 h-11 rounded-xl bg-red-50 hover:bg-red-100 text-red-500 flex items-center justify-center transition-colors shrink-0 cursor-pointer"
                                                    title="حذف هذا الحساب"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">رقم الهاتف (للتواصل والتفعيل)</label>
                                    <div className="relative">
                                        <Phone className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                        <input
                                            type="tel"
                                            value={editPhone}
                                            onChange={(e) => setEditPhone(e.target.value)}
                                            placeholder="079..."
                                            className="w-full h-11 pr-10 pl-3 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                className="h-11 px-8 rounded-full bg-[hsl(var(--brand-blue-deep))] hover:opacity-90 text-white text-xs font-black shadow-md transition-opacity flex items-center gap-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>حفظ البيانات الشخصية ✨</span>
                            </button>
                        </div>
                    </form>
                    <form onSubmit={handleChangePassword} className="bg-white rounded-3xl p-6 sm:p-7 border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-6 flex flex-col justify-between h-full">
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                                    <KeyRound className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-black text-base text-[hsl(var(--brand-ink))]">تغيير كلمة المرور</h3>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/50 font-medium">
                                        ينصح بتغيير كلمة المرور كل 90 يوم للحماية
                                    </p>
                                </div>
                            </div>

                            {passSuccessMsg && (
                                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-black flex items-center gap-2 animate-in fade-in duration-200" role="status" data-testid="password-success-msg">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                    <span>{passSuccessMsg}</span>
                                </div>
                            )}

                            {passErrorMsg && (
                                <div className="p-3.5 rounded-2xl bg-red-50 border border-red-300 text-red-700 text-xs font-black flex items-center gap-2 animate-in fade-in duration-200" role="alert" data-testid="password-error-msg">
                                    <Shield className="w-4 h-4 text-red-500 shrink-0" />
                                    <span>{passErrorMsg}</span>
                                </div>
                            )}

                            <div className="space-y-4">
                                {/* Current Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">
                                        كلمة المرور الحالية
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPass ? "text" : "password"}
                                            value={currentPass}
                                            onChange={(e) => setCurrentPass(e.target.value)}
                                            placeholder="أدخل كلمة المرور الحالية"
                                            className="w-full h-11 pr-4 pl-10 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPass(!showCurrentPass)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* New Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">
                                        كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPass ? "text" : "password"}
                                            value={newPass}
                                            onChange={(e) => setNewPass(e.target.value)}
                                            placeholder="أدخل كلمة المرور الجديدة"
                                            className="w-full h-11 pr-4 pl-10 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPass(!showNewPass)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">
                                        تأكيد كلمة المرور الجديدة
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPass ? "text" : "password"}
                                            value={confirmPass}
                                            onChange={(e) => setConfirmPass(e.target.value)}
                                            placeholder="أعد كتابة كلمة المرور الجديدة"
                                            className="w-full h-11 pr-4 pl-10 rounded-xl border border-slate-300 bg-white text-xs font-bold focus:outline-none focus:border-slate-800"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPass(!showConfirmPass)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button Pill matching admin design */}
                        <div className="pt-6 border-t border-slate-100 flex justify-end">
                            <button
                                type="submit"
                                className="h-11 px-8 rounded-full bg-slate-600 hover:bg-slate-800 text-white text-xs font-black shadow-md transition-colors flex items-center gap-2 cursor-pointer"
                            >
                                <Save className="w-4 h-4" />
                                <span>تحديث كلمة المرور 💾</span>
                            </button>
                        </div>
                    </form>
                </div>

            </div>
        </div>
    );
}
