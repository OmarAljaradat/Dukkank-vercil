import { ArrowLeft, ArrowRight, BadgeCheck, Zap, Instagram } from "lucide-react";
import { quickInquiry } from "../lib/whatsapp";
import { useLang, pickLocalized } from "../contexts/LanguageContext";
import { useStoreData } from "../contexts/DataContext";

export const Hero = () => {
    const { isRTL, lang } = useLang();
    const { store, waTemplates, content } = useStoreData();
    const c = content?.hero || {};
    const storeName = pickLocalized(store, "name", lang);
    const Arrow = isRTL ? ArrowLeft : ArrowRight;
    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative overflow-hidden border-b border-[hsl(var(--brand-ink))]/10"
        >
            {/* keffiyeh stripe accent — top only on mobile, removed from sides for readability */}
            <div className="absolute top-0 right-0 w-full h-3 keffiyeh-pattern md:hidden" />

            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Text column */}
                <div className="rise">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-blue))]/15 border border-[hsl(var(--brand-blue))]/30 px-3 py-1.5 text-xs sm:text-sm font-semibold text-[hsl(var(--brand-blue-deep))] mb-5">
                        <BadgeCheck className="w-4 h-4" />
                        {c.badge}
                    </div>

                    <h1
                        className="text-[2.4rem] sm:text-5xl lg:text-6xl font-bold leading-[1.1] text-[hsl(var(--brand-ink))]"
                        data-testid="hero-title"
                    >
                        <span className="block">{c.titleLine1}</span>
                        <span className="block text-[hsl(var(--brand-red))]">{c.titleLine2}</span>
                    </h1>

                    <p className="mt-4 sm:mt-6 text-sm sm:text-lg text-[hsl(var(--brand-ink))]/70 max-w-xl leading-relaxed">
                        {c.subtitle}
                    </p>

                    {/* CTAs — stacked full-width on mobile, row on tablet+ */}
                    <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
                        <a
                            href="#essential"
                            data-testid="hero-cta-browse"
                            className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-13 sm:h-12 bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] text-sm font-bold hover:bg-[hsl(var(--brand-blue-deep))] transition-colors active:scale-[0.97]"
                        >
                            {c.ctaBrowse || "تصفح العروض"}
                            <Arrow className="w-4 h-4" />
                        </a>
                        <a
                            href="https://ig.me/m/dukkank15"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="hero-cta-instagram"
                            className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-13 sm:h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-sm font-bold shadow-md transition-all active:scale-[0.97] cursor-pointer"
                        >
                            <Instagram className="w-4 h-4" />
                            <span>تواصل عبر إنستجرام 💬</span>
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-7 sm:mt-10 grid grid-cols-3 gap-2 sm:gap-3 max-w-xs sm:max-w-lg">
                        {[
                            { icon: Zap, label: c.benefitInstant || "تسليم فوري ⚡" },
                            { icon: BadgeCheck, label: c.benefitOriginal || "حسابات أصلية 100%" },
                            { icon: Instagram, label: "دعم إنستجرام مباشر" },
                        ].map((b, i) => (
                            <div
                                key={i}
                                className="rounded-xl sm:rounded-xl bg-white/70 dark:bg-white/[0.06] border border-[hsl(var(--brand-ink))]/10 px-2 py-2.5 sm:px-3 sm:py-3 text-center"
                            >
                                <b.icon className="w-4 h-4 mx-auto text-[hsl(var(--brand-red))] mb-1" />
                                <div className="text-[11px] sm:text-sm font-semibold text-[hsl(var(--brand-ink))] leading-tight">
                                    {b.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logo card — hidden on mobile to keep CTA above fold */}
                <div className="hidden md:block relative rise">
                    <div className="absolute -inset-6 bg-[hsl(var(--brand-blue))]/20 blur-3xl rounded-full" />
                    <div className="relative card-elevated rounded-[2rem] bg-[hsl(var(--brand-blue))] p-8 sm:p-12 overflow-hidden">
                        <div className="absolute -top-10 -left-10 w-48 h-48 keffiyeh-pattern opacity-30 rotate-12" />
                        <div className="absolute -bottom-10 -right-10 w-56 h-56 keffiyeh-pattern opacity-30 -rotate-12" />
                        <img src="/logo.png" alt={storeName} className="relative w-full max-w-sm mx-auto drop-shadow-2xl" />
                        <div className="relative mt-6 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-cream))]/95 px-4 py-2 text-sm font-bold text-[hsl(var(--brand-blue-deep))]">
                                {storeName} • Dukkank
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
