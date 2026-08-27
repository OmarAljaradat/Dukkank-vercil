import { useState } from "react";
import { Gift, Clock, Sparkles, Bell, ShieldCheck, Heart, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function GiftsTab() {
    return (
        <div data-testid="gifts-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Top Header Banner */}
            <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 rounded-3xl border border-purple-500/20 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-300 text-2xl shrink-0">
                        🎁
                    </div>
                    <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                            <h2 className="text-lg font-black text-white">إدارة طلبات الهدايا الرقمية</h2>
                            <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                                ⏳ قريباً (Coming Soon)
                            </span>
                        </div>
                        <p className="text-xs text-purple-200/70 font-medium">
                            نظام إهداء الألعاب والاشتراكات للأصدقاء وتجهيز بطاقات المعايدة الرقمية.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <span className="px-4 py-2 rounded-2xl bg-white/10 text-xs font-bold text-slate-300 border border-white/10">
                        الحالة: متوقف مؤقتاً ⏸️
                    </span>
                </div>
            </div>

            {/* Coming Soon Card */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-sm max-w-2xl mx-auto space-y-6">
                <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto text-4xl shadow-inner border border-purple-200 dark:border-purple-800/40 animate-pulse">
                    🎁
                </div>

                <div className="space-y-2">
                    <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        قسم طلبات الهدايا الرقمية قيد التطوير (قريباً) 🚀
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto leading-relaxed">
                        تم إيقاف هذا القسم مؤقتاً بناءً على طلبك لتبسيط عمليات المتجر في مرحلة الإطلاق الحالية. سيتم تفعيله لاحقاً بنظام إرسال آلي متكامل عبر الواتساب وبطاقات تهنئة احترافية.
                    </p>
                </div>

                {/* Planned Features Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 text-right">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                            <Heart className="w-3.5 h-3.5" />
                            <span>بطاقات تهنئة مخصصة</span>
                        </div>
                        <p className="text-[11px] text-slate-400">تصاميم مناسبات (أعياد، تخرج، هدايا مفاجئة).</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-xs">
                            <Send className="w-3.5 h-3.5" />
                            <span>إرسال فوري للصديق</span>
                        </div>
                        <p className="text-[11px] text-slate-400">توصيل بيانات الحساب مباشرة لرقم المستلم.</p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 space-y-1">
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>تتبع الإهداءات</span>
                        </div>
                        <p className="text-[11px] text-slate-400">لوحة تتبع للمرسل للتأكد من وصول وتفعيل الهدية.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
