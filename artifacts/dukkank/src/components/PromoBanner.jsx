import { useEffect, useState } from "react";
import { useStoreData } from "../contexts/DataContext";
import { Clock, X, ArrowLeft } from "lucide-react";

function calcLeft(endsAt) {
    if (!endsAt) return null;
    const end = new Date(endsAt).getTime();
    if (Number.isNaN(end)) return null;
    const diff = end - Date.now();
    if (diff <= 0) return null;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);
    return { days, hours, minutes, seconds };
}

const Cell = ({ value, label }) => (
    <div className="flex flex-col items-center min-w-[44px] sm:min-w-[60px]">
        <span
            dir="ltr"
            className="text-lg sm:text-2xl font-extrabold tabular-nums leading-none text-[hsl(var(--brand-cream))]"
        >
            {String(value).padStart(2, "0")}
        </span>
        <span className="text-[10px] sm:text-[11px] mt-1 opacity-75 font-semibold">
            {label}
        </span>
    </div>
);

export const PromoBanner = () => {
    const { promo } = useStoreData();
    const [closed, setClosed] = useState(false);
    const [left, setLeft] = useState(() => calcLeft(promo?.endsAt));

    useEffect(() => {
        setClosed(false);
    }, [promo?.enabled, promo?.title]);

    useEffect(() => {
        if (!promo?.enabled || !promo?.endsAt) {
            setLeft(null);
            return;
        }
        const tick = () => setLeft(calcLeft(promo.endsAt));
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [promo?.enabled, promo?.endsAt]);

    if (!promo || promo.enabled === false) return null;
    if (closed) return null;

    const handleClose = () => {
        setClosed(true);
    };

    return (
        <div
            data-testid="promo-banner"
            className="relative bg-[hsl(var(--brand-red))] text-[hsl(var(--brand-cream))] border-b border-black/15"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3 sm:py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="hidden sm:inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/15">
                        <Clock className="w-5 h-5" />
                    </span>
                    <div className="leading-tight min-w-0">
                        <div className="font-bold text-sm sm:text-base truncate">
                            {promo.title || "عرض محدود"}
                        </div>
                        {promo.subtitle && (
                            <div className="text-[12px] sm:text-sm opacity-90 truncate">
                                {promo.subtitle}
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                    {left && (
                        <div className="flex items-center gap-1.5 sm:gap-2 bg-black/20 rounded-xl px-2 sm:px-3 py-1.5">
                            {left.days > 0 && <Cell value={left.days} label="يوم" />}
                            <Cell value={left.hours} label="ساعة" />
                            <Cell value={left.minutes} label="دقيقة" />
                            <Cell value={left.seconds} label="ثانية" />
                        </div>
                    )}
                    {promo.ctaLabel && (
                        <a
                            href={promo.ctaHref || "#essential"}
                            data-testid="promo-cta"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-4 h-10 bg-[hsl(var(--brand-cream))] text-[hsl(var(--brand-red))] text-sm font-bold hover:bg-white transition-colors"
                        >
                            {promo.ctaLabel}
                            <ArrowLeft className="w-4 h-4" />
                        </a>
                    )}
                    <button
                        onClick={handleClose}
                        aria-label="إغلاق العرض"
                        data-testid="promo-close"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-full hover:bg-white/15 transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
};
