import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Check, Share2, Gamepad2, Heart, Bell, Zap, Eye } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useLang } from "../contexts/LanguageContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useStoreData } from "../contexts/DataContext";
import { NotifyMeDialog } from "./NotifyMeDialog";
import { QuickViewModal } from "./QuickViewModal";
import { apiRecordCartAdd } from "../lib/api";
import { toast } from "sonner";

const TIER_LABEL = {
    five: "PS5",
    four: "PS4",
    secondary: "سكندري",
};

const TIER_LABEL_FULL = {
    five: "PS5",
    four: "PS4",
    secondary: "سكندري",
};

export const GameCard = ({ game }) => {
    const { add } = useCart();
    const { format } = useCurrency();
    const { t } = useLang();
    const { has: isFav, toggle: toggleFav } = useWishlist();
    const { store } = useStoreData();
    const navigate = useNavigate();
    const isAvailable   = game.available !== false;
    const availableTiers = ["five", "four", "secondary"].filter((tier) => game[tier] != null);
    const hasPrice       = availableTiers.length > 0;
    const canBuy         = isAvailable && hasPrice;
    const possibleTiers  = availableTiers.length ? availableTiers : ["five", "four", "secondary"];
    const [tier, setTier]       = useState(possibleTiers[0]);
    const [adding, setAdding]   = useState(false);
    const [copied, setCopied]   = useState(false);
    const [imgError, setImgError] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [quickViewOpen, setQuickViewOpen] = useState(false);

    const price  = game[tier];
    const favored = isFav(game.id);

    const handleAdd = () => {
        if (!canBuy || price == null) return;
        add({ key: `game-${game.id}-${tier}`, type: "game", title: game.name, subtitle: TIER_LABEL_FULL[tier], price });
        apiRecordCartAdd({ itemType: "game", itemId: game.id, itemName: game.name });
        setAdding(true);
        toast.success(t("toast.gameAddedToCart"), { description: `${game.name} (${TIER_LABEL_FULL[tier]})` });
        setTimeout(() => setAdding(false), 1200);
    };

    const handleExpressBuy = (e) => {
        e?.stopPropagation?.();
        if (!canBuy || price == null) return;
        add({ key: `game-${game.id}-${tier}`, type: "game", title: game.name, subtitle: TIER_LABEL_FULL[tier], price });
        apiRecordCartAdd({ itemType: "game", itemId: game.id, itemName: game.name });
        toast.success("جاري نقلك لتأكيد ودفع الطلب في الموقع 💳");
        navigate("/cart");
    };

    const handleFavorite = (e) => {
        e?.stopPropagation?.();
        const added = toggleFav(game.id);
        if (added) toast.success("أُضيفت للمفضلة ❤️", { description: game.name });
    };

    const handleShare = async (e) => {
        e?.stopPropagation?.();
        const base = `${window.location.origin}${window.location.pathname}`;
        const url  = `${base}?p=game-${game.id}#games`;
        try {
            if (navigator.share) { await navigator.share({ title: game.name, url }); return; }
            await navigator.clipboard.writeText(url);
            setCopied(true);
            toast.success(t("toast.linkCopied"));
            setTimeout(() => setCopied(false), 1800);
        } catch { toast.error(t("toast.copyFailed")); }
    };

    const showImage = game.image && !imgError;

    const platformLabel = !hasPrice
        ? t("card.comingSoon")
        : availableTiers.length === 3
            ? "PS4 / PS5 / سكندري"
            : availableTiers.length === 2
                ? `${TIER_LABEL[availableTiers[0]]} / ${TIER_LABEL[availableTiers[1]]}`
                : TIER_LABEL[availableTiers[0]] || "";

    // ── Mobile horizontal layout (< md) ────────────────────────────────────────
    const mobileCard = (
        <article
            id={`game-${game.id}`}
            data-testid={`game-card-${game.id}`}
            className="md:hidden card-elevated rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden scroll-mt-28"
        >
            <div className="flex items-stretch gap-0">
                {/* Square image */}
                <div
                    className="relative w-[95px] sm:w-[110px] flex-shrink-0 flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${game.gradientFrom} 0%, ${game.gradientTo} 100%)` }}
                >
                    {showImage ? (
                        <img src={game.image} alt={game.name} loading="lazy" onError={() => setImgError(true)}
                            className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <>
                            <div className="absolute inset-0 opacity-20 keffiyeh-pattern mix-blend-overlay" />
                            <Gamepad2 className="text-white/90 w-10 h-10 drop-shadow-lg relative z-[1]" />
                        </>
                    )}

                    {!isAvailable && (
                        <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-[3]">
                            <span className="rounded-full bg-[hsl(var(--brand-red))] text-white text-[10px] font-extrabold px-2.5 py-1 shadow-lg">
                                {t("card.outOfStock")}
                            </span>
                        </div>
                    )}

                    {isAvailable && hasPrice && game.bestSeller && (
                        <div className="absolute top-2 right-0 left-0 flex justify-center pointer-events-none z-[3]">
                            <span className="text-[9px] font-extrabold px-2 py-0.5 rounded-full text-[#3a2400]"
                                style={{ background: "linear-gradient(135deg, #ffd86b 0%, #f0a500 100%)" }}>
                                🔥 الأكثر طلباً
                            </span>
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 flex flex-col p-3.5 gap-2">
                    {/* Title row */}
                    <div className="flex items-start gap-1.5">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-black text-[hsl(var(--brand-ink))] leading-tight truncate">
                                {game.name}
                            </h3>
                            {game.sub && (
                                <p className="text-[11px] text-[hsl(var(--brand-ink))]/55 mt-0.5 truncate">{game.sub}</p>
                            )}
                        </div>
                        {/* Fav button */}
                        <button onClick={handleFavorite} aria-label="مفضلة"
                            className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center transition-colors ${favored ? "bg-[hsl(var(--brand-red))] text-white" : "text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-red))]"}`}>
                            <Heart className={`w-3.5 h-3.5 ${favored ? "fill-white" : ""}`} />
                        </button>
                    </div>

                    {/* Tier selector — horizontal chips */}
                    <div className="flex items-center gap-2">
                        <div className="inline-flex p-0.5 rounded-xl bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10">
                            {possibleTiers.map((t) => {
                                const avail = game[t] != null;
                                return (
                                    <button key={t} onClick={() => avail && setTier(t)} disabled={!avail}
                                        className={`text-xs font-black px-3.5 h-8 rounded-lg transition-all disabled:opacity-30 flex-shrink-0 active:scale-95 cursor-pointer ${
                                            tier === t && avail
                                                ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-sm font-black"
                                                : "text-[hsl(var(--brand-ink))]/70 hover:bg-white/50"
                                        }`}>
                                        {TIER_LABEL[t]}
                                    </button>
                                );
                            })}
                        </div>
                        <span className="text-[10px] font-bold text-[hsl(var(--brand-ink))]/50 mr-auto">{platformLabel}</span>
                    </div>

                    {/* Stock Badge */}
                    {isAvailable && hasPrice && (
                        <div className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg w-max mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>متوفر للتسليم ⚡</span>
                        </div>
                    )}

                    {/* Price + Action buttons row */}
                    <div className="flex items-center justify-between gap-1.5 mt-auto">
                        <div>
                            {!isAvailable ? (
                                <div className="text-xs font-bold text-[hsl(var(--brand-red))]/80">{t("card.unavailable")}</div>
                            ) : hasPrice && price != null ? (
                                <div className="text-lg font-extrabold text-[hsl(var(--brand-red))] leading-none">{format(price)}</div>
                            ) : (
                                <div className="text-xs font-bold text-[hsl(var(--brand-ink))]/40">{t("card.comingSoon")}</div>
                            )}
                        </div>

                        <div className="flex items-center gap-1">
                            {isAvailable && canBuy && price != null && (
                                <button
                                    onClick={handleExpressBuy}
                                    className="inline-flex items-center gap-1 rounded-full px-2.5 h-9 text-[11px] font-extrabold bg-[hsl(var(--brand-gold))] text-[hsl(var(--brand-blue-deep))] hover:bg-[hsl(var(--brand-gold))]/90 transition-all shadow-sm active:scale-95 shrink-0"
                                >
                                    <Zap className="w-3 h-3 fill-current" />
                                    <span>فوري ⚡</span>
                                </button>
                            )}
                            <button
                                onClick={isAvailable ? handleAdd : () => setNotifyOpen(true)}
                                disabled={isAvailable && (!canBuy || price == null)}
                                data-testid={isAvailable ? `game-${game.id}-add-button` : `game-${game.id}-notify-button`}
                                className={`inline-flex items-center gap-1 rounded-full px-3 h-9 text-[11px] font-bold transition-all disabled:opacity-40 active:scale-95 shrink-0 ${
                                    !isAvailable
                                        ? "bg-[hsl(var(--brand-red))] text-white"
                                        : adding
                                            ? "bg-green-600 text-white"
                                            : "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] hover:bg-[hsl(var(--brand-blue-deep))]"
                                }`}
                            >
                                {!isAvailable ? <><Bell className="w-3 h-3" /> أعلمني</>
                                    : adding   ? <><Check className="w-3 h-3" /> {t("card.added")}</>
                                    : <><Plus className="w-3 h-3" /> {t("card.add")}</>}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <NotifyMeDialog open={notifyOpen} onOpenChange={setNotifyOpen} game={game} />
        </article>
    );

    // ── Desktop vertical card (≥ md) ──────────────────────────────────────────
    const desktopCard = (
        <article
            id={`game-${game.id}`}
            data-testid={`game-card-${game.id}`}
            className="hidden md:flex card-elevated rounded-2xl bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 overflow-hidden flex-col transition-transform hover:-translate-y-1 scroll-mt-28"
        >
            {/* Cover */}
            <div className="relative aspect-[3/4] flex items-center justify-center overflow-hidden"
                style={{ background: `linear-gradient(135deg, ${game.gradientFrom} 0%, ${game.gradientTo} 100%)` }}>
                {showImage ? (
                    <img src={game.image} alt={game.name} loading="lazy" onError={() => setImgError(true)} className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <>
                        <div className="absolute inset-0 opacity-20 keffiyeh-pattern mix-blend-overlay" />
                        <Gamepad2 className="text-white/95 w-20 h-20 drop-shadow-xl" />
                    </>
                )}
                <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent pointer-events-none z-[2]" />
                {!isAvailable && (
                    <div className="absolute inset-0 bg-black/55 backdrop-blur-[2px] flex items-center justify-center pointer-events-none z-[2]">
                        <span className="rounded-full bg-[hsl(var(--brand-red))] text-white text-sm font-extrabold px-5 py-2 shadow-2xl rotate-[-6deg] border-2 border-white/20" data-testid={`game-${game.id}-out-of-stock`}>
                            {t("card.outOfStock")}
                        </span>
                    </div>
                )}
                <div className="absolute bottom-3 right-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 backdrop-blur-md px-3 py-1 text-[11px] font-semibold text-white pointer-events-none z-[3]">{platformLabel}</div>
                {isAvailable && !hasPrice && (
                    <div className="absolute top-3 right-3 inline-flex items-center rounded-full bg-[hsl(var(--brand-red))] px-3 py-1 text-[11px] font-bold text-white uppercase tracking-wider pointer-events-none z-[3]">{t("card.priceSoon")}</div>
                )}
                {isAvailable && hasPrice && game.bestSeller && (
                    <div data-testid={`game-${game.id}-best-seller`} className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-extrabold text-[#3a2400] tracking-wide shadow-lg pointer-events-none z-[3]"
                        style={{ background: "linear-gradient(135deg, #ffd86b 0%, #f0a500 100%)" }}>
                        🔥 {t("card.bestSeller")}
                    </div>
                )}
                <button onClick={handleFavorite} aria-label={favored ? "إزالة من المفضلة" : "إضافة للمفضلة"} data-testid={`game-${game.id}-fav-button`}
                    className={`absolute top-3 left-3 inline-flex items-center justify-center w-9 h-9 rounded-full transition-colors backdrop-blur shadow-md z-[4] ${favored ? "bg-[hsl(var(--brand-red))] text-white" : "bg-white/95 hover:bg-white text-[hsl(var(--brand-ink))]"}`}>
                    <Heart className={`w-4 h-4 transition-transform ${favored ? "fill-white scale-110" : ""}`} />
                </button>
                <button onClick={handleShare} aria-label={t("card.share")} data-testid={`game-${game.id}-share-button`}
                    className="absolute top-14 left-3 inline-flex items-center gap-1.5 rounded-full bg-white/95 hover:bg-white text-[hsl(var(--brand-ink))] px-3 py-1.5 text-[11px] font-semibold transition-colors backdrop-blur shadow-md z-[4]">
                    {copied ? <><Check className="w-3.5 h-3.5 text-[hsl(var(--brand-red))]" />{t("card.copied")}</> : <><Share2 className="w-3.5 h-3.5" />{t("card.share")}</>}
                </button>
            </div>

            <div className="p-5 sm:p-6 flex flex-col flex-1">
                <h3 className="latin-tight text-lg sm:text-xl font-bold text-[hsl(var(--brand-ink))] leading-tight" dir="ltr">
                    {game.name}
                </h3>
                <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/60 mt-1">{game.sub}</p>

                {/* Stock Badge */}
                {isAvailable && hasPrice && (
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg w-max mt-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span>متوفر للتسليم الفوري ⚡</span>
                    </div>
                )}

                <div className={`mt-4 grid gap-2 ${possibleTiers.length >= 3 ? "grid-cols-3" : "grid-cols-2"}`}>

                    {possibleTiers.map((t) => {
                        const avail = game[t] != null;
                        return (
                            <button key={t} onClick={() => avail ? setTier(t) : null} disabled={!avail} data-testid={`game-${game.id}-tier-${t}`} data-selected={tier === t && avail}
                                className="tier-pill text-xs sm:text-sm font-semibold rounded-lg border-2 border-[hsl(var(--brand-ink))]/15 h-11 transition-all disabled:opacity-35 disabled:cursor-not-allowed">
                                {TIER_LABEL_FULL[t]}
                            </button>
                        );
                    })}
                </div>

                <div className="mt-5 pt-4 border-t border-[hsl(var(--brand-ink))]/10 flex items-end justify-between gap-2">
                    <div>
                        <div className="text-xs text-[hsl(var(--brand-ink))]/55">{t("card.price")}</div>
                        {!isAvailable ? (
                            <div className="text-base font-bold text-[hsl(var(--brand-red))]/80" data-testid={`game-${game.id}-price`}>{t("card.unavailable")}</div>
                        ) : hasPrice && price != null ? (
                            <div className="text-2xl font-bold text-[hsl(var(--brand-red))]" data-testid={`game-${game.id}-price`}>{format(price)}</div>
                        ) : (
                            <div className="text-base font-bold text-[hsl(var(--brand-ink))]/40" data-testid={`game-${game.id}-price`}>{t("card.comingSoon")}</div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {isAvailable && canBuy && price != null && (
                            <button
                                onClick={handleExpressBuy}
                                className="inline-flex items-center gap-1.5 rounded-full px-3.5 h-11 text-xs font-extrabold bg-[hsl(var(--brand-gold))] text-[hsl(var(--brand-blue-deep))] hover:bg-[hsl(var(--brand-gold))]/90 transition-all shadow-md active:scale-95 shrink-0"
                            >
                                <Zap className="w-3.5 h-3.5 fill-current" />
                                <span>شراء سريع ⚡</span>
                            </button>
                        )}
                        <button onClick={isAvailable ? handleAdd : () => setNotifyOpen(true)} disabled={isAvailable && (!canBuy || price == null)}
                            data-testid={isAvailable ? `game-${game.id}-add-button` : `game-${game.id}-notify-button`}
                            className={`inline-flex items-center gap-1.5 rounded-full px-4 h-11 text-xs sm:text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0 ${
                                isAvailable ? "bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] hover:bg-[hsl(var(--brand-blue-deep))]" : "bg-[hsl(var(--brand-red))] text-white hover:bg-[hsl(var(--brand-red-soft))]"
                            }`}>
                            {!isAvailable ? <><Bell className="w-4 h-4" /> أعلمني</> : adding ? <><Check className="w-4 h-4" /> {t("card.added")}</> : <><Plus className="w-4 h-4" /> {t("card.add")}</>}
                        </button>
                    </div>
                </div>
            </div>

            <NotifyMeDialog open={notifyOpen} onOpenChange={setNotifyOpen} game={game} />
        </article>
    );

    return (
        <>
            {mobileCard}
            {desktopCard}
        </>
    );
};
