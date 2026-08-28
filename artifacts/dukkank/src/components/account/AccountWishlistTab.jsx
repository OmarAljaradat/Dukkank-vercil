import { useState } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingBag, Trash2, Instagram, Gamepad2, X, Send, HelpCircle } from "lucide-react";
import { toast } from "sonner";

export default function AccountWishlistTab({ wishGames, wishCount, addToCart, removeWish, format }) {
    const [inquiryModalItem, setInquiryModalItem] = useState(null);
    const [inquiryText, setInquiryText] = useState("");

    // Fallback demo wishlist items for rich preview if list is 0
    const displayList = (wishGames && wishGames.length > 0) ? wishGames : [
        {
            id: "wish-demo-1",
            name: "EA Sports FC 26 — PS5 Edition",
            sub: "كرة قدم • تسليم فوري",
            price: 22.98,
            five: 22.98,
            image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80",
        },
        {
            id: "wish-demo-2",
            name: "PlayStation Plus Extra — 12 شهر",
            sub: "اشتراك إضافي +400 لعبة",
            price: 42.00,
            five: 42.00,
            image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
        }
    ];

    const handleSendInquiry = (e) => {
        e.preventDefault();
        if (!inquiryModalItem) return;
        window.open("https://ig.me/m/dukkank15", "_blank");
        setInquiryModalItem(null);
        setInquiryText("");
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--brand-ink))]/10">
                <div>
                    <h2 className="text-xl font-black text-[hsl(var(--brand-ink))] flex items-center gap-2">
                        <Heart className="w-5.5 h-5.5 text-red-500 fill-red-500 animate-pulse" />
                        <span>الألعاب والمنتجات المفضلة</span>
                    </h2>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium mt-0.5">
                        الألعاب والاشتراكات المحفوظة في قائمة أمنياتك للعودة إليها والشراء لاحقاً
                    </p>
                </div>

                <span className="px-3 py-1 rounded-full bg-red-500/10 text-red-600 border border-red-500/20 text-xs font-black">
                    {displayList.length} ألعاب محفوظة ❤️
                </span>
            </div>

            {/* Wishlist Cards Grid */}
            {displayList.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[hsl(var(--brand-ink))]/10 space-y-4 shadow-xs">
                    <Heart className="w-14 h-14 text-red-300 mx-auto" />
                    <div className="space-y-1">
                        <p className="font-extrabold text-base text-[hsl(var(--brand-ink))]">قائمة المفضلة فارغة حالياً</p>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/50">احفظ ألعابك واشتراكاتك المفضلة أثناء التصفح للعودة إليها ومتابعة أسعارها!</p>
                    </div>
                    <Link to="/games" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[hsl(var(--brand-blue-deep))] text-white rounded-xl text-xs font-black shadow-md hover:bg-[hsl(var(--brand-ink))] transition-colors">
                        <Gamepad2 className="w-4 h-4" />
                        <span>تصفح الألعاب الآن 🎮</span>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {displayList.map((item) => {
                        const itemPrice = item.five != null ? Number(item.five) : (item.four != null ? Number(item.four) : (item.price || 20));
                        const formattedPrice = format ? format(itemPrice) : `$${itemPrice.toFixed(2)}`;

                        return (
                            <div
                                key={item.id}
                                className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between group"
                            >
                                <div className="p-4 space-y-3.5">
                                    {/* Cover Poster Image */}
                                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-slate-950 flex items-center justify-center">
                                        {item.image ? (
                                            <img
                                                src={item.image}
                                                alt={item.name || item.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        ) : (
                                            <div className="text-center p-3">
                                                <Gamepad2 className="w-10 h-10 text-white/30 mx-auto mb-1" />
                                                <span className="text-xs text-white/70 font-bold">{item.name || item.title}</span>
                                            </div>
                                        )}

                                        {/* Remove Wish Badge Button */}
                                        <button
                                            onClick={() => {
                                                removeWish?.(item.id);
                                                toast.info("تمت إزالة اللعبة من المفضلة");
                                            }}
                                            className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/60 hover:bg-red-600 text-white flex items-center justify-center backdrop-blur transition-all shadow-md cursor-pointer"
                                            title="حذف من المفضلة"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>

                                        {/* Price Tag Pill */}
                                        <div className="absolute bottom-2.5 right-2.5 px-3 py-1 rounded-full bg-slate-900/90 text-yellow-400 text-xs font-black backdrop-blur border border-white/20 shadow-md">
                                            {formattedPrice}
                                        </div>
                                    </div>

                                    {/* Game Title & Subtext */}
                                    <div className="space-y-1">
                                        <h3 className="font-black text-sm text-[hsl(var(--brand-ink))] leading-snug group-hover:text-[hsl(var(--brand-blue-deep))] transition-colors">
                                            {item.name || item.title}
                                        </h3>
                                        <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">
                                            {item.sub || "تفعيل رقمي موثق ومضمون"}
                                        </p>
                                    </div>
                                </div>

                                {/* Action Buttons Footer */}
                                <div className="p-3 bg-[hsl(var(--brand-cream))]/60 border-t border-[hsl(var(--brand-ink))]/10 grid grid-cols-2 gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setInquiryModalItem(item)}
                                        className="h-9.5 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-90 text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-opacity cursor-pointer"
                                    >
                                        <Instagram className="w-3.5 h-3.5" />
                                        <span>استفسار 💬</span>
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            addToCart({
                                                key: `wish-${item.id}-${Date.now()}`,
                                                title: item.name || item.title,
                                                subtitle: "من المفضلة",
                                                price: itemPrice,
                                            });
                                            toast.success("تمت إضافة اللعبة للسلة! 🛒");
                                        }}
                                        className="h-9.5 rounded-xl bg-[hsl(var(--brand-blue-deep))] hover:bg-[hsl(var(--brand-ink))] text-white font-extrabold text-xs flex items-center justify-center gap-1 shadow-xs transition-colors cursor-pointer"
                                    >
                                        <ShoppingBag className="w-3.5 h-3.5" />
                                        <span>إضافة للسلة 🛒</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Custom Inquiry Modal */}
            {inquiryModalItem && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setInquiryModalItem(null)}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center absolute left-4 top-4 cursor-pointer"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-1">
                            <h3 className="font-black text-base text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-pink-600" />
                                <span>استفسار عن: {inquiryModalItem.name || inquiryModalItem.title}</span>
                            </h3>
                            <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">
                                تواصل مباشرة مع فريق الدعم الفني عبر خاص إنستجرام للاستفسار عن هذه اللعبة.
                            </p>
                        </div>

                        <div className="pt-2">
                            <a
                                href="https://ig.me/m/dukkank15"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setInquiryModalItem(null)}
                                className="w-full h-11 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-opacity cursor-pointer"
                            >
                                <Instagram className="w-4 h-4" />
                                <span>فتح خاص إنستجرام ومراسلة المتجر 💬</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
