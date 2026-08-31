import { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, HelpCircle } from "lucide-react";
import { SecondaryExplainerModal } from "./SecondaryExplainerModal";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useLang, pickLocalized } from "../contexts/LanguageContext";
import { apiRecordCartAdd } from "../lib/api";
import { toast } from "sonner";

const TIER_LABEL = {
    five: "PS5",
    four: "PS4",
    secondary: "سكندري",
};

export const SubscriptionCard = ({ sub }) => {
    const { add } = useCart();
    const { format } = useCurrency();
    const { t, lang } = useLang();
    const navigate = useNavigate();

    const [tier, setTier] = useState("five");
    const availableDurations = useMemo(() => (sub.durations || []).filter((d) => d[tier] != null && Number(d[tier]) > 0), [sub.durations, tier]);
    const [duration, setDuration] = useState(availableDurations[0]?.id);
    const [adding, setAdding] = useState(false);
    const [explainerOpen, setExplainerOpen] = useState(false);

    useEffect(() => {
        if (!availableDurations.find((d) => d.id === duration)) {
            setDuration(availableDurations[0]?.id);
        }
    }, [tier, availableDurations, duration]);

    const dur = (sub.durations || []).find((d) => d.id === duration) || availableDurations[0];
    const price = dur ? dur[tier] : null;
    const subName = pickLocalized(sub, "name", lang);
    const subTagline = pickLocalized(sub, "tagline", lang);
    const durLabel = dur ? pickLocalized(dur, "label", lang) : "";
    const isOut = dur ? dur.stockStatus === "out" : false;

    const accent = sub.accent === "red"
        ? { bar: "bg-[hsl(var(--brand-red))]", ribbon: "bg-[hsl(var(--brand-red))]/10 text-[hsl(var(--brand-red))] border-[hsl(var(--brand-red))]/30", price: "text-[hsl(var(--brand-red))]", sel: "border-[hsl(var(--brand-red))] bg-[hsl(var(--brand-red))]/10 text-[hsl(var(--brand-red))]" }
        : sub.accent === "amber" || sub.accent === "yellow"
        ? { bar: "bg-amber-500", ribbon: "bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30", price: "text-amber-600 dark:text-amber-400", sel: "border-amber-500 bg-amber-500/10 text-amber-700 dark:text-amber-400" }
        : { bar: "bg-[hsl(var(--brand-blue-deep))]", ribbon: "bg-[hsl(var(--brand-blue))]/15 text-[hsl(var(--brand-blue-deep))] border-[hsl(var(--brand-blue))]/40", price: "text-[hsl(var(--brand-blue-deep))]", sel: "border-[hsl(var(--brand-blue-deep))] bg-[hsl(var(--brand-blue))]/10 text-[hsl(var(--brand-blue-deep))]" };

    const handleAdd = () => {
        if (price == null || isOut) return;
        const item = { key: `sub-${sub.id}-${duration}-${tier}`, type: "subscription", title: `${subName} — ${durLabel}`, subtitle: TIER_LABEL[tier], price };
        add(item);
        apiRecordCartAdd({ itemType: "subscription", itemId: sub.id, itemName: subName });
        setAdding(true);
        toast.success(t("toast.addedToCart"), { description: `${item.title} (${item.subtitle})` });
        setTimeout(() => setAdding(false), 1200);
    };

    const handleExpressBuy = () => {
        if (price == null || isOut) return;
        handleAdd();
        toast.success("جاري نقلك لدفع الطلب في الموقع 💳");
        navigate("/cart");
    };

    return (
        <article
            data-testid={`subscription-card-${sub.id}`}
            className="card-elevated rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden flex flex-col"
        >
            <div className={`h-1.5 ${accent.bar}`} />

            <div className="p-5 sm:p-7 flex flex-col flex-1">
                {/* Header */}
                <div className="flex items-start justify-between gap-3 mb-4 sm:mb-5">
                    <div>
                        <h3 className="text-xl sm:text-2xl font-bold text-[hsl(var(--brand-ink))]">{subName}</h3>
                        <p className="text-sm text-[hsl(var(--brand-ink))]/65 mt-1">{subTagline}</p>
                    </div>
                    <span className={`text-[11px] font-semibold rounded-full border px-2.5 py-1 flex-shrink-0 ${accent.ribbon}`}>
                        {sub.id === "deluxe" ? "الفاخر" : sub.id === "extra" ? t("card.mostRequested") : t("card.basic")}
                    </span>
                </div>

                {/* Tier selector */}
                <div className="mb-4">
                    <div className="text-xs font-semibold text-[hsl(var(--brand-ink))]/60 mb-2">{t("card.device")}</div>
                    {(() => {
                        const isExtra = sub.id === "extra";
                        const availablePlatformTiers = isExtra ? ["five", "four", "secondary"] : ["five", "four"];
                        return (
                            <div className={`grid gap-2 ${availablePlatformTiers.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
                                {availablePlatformTiers.map((tt) => (
                                    <button
                                        key={tt}
                                        onClick={() => {
                                            setTier(tt);
                                            if (tt === "secondary") setExplainerOpen(true);
                                        }}
                                        data-testid={`sub-${sub.id}-tier-${tt}`}
                                        data-selected={tier === tt}
                                        className="tier-pill text-xs sm:text-sm font-semibold rounded-xl border-2 border-[hsl(var(--brand-ink))]/15 h-11 sm:h-12 transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1"
                                    >
                                        <span>{TIER_LABEL[tt]}</span>
                                        {tt === "secondary" && (
                                            <span className="text-[10px] text-amber-500 font-bold">ℹ️</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                        );
                    })()}
                </div>

                {/* Duration selector */}
                <div className="mb-5">
                    <div className="text-xs font-semibold text-[hsl(var(--brand-ink))]/60 mb-2">{t("card.duration")}</div>

                    {/* Mobile: horizontal scroll chips */}
                    <div className="sm:hidden flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
                        {(sub.durations || []).map((d) => {
                            const isAvail = d[tier] != null && Number(d[tier]) > 0;
                            const selected = d.id === duration;
                            const lbl = pickLocalized(d, "label", lang);
                            return (
                                <button
                                    key={d.id}
                                    onClick={() => isAvail && setDuration(d.id)}
                                    disabled={!isAvail}
                                    data-testid={isAvail ? `sub-${sub.id}-duration-${d.id}` : `sub-${sub.id}-duration-${d.id}-disabled`}
                                    className={`flex-shrink-0 flex flex-col items-center justify-center rounded-xl border-2 px-3 py-2 text-xs font-semibold transition-all min-w-[72px] min-h-[52px] active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                                        selected && isAvail ? accent.sel : "border-[hsl(var(--brand-ink))]/12 bg-[hsl(var(--brand-cream))]/40 text-[hsl(var(--brand-ink))]/80"
                                    }`}
                                >
                                    <span className="font-bold text-[13px]">{lbl}</span>
                                    <span className={`text-[11px] mt-0.5 ${selected && isAvail ? "opacity-90" : "text-[hsl(var(--brand-ink))]/50"}`}>
                                        {isAvail ? format(d[tier]) : "غير متوفر"}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Desktop: vertical list */}
                    <div className="hidden sm:block space-y-2">
                        {(sub.durations || []).map((d) => {
                            const isAvail = d[tier] != null && Number(d[tier]) > 0;
                            const selected = d.id === duration;
                            const lbl = pickLocalized(d, "label", lang);
                            if (!isAvail) {
                                return (
                                    <div key={d.id} data-testid={`sub-${sub.id}-duration-${d.id}-disabled`}
                                        className="w-full flex items-center justify-between rounded-xl border-2 border-dashed border-[hsl(var(--brand-ink))]/15 px-4 h-12 text-sm font-medium opacity-50">
                                        <span className="text-[hsl(var(--brand-ink))]/60">{lbl}</span>
                                        <span className="text-[hsl(var(--brand-ink))]/45 text-xs">{t("card.notAvailable")}</span>
                                    </div>
                                );
                            }
                            return (
                                <button key={d.id} onClick={() => setDuration(d.id)} data-testid={`sub-${sub.id}-duration-${d.id}`}
                                    className={`w-full flex items-center justify-between rounded-xl border-2 px-4 h-12 text-sm font-semibold transition-all cursor-pointer ${
                                        selected ? accent.sel : "border-[hsl(var(--brand-ink))]/10 bg-[hsl(var(--brand-cream))]/40 text-[hsl(var(--brand-ink))]/80 hover:border-[hsl(var(--brand-ink))]/25"
                                    }`}>
                                    <span className="flex items-center gap-2">
                                        {selected && <Check className="w-4 h-4" />}
                                        {lbl}
                                        {d.stockStatus === "out" && (
                                            <span className="text-[10px] text-red-500 font-bold mr-2">(نفد المخزون 🔴)</span>
                                        )}
                                    </span>
                                    <span className="text-[hsl(var(--brand-ink))]/60 text-xs">{format(d[tier])}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Price + Add */}
                <div className="mt-auto pt-4 border-t border-[hsl(var(--brand-ink))]/10 flex items-center justify-between gap-3">
                    <div>
                        <div className="text-xs text-[hsl(var(--brand-ink))]/55 mb-0.5">{t("card.price")}</div>
                        {(() => {
                            const curDurObj = (sub.durations || []).find((x) => x.id === duration);
                            const origP = curDurObj ? (tier === "five" ? curDurObj.originalFive : curDurObj.originalFour) : null;
                            const hasOrig = origP != null && Number(origP) > Number(price);
                            const discountPct = hasOrig ? Math.round(((Number(origP) - Number(price)) / Number(origP)) * 100) : 0;

                            return (
                                <div className="flex flex-col">
                                    {hasOrig && (
                                        <div className="flex items-center gap-1.5 mb-0.5">
                                            <span className="line-through text-xs text-slate-400 font-semibold">{format(origP)}</span>
                                            <span className="px-1.5 py-0.5 rounded bg-red-500 text-white text-[10px] font-black">
                                                خصم {discountPct}% 🔥
                                            </span>
                                        </div>
                                    )}
                                    <div className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${accent.price}`}>
                                        {price != null ? format(price) : "غير متوفر"}
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleExpressBuy}
                            disabled={price == null || isOut}
                            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm cursor-pointer disabled:opacity-40"
                        >
                            شراء الآن ⚡
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={adding || price == null || isOut}
                            className="px-4 py-2.5 rounded-xl bg-slate-900 text-white hover:bg-slate-800 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>إضافة للسلة 🛒</span>
                        </button>
                    </div>
                </div>
            </div>
            <SecondaryExplainerModal open={explainerOpen} onClose={() => setExplainerOpen(false)} />
        </article>
    );
};
