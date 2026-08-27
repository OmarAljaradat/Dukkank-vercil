import { useState } from "react";
import { X, ShieldCheck, Zap, Plus, Check, Gamepad2, Heart, Share2, AlertCircle } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const TIER_LABEL_FULL = {
    four: "PS4 (Four)",
    five: "PS5 (Five)",
};

export function QuickViewModal({ open, onClose, game }) {
    if (!open || !game) return null;

    const { add } = useCart();
    const { format } = useCurrency();
    const { has: isFav, toggle: toggleFav } = useWishlist();
    const navigate = useNavigate();

    const availableTiers = ["five", "four"].filter((tier) => game[tier] != null);
    const possibleTiers  = availableTiers.length ? availableTiers : ["five", "four"];
    const [tier, setTier] = useState(possibleTiers[0]);
    const [adding, setAdding] = useState(false);

    const price = game[tier];
    const originalPrice = game.originalPrice || (price ? Math.round(price * 1.25) : null);
    const isAvailable = game.available !== false && price != null;
    const favored = isFav(game.id);

    const handleAdd = () => {
        if (!isAvailable) return;
        add({ key: `game-${game.id}-${tier}`, type: "game", title: game.name, subtitle: TIER_LABEL_FULL[tier], price });
        setAdding(true);
        toast.success("أُضيفت اللعبة إلى السلة 🛒", { description: `${game.name} (${TIER_LABEL_FULL[tier]})` });
        setTimeout(() => setAdding(false), 1200);
    };

    const handleExpressBuy = () => {
        if (!isAvailable) return;
        add({ key: `game-${game.id}-${tier}`, type: "game", title: game.name, subtitle: TIER_LABEL_FULL[tier], price });
        toast.success("جاري نقلك لتأكيد ودفع الطلب في الموقع 💳");
        onClose();
        navigate("/cart");
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 dir-rtl">
            <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
                
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 left-4 z-20 w-9 h-9 rounded-full bg-black/40 text-white hover:bg-black/60 flex items-center justify-center transition-colors backdrop-blur"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Left Side: Game Cover */}
                <div
                    className="relative w-full md:w-5/12 aspect-[3/4] md:aspect-auto flex items-center justify-center overflow-hidden"
                    style={{ background: `linear-gradient(135deg, ${game.gradientFrom || '#1e293b'} 0%, ${game.gradientTo || '#0f172a'} 100%)` }}
                >
                    {game.image ? (
                        <img src={game.image} alt={game.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                        <Gamepad2 className="text-white/90 w-24 h-24 drop-shadow-2xl" />
                    )}
                    <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
                    
                    {/* Discount Badge */}
                    <div className="absolute top-4 right-4 bg-red-600 text-white font-extrabold text-xs px-3 py-1.5 rounded-full shadow-lg border border-white/20">
                        وفر 20% 🔥
                    </div>
                </div>

                {/* Right Side: Game Details & Actions */}
                <div className="w-full md:w-7/12 p-6 sm:p-8 flex flex-col justify-between space-y-6">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))]">
                                حساب رقمي رسمي 🎮
                            </span>
                            <button
                                onClick={() => toggleFav(game.id)}
                                className={`p-2 rounded-full border transition-colors ${favored ? 'bg-red-500 text-white border-red-500' : 'text-slate-400 border-slate-200'}`}
                            >
                                <Heart className={`w-4 h-4 ${favored ? 'fill-white' : ''}`} />
                            </button>
                        </div>

                        <h2 className="text-xl sm:text-2xl font-extrabold text-[hsl(var(--brand-ink))] leading-tight" dir="ltr">
                            {game.name}
                        </h2>
                        {game.sub && <p className="text-xs text-slate-500 font-medium">{game.sub}</p>}

                        {/* Price Display with Strikethrough */}
                        <div className="flex items-baseline gap-3 pt-2">
                            <span className="text-2xl sm:text-3xl font-extrabold text-[hsl(var(--brand-red))]">
                                {format(price)}
                            </span>
                            {originalPrice && (
                                <span className="text-sm font-bold text-slate-400 line-through">
                                    {format(originalPrice)}
                                </span>
                            )}
                        </div>

                        {/* Platform Selector */}
                        <div className="space-y-1.5 pt-2">
                            <label className="text-xs font-extrabold text-slate-700 dark:text-slate-300">اختر الجهاز:</label>
                            <div className="grid grid-cols-2 gap-2">
                                {possibleTiers.map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setTier(t)}
                                        className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border-2 transition-all ${
                                            tier === t
                                                ? "border-[hsl(var(--brand-blue-deep))] bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))]"
                                                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                                        }`}
                                    >
                                        {TIER_LABEL_FULL[t]}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Guarantee Features */}
                        <div className="space-y-2 pt-2 text-xs font-bold text-slate-600 dark:text-slate-300">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <ShieldCheck className="w-4 h-4 shrink-0" />
                                <span>ضمان رسمي واستبدال فوري عند وجود خلل</span>
                            </div>
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Zap className="w-4 h-4 shrink-0" />
                                <span>متوفر للتسليم الفوري ⚡</span>
                            </div>
                        </div>
                    </div>

                    {/* Modal Buttons */}
                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <button
                            onClick={handleExpressBuy}
                            disabled={!isAvailable}
                            className="h-12 rounded-2xl bg-[hsl(var(--brand-gold))] text-[hsl(var(--brand-blue-deep))] font-extrabold text-xs sm:text-sm shadow-md hover:bg-[hsl(var(--brand-gold))]/90 flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                            <Zap className="w-4 h-4 fill-current" />
                            <span>شراء سريع ⚡</span>
                        </button>
                        <button
                            onClick={handleAdd}
                            disabled={!isAvailable}
                            className="h-12 rounded-2xl bg-[hsl(var(--brand-ink))] text-white font-extrabold text-xs sm:text-sm shadow-md hover:bg-[hsl(var(--brand-blue-deep))] flex items-center justify-center gap-1.5 active:scale-95 transition-all"
                        >
                            {adding ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                            <span>{adding ? "تمت الإضافة" : "أضف للسلة 🛒"}</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
}
