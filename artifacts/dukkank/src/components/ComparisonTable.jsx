import { Check, X } from "lucide-react";
import { useStoreData } from "../contexts/DataContext";

const DEFAULT_ROWS = [
    { feature: "اللعب أونلاين عبر الشبكة (Online Multiplayer)", essential: true, extra: true, deluxe: true },
    { feature: "ألعاب شهرية مجانية متجددة كل شهر", essential: true, extra: true, deluxe: true },
    { feature: "مكتبة ألعاب ضخمة (+400 لعبة كتالوج PS4 & PS5)", essential: false, extra: true, deluxe: true },
    { feature: "كتالوج ألعاب يوبي سوفت (Ubisoft+ Classics)", essential: false, extra: true, deluxe: true },
    { feature: "ألعاب استوديوهات بلايستيشن الحصرية (PlayStation Studios)", essential: false, extra: true, deluxe: true },
    { feature: "تفعيل فوري مضمون كامل فترة الاشتراك 100%", essential: true, extra: true, deluxe: true },
];

export const ComparisonTable = () => {
    const { content, subscriptions, sections } = useStoreData();
    const c = content?.comparison || {};
    const ROWS = c.rows && c.rows.length >= 4 ? c.rows : DEFAULT_ROWS;

    // Check visibility of each subscription tier in both subscriptions and sections
    const isEssVisible = (subscriptions || []).find((s) => s.id === "essential")?.visible !== false && (sections || []).find((s) => s.id === "essential")?.visible !== false;
    const isExtVisible = (subscriptions || []).find((s) => s.id === "extra")?.visible !== false && (sections || []).find((s) => s.id === "extra")?.visible !== false;
    const isDelVisible = (subscriptions || []).find((s) => s.id === "deluxe" || s.id.includes("deluxe"))?.visible !== false && (sections || []).find((s) => s.id === "deluxe")?.visible !== false;

    const activeColsCount = (isEssVisible ? 1 : 0) + (isExtVisible ? 1 : 0) + (isDelVisible ? 1 : 0);

    // If no subscription tiers are visible, hide comparison table
    if (activeColsCount === 0) return null;

    // Dynamic Tailwind Grid template based on active visible columns
    const gridClass = activeColsCount === 3
        ? "grid-cols-[1.4fr_1fr_1fr_1fr] sm:grid-cols-[1.6fr_1fr_1fr_1fr]"
        : activeColsCount === 2
        ? "grid-cols-[1.4fr_1fr_1fr] sm:grid-cols-[1.6fr_1fr_1fr]"
        : "grid-cols-[1.4fr_1fr] sm:grid-cols-[1.6fr_1fr]";

    return (
        <section
            id="comparison"
            data-testid="comparison-section"
            className="bg-[hsl(var(--brand-cream))]"
        >
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
                <div className="mb-10 max-w-3xl">
                    <div className="inline-block text-xs font-bold uppercase tracking-[0.18em] mb-3 text-[hsl(var(--brand-blue-deep))]">
                        {c.eyebrow || "مقارنة الباقات"}
                    </div>
                    <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--brand-ink))] leading-tight">
                        {c.title || "شو الفرق بين باقات الاشتراكات؟"}
                    </h2>
                    <p className="mt-3 text-base sm:text-lg text-[hsl(var(--brand-ink))]/70 leading-relaxed">
                        {c.description || "كل خطة لها نقاط قوتها — هاي مقارنة سريعة بين الباقات عشان تختار صح من أول مرة."}
                    </p>
                </div>

                <div
                    data-testid="comparison-table-wrap"
                    className="card-elevated rounded-3xl bg-white border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 mt-8 overflow-visible"
                >
                    {/* Table head */}
                    <div className={`grid ${gridClass} relative`}>
                        <div className="bg-[hsl(var(--brand-cream))]/60 px-3 sm:px-6 py-5 border-b border-[hsl(var(--brand-ink))]/10 rounded-tr-3xl">
                            <div className="text-xs font-semibold text-[hsl(var(--brand-ink))]/55 uppercase tracking-wider">
                                الميزة
                            </div>
                        </div>

                        {/* Essential Col */}
                        {isEssVisible && (
                            <div className="bg-[hsl(var(--brand-blue))]/15 px-2 sm:px-6 py-5 border-b border-[hsl(var(--brand-ink))]/10 text-center">
                                <div className="text-sm sm:text-lg font-bold text-[hsl(var(--brand-blue-deep))]">
                                    {c.essentialColLabel || "أساسي"}
                                </div>
                            </div>
                        )}

                        {/* Extra Col */}
                        {isExtVisible && (
                            <div className="bg-[hsl(var(--brand-red))]/10 px-2 sm:px-6 py-5 border-b border-[hsl(var(--brand-ink))]/10 text-center relative">
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[9px] sm:text-xs font-bold rounded-full bg-[hsl(var(--brand-red))] text-[hsl(var(--brand-cream))] px-2.5 py-1 shadow-md whitespace-nowrap z-10">
                                    🔥 {c.popularBadge || "الأكثر طلباً"}
                                </span>
                                <div className="text-sm sm:text-lg font-bold text-[hsl(var(--brand-red))] mt-0.5">
                                    {c.extraColLabel || "إضافي"}
                                </div>
                            </div>
                        )}

                        {/* Deluxe Col */}
                        {isDelVisible && (
                            <div className="bg-amber-500/10 px-2 sm:px-6 py-5 border-b border-[hsl(var(--brand-ink))]/10 text-center relative rounded-tl-3xl">
                                <span className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 text-[9px] sm:text-xs font-bold rounded-full bg-amber-500 text-white px-2.5 py-1 shadow-md whitespace-nowrap z-10">
                                    👑 الباقة الملكية
                                </span>
                                <div className="text-sm sm:text-lg font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                                    فاخر
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Rows */}
                    {ROWS.map((row, i) => (
                        <div
                            key={i}
                            data-testid={`comparison-row-${i}`}
                            className={`grid ${gridClass} ${
                                i % 2 === 0
                                    ? "bg-white"
                                    : "bg-[hsl(var(--brand-cream))]/40"
                            }`}
                        >
                            <div className="px-3 sm:px-6 py-4 sm:py-5 text-xs sm:text-base font-medium text-[hsl(var(--brand-ink))] border-b border-[hsl(var(--brand-ink))]/5">
                                {row.feature}
                            </div>

                            {/* Essential check */}
                            {isEssVisible && (
                                <div className="px-2 sm:px-6 py-4 sm:py-5 flex items-center justify-center border-b border-[hsl(var(--brand-ink))]/5">
                                    {row.essential ? (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))]">
                                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/40">
                                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Extra check */}
                            {isExtVisible && (
                                <div className="px-2 sm:px-6 py-4 sm:py-5 flex items-center justify-center border-b border-[hsl(var(--brand-ink))]/5">
                                    {row.extra ? (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--brand-red))] text-[hsl(var(--brand-cream))]">
                                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/40">
                                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                        </span>
                                    )}
                                </div>
                            )}

                            {/* Deluxe check */}
                            {isDelVisible && (
                                <div className="px-2 sm:px-6 py-4 sm:py-5 flex items-center justify-center border-b border-[hsl(var(--brand-ink))]/5">
                                    {row.deluxe !== false ? (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-500 text-white shadow-sm">
                                            <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={3} />
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/40">
                                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" strokeWidth={2.5} />
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}

                    {/* CTA row */}
                    <div className={`grid ${gridClass} bg-[hsl(var(--brand-cream))]/70 rounded-b-3xl`}>
                        <div className="px-3 sm:px-6 py-5 text-[11px] sm:text-sm text-[hsl(var(--brand-ink))]/60">
                            {c.ctaStart || "جاهز تبدأ؟"}
                        </div>

                        {isEssVisible && (
                            <div className="px-1 sm:px-4 py-5 flex items-center justify-center">
                                <a
                                    href="#essential"
                                    data-testid="comparison-cta-essential"
                                    className="inline-flex items-center justify-center rounded-full px-2.5 sm:px-5 h-9 sm:h-10 bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))] text-[11px] sm:text-sm font-bold hover:bg-[hsl(var(--brand-ink))] transition-colors"
                                >
                                    {c.ctaEssential || "اختر الأساسي"}
                                </a>
                            </div>
                        )}

                        {isExtVisible && (
                            <div className="px-1 sm:px-4 py-5 flex items-center justify-center">
                                <a
                                    href="#extra"
                                    data-testid="comparison-cta-extra"
                                    className="inline-flex items-center justify-center rounded-full px-2.5 sm:px-5 h-9 sm:h-10 bg-[hsl(var(--brand-red))] text-[hsl(var(--brand-cream))] text-[11px] sm:text-sm font-bold hover:bg-[hsl(var(--brand-red-soft))] transition-colors"
                                >
                                    {c.ctaExtra || "اختر الإضافي"}
                                </a>
                            </div>
                        )}

                        {isDelVisible && (
                            <div className="px-1 sm:px-4 py-5 flex items-center justify-center">
                                <a
                                    href="#deluxe"
                                    data-testid="comparison-cta-deluxe"
                                    className="inline-flex items-center justify-center rounded-full px-2.5 sm:px-5 h-9 sm:h-10 bg-amber-500 hover:bg-amber-600 text-white text-[11px] sm:text-sm font-bold transition-colors shadow-sm"
                                >
                                    اختر الفاخر
                                </a>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};
