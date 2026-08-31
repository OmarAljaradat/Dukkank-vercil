import { createPortal } from "react-dom";
import { X, Gamepad2, ShieldCheck, Sparkles, CheckCircle2, Info } from "lucide-react";

export function SecondaryExplainerModal({ open, onClose }) {
    if (!open || typeof document === "undefined") return null;

    return createPortal(
        <div 
            className="fixed inset-0 z-[999999] flex items-center justify-center p-4 sm:p-6 bg-black/75 backdrop-blur-md animate-in fade-in duration-200 dir-rtl"
            onClick={onClose}
        >
            <div 
                className="relative z-10 w-full max-w-lg bg-[#faf8f5] dark:bg-slate-900 border-2 border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[92vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Top Header Banner */}
                <div className="relative h-20 sm:h-24 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-6 flex items-center justify-between overflow-hidden shrink-0">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:12px_12px]" />
                    
                    <div className="relative z-10 flex items-center gap-3">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white flex items-center justify-center shadow-lg">
                            <Gamepad2 className="w-6 h-6 sm:w-7 sm:h-7 drop-shadow" />
                        </div>
                        <div>
                            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-white/25 text-white border border-white/30">
                                توضيح هام وسريع 💡
                            </span>
                            <h3 className="text-base sm:text-lg font-black text-white mt-1 drop-shadow-sm">
                                ما هو الحساب السكندري (Secondary)؟
                            </h3>
                        </div>
                    </div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        type="button"
                        aria-label="إغلاق"
                        className="relative z-10 w-9 h-9 rounded-full bg-black/20 hover:bg-black/40 text-white flex items-center justify-center transition-all cursor-pointer border border-white/20 active:scale-95"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-5 sm:p-6 space-y-3.5 overflow-y-auto">
                    {/* Card 1: How to play */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-start gap-3 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                            <Gamepad2 className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>طريقة اللعب المباشرة</span>
                                <span className="text-[10px] bg-amber-500/15 text-amber-700 dark:text-amber-300 font-extrabold px-2 py-0.5 rounded-md">من الحساب نفسه</span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                تقوم بتسجيل الدخول بالحساب المسلم لك من المتجر، وتلعب اللعبة أو تشترك بالبلس <strong className="text-slate-900 dark:text-white font-extrabold">مباشرة من داخل الحساب نفسه</strong> على جهازك (سوني 4 أو سوني 5).
                            </p>
                        </div>
                    </div>

                    {/* Card 2: Full Features */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-start gap-3 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>كامل الميزات الرسمية 100%</span>
                                <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 font-extrabold px-2 py-0.5 rounded-md">بدون أي نقص</span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                اللعبة أو باقة إكسترا أصلية وكاملة وتتلقى كافة التحديثات الرسمية، وتستطيع اللعب أونلاين وتحميل كافة الألعاب بحرية تامة.
                            </p>
                        </div>
                    </div>

                    {/* Card 3: Guarantee & Savings */}
                    <div className="p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-white/10 shadow-xs flex items-start gap-3 transition-all">
                        <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 shadow-inner">
                            <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div className="space-y-1">
                            <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                                <span>توفير مالي ضخم + ضمان ذهبي</span>
                                <span className="text-[10px] bg-blue-500/15 text-blue-700 dark:text-blue-300 font-extrabold px-2 py-0.5 rounded-md">أوفر بنسبة تصل 60%</span>
                            </h4>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                                سعر اقتصادي جداً ومناسب مع ضمان رسمي كامل ودعم فني متواصل من فريق متجر دُكانك.
                            </p>
                        </div>
                    </div>

                    {/* Comparison Note */}
                    <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-xs font-bold text-amber-900 dark:text-amber-200 flex items-center gap-2.5">
                        <Info className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>الفرق: الحساب الأساسي يتيح اللعب من حسابك الشخصي، بينما السكندري تلعب من داخل حساب المتجر بنفس المتعة وبسعر أقل.</span>
                    </div>
                </div>

                {/* Footer Action Button */}
                <div className="p-4 sm:p-5 bg-white dark:bg-slate-950 border-t border-slate-200/80 dark:border-white/10 shrink-0">
                    <button
                        onClick={onClose}
                        type="button"
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-[hsl(var(--brand-blue-deep))] to-[hsl(215_55%_25%)] hover:opacity-95 text-white font-extrabold text-xs sm:text-sm shadow-lg active:scale-98 transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                        <span>فهمت الفكرة، متابعة الاختيار 🎮</span>
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
}
