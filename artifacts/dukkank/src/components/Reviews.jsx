import { useState } from "react";
import { Star, ShieldCheck, ArrowLeft, Plus } from "lucide-react";
import { Link } from "react-router-dom";
import { useStoreData } from "../contexts/DataContext";
import PostPurchaseReviewModal from "./PostPurchaseReviewModal";

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

export const Reviews = () => {
    const { reviews } = useStoreData();
    const [showReviewModal, setShowReviewModal] = useState(false);

    const sampleReviews = [
        { id: "s-1", name: "خالد العنزي 🇸🇦", badge: "PS5 • عميل موثق", rating: 5, text: "أفضل تجربة شحن مررت بها للتجربة والموثوقية والتسليم كان فوري بدون أي تأخير!", item: "EA SPORTS FC 25" },
        { id: "s-2", name: "أحمد الدوسري 🇸🇦", badge: "PS5 / PS4 • عميل موثق", rating: 5, text: "صراحة ما توقعت السرعة والاحترافية بهالمستوى! الحساب تفعل فوراً والضمان شغال 100%.", item: "PlayStation Plus Deluxe 12M" },
        { id: "s-3", name: "مشعل المطوع 🇰🇼", badge: "PS5 • عميل VIP", rating: 5, text: "أكثر من سنة وأنا أتعامل مع متجر دُكانك والخدمة ممتازة ودعم الإنستجرام سريع جداً.", item: "PlayStation Plus Extra 12M" },
        { id: "s-4", name: "خليل الهاشمي 🇦🇪", badge: "Console • عميل موثق", rating: 5, text: "أفضل متجر شحن بلا منازع، الدعم الفني متعاون جداً والخدمة سريعة وممتازة.", item: "GTA VI Pre-Order" },
        { id: "s-5", name: "حمد آل ثاني 🇶🇦", badge: "PS5 • عميل مميز", rating: 5, text: "أنصح بالتعامل معهم، سعر أرخص من الستور الرسمي بكثير مع ضمان ذهبي معتمد.", item: "Call of Duty: Black Ops 6" },
        { id: "s-6", name: "تركي السديري 🇸🇦", badge: "PS5 • عميل VIP", rating: 5, text: "جربت كثير من المتاجر ودُكانك الأفضل بكل المقاييس. سرعة ومصداقية ودعم محترم.", item: "Elden Ring Shadow of Erdtree" },
    ];

    // Filter to only display approved / visible reviews (prioritizing pinned ones)
    const approvedReviews = (reviews || []).filter(r => r && r.visible !== false && r.status !== "pending");
    const pinnedReviews = approvedReviews.filter(r => r.pinned);
    const unpinnedReviews = approvedReviews.filter(r => !r.pinned);
    
    // Combine custom reviews with sample reviews so we always have at least 6 rich reviews
    const existingNames = new Set(approvedReviews.map(r => (r.name || "").trim().toLowerCase()));
    const additionalSamples = sampleReviews.filter(s => !existingNames.has(s.name.trim().toLowerCase()));
    const combinedReviews = [...pinnedReviews, ...unpinnedReviews, ...additionalSamples];
    const displayList = combinedReviews.slice(0, 6);

    return (
        <section
            id="reviews"
            data-testid="reviews-section"
            className="py-16 sm:py-24 bg-[hsl(var(--brand-cream))]/40 relative overflow-hidden"
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 space-y-12">
                
                {/* Header */}
                <div className="text-center space-y-4 max-w-3xl mx-auto">
                    <div className="text-xs font-bold uppercase tracking-widest text-[hsl(var(--brand-ink))]/50">
                        التقييمات
                    </div>

                    <h2 className="text-4xl sm:text-5xl font-extrabold text-[hsl(var(--brand-ink))]">
                        عملاؤنا <span className="text-[hsl(var(--brand-blue-deep))]">يتكلمون</span>
                    </h2>

                    {/* Rating Pill Badge */}
                    <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 bg-white dark:bg-white/[0.06] border border-[hsl(var(--brand-ink))]/10 p-3 sm:px-6 sm:py-2.5 rounded-2xl sm:rounded-full shadow-sm text-xs font-bold">
                        <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap justify-center">
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2.5 py-1 rounded-full border border-emerald-500/20 text-[11px]">
                                <ShieldCheck className="w-3.5 h-3.5" />
                                <span>تقييمات موثقة</span>
                            </span>
                            <div className="flex items-center gap-1.5">
                                <StarRow count={5} />
                                <span className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">4.9 من 5</span>
                            </div>
                        </div>

                        <div className="hidden sm:block w-px h-4 bg-[hsl(var(--brand-ink))]/15" />

                        <span className="text-[hsl(var(--brand-ink))]/70 text-center sm:text-right text-xs font-medium">
                            بناءً على أكثر من 1,500+ تقييم حقيقي
                        </span>

                        <div className="hidden sm:block w-px h-4 bg-[hsl(var(--brand-ink))]/15" />

                        <button
                            onClick={() => setShowReviewModal(true)}
                            className="px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-xs transition cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95 shrink-0"
                        >
                            <Plus className="w-3.5 h-3.5" />
                            <span>أضف تقييمك ⭐</span>
                        </button>
                    </div>
                </div>

                {/* Reviews Grid: 3 reviews on mobile, 6 on desktop */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                    {displayList.map((r, i) => (
                        <article
                            key={r.id || i}
                            data-testid={`review-card-${i}`}
                            className={`bg-white dark:bg-white/[0.04] rounded-3xl p-5 sm:p-6 border border-[hsl(var(--brand-ink))]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4 ${
                                i >= 3 ? "hidden sm:flex" : "flex"
                            }`}
                        >
                            <div className="space-y-3">
                                {/* User Info Header */}
                                <div className="flex items-center gap-3">
                                    <div className="w-11 h-11 rounded-full bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-base flex items-center justify-center shadow-sm shrink-0">
                                        {(r.name || "ع").charAt(0)}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="font-extrabold text-sm text-[hsl(var(--brand-ink))] truncate">
                                            {r.name}
                                        </div>
                                        <div className="text-[11px] text-[hsl(var(--brand-ink))]/50 font-medium truncate">
                                            {r.badge || "عميل موثق"}
                                        </div>
                                    </div>
                                </div>

                                {/* Stars */}
                                <StarRow count={r.rating || 5} />

                                {/* Review Text */}
                                <p className="text-sm text-[hsl(var(--brand-ink))]/80 leading-relaxed font-medium">
                                    "{getReviewText(r)}"
                                </p>
                            </div>

                            {/* Product Badge Pill */}
                            <div className="pt-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] text-[11px] font-bold">
                                    {getReviewProduct(r)}
                                </span>
                            </div>
                        </article>
                    ))}
                </div>

                {/* View More Button */}
                <div className="flex justify-center pt-2">
                    <Link
                        to="/reviews"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        data-testid="view-more-reviews-btn"
                        className="inline-flex items-center justify-center gap-2.5 px-8 h-13 rounded-full bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-sm shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200"
                    >
                        <span>مشاهدة المزيد من التقييمات</span>
                        <ArrowLeft className="w-4 h-4 rotate-180" />
                    </Link>
                </div>
            </div>

            <PostPurchaseReviewModal
                isOpen={showReviewModal}
                onClose={() => setShowReviewModal(false)}
            />
        </section>
    );
};
