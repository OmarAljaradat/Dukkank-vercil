import { X, Gamepad2, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";

export function SecondaryExplainerModal({ open, onClose }) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 dir-rtl">
            <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center shadow-inner">
                        <Gamepad2 className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="text-lg font-black text-slate-900 dark:text-white">
                            ما هو الحساب السكندري (Secondary)؟
                        </h3>
                        <p className="text-xs text-slate-500 font-medium">دليلك السريع لفهم خيار السكندري الاقتصادي 💡</p>
                    </div>
                </div>

                {/* Details List */}
                <div className="space-y-3 pt-1">
                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <span className="font-extrabold text-slate-900 dark:text-white block">طريقة اللعب والاستخدام:</span>
                            <span className="text-slate-600 dark:text-slate-300 leading-relaxed block">
                                تلعب وتستمتع باللعبة أو اشتراك البلس مباشرة من داخل الحساب المعطى لك من المتجر على جهازك (سوني 4 أو سوني 5).
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <span className="font-extrabold text-slate-900 dark:text-white block">كامل الميزات والتوفير:</span>
                            <span className="text-slate-600 dark:text-slate-300 leading-relaxed block">
                                ستحصل على اللعبة أو باقة إكسترا بالكامل مع كافة التحديثات واللعب أونلاين وبسعر مخفض واقتصادي جداً!
                            </span>
                        </div>
                    </div>

                    <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-white/[0.04] border border-slate-200/60 dark:border-white/10 flex items-start gap-3">
                        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                        <div className="text-xs space-y-1">
                            <span className="font-extrabold text-slate-900 dark:text-white block">الضمان الذهبي 100%:</span>
                            <span className="text-slate-600 dark:text-slate-300 leading-relaxed block">
                                الحساب آمن ورسمي تماماً ومشمول بالضمان الذهبي والدعم الفني الكامل من متجر دُكانك.
                            </span>
                        </div>
                    </div>
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                    <button
                        onClick={onClose}
                        className="w-full h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-xs sm:text-sm hover:opacity-90 active:scale-95 transition-all shadow-md cursor-pointer"
                    >
                        فهمت، متابعة الاختيار 👍
                    </button>
                </div>
            </div>
        </div>
    );
}
