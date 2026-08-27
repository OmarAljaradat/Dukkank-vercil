import React, { useState, useEffect } from "react";
import { useStoreData } from "../contexts/DataContext";
import { Zap, Clock, Copy, ArrowRight, Flame, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

function calcTimeLeft(targetTime) {
  if (!targetTime) return { hours: 23, minutes: 59, seconds: 59 };
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0 };
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);
  return { hours, minutes, seconds };
}

export function FlashSaleBanner() {
  const { promo } = useStoreData();
  const flash = promo?.flashSale;

  const [timeLeft, setTimeLeft] = useState(() => calcTimeLeft(flash?.endTime));
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!flash?.enabled) return;
    const interval = setInterval(() => {
      setTimeLeft(calcTimeLeft(flash?.endTime));
    }, 1000);
    return () => clearInterval(interval);
  }, [flash?.enabled, flash?.endTime]);

  if (!promo || promo.enabled === false) return null;
  if (!flash || flash.enabled !== true) return null;

  const handleCopyCode = () => {
    if (!flash.code) return;
    navigator.clipboard.writeText(flash.code);
    setCopied(true);
    toast.success(`تم نسخ كود الخصم (${flash.code}) ⚡!`);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-8 py-4">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 text-white p-6 sm:p-8 shadow-2xl border border-white/20">
        {/* Animated background glow */}
        <div className="absolute -right-20 -top-20 w-64 h-64 bg-amber-400/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -left-20 -bottom-20 w-64 h-64 bg-rose-500/20 rounded-full blur-3xl animate-pulse" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-6 dir-rtl text-right">
          {/* Main Info */}
          <div className="space-y-2 max-w-2xl text-center lg:text-right">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-black text-amber-300">
              <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
              <span>{flash.badge || "عرض لفترة محدودة"}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center justify-center lg:justify-start gap-2">
              <span>{flash.title}</span>
              {flash.discount && (
                <span className="px-3 py-1 rounded-2xl bg-amber-400 text-slate-950 text-base font-extrabold rotate-3 inline-block shadow-lg">
                  خصم {flash.discount}%
                </span>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-amber-100/90 font-medium">
              {flash.subtitle}
            </p>
          </div>

          {/* Countdown Clock & CTA */}
          <div className="flex flex-col sm:flex-row items-center gap-4 shrink-0">
            {/* Live Ticking Clock */}
            <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-xl p-3 px-5 rounded-2xl border border-white/10 shadow-inner dir-ltr">
              <Clock className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: "8s" }} />
              <div className="flex items-center gap-1.5 font-mono text-xl font-black text-amber-300">
                <span className="bg-white/10 px-2.5 py-1 rounded-xl">{String(timeLeft.hours).padStart(2, "0")}</span>
                <span>:</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-xl">{String(timeLeft.minutes).padStart(2, "0")}</span>
                <span>:</span>
                <span className="bg-white/10 px-2.5 py-1 rounded-xl text-rose-400">{String(timeLeft.seconds).padStart(2, "0")}</span>
              </div>
            </div>

            {/* Promo Code Copy Button */}
            {flash.code && (
              <button
                type="button"
                onClick={handleCopyCode}
                className="h-12 px-6 rounded-2xl bg-white text-slate-950 font-black text-xs hover:bg-amber-300 transition shadow-lg flex items-center gap-2 cursor-pointer group"
              >
                <span className="font-mono text-sm tracking-wider text-rose-600 font-bold">{flash.code}</span>
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-slate-600 group-hover:scale-110 transition" />}
                <span>{copied ? "تم النسخ!" : "نسخ الكود"}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
