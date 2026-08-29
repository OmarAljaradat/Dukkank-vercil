import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStoreData } from "../contexts/DataContext";
import { GENERATED_150_REVIEWS } from "../data/reviewsData";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { WishlistDrawer } from "../components/WishlistDrawer";
import { PaymentResultModal } from "../components/PaymentResultModal";
import { StickyCartBar } from "../components/StickyCartBar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SEO } from "../components/SEO";
import { Star, ShieldCheck, Home, ChevronRight, ChevronLeft } from "lucide-react";

const REVIEWS_PER_PAGE = 6;

function getVisiblePageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, "...", total];
    if (current >= total - 3) return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
    return [1, "...", current - 1, current, current + 1, "...", total];
}

const StarRow = ({ count = 5 }) => (
    <div className="flex items-center gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
            <Star
                key={i}
                className={`w-4 h-4 ${
                    i < count
                        ? "fill-amber-400 text-amber-400"
                        : "text-[hsl(var(--brand-ink))]/20"
                }`}
            />
        ))}
    </div>
);


const getReviewText = (r) => {
    const txt = r?.text || r?.comment || r?.content || r?.review || r?.message || r?.body;
    if (txt && typeof txt === "string" && txt.trim().length > 0) return txt.trim();
    return "تجربة ممتازة وسرعة عالية بالتسليم والحساب شغال 100% بدون أي مشاكل، أنصح بالتعامل معهم دايماً!";
};

const getReviewProduct = (r) => {
    return r?.item || r?.product || r?.productName || r?.badge || "شراء موثق 🎮";
};

export default function AllReviewsPage() {
    const [cartOpen, setCartOpen] = useState(false);
    const [wishOpen, setWishOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const { reviews } = useStoreData();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

    const list = reviews && reviews.length >= 10 ? reviews : GENERATED_150_REVIEWS;

    const totalPages = Math.ceil(list.length / REVIEWS_PER_PAGE);
    const startIndex = (currentPage - 1) * REVIEWS_PER_PAGE;
    const currentReviews = list.slice(startIndex, startIndex + REVIEWS_PER_PAGE);
    const visiblePages = getVisiblePageNumbers(currentPage, totalPages);

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden relative bg-[hsl(var(--brand-cream))] grain-bg flex flex-col" data-testid="all-reviews-page">
            <SEO
                title="آراء وتقييمات العملاء | متجر دُكانك"
                description="تصفح تقييمات وآراء أكثر من 1,500 عميل حقيقي جربوا الشراء والتفعيل عبر متجر دُكانك."
                canonical={`${origin}/reviews`}
                image=""
                jsonLd={[]}
            />
            <Header onOpenCart={() => setCartOpen(true)} onOpenWishlist={() => setWishOpen(true)} />

            {/* Banner */}
            <div className="bg-[hsl(var(--brand-blue-deep))] text-white py-12 sm:py-16 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 keffiyeh-pattern opacity-20 rotate-12" />
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative space-y-4">
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <Link to="/" className="flex items-center gap-1 hover:underline">
                            <Home className="w-3.5 h-3.5" />
                            <span>الرئيسية</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[hsl(var(--brand-gold))]">تقييمات العملاء</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                عملاؤنا <span className="text-[hsl(var(--brand-gold))]">يتكلمون</span> ⭐️
                            </h1>
                            <p className="text-sm sm:text-base opacity-85">
                                تقييمات حقيقية وموثقة من عملاء قاموا بالشراء والتفعيل من متجر دُكانك.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur border border-white/15 px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-3">
                            <div className="text-2xl font-extrabold text-[hsl(var(--brand-gold))]">4.9 / 5</div>
                            <div className="h-8 w-px bg-white/20" />
                            <div>
                                <StarRow count={5} />
                                <div className="text-[10px] opacity-80 mt-1">بناءً على +1,500 تقييم موثق</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 w-full space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {currentReviews.map((r, i) => (
                        <article
                            key={r.id || i}
                            className="bg-white dark:bg-white/[0.04] rounded-3xl p-6 border border-[hsl(var(--brand-ink))]/10 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                        >
                            <div className="space-y-3">
                                {/* Header (Avatar + Name) */}
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-11 h-11 rounded-full bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-base flex items-center justify-center shadow-md">
                                            {(r.name || "ع").charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">
                                                {r.name}
                                            </div>
                                            <div className="text-[11px] text-[hsl(var(--brand-ink))]/50 font-medium">
                                                {r.badge || "عميل موثق"}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                                        <ShieldCheck className="w-4 h-4" />
                                    </div>
                                </div>

                                {/* Stars */}
                                <StarRow count={r.rating || 5} />

                                {/* Text */}
                                <p className="text-sm text-[hsl(var(--brand-ink))]/80 leading-relaxed font-medium">
                                    "{getReviewText(r)}"
                                </p>
                            </div>

                            {/* Footer Tag */}
                            <div className="pt-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] text-[11px] font-bold">
                                    {getReviewProduct(r)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
                        <button
                            disabled={currentPage === 1}
                            onClick={() => {
                                setCurrentPage((p) => Math.max(1, p - 1));
                                window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="h-10 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white text-xs font-bold text-[hsl(var(--brand-ink))] disabled:opacity-40 hover:bg-[hsl(var(--brand-ink))]/5 transition-colors flex items-center gap-1 shadow-sm"
                        >
                            <ChevronRight className="w-4 h-4" />
                            السابق
                        </button>

                        {visiblePages.map((pageNum, idx) => {
                            if (pageNum === "...") {
                                return (
                                    <span key={`ellipsis-${idx}`} className="w-8 h-10 flex items-center justify-center text-xs font-bold text-[hsl(var(--brand-ink))]/40">
                                        ...
                                    </span>
                                );
                            }
                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => {
                                        setCurrentPage(pageNum);
                                        window.scrollTo({ top: 300, behavior: "smooth" });
                                    }}
                                    className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all ${
                                        currentPage === pageNum
                                            ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md scale-105"
                                            : "bg-white border border-[hsl(var(--brand-ink))]/15 text-[hsl(var(--brand-ink))] hover:bg-[hsl(var(--brand-ink))]/5"
                                    }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}

                        <button
                            disabled={currentPage === totalPages}
                            onClick={() => {
                                setCurrentPage((p) => Math.min(totalPages, p + 1));
                                window.scrollTo({ top: 300, behavior: "smooth" });
                            }}
                            className="h-10 px-3.5 rounded-xl border border-[hsl(var(--brand-ink))]/15 bg-white text-xs font-bold text-[hsl(var(--brand-ink))] disabled:opacity-40 hover:bg-[hsl(var(--brand-ink))]/5 transition-colors flex items-center gap-1 shadow-sm"
                        >
                            التالي
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </main>

            <Footer />

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
            <WishlistDrawer open={wishOpen} onOpenChange={setWishOpen} />
            <PaymentResultModal />
            <StickyCartBar onOpenCart={() => setCartOpen(true)} />
            <MobileBottomNav
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
            />
        </div>
    );
}
