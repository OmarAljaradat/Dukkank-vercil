import { useStoreData } from "../../contexts/DataContext";
import { BookOpen, QrCode, AlertTriangle, ShieldCheck, Instagram, Lock, Monitor, CheckCircle2 } from "lucide-react";

export default function AccountGuideTab() {
    const { content } = useStoreData();
    const guideData = content?.accountGuide || {};

    const ps5Steps = Array.isArray(guideData.ps5Steps) && guideData.ps5Steps.length > 0 ? guideData.ps5Steps : [
        "افتح جهاز الـ PS5 الخاص بك.",
        "اضغط على صورة حسابك الشخصي بأعلى الشاشة.",
        "اختر \"تبديل المستخدم\" ➔ \"إضافة مستخدم جديد\" (Add User).",
        "اختر \"تسجيل الدخول بواسطة تطبيق PlayStation App\".",
        "سيظهر رمز الـ QR Code عريضاً على شاشة التلفزيون 📸.",
        "صور الرمز بجوالك وأرسله فوراً للدعم في الواتساب!"
    ];

    const ps4Steps = Array.isArray(guideData.ps4Steps) && guideData.ps4Steps.length > 0 ? guideData.ps4Steps : [
        "من القائمة الرئيسية، اختر \"مستخدم جديد\" (New User).",
        "اختر \"إنشاء مستخدم جديد\" (Create User).",
        "اختر \"تسجيل الدخول بواسطة التطبيق\" لإظهار رمز الـ QR Code.",
        "التقط صورة بوضوح للشاشة بجوالك.",
        "أرسل الصورة لفريق الدعم ليفعلوا الحساب على جهازك!"
    ];

    return (
        <div className="space-y-6">
            {/* Main Header */}
            <div className="flex items-center justify-between pb-2 border-b border-[hsl(var(--brand-ink))]/10">
                <div>
                    <h2 className="text-xl font-black text-[hsl(var(--brand-ink))] flex items-center gap-2">
                        <BookOpen className="w-5.5 h-5.5 text-blue-600" />
                        <span>{guideData.pageTitle || "دليل وشروحات التفعيل والضمان"}</span>
                    </h2>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium mt-0.5">
                        {guideData.pageSubtitle || "كل ما تحتاج معرفته لتفعيل حسابك على السوني وقواعد الضمان الذهبي"}
                    </p>
                </div>
            </div>

            {/* SECTION 1: How to get QR Code */}
            <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white p-6 rounded-3xl space-y-4 shadow-lg border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 font-extrabold text-sm border-b border-white/10 pb-3">
                    <QrCode className="w-5 h-5 text-blue-300" />
                    <span>{guideData.qrHeaderTitle || "كيف تُظهر رمز الـ QR Code من شاشة السوني الخاصة بك؟ 📸"}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* PS5 Steps */}
                    <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15 space-y-2">
                        <div className="font-extrabold text-sm text-blue-300 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-blue-600 text-white text-[11px] font-black">PS5</span>
                            <span>{guideData.ps5Title || "طريقة إظهار الـ QR على سوني 5:"}</span>
                        </div>
                        <ol className="space-y-1.5 text-slate-200 list-decimal list-inside font-medium leading-relaxed">
                            {ps5Steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ol>
                    </div>

                    {/* PS4 Steps */}
                    <div className="bg-white/10 backdrop-blur p-4 rounded-2xl border border-white/15 space-y-2">
                        <div className="font-extrabold text-sm text-indigo-300 flex items-center gap-1.5">
                            <span className="px-2 py-0.5 rounded bg-indigo-600 text-white text-[11px] font-black">PS4</span>
                            <span>{guideData.ps4Title || "طريقة إظهار الـ QR على سوني 4:"}</span>
                        </div>
                        <ol className="space-y-1.5 text-slate-200 list-decimal list-inside font-medium leading-relaxed">
                            {ps4Steps.map((step, idx) => (
                                <li key={idx}>{step}</li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>

            {/* SECTION 2: CRITICAL RULES & WARNINGS */}
            <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-2 border-amber-500/30 p-6 rounded-3xl space-y-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-extrabold text-base border-b border-amber-500/20 pb-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                    <span>تعليمات وقواعد الاستخدام الذهبية (تنبيهات شديدة الأهمية ⚠️)</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {/* Rule 1 */}
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-amber-500/20 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
                            <Monitor className="w-4 h-4 text-amber-600" />
                            <span>{guideData.rule1Title || "1. جهاز واحد فقط"}</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/70 font-medium leading-relaxed">
                            {guideData.rule1Desc || "الحساب مخصص ومصرح بالعمل على جهاز سوني واحد فقط ولا يمكن نقله لجهاز آخر."}
                        </p>
                    </div>

                    {/* Rule 2 */}
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-red-500/30 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-black text-red-600 dark:text-red-400">
                            <Lock className="w-4 h-4 text-red-600" />
                            <span>{guideData.rule2Title || "2. يُمنع تسجيل الخروج! ⛔"}</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/70 font-medium leading-relaxed">
                            {guideData.rule2Desc || "ممنوع ممنوع الخروج من الحساب أو حذفه لأي ظرف من الظروف! الخروج يتسبب في فقدان التفعيل فوراً وانسحاب الضمان."}
                        </p>
                    </div>

                    {/* Rule 3 */}
                    <div className="bg-white dark:bg-slate-900/60 p-4 rounded-2xl border border-amber-500/20 space-y-1.5 shadow-xs">
                        <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
                            <ShieldCheck className="w-4 h-4 text-amber-600" />
                            <span>{guideData.rule3Title || "3. عدم تعديل البيانات"}</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/70 font-medium leading-relaxed">
                            {guideData.rule3Desc || "يُمنع تغيير البريد أو الرمز أو إعدادات الأمان الخاصة بالحساب لضمان استمرارية الضمان."}
                        </p>
                    </div>
                </div>
            </div>

            {/* SECTION 3: GOLDEN GUARANTEE */}
            <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-6 rounded-3xl space-y-4 shadow-lg">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/20 pb-3">
                    <div className="flex items-center gap-2 font-black text-base text-yellow-300">
                        <ShieldCheck className="w-6 h-6 text-yellow-300" />
                        <span>{guideData.guaranteeTitle || "سياسة الضمان الذهبي لمتجر دُكانك 🛡️"}</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-white/20 text-white text-xs font-black backdrop-blur">
                        ضمان 100% طوال الفترة
                    </span>
                </div>

                <div className="space-y-2 text-xs text-emerald-100 font-medium leading-relaxed">
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                        <span>{guideData.guaranteeItem1 || "نضمن لك عمل الحساب واللعبة أو الاشتراك بنسبة 100% طوال الفترة المشترك بها دون أي انقطاع."}</span>
                    </div>
                    <div className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-yellow-300 shrink-0 mt-0.5" />
                        <span>{guideData.guaranteeItem2 || "في حال حدوث أي مشكلة تقنية من طرفنا، يتولى فريق الدعم حل المشكلة فوراً أو استبدال الحساب."}</span>
                    </div>
                </div>

                {/* Instagram Help CTA */}
                <div className="pt-2">
                    <a
                        href="https://ig.me/m/dukkank15"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full h-11 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-opacity cursor-pointer"
                    >
                        <Instagram className="w-4.5 h-4.5" />
                        <span>تواصل مع الدعم الفني عبر إنستجرام للاستفسارات المباشرة 💬</span>
                    </a>
                </div>
            </div>
        </div>
    );
}
