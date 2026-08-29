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

export const Reviews = () => {
    const { reviews } = useStoreData();
    const [showReviewModal, setShowReviewModal] = useState(false);

    const sampleReviews = [
        { id: "1", name: "خالد العنزي 🇸🇦", badge: "PS5", rating: 5, text: "أفضل تجربة شحن مررت بها للتجربة والموثوقية!", item: "FIFA 25 FUT — PS5" },
        { id: "2", name: "أحمد الدوسري 🇸🇦", badge: "عميل جديد • Console", rating: 5, text: "صراحة لقيتهم عن طريق صديق ووالله ما توقعت تجربة بهالمستوى. التوصيل كان بأسرع وقت شفته.", item: "EA SPORTS FC 25" },
        { id: "3", name: "مشعل المطوع 🇰🇼", badge: "عميل مميز • Console", rating: 5, text: "أكثر من سنة وأنا أتعامل معهم ولم يخذلوني ولو مرة. الخدمة ممتازة ودعم الواتساب سريع.", item: "PlayStation Plus Deluxe 12M" },
        { id: "4", name: "خليل الهاشمي 🇦🇪", badge: "Xbox", rating: 5, text: "أفضل متجر شحن بلا منازع، الدعم الفني متعاون جداً والخدمة سريعة وممتازة.", item: "GTA VI Pre-Order" },
        { id: "5", name: "حمد آل ثاني 🇶🇦", badge: "عميل مميز • Console", rating: 5, text: "أنصح كل الناس يشتروا من هنا. سعر أقل من المنافسين بكثير وضمان استرجاع وإعادة حق لجميع الزبائن.", item: "Call of Duty: Black Ops 6" },
        { id: "6", name: "تركي السديري 🇸🇦", badge: "عميل VIP • PS5", rating: 5, text: "جربت كثير من المتاجر وهذا الأفضل بكل المقاييس. المتجر موثوق، توصيل فوري، ودعم جاهز يرد فوراً.", item: "Elden Ring Shadow of Erdtree" },
    ];

    // Filter to only display approved / visible reviews (prioritizing pinned ones for Top 6 Homepage slots)
    const approvedReviews = (reviews || []).filter(r => r.visible !== false && r.status !== "pending");
    const pinnedReviews = approvedReviews.filter(r => r.pinned);
    const unpinnedReviews = approvedReviews.filter(r => !r.pinned);
    const sortedList = [...pinnedReviews, ...unpinnedReviews];
    const displayList = (sortedList.length >= 1 ? sortedList : sampleReviews).slice(0, 6);

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

                {/* 6 Reviews Grid (3 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayList.map((r, i) => (
                        <article
                            key={r.id || i}
                            data-testid={`review-card-${i}`}
                            className="bg-white dark:bg-white/[0.04] rounded-3xl p-6 border border-[hsl(var(--brand-ink))]/10 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
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
                                    "{r.text}"
                                </p>
                            </div>

                            {/* Product Badge Pill */}
                            <div className="pt-2">
                                <span className="inline-block px-3 py-1 rounded-full bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] text-[11px] font-bold">
                                    {r.item || "شراء موثق"}
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
