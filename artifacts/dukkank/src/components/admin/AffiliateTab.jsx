import React from "react";
import { Gift, Rocket, Sparkles, Clock } from "lucide-react";

export default function AffiliateTab() {
    return (
        <div data-testid="affiliate-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Header Banner */}
            <div className="relative rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-2xl overflow-hidden">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                        <Gift className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span>نظام التسويق بالعمولة والإحالات (Affiliate & Influencer Hub)</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-400 font-medium mt-0.5">
                            إدارة أكواد المشاهير والمسوقين وتوزيع الأرباح
                        </p>
                    </div>
                </div>
            </div>

            {/* Coming Soon Showcase Card */}
            <div className="bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 rounded-3xl p-10 sm:p-16 text-center space-y-6 shadow-sm flex flex-col items-center justify-center min-h-[380px]">
                <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-purple-600/20 to-blue-600/20 border border-purple-500/30 flex items-center justify-center text-purple-500 shadow-inner">
                    <Rocket className="w-10 h-10 animate-bounce" />
                </div>

                <div className="space-y-2 max-w-md">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                        <Clock className="w-3.5 h-3.5" />
                        قيد التطوير والتجهيز
                    </span>
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white">
                        قريباً 🚀
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                        سيتم إطلاق نظام التسويق بالعمولة والإحالات المطور مع احتساب الأرباح الآلي وربط المسوقين والمؤثرين بالكامل قريباً.
                    </p>
                </div>
            </div>
        </div>
    );
}

