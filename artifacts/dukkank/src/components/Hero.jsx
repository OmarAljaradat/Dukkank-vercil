import { ArrowLeft, ArrowRight, BadgeCheck, Zap, Instagram, Sparkles, Gamepad2, Flame, Star, HelpCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useLang, pickLocalized } from "../contexts/LanguageContext";
import { useStoreData } from "../contexts/DataContext";

const QUICK_JUMP_LINKS = [
    { label: "اشتراكات بلس 🎮", href: "#essential", isRoute: false },
    { label: "EA SPORTS FC ⚽", href: "#eafc25", isRoute: false },
    { label: "GTA VI 🔥", href: "#gtavi", isRoute: false },
    { label: "كل الألعاب 🎯", href: "/games", isRoute: true },
    { label: "تقييمات العملاء ⭐", href: "#reviews", isRoute: false },
    { label: "الأسئلة الشائعة ❓", href: "#faq", isRoute: false },
];

export const Hero = () => {
    const { isRTL, lang } = useLang();
    const { store, content } = useStoreData();
    const c = content?.hero || {};
    const storeName = pickLocalized(store, "name", lang);
    const Arrow = isRTL ? ArrowLeft : ArrowRight;

    return (
        <section
            id="top"
            data-testid="hero-section"
            className="relative overflow-hidden border-b border-[hsl(var(--brand-ink))]/10"
        >
            {/* Keffiyeh stripe accent */}
            <div className="absolute top-0 right-0 w-full h-2.5 keffiyeh-pattern md:hidden" />

            <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 pb-6 sm:py-24 grid md:grid-cols-2 gap-8 md:gap-12 items-center">
                {/* Text column */}
                <div className="rise space-y-4 sm:space-y-6">
                    <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-blue))]/15 border border-[hsl(var(--brand-blue))]/30 px-3.5 py-1.5 text-xs sm:text-sm font-bold text-[hsl(var(--brand-blue-deep))]">
                        <BadgeCheck className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                        <span>{c.badge || "متجر الألعاب واشتراكات بلس المعتمد"}</span>
                    </div>

                    <h1
                        className="text-3xl sm:text-5xl lg:text-6xl font-black leading-[1.15] text-[hsl(var(--brand-ink))] tracking-tight"
                        data-testid="hero-title"
                    >
                        <span className="block">{c.titleLine1 || "وفر أكثر من 60% على"}</span>
                        <span className="block text-[hsl(var(--brand-red))]">{c.titleLine2 || "اشتراكات وألعاب PlayStation"}</span>
                    </h1>

                    <p className="text-sm sm:text-lg text-[hsl(var(--brand-ink))]/75 max-w-xl leading-relaxed font-medium">
                        {c.subtitle || "تسليم فوري، حسابات أصلية 100%، وضمان ذهبي كامل طوال فترة الاشتراك مع دعم مباشر."}
                    </p>

                    {/* CTAs — touch-friendly stacked on mobile */}
                    <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
                        <a
                            href="#essential"
                            data-testid="hero-cta-browse"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-13 sm:h-12 bg-[hsl(var(--brand-ink))] text-[hsl(var(--brand-cream))] text-sm font-black hover:bg-[hsl(var(--brand-blue-deep))] transition-all active:scale-[0.98] shadow-md"
                        >
                            <span>{c.ctaBrowse || "تصفح العروض والاشتراكات"}</span>
                            <Arrow className="w-4 h-4" />
                        </a>
                        <a
                            href="https://ig.me/m/dukkank15"
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="hero-cta-instagram"
                            className="inline-flex items-center justify-center gap-2 rounded-2xl px-6 h-13 sm:h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white text-sm font-black shadow-md transition-all active:scale-[0.98] cursor-pointer"
                        >
                            <Instagram className="w-4 h-4" />
                            <span>محادثة خاصة على إنستجرام 💬</span>
                        </a>
                    </div>

                    {/* Trust badges */}
                    <div className="pt-2 grid grid-cols-3 gap-2 sm:gap-3 max-w-md">
                        {[
                            { icon: Zap, label: c.benefitInstant || "تسليم فوري ⚡" },
                            { icon: BadgeCheck, label: c.benefitOriginal || "أصلي ومضمون 100%" },
                            { icon: Instagram, label: "دعم إنستجرام مباشر" },
                        ].map((b, i) => (
                            <div
                                key={i}
                                className="rounded-2xl bg-white/80 dark:bg-white/[0.06] border border-[hsl(var(--brand-ink))]/10 p-2.5 sm:p-3 text-center shadow-2xs"
                            >
                                <b.icon className="w-4 h-4 mx-auto text-[hsl(var(--brand-red))] mb-1" />
                                <div className="text-[11px] sm:text-xs font-bold text-[hsl(var(--brand-ink))] leading-tight">
                                    {b.label}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Logo card — hidden on small mobile, visible on desktop */}
                <div className="hidden md:block relative rise">
                    <div className="absolute -inset-6 bg-[hsl(var(--brand-blue))]/20 blur-3xl rounded-full" />
                    <div className="relative card-elevated rounded-[2.5rem] bg-[hsl(var(--brand-blue))] p-8 sm:p-12 overflow-hidden shadow-2xl">
                        <div className="absolute -top-10 -left-10 w-48 h-48 keffiyeh-pattern opacity-30 rotate-12" />
                        <div className="absolute -bottom-10 -right-10 w-56 h-56 keffiyeh-pattern opacity-30 -rotate-12" />
                        <img src="/logo.png" alt={storeName} className="relative w-full max-w-sm mx-auto drop-shadow-2xl" />
                        <div className="relative mt-6 text-center">
                            <div className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--brand-cream))]/95 px-4 py-2 text-sm font-black text-[hsl(var(--brand-blue-deep))] shadow-md">
                                {storeName} • المتجر الرسمي
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* MOBILE QUICK CATEGORY PILLS (Horizontal Scroll) */}
            <div className="md:hidden border-t border-[hsl(var(--brand-ink))]/10 bg-white/60 dark:bg-black/20 py-2.5 px-4 overflow-x-auto no-scrollbar">
                <div className="flex items-center gap-2 w-max">
                    <span className="text-[11px] font-black text-[hsl(var(--brand-ink))]/60 pl-1 shrink-0">
                        ⚡ أقسام سريعة:
                    </span>
                    {QUICK_JUMP_LINKS.map((item, idx) => (
                        item.isRoute ? (
                            <Link
                                key={idx}
                                to={item.href}
                                className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-[hsl(var(--brand-ink))]/15 text-[11px] font-extrabold text-[hsl(var(--brand-ink))] shadow-2xs hover:bg-[hsl(var(--brand-blue-deep))] hover:text-white transition-all shrink-0 active:scale-95"
                            >
                                {item.label}
                            </Link>
                        ) : (
                            <a
                                key={idx}
                                href={item.href}
                                className="px-3 py-1.5 rounded-full bg-white dark:bg-white/10 border border-[hsl(var(--brand-ink))]/15 text-[11px] font-extrabold text-[hsl(var(--brand-ink))] shadow-2xs hover:bg-[hsl(var(--brand-blue-deep))] hover:text-white transition-all shrink-0 active:scale-95"
                            >
                                {item.label}
                            </a>
                        )
                    ))}
                </div>
            </div>
        </section>
    );
};
