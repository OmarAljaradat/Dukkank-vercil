import { useState } from "react";
import { ShieldCheck, Lock, ArrowLeft, X, AlertCircle, CheckCircle2, CreditCard, Sparkles, Loader2 } from "lucide-react";

export function PaymentCurrencyNoticeModal({
    open,
    onClose,
    onConfirm,
    loading = false,
    formattedOriginal = "0.00 ر.س",
    originalCurrency = "SAR",
    usdAmount = 0,
}) {
    if (!open) return null;

    // Calculate exact JOD equivalent (PayTabs Jordan rate: 1 USD = 0.71 JOD)
    const jodAmount = Math.max(0.1, +(usdAmount * 0.71).toFixed(2));
    const isAlreadyJod = originalCurrency === "JOD";

    return (
        <div className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative space-y-0 text-slate-900 dark:text-white">
                
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-[hsl(var(--brand-blue-deep))] to-blue-700 text-white p-5 sm:p-6 relative">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur border border-white/20 flex items-center justify-center text-white shrink-0">
                                <Lock className="w-5 h-5 text-[hsl(var(--brand-gold))]" />
                            </div>
                            <div>
                                <h3 className="font-extrabold text-base sm:text-lg">تأكيد الدفع الإلكتروني الآمن 🔒</h3>
                                <p className="text-[11px] text-white/80 font-medium">بوابة دفع معتمدة ومشفرة 100%</p>
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer disabled:opacity-50"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-5 sm:p-6 space-y-5">
                    
                    {/* Amount Comparison Card */}
                    <div className="bg-slate-50 dark:bg-slate-950 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800 space-y-3">
                        <div className="text-xs font-bold text-slate-500 dark:text-slate-400">ملخص المبلغ النهائي للطلب:</div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {/* Selected Currency Amount */}
                            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/70 dark:border-slate-800">
                                <div className="text-[11px] font-bold text-slate-400">المبلغ بعملتك المحددة:</div>
                                <div className="text-lg font-black text-[hsl(var(--brand-blue-deep))] dark:text-blue-400 mt-0.5">
                                    {formattedOriginal}
                                </div>
                            </div>

                            {/* JOD Equivalent Amount */}
                            <div className="bg-amber-50 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                                <div className="text-[11px] font-bold text-amber-700 dark:text-amber-400">المعادل بالدينار الأردني:</div>
                                <div className="text-lg font-black text-amber-600 dark:text-amber-400 mt-0.5">
                                    {jodAmount} د.أ <span className="text-xs font-bold">(JOD)</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Notice & Clarification Box */}
                    <div className="bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-900/50 rounded-2xl p-4 space-y-2.5">
                        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300 font-extrabold text-xs">
                            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0" />
                            <span>تنويه هام بخصوص عملة المعالجة البنكية:</span>
                        </div>
                        
                        <p className="text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                            تتم معالجة عمليات الدفع البنكية عبر بوابة الدفع الإلكترونية الرسمية بالدينار الأردني (<span className="font-bold">JOD</span>)، وهو <span className="font-bold text-emerald-600 dark:text-emerald-400">نفس المبلغ المعادل لقيمة مشترياتك تماماً</span> بسعر الصرف البنكي الرسمي دون أي رسوم أو فوائد إضافية.
                        </p>

                        <div className="pt-1 flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                            <span>سيتم الخصم من بطاقتك البنكية بما يعادل هذا المبلغ بالضبط بعملتك المحلية.</span>
                        </div>
                    </div>

                    {/* Trust Signals */}
                    <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 dark:text-slate-400">
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            <span>ضمان استرجاع ذهبي</span>
                        </div>
                        <div className="flex items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200/50 dark:border-slate-800">
                            <CreditCard className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                            <span>دعم مدى / فيزا / ماستركارد</span>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-2">
                        <button
                            type="button"
                            onClick={onConfirm}
                            disabled={loading}
                            className="w-full h-13 rounded-2xl bg-gradient-to-r from-[hsl(var(--brand-blue-deep))] to-blue-700 hover:opacity-95 text-white font-black text-sm transition shadow-xl hover:shadow-2xl flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 active:scale-[0.99]"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    <span>جاري فتح بوابة الدفع...</span>
                                </>
                            ) : (
                                <>
                                    <Lock className="w-4 h-4 text-[hsl(var(--brand-gold))]" />
                                    <span>متابعة للدفع الآمن الآن 💳</span>
                                </>
                            )}
                        </button>
                    </div>

                </div>

            </div>
        </div>
    );
}
