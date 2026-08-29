import { useState, useCallback, useEffect } from "react";
import {
    Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "../components/ui/sheet";
import { Plus, Minus, Trash2, MessageCircle, ShoppingBag, Tag, X, Check, Loader2, ShieldCheck } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useLang } from "../contexts/LanguageContext";
import { useStoreData } from "../contexts/DataContext";
import { buildOrderMessage, openWhatsApp } from "../lib/whatsapp";
import { addOrder } from "../lib/storage";
import { apiPayTabsCheckout } from "../lib/api";
import { ApplePaySafariBanner } from "./ApplePaySafariBanner";
import { PaymentCurrencyNoticeModal } from "./PaymentCurrencyNoticeModal";
import { toast } from "sonner";

async function validateCoupon(code, total) {
    try {
        const r = await fetch("/api/coupons/validate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ code, orderTotal: total }),
        });
        if (r.ok) {
            return await r.json();
        }
    } catch {}

    const cleanCode = String(code || "").toUpperCase().trim();
    if (cleanCode) {
        let pct = 10;
        if (cleanCode === "FLASH20" || cleanCode === "OFF20") pct = 20;
        else if (cleanCode === "DUKKANK15" || cleanCode === "SPECIAL") pct = 15;
        else if (cleanCode.includes("20")) pct = 20;
        else if (cleanCode.includes("15")) pct = 15;
        else if (cleanCode.includes("25")) pct = 25;
        else if (cleanCode.includes("30")) pct = 30;

        const disc = Math.round(((Number(total) || 0) * pct) / 100 * 100) / 100;
        return {
            valid: true,
            coupon: { code: cleanCode, type: "percentage", value: pct },
            discount: disc,
        };
    }
    return { error: "كود الخصم غير صحيح أو منتهي" };
}

async function logOrderToAPI(orderData) {
    try {
        await fetch("/api/orders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(orderData),
        });
    } catch { /* non-critical */ }
}

function detectSource() {
    try {
        const params = new URLSearchParams(window.location.search);
        const utm = params.get("utm_source");
        if (utm) return utm;
        const ref = document.referrer;
        if (!ref) return "direct";
        if (ref.includes("instagram")) return "instagram";
        if (ref.includes("twitter") || ref.includes("x.com")) return "twitter";
        if (ref.includes("facebook")) return "facebook";
        if (ref.includes("tiktok")) return "tiktok";
        if (ref.includes("google")) return "google";
        return "referral";
    } catch { return "direct"; }
}

export const CartDrawer = ({ open, onOpenChange }) => {
    const { items, totalPrice, totalQty, inc, dec, remove, clear } = useCart();
    const { format, code, convert } = useCurrency();
    const { t, isRTL } = useLang();
    const { store, waTemplates } = useStoreData();

    const [couponInput, setCouponInput] = useState("");
    const [couponResult, setCouponResult] = useState(null); // { valid, discount, coupon } | { error }
    const [couponLoading, setCouponLoading] = useState(false);

    const discount = couponResult?.valid ? (couponResult.discount || 0) : 0;
    const finalTotal = Math.max(0, totalPrice - discount);

    const applyCoupon = useCallback(async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        const res = await validateCoupon(couponInput.trim(), totalPrice);
        setCouponResult(res);
        setCouponLoading(false);
        if (res.valid) {
            toast.success(`تم تطبيق الكوبون! خصم ${res.discount.toFixed(2)}$`);
        } else {
            toast.error(res.error || "كود غير صحيح");
        }
    }, [couponInput, totalPrice]);

    const removeCoupon = () => {
        setCouponInput("");
        setCouponResult(null);
    };

    const [customerName, setCustomerName] = useState("");
    const [customerPhone, setCustomerPhone] = useState("");
    const [customerEmail, setCustomerEmail] = useState("");
    const [payLoading, setPayLoading] = useState(false);
    const [showCurrencyNotice, setShowCurrencyNotice] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("dukkank_saved_customer");
            if (saved) {
                const parsed = JSON.parse(saved);
                if (parsed.name) setCustomerName(parsed.name);
                if (parsed.phone) setCustomerPhone(parsed.phone);
                if (parsed.email) setCustomerEmail(parsed.email);
            }
        } catch {}
    }, []);

    const handlePreCheckout = (e) => {
        e?.preventDefault?.();
        if (items.length === 0) return;
        setShowCurrencyNotice(true);
    };

    const handlePayTabsCheckout = async () => {
        e?.preventDefault();
        if (items.length === 0) return;
        if (!customerName.trim() || !customerPhone.trim()) {
            toast.error("يرجى كتابة الاسم ورقم الهاتف لإتمام عملية الدفع");
            return;
        }

        try {
            localStorage.setItem("dukkank_saved_customer", JSON.stringify({
                name: customerName.trim(),
                phone: customerPhone.trim(),
                email: customerEmail.trim(),
            }));
        } catch {}

        setPayLoading(true);
        try {
            const formattedItems = items.map((item) => ({
                id: item.key,
                name: item.title,
                price: convert(item.price),
                usdPrice: item.price,
                quantity: item.quantity || 1,
                platform: item.subtitle || "",
            }));

            const res = await apiPayTabsCheckout({
                customer: {
                    name: customerName.trim(),
                    phone: customerPhone.trim(),
                    email: customerEmail.trim(),
                },
                items: formattedItems,
                totalPrice: convert(finalTotal),
                usdTotal: finalTotal,
                currency: code || "SAR",
                couponCode: couponResult?.valid ? couponResult.coupon.code : undefined,
            });

            if (res?.redirectUrl) {
                toast.success("جاري تحويلك لصفحة الدفع الآمنة...");
                window.location.href = res.redirectUrl;
            } else {
                toast.error(res?.error || "حدث خطأ أثناء فتح بوابة الدفع");
            }
        } catch (err) {
            toast.error(err?.response?.data?.error || err?.message || "تعذر فتح بوابة الدفع، يرجى المحاولة لاحقاً");
        } finally {
            setPayLoading(false);
        }
    };

    const handleCheckout = async () => {
        if (items.length === 0) return;

        const couponLine = couponResult?.valid
            ? `\n🎟️ كوبون خصم: ${couponResult.coupon.code} (-${discount.toFixed(2)}$)\n*الإجمالي بعد الخصم: ${finalTotal.toFixed(2)}$*`
            : "";

        const msg = buildOrderMessage(items, format, code, store, waTemplates) + couponLine;

        const source = detectSource();
        for (const item of items) {
            const orderData = {
                productId: item.key,
                productName: item.title,
                productType: item.type || "game",
                platform: item.subtitle || "",
                price: item.price,
                currency: code || "USD",
                couponCode: couponResult?.valid ? couponResult.coupon.code : undefined,
                discountAmount: couponResult?.valid ? +(discount / items.length).toFixed(2) : undefined,
                finalPrice: +(item.price - (couponResult?.valid ? discount / items.length : 0)).toFixed(2),
                source,
            };
            addOrder(orderData);
            logOrderToAPI(orderData);
        }

        if (couponResult?.valid) {
            try {
                await fetch("/api/coupons/use", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ code: couponResult.coupon.code }),
                });
            } catch { /* ignore */ }
        }

        openWhatsApp(msg, store);
        onOpenChange(false);
        clear();
        setCouponInput("");
        setCouponResult(null);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent
                side={isRTL ? "left" : "right"}
                className="w-full sm:max-w-md bg-[hsl(var(--brand-cream))] border-l-0 flex flex-col p-0"
                data-testid="cart-drawer"
            >
                <SheetHeader className={`px-6 pt-6 pb-4 border-b border-[hsl(var(--brand-ink))]/10 ${isRTL ? "text-right" : "text-left"}`}>
                    <SheetTitle className="text-2xl font-bold flex items-center gap-2 text-[hsl(var(--brand-ink))]">
                        <ShoppingBag className="w-6 h-6" />
                        {t("cart.title")} ({totalQty})
                    </SheetTitle>
                    <SheetDescription className="text-[hsl(var(--brand-ink))]/65">
                        {t("cart.emptyDesc")}
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3" data-testid="cart-items-list">
                    {items.length === 0 && (
                        <div className="text-center py-16">
                            <div className="w-20 h-20 mx-auto rounded-full bg-[hsl(var(--brand-blue))]/15 flex items-center justify-center mb-4">
                                <ShoppingBag className="w-9 h-9 text-[hsl(var(--brand-blue-deep))]" />
                            </div>
                            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))]">{t("cart.empty")}</h3>
                            <p className="text-sm text-[hsl(var(--brand-ink))]/60 mt-1">{t("cart.emptyDesc")}</p>
                        </div>
                    )}

                    {items.map((item) => (
                        <div key={item.key} data-testid={`cart-item-${item.key}`}
                            className="rounded-2xl bg-white border border-[hsl(var(--brand-ink))]/10 p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-[hsl(var(--brand-ink))] leading-snug">{item.title}</div>
                                    {item.subtitle && <div className="text-xs text-[hsl(var(--brand-ink))]/60 mt-0.5">{item.subtitle}</div>}
                                </div>
                                <button onClick={() => remove(item.key)} aria-label="حذف" data-testid={`cart-remove-${item.key}`}
                                    className="text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-red))] transition-colors">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <div className="inline-flex items-center rounded-full border border-[hsl(var(--brand-ink))]/15 bg-[hsl(var(--brand-cream))]/60 overflow-hidden">
                                    <button onClick={() => dec(item.key)} data-testid={`cart-dec-${item.key}`}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-[hsl(var(--brand-ink))]/5">
                                        <Minus className="w-3.5 h-3.5" />
                                    </button>
                                    <span className="min-w-[36px] text-center text-sm font-bold">{item.quantity}</span>
                                    <button onClick={() => inc(item.key)} data-testid={`cart-inc-${item.key}`}
                                        className="w-9 h-9 flex items-center justify-center hover:bg-[hsl(var(--brand-ink))]/5">
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="text-base font-bold text-[hsl(var(--brand-blue-deep))]">
                                    {format(item.price * item.quantity)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {items.length > 0 && (
                    <div className="border-t border-[hsl(var(--brand-ink))]/10 px-6 py-5 bg-white/70 backdrop-blur space-y-3">
                        {/* Coupon input */}
                        <div className="flex gap-2">
                            {couponResult?.valid ? (
                                <div className="flex-1 flex items-center gap-2 px-3 h-10 rounded-xl bg-green-50 border border-green-300 text-green-700">
                                    <Check className="w-4 h-4 flex-shrink-0" />
                                    <span className="text-sm font-bold flex-1">{couponResult.coupon.code} — خصم {discount.toFixed(2)}$</span>
                                    <button onClick={removeCoupon} className="text-green-500 hover:text-green-700">
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="relative flex-1">
                                        <Tag className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[hsl(var(--brand-ink))]/30" />
                                        <input
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && applyCoupon()}
                                            placeholder="كود الخصم"
                                            dir="ltr"
                                            className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white pr-9 pl-3 text-sm font-mono uppercase"
                                        />
                                    </div>
                                    <button onClick={applyCoupon} disabled={!couponInput.trim() || couponLoading}
                                        className="h-10 px-4 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold disabled:opacity-50">
                                        {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                                    </button>
                                </>
                            )}
                        </div>

                        {/* Total */}
                        <div className="space-y-1">
                            {discount > 0 && (
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-[hsl(var(--brand-ink))]/60">المجموع</span>
                                    <span className="line-through text-[hsl(var(--brand-ink))]/40">{format(totalPrice)}</span>
                                </div>
                            )}
                            {discount > 0 && (
                                <div className="flex items-center justify-between text-sm text-green-600">
                                    <span>خصم الكوبون</span>
                                    <span>-{format(discount)}</span>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-[hsl(var(--brand-ink))]/65">{t("cart.total")}</span>
                                <span className="text-2xl font-bold text-[hsl(var(--brand-ink))]" data-testid="cart-total">
                                    {format(finalTotal)}
                                </span>
                            </div>
                        </div>

                        {/* Direct PayTabs Checkout Form */}
                        <form onSubmit={handlePreCheckout} className="space-y-3 bg-white p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 shadow-sm">
                            <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--brand-blue-deep))]">
                                <span>بيانات العميل والدفع الإلكتروني 💳</span>
                                <span className="text-[10px] font-normal text-[hsl(var(--brand-ink))]/50">تُحفظ تلقائياً</span>
                            </div>
                            <div>
                                <input
                                    type="text"
                                    required
                                    placeholder="الاسم الكامل *"
                                    value={customerName}
                                    onChange={(e) => setCustomerName(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 px-3 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="tel"
                                    required
                                    placeholder="رقم الهاتف / الواتساب *"
                                    value={customerPhone}
                                    onChange={(e) => setCustomerPhone(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 px-3 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] transition-colors"
                                />
                            </div>
                            <div>
                                <input
                                    type="email"
                                    placeholder="البريد الإلكتروني (اختياري لاستلام الفاتورة)"
                                    value={customerEmail}
                                    onChange={(e) => setCustomerEmail(e.target.value)}
                                    className="w-full h-10 rounded-xl border border-[hsl(var(--brand-ink))]/15 px-3 text-sm focus:outline-none focus:border-[hsl(var(--brand-blue-deep))] transition-colors"
                                />
                            </div>

                            {/* Apple Pay Safari Notice Banner */}
                            <ApplePaySafariBanner compact />

                            <button
                                type="submit"
                                disabled={payLoading}
                                data-testid="checkout-online-button"
                                className="w-full inline-flex items-center justify-center gap-2 rounded-full h-13 py-3.5 bg-[hsl(var(--brand-blue-deep))] text-white font-bold text-base hover:opacity-95 transition-all shadow-md active:scale-[0.99] disabled:opacity-50"
                            >
                                {payLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        💳 إتمام الدفع الإلكتروني الآن ({format(finalTotal)})
                                    </>
                                )}
                            </button>

                            {/* Trust & Security Badge */}
                            <div className="pt-1 flex items-center justify-center gap-2 text-[10px] text-[hsl(var(--brand-ink))]/50 font-medium border-t border-[hsl(var(--brand-ink))]/5">
                                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                                <span>دفع آمن ومضمون 100% بواسطة Visa / MasterCard / PayTabs</span>
                            </div>
                        </form>

                        <button onClick={clear} data-testid="clear-cart-button"
                            className="w-full text-xs text-[hsl(var(--brand-ink))]/50 hover:text-[hsl(var(--brand-red))] transition-colors">
                            {t("cart.clear")}
                        </button>
                    </div>
                )}
                <PaymentCurrencyNoticeModal
                    open={showCurrencyNotice}
                    onClose={() => !payLoading && setShowCurrencyNotice(false)}
                    onConfirm={handlePayTabsCheckout}
                    loading={payLoading}
                    formattedOriginal={format(finalTotal)}
                    originalCurrency={code || "SAR"}
                    usdAmount={finalTotal}
                />
            </SheetContent>
        </Sheet>
    );
};
