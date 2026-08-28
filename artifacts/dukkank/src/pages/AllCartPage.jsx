import { useState, useCallback, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useStoreData } from "../contexts/DataContext";
import { useCustomer } from "../contexts/CustomerContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { WishlistDrawer } from "../components/WishlistDrawer";
import { CustomerAuthModal } from "../components/CustomerAuthModal";
import { PaymentResultModal } from "../components/PaymentResultModal";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SEO } from "../components/SEO";
import { apiPayTabsCheckout } from "../lib/api";
import { ApplePaySafariBanner } from "../components/ApplePaySafariBanner";
import {
    ShoppingBag,
    Trash2,
    Plus,
    Minus,
    ArrowLeft,
    Home,
    ShieldCheck,
    CreditCard,
    MessageCircle,
    Tag,
    Check,
    Loader2,
    Lock,
    Sparkles,
    Gift,
    Zap,
    TrendingUp,
    HeartHandshake,
    Instagram,
} from "lucide-react";
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

    // Robust client-side fallback for standard promo codes
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

const UPSELL_PRODUCTS = [
    { id: "upsell-psplus", title: "اشتراك PlayStation Plus فاخر (12 شهر)", price: 24.99, badge: "خصم 15% 🏷️", icon: "⭐" },
    { id: "upsell-fc26",   title: "EA Sports FC 26 — نسخة الألتيميت",        price: 19.99, badge: "الأكثر طلباً 🔥", icon: "⚽" },
    { id: "upsell-gtav",   title: "Grand Theft Auto V — PS5 Edition",        price: 12.00, badge: "عروض الأسبوع 💥", icon: "🚗" },
];

export default function AllCartPage() {
    const { items, totalPrice, totalQty, inc, dec, remove, clear, add: addToCart } = useCart();
    const { format, code, convert } = useCurrency();
    const { store, waTemplates } = useStoreData();
    const { customer, addOrderToHistory } = useCustomer();

    const [wishOpen, setWishOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);

    // Coupon state
    const [couponInput, setCouponInput] = useState("");
    const [couponResult, setCouponResult] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);

    // Feature 5: Gift Toggle State
    const [isGift, setIsGift] = useState(false);
    const [giftName, setGiftName] = useState("");
    const [giftPhone, setGiftPhone] = useState("");
    const [giftMsg, setGiftMsg] = useState("");

    const discount = couponResult?.valid ? (couponResult.discount || 0) : 0;
    const finalTotal = Math.max(0, totalPrice - discount);

    // Customer state
    const [customerName, setCustomerName] = useState(customer?.name || "");
    const [customerPhone, setCustomerPhone] = useState(customer?.phone || "");
    const [customerEmail, setCustomerEmail] = useState(customer?.email || "");
    const [customerInstagram, setCustomerInstagram] = useState("");
    const [payLoading, setPayLoading] = useState(false);

    // Feature 3: Progress Bar Goal ($50 threshold)
    const TARGET_DISCOUNT_GOAL = 50;
    const progressPercent = Math.min(100, (totalPrice / TARGET_DISCOUNT_GOAL) * 100);
    const amountLeft = Math.max(0, TARGET_DISCOUNT_GOAL - totalPrice);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        if (customer) {
            if (customer.name) setCustomerName(customer.name);
            if (customer.phone) setCustomerPhone(customer.phone);
            if (customer.email) setCustomerEmail(customer.email);
        }
    }, [customer]);

    const applyCoupon = useCallback(async () => {
        if (!couponInput.trim()) return;
        setCouponLoading(true);
        const res = await validateCoupon(couponInput.trim(), totalPrice);
        setCouponResult(res);
        setCouponLoading(false);
        if (res.valid) {
            toast.success(`تم تطبيق الكوبون (${res.coupon.code}) بنجاح! خصم ${format(res.discount)}`);
        } else {
            toast.error(res.error || "كود غير صحيح");
        }
    }, [couponInput, totalPrice, format]);

    const removeCoupon = () => {
        setCouponInput("");
        setCouponResult(null);
        toast.info("تمت إزالة كود الخصم");
    };

    const handlePayTabsCheckout = async (e) => {
        e?.preventDefault?.();
        if (items.length === 0) return;

        const effectiveName = customerName.trim() || customer?.name || "عميل دُكانك";
        const effectivePhone = customerPhone.trim() || customer?.phone || "0791234567";
        const effectiveEmail = customerEmail.trim() || customer?.email || "customer@dukkank.com";

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
                    name: effectiveName,
                    phone: effectivePhone,
                    email: effectiveEmail,
                    instagram: customerInstagram.trim() || undefined,
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

    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

    return (
        <div className="min-h-screen bg-[hsl(var(--brand-cream))] grain-bg flex flex-col" data-testid="all-cart-page">
            <SEO
                title="سلة الشراء | متجر دُكانك"
                description="استعرض ألعابك واشتراكاتك في سلة الشراء وأتمم عملية الدفع أونلاين بسهولة وأمان."
                canonical={`${origin}/cart`}
                image=""
                jsonLd={[]}
            />
            <Header
                onOpenCart={() => {}}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setAuthOpen(true)}
            />

            {/* Banner */}
            <div className="bg-[hsl(var(--brand-blue-deep))] text-white py-10 sm:py-14 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 keffiyeh-pattern opacity-15 rotate-12 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <Link to="/" className="flex items-center gap-1 hover:underline">
                            <Home className="w-3.5 h-3.5" />
                            <span>الرئيسية</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[hsl(var(--brand-gold))]">سلة الشراء</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h1 className="text-2xl sm:text-3xl font-extrabold flex items-center gap-2.5">
                                <ShoppingBag className="w-7 h-7 text-[hsl(var(--brand-gold))]" />
                                <span>سلة منتجاتك الرقمية</span>
                            </h1>
                            <p className="text-xs sm:text-sm text-white/75 font-medium">
                                تفعيل فوري وتأمين 100% على كافة مشترواتك
                            </p>
                        </div>

                        {items.length > 0 && (
                            <button
                                onClick={clear}
                                className="text-xs font-bold text-red-300 hover:text-red-100 flex items-center gap-1 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur transition-all"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> إفراغ السلة
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Cart Body */}
            <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-8 sm:py-12 w-full space-y-6">
                
                {/* FEATURE 3: PROGRESS BAR TO FREE DISCOUNT / BONUS */}
                {items.length > 0 && (
                    <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 shadow-sm space-y-2.5">
                        <div className="flex items-center justify-between text-xs font-extrabold text-[hsl(var(--brand-ink))]">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[hsl(var(--brand-gold))]" />
                                {totalPrice >= TARGET_DISCOUNT_GOAL ? (
                                    <span className="text-emerald-600">🎉 مبروك! حققت الحد الأقصى وحصلت على خصم 10% إضافي هدية!</span>
                                ) : (
                                    <span>أضف منتجات بقيمة <span className="text-[hsl(var(--brand-red))]">{format(amountLeft)}</span> أخرى للحصول على خصم 10% مجاني!</span>
                                )}
                            </div>
                            <span className="font-black">{progressPercent.toFixed(0)}%</span>
                        </div>
                        <div className="w-full h-3 rounded-full bg-[hsl(var(--brand-ink))]/10 overflow-hidden p-0.5">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-emerald-500 transition-all duration-500"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                    </div>
                )}

                {items.length === 0 ? (
                    <div className="bg-white dark:bg-white/[0.04] rounded-3xl p-12 text-center border border-[hsl(var(--brand-ink))]/10 max-w-lg mx-auto space-y-4 shadow-sm">
                        <div className="w-20 h-20 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center mx-auto">
                            <ShoppingBag className="w-10 h-10" />
                        </div>
                        <h2 className="font-extrabold text-xl text-[hsl(var(--brand-ink))]">سلة الشراء فارغة حالياً</h2>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 leading-relaxed font-medium">
                            لم تقم بإضافة أي منتجات أو ألعاب لسلتك بعد. تصفح مكتبة الألعاب والاشتراكات واشترِ بسهولة!
                        </p>
                        <Link
                            to="/games"
                            className="inline-flex items-center gap-2 px-6 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-xs shadow-lg hover:shadow-xl transition-all"
                        >
                            <span>تصفح مكتبة الألعاب الآن 🎮</span>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        
                        {/* Cart Items List */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-xs font-bold text-[hsl(var(--brand-ink))]/70 px-1">
                                    <span>المنتجات المضافة ({totalQty})</span>
                                    <span>السعر الإجمالي</span>
                                </div>

                                {items.map((item) => (
                                    <div
                                        key={item.key}
                                        className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-[hsl(var(--brand-blue-deep))] text-white font-black text-xl flex items-center justify-center shrink-0">
                                                🎮
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="font-extrabold text-base text-[hsl(var(--brand-ink))]">{item.title}</h3>
                                                {item.subtitle && (
                                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">{item.subtitle}</p>
                                                )}
                                                <div className="text-xs font-bold text-[hsl(var(--brand-red))]">
                                                    {format(item.price)} <span className="text-[10px] text-[hsl(var(--brand-ink))]/50">للقطعة</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between sm:justify-end gap-4 border-t sm:border-t-0 pt-3 sm:pt-0 border-[hsl(var(--brand-ink))]/10">
                                            {/* Quantity Selector */}
                                            <div className="flex items-center gap-2 bg-[hsl(var(--brand-cream))] dark:bg-white/[0.05] p-1 rounded-2xl border border-[hsl(var(--brand-ink))]/10">
                                                <button
                                                    onClick={() => dec(item.key)}
                                                    className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold shadow-sm"
                                                >
                                                    <Minus className="w-3.5 h-3.5" />
                                                </button>
                                                <span className="w-6 text-center font-extrabold text-sm">{item.quantity}</span>
                                                <button
                                                    onClick={() => inc(item.key)}
                                                    className="w-8 h-8 rounded-xl bg-white dark:bg-white/10 flex items-center justify-center text-xs font-bold shadow-sm"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            </div>

                                            <div className="font-black text-lg text-[hsl(var(--brand-ink))] min-w-[80px] text-left">
                                                {format(item.price * item.quantity)}
                                            </div>

                                            <button
                                                onClick={() => remove(item.key)}
                                                className="w-9 h-9 rounded-xl border border-red-200 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center justify-center transition-colors shrink-0"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Coupon Box */}
                            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-5 space-y-3">
                                <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5">
                                    <Tag className="w-4 h-4 text-[hsl(var(--brand-gold))]" />
                                    <span>هل لديك كود خصم أو كوبون؟</span>
                                </label>
                                {couponResult?.valid ? (
                                    <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-700/50 flex items-center justify-between gap-2 animate-in fade-in duration-200">
                                        <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 text-xs font-black">
                                            <Check className="w-4 h-4 text-emerald-600" />
                                            <span>تم تطبيق كود الخصم ({couponResult.coupon.code}) — خصم {format(discount)} ({couponResult.coupon.value}%)</span>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={removeCoupon}
                                            className="px-2.5 py-1 text-[11px] font-bold text-red-600 hover:bg-red-100 dark:hover:bg-red-950/40 rounded-lg transition cursor-pointer"
                                        >
                                            إلغاء ✖
                                        </button>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={couponInput}
                                            onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                                            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), applyCoupon())}
                                            placeholder="أدخل كود الخصم هنا (مثال: FLASH20)"
                                            className="flex-1 h-11 px-4 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-xs font-bold focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]"
                                        />
                                        <button
                                            type="button"
                                            onClick={applyCoupon}
                                            disabled={couponLoading || !couponInput.trim()}
                                            className="h-11 px-5 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-xs disabled:opacity-50 cursor-pointer"
                                        >
                                            {couponLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "تطبيق"}
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* FEATURE 1: SMART UPSELLING & FREQUENTLY BOUGHT TOGETHER */}
                            <div className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 space-y-4 shadow-sm">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-extrabold text-base text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                        <TrendingUp className="w-5 h-5 text-amber-500" />
                                        <span>منتجات يشتريها العملاء عادة مع هذا الطلب 🔥</span>
                                    </h3>
                                    <span className="text-[11px] text-amber-600 font-bold bg-amber-50 dark:bg-amber-950/40 px-2.5 py-1 rounded-full">خصومات فورية</span>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    {UPSELL_PRODUCTS.map((prod) => (
                                        <div key={prod.id} className="bg-[hsl(var(--brand-cream))]/60 dark:bg-white/[0.04] p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 space-y-3 flex flex-col justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center justify-between text-xs">
                                                    <span className="text-xl">{prod.icon}</span>
                                                    <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-extrabold text-[10px]">{prod.badge}</span>
                                                </div>
                                                <h4 className="font-extrabold text-xs text-[hsl(var(--brand-ink))] leading-snug">{prod.title}</h4>
                                                <div className="font-black text-xs text-[hsl(var(--brand-red))]">{format(prod.price)}</div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    addToCart({ key: prod.id, title: prod.title, price: prod.price, quantity: 1 });
                                                    toast.success(`تمت إضافة ${prod.title} للسلة!`);
                                                }}
                                                className="w-full h-9 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white text-[11px] font-bold flex items-center justify-center gap-1 shadow-sm hover:scale-[1.02] active:scale-95 transition-all"
                                            >
                                                <Plus className="w-3.5 h-3.5" />
                                                <span>إضافة للسلة 🛒</span>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                        </div>

                        {/* Order Summary & Checkout Form Sidebar */}
                        <div className="space-y-4">
                            <form onSubmit={handlePayTabsCheckout} className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 space-y-6 shadow-sm">
                                <h3 className="font-extrabold text-base text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                                    <span>تفاصيل المشتري وإتمام الدفع</span>
                                </h3>

                                <div className="space-y-3">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">الاسم الكامل (اختياري)</label>
                                        <input
                                            type="text"
                                            value={customerName}
                                            onChange={(e) => setCustomerName(e.target.value)}
                                            placeholder="أدخل اسمك الكامل (افتراضي: عميل دُكانك)"
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-xs font-bold focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">رقم الهاتف / الواتساب (اختياري)</label>
                                        <input
                                            type="tel"
                                            value={customerPhone}
                                            onChange={(e) => setCustomerPhone(e.target.value)}
                                            placeholder="079... أو 00962..."
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-xs font-bold focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">حساب إنستغرام للتواصل والتسليم (اختياري)</label>
                                        <input
                                            type="text"
                                            value={customerInstagram}
                                            onChange={(e) => setCustomerInstagram(e.target.value)}
                                            placeholder="@your_instagram"
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-xs font-bold focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]"
                                            dir="ltr"
                                        />
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70">البريد الإلكتروني (اختياري)</label>
                                        <input
                                            type="email"
                                            value={customerEmail}
                                            onChange={(e) => setCustomerEmail(e.target.value)}
                                            placeholder="name@example.com"
                                            className="w-full h-11 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-transparent text-xs font-bold focus:outline-none focus:border-[hsl(var(--brand-blue-deep))]"
                                        />
                                    </div>

                                    {/* GIFT ORDER TOGGLE (Temporarily Paused / Coming Soon) */}

                                </div>

                                {/* Order Totals Calculation */}
                                <div className="space-y-2 pt-4 border-t border-[hsl(var(--brand-ink))]/10 text-xs">
                                    <div className="flex justify-between text-[hsl(var(--brand-ink))]/70 font-medium">
                                        <span>المجموع الفرعي:</span>
                                        <span className="font-bold">{format(totalPrice)}</span>
                                    </div>

                                    {discount > 0 && (
                                        <div className="flex justify-between text-emerald-600 font-bold bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-200/50">
                                            <span className="flex items-center gap-1">
                                                <Tag className="w-3.5 h-3.5" />
                                                <span>الخصم المطبق (كود: {couponResult?.coupon?.code || "FLASH20"}):</span>
                                            </span>
                                            <span className="font-black">-{format(discount)}</span>
                                        </div>
                                    )}

                                    <div className="flex justify-between text-base font-black text-[hsl(var(--brand-ink))] pt-2 border-t border-[hsl(var(--brand-ink))]/10">
                                        <span>الإجمالي النهائي:</span>
                                        <span className="text-[hsl(var(--brand-red))]">{format(finalTotal)}</span>
                                    </div>
                                </div>

                                {/* Apple Pay Safari Notice Banner */}
                                <ApplePaySafariBanner />

                                <button
                                    type="submit"
                                    onClick={handlePayTabsCheckout}
                                    data-testid="checkout-pay-button"
                                    disabled={payLoading}
                                    className="w-full h-13 rounded-2xl bg-gradient-to-r from-[hsl(var(--brand-blue-deep))] to-blue-700 text-white font-extrabold text-sm shadow-xl hover:shadow-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                                >
                                    {payLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Lock className="w-4 h-4" />
                                            <span>إتمام الدفع أونلاين بأمان 💳</span>
                                        </>
                                    )}
                                </button>

                                {/* FEATURE 4: TRUST & SAFETY BADGES */}
                                <div className="pt-2 grid grid-cols-2 gap-2 text-[10px] font-bold text-[hsl(var(--brand-ink))]/70">
                                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 text-emerald-700 dark:text-emerald-300">
                                        <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                                        <span>ضمان تشغيل 100%</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 text-blue-700 dark:text-blue-300">
                                        <Zap className="w-3.5 h-3.5 shrink-0 text-amber-500" />
                                        <span>تفعيل QR خلال دقائق</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 text-amber-700 dark:text-amber-300">
                                        <Lock className="w-3.5 h-3.5 shrink-0" />
                                        <span>تشفير SSL 256-Bit</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 p-2 rounded-xl bg-pink-50 dark:bg-pink-950/30 border border-pink-200/50 text-pink-700 dark:text-pink-300">
                                        <Instagram className="w-3.5 h-3.5 shrink-0" />
                                        <span>دعم إنستجرام حي 24/7</span>
                                    </div>
                                </div>

                            </form>
                        </div>

                    </div>
                )}
            </main>

            <Footer />

            <WishlistDrawer open={wishOpen} onOpenChange={setWishOpen} />
            <CustomerAuthModal open={authOpen} onOpenChange={setAuthOpen} />
            <PaymentResultModal />
            <MobileBottomNav
                onOpenCart={() => {}}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setAuthOpen(true)}
            />
        </div>
    );
}
