import { ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";

export function StickyCartBar({ onOpenCart }) {
    const { totalQty, totalPrice } = useCart();
    const { format } = useCurrency();

    if (!totalQty || totalQty === 0) return null;

    const safeTotal = typeof totalPrice === "number" && !isNaN(totalPrice) ? totalPrice : 0;

    return (
        <div
            className="md:hidden fixed inset-x-0"
            style={{ zIndex: 45, bottom: "calc(58px + env(safe-area-inset-bottom, 0px))" }}
        >
            <div className="mx-3 mb-2">
                <button
                    onClick={onOpenCart}
                    className="w-full flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-white font-bold shadow-2xl active:scale-[0.98] transition-transform cursor-pointer"
                    style={{
                        background: "linear-gradient(135deg, hsl(var(--brand-blue-deep)) 0%, hsl(211 45% 20%) 100%)",
                        boxShadow: "0 8px 32px hsl(var(--brand-blue-deep) / 0.45), 0 0 0 2px hsl(var(--brand-blue) / 0.3)",
                    }}
                >
                    <div className="flex items-center gap-2.5">
                        <div className="relative">
                            <ShoppingBag className="w-5 h-5" />
                            <span className="absolute -top-2 -right-2 min-w-[16px] h-[16px] px-0.5 inline-flex items-center justify-center rounded-full bg-[hsl(var(--brand-red))] text-white text-[9px] font-bold">
                                {totalQty > 9 ? "9+" : totalQty}
                            </span>
                        </div>
                        <span className="text-sm">
                            {totalQty === 1 ? "عنصر واحد في سلتك" : `${totalQty} عناصر في سلتك`}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <span className="text-base font-extrabold">{format(safeTotal)}</span>
                        <ArrowLeft className="w-4 h-4 opacity-80" />
                    </div>
                </button>
            </div>
        </div>
    );
}
