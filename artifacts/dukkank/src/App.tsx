import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster } from "sonner";
import { CartProvider } from "./contexts/CartContext";
import { CurrencyProvider } from "./contexts/CurrencyContext";
import { DataProvider, useStoreData } from "./contexts/DataContext";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { WishlistProvider } from "./contexts/WishlistContext";
import { Header } from "./components/Header";
import { MobileBottomNav } from "./components/MobileBottomNav";
import { StickyCartBar } from "./components/StickyCartBar";
import { Hero } from "./components/Hero";
import { Ticker } from "./components/Ticker";
import { SubscriptionCard } from "./components/SubscriptionCard";
import { PsPlusPricingTable } from "./components/PsPlusPricingTable";
import { GameCard } from "./components/GameCard";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { ComparisonTable } from "./components/ComparisonTable";
import { Reviews } from "./components/Reviews";
import { FAQ } from "./components/FAQ";
import { Bundles } from "./components/Bundles";
import { BundleBuilder } from "./components/BundleBuilder";
import { Recommender } from "./components/Recommender";
import { CompareButton } from "./components/GameCompare";
import { PromoBanner } from "./components/PromoBanner";
import { FlashSaleBanner } from "./components/FlashSaleBanner";
import { ApplePaySafariBanner } from "./components/ApplePaySafariBanner";
import { OfferPopupModal } from "./components/OfferPopupModal";
import { SocialProofToast } from "./components/SocialProofToast";
import { EmailSignup } from "./components/EmailSignup";
import { HomeSkeleton } from "./components/Skeletons";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { GamesGrid } from "./components/GamesGrid";
import { lazy, Suspense } from "react";
import { SEO } from "./components/SEO";
import { MaintenanceOverlay } from "./components/MaintenanceOverlay";
import ErrorBoundary from "./components/ErrorBoundary";
import { HowItWorks } from "./components/HowItWorks";
import { AboutStore } from "./components/AboutStore";
import { GoldenGuarantee } from "./components/GoldenGuarantee";
import { PaymentResultModal } from "./components/PaymentResultModal";
import { CustomerProvider } from "./contexts/CustomerContext";

// Lazy-loaded heavy sections and pages for bundle optimization & fast loading
const GTAVISection = lazy(() => import("./components/GTAVISection").then(m => ({ default: m.GTAVISection })));
const EAFCSection = lazy(() => import("./components/EAFCSection").then(m => ({ default: m.EAFCSection })));
const CustomerAuthModal = lazy(() => import("./components/CustomerAuthModal").then(m => ({ default: m.CustomerAuthModal })));

const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AllGamesPage = lazy(() => import("./pages/AllGamesPage"));
const AllReviewsPage = lazy(() => import("./pages/AllReviewsPage"));
const AllAccountPage = lazy(() => import("./pages/AllAccountPage"));
const AllCartPage = lazy(() => import("./pages/AllCartPage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const PoliciesPage = lazy(() => import("./pages/PoliciesPage"));

import { FloatingWhatsApp } from "./components/FloatingWhatsApp";
import { MessageCircle } from "lucide-react";
import { quickInquiry } from "./lib/whatsapp";
import { useVisitorHeartbeat } from "./hooks/useVisitorHeartbeat";

import { applyTheme, getTheme, getSeo } from "./lib/storage";
import { LaunchAnnouncement, LaunchHeroBanner } from "./components/LaunchAnnouncement";

// Decides which launch section to render based on admin-selected theme
function GameLaunchSwitch() {
    const { launchAnnouncement } = useStoreData() as any;
    if (!launchAnnouncement || launchAnnouncement.enabled === false) return null;
    const theme = launchAnnouncement?.theme;

    return (
        <ErrorBoundary>
            <Suspense fallback={<div className="h-64 bg-black/5 animate-pulse rounded-2xl my-4" />}>
                <div className="relative">
                    {theme === "vice" ? (
                        <GTAVISection />
                    ) : theme === "eafc" ? (
                        <EAFCSection />
                    ) : (
                        <LaunchHeroBanner />
                    )}
                    {/* Hazard Caution Striped Separator Line */}
                    <div
                        className="w-full h-4 sm:h-5 relative z-20 shadow-md border-y border-red-950/40 pointer-events-none select-none"
                        style={{
                            backgroundImage: `repeating-linear-gradient(
                                -45deg,
                                #b91c1c 0px,
                                #b91c1c 16px,
                                #faf3e0 16px,
                                #faf3e0 32px
                            )`,
                        }}
                    />
                </div>
            </Suspense>
        </ErrorBoundary>
    );
}

const SECTION_RENDERERS: Record<string, any> = {
    hero: () => <Hero />,
    gamelaunch: ({ ...props }: any) => <GameLaunchSwitch />,
    recommender: () => <Recommender />,
    essential: ({ subscriptions, content }: any) => {
        const essential = subscriptions.find((s: any) => s.id === "essential");
        if (!essential || essential.visible === false) return null;
        const c = content.essential || {};
        return (
            <section id="essential" data-testid="essential-section" className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
                <SectionHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 stagger">
                    <SubscriptionCard sub={essential} />
                    <FeatureHighlight title={c.featureTitle} bullets={c.featureBullets || []} />
                </div>
            </section>
        );
    },
    extra: ({ subscriptions, content }: any) => {
        const extra = subscriptions.find((s: any) => s.id === "extra");
        if (!extra || extra.visible === false) return null;
        const c = content.extra || {};
        return (
            <section id="extra" data-testid="extra-section" className="bg-white/60 border-y border-[hsl(var(--brand-ink))]/10">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
                    <SectionHeader eyebrow={c.eyebrow} title={c.title} description={c.description} accent="red" />
                    <div className="grid md:grid-cols-2 gap-6 sm:gap-8 stagger">
                        <FeatureHighlight title={c.featureTitle} bullets={c.featureBullets || []} accent="red" />
                        <SubscriptionCard sub={extra} />
                    </div>
                </div>
            </section>
        );
    },
    deluxe: ({ subscriptions, content }: any) => {
        let deluxe = subscriptions.find((s: any) => s.id === "deluxe" || s.id.includes("deluxe"));
        if (!deluxe) {
            deluxe = {
                id: "deluxe",
                name: "اشتراك فاخر (Deluxe)",
                tagline: "الباقة الملكية والشاملة لكافة الألعاب الكلاسيكية والتجريبية",
                accent: "amber",
                visible: true,
                durations: [
                    { id: "del-1m",  label: "شهر واحد",  four: 11, five: 16.0 },
                    { id: "del-3m",  label: "٣ شهور",    four: 22, five: 33.0 },
                    { id: "del-12m", label: "سنة كاملة", four: 49, five: 69.0 },
                ],
            };
        }
        if (deluxe.visible === false) return null;
        const c = content.deluxe || {};
        return (
            <section id="deluxe" data-testid="deluxe-section" className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
                <SectionHeader
                    eyebrow={c.eyebrow || "الاشتراكات"}
                    title={c.title || deluxe.name}
                    description={c.description || deluxe.tagline || "للاعب المستعد لتجربة كافة الألعاب الكلاسيكية والتجريبية قبل الشراء وبأفضل الأداء."}
                    accent="amber"
                />
                <div className="grid md:grid-cols-2 gap-6 sm:gap-8 stagger">
                    <SubscriptionCard sub={deluxe} />
                    <FeatureHighlight
                        title={c.featureTitle || `ليش ${deluxe.name}؟`}
                        bullets={c.featureBullets || [
                            "جميع مميزات باقتي Essential و Extra بالكامل",
                            "مكتبة ألعاب كلاسيكية عريقة (PS1, PS2, PSP)",
                            "تجربة الألعاب الضخمة الجديدة قبل الشراء (Trials)",
                            "أولوية السيرفرات السريعة والدعم الفني الذهبي"
                        ]}
                        accent="amber"
                    />
                </div>
            </section>
        );
    },
    comparison: () => <ComparisonTable />,
    bundles: () => <Bundles />,
    bundleBuilder: () => <BundleBuilder />,
    games: ({ games, store, waTemplates, content }: any) => {
        const c = content.games || {};
        return (
            <section id="games" data-testid="games-section" className="bg-white/60 border-y border-[hsl(var(--brand-ink))]/10">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20">
                    <div className="mb-8 sm:mb-12">
                        <SectionHeader eyebrow={c.eyebrow} title={c.title} description={c.description} />
                    </div>
                    <GamesGrid games={games} />
                    <div className="mt-12 rounded-3xl bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))] p-8 sm:p-12 relative overflow-hidden">
                        <div className="absolute -top-8 -right-8 w-44 h-44 keffiyeh-pattern opacity-30 rotate-12" />
                        <div className="relative grid md:grid-cols-[1fr_auto] items-center gap-6">
                            <div>
                                <h3 className="text-2xl sm:text-3xl font-bold leading-tight">{c.customGameTitle}</h3>
                                <p className="opacity-85 mt-2 text-sm sm:text-base">{c.customGameSubtitle}</p>
                            </div>
                            <button
                                onClick={() => quickInquiry("لعبة مخصصة بطلب عميل", store, waTemplates)}
                                className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 bg-[#25D366] text-white font-semibold hover:bg-[#1DA851] transition-colors w-fit"
                            >
                                <MessageCircle className="w-4 h-4 wa-pulse" />
                                {c.customGameCta}
                            </button>
                        </div>
                    </div>
                </div>
            </section>
        );
    },
    reviews: () => <Reviews />,
    emailSignup: () => <EmailSignup />,
    faq: () => <FAQ />,
    howItWorks: () => <HowItWorks />,
    goldenGuarantee: () => <GoldenGuarantee />,
    aboutStore: () => <AboutStore />,
};

function HomePage() {
    const [cartOpen, setCartOpen] = useState(false);
    const [wishOpen, setWishOpen] = useState(false);
    const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
    const { subscriptions, games, store, sections, waTemplates, content, loading } = useStoreData() as any;

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const p = params.get("p");
        if (p && p.startsWith("game-")) {
            const id = p.slice(5);
            setTimeout(() => {
                const el = document.getElementById(`game-${id}`);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "center" });
                    el.style.transition = "box-shadow 0.5s ease";
                    el.style.boxShadow = "0 0 0 4px hsl(var(--brand-red) / 0.6)";
                    setTimeout(() => { el.style.boxShadow = ""; }, 2200);
                }
            }, 800);
        }
    }, []);

    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";
    const heroDesc = content?.hero?.subtitle || "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.";
    const homeTitle = `${store?.name || "دُكانك"} | متجر الاشتراكات والألعاب الرقمية`;

    if (loading && games?.length === 0) {
        return (
            <div className="min-h-screen bg-[hsl(var(--brand-cream))] grain-bg" data-testid="app-root">
                <SEO title={homeTitle} description={heroDesc} canonical={origin} image="" jsonLd={[]} />
                <Header onOpenCart={() => setCartOpen(true)} onOpenWishlist={() => setWishOpen(true)} onOpenCustomerAuth={() => setCustomerAuthOpen(true)} />
                <HomeSkeleton />
                <Footer />
            </div>
        );
    }

    const rawSections = (sections || []);
    const REMOVED_IDS = ["bundles", "bundleBuilder", "recommender", "emailSignup", "promoBanner"];
    const heroSec = rawSections.find((s: any) => s.id === "hero");
    const isHeroVisible = heroSec ? heroSec.visible !== false : true;

    // Check visibility across both sections and subscriptions
    let visibleSections = rawSections.filter((s: any) => {
        if (s.visible === false) return false;
        if (s.id === "hero" || REMOVED_IDS.includes(s.id)) return false;
        if (s.id === "essential" && (subscriptions || []).find((sub: any) => sub.id === "essential")?.visible === false) return false;
        if (s.id === "extra" && (subscriptions || []).find((sub: any) => sub.id === "extra")?.visible === false) return false;
        if (s.id === "deluxe" && (subscriptions || []).find((sub: any) => sub.id === "deluxe" || sub.id.includes("deluxe"))?.visible === false) return false;
        return true;
    });

    // Ensure Deluxe section is present and positioned right after Extra if Extra exists
    const hasDeluxeSub = (subscriptions || []).find((sub: any) => sub.id === "deluxe" || sub.id.includes("deluxe"))?.visible !== false;
    const hasDeluxeSec = rawSections.find((s: any) => s.id === "deluxe")?.visible !== false;
    if (hasDeluxeSub && hasDeluxeSec) {
        if (!visibleSections.some((s: any) => s.id === "deluxe")) {
            const extraIdx = visibleSections.findIndex((s: any) => s.id === "extra");
            if (extraIdx !== -1) {
                visibleSections.splice(extraIdx + 1, 0, { id: "deluxe", visible: true });
            } else {
                visibleSections.push({ id: "deluxe", visible: true });
            }
        }
    }

    return (
        <div className="min-h-screen bg-[hsl(var(--brand-cream))] grain-bg" data-testid="app-root">
            <SEO title={homeTitle} description={heroDesc} canonical={origin} image="" jsonLd={[]} />
            <PromoBanner />
            <Header onOpenCart={() => setCartOpen(true)} onOpenWishlist={() => setWishOpen(true)} onOpenCustomerAuth={() => setCustomerAuthOpen(true)} />
            {isHeroVisible && <Hero />}
            <FlashSaleBanner />
            <div className="max-w-7xl mx-auto px-4 sm:px-8">
                <ApplePaySafariBanner />
            </div>
            <Ticker />
            {visibleSections.map((s: any) => {
                const Renderer = SECTION_RENDERERS[s.id];
                if (!Renderer) return null;
                return (
                    <Renderer
                        key={s.id}
                        subscriptions={subscriptions}
                        games={games}
                        store={store}
                        waTemplates={waTemplates}
                        content={content}
                    />
                );
            })}

            {/* Custom subscriptions created by admin (only visible ones) */}
            {(subscriptions || [])
                .filter((s: any) => s.id !== "essential" && s.id !== "extra" && s.id !== "deluxe" && s.visible !== false && !s.hidden)
                .map((sub: any) => (
                    <section key={sub.id} id={`sub-${sub.id}`} className="max-w-7xl mx-auto px-5 sm:px-8 py-14 sm:py-20 border-t border-[hsl(var(--brand-ink))]/10">
                        <SectionHeader
                            eyebrow="خطة اشتراك مخصصة ✨"
                            title={sub.name}
                            description={sub.tagline || "خطة اشتراك مخصصة للتفعيل الفوري بأفضل أسعار السوق."}
                            accent={sub.accent === "amber" || sub.accent === "yellow" ? "amber" : sub.accent === "red" ? "red" : "blue"}
                        />
                        <div className="grid md:grid-cols-2 gap-6 sm:gap-8 stagger">
                            <SubscriptionCard sub={sub} />
                            <FeatureHighlight
                                title={`ليش ${sub.name}؟`}
                                bullets={[
                                    "أفضل الأسعار للتفعيل الفوري عبر متجر دُكانك",
                                    "ضمان كامل 100% طوال فترة الاشتراك",
                                    "دعم فني وتواصل مباشر 24/7 عبر الواتساب"
                                ]}
                                accent={sub.accent === "amber" || sub.accent === "yellow" ? "amber" : sub.accent === "red" ? "red" : "blue"}
                            />
                        </div>
                    </section>
                ))}
            <Footer />
            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
            <WishlistDrawer open={wishOpen} onOpenChange={setWishOpen} />
            <ErrorBoundary>
                <Suspense fallback={null}>
                    <CustomerAuthModal open={customerAuthOpen} onOpenChange={setCustomerAuthOpen} />
                </Suspense>
            </ErrorBoundary>
            <PaymentResultModal />
            <OfferPopupModal />
            <SocialProofToast />
            {/* Sticky cart bar — shows above bottom nav when cart has items */}
            <StickyCartBar onOpenCart={() => setCartOpen(true)} />
            {/* Interactive Floating WhatsApp Live Chat */}
            <FloatingWhatsApp />
            {/* Mobile bottom navigation */}
            <MobileBottomNav
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
            />
        </div>
    );
}

function SiteGuards({ children }: { children: React.ReactNode }) {
    const { siteSettings } = useStoreData();
    const location = useLocation();

    useEffect(() => {
        const disableSelection = !!(siteSettings as any)?.disableTextSelection;
        const onAdmin = location.pathname.startsWith("/admin");
        document.body.classList.toggle("no-select", disableSelection && !onAdmin);
        if (disableSelection && !onAdmin) {
            const stopCtx = (e: Event) => { e.preventDefault(); };
            const stopKey = (e: KeyboardEvent) => {
                if (!e.ctrlKey && !e.metaKey) return;
                const t = e.target as HTMLElement;
                if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
                if (["c","C","x","X","u","U","s","S","a","A"].includes(e.key)) e.preventDefault();
            };
            document.addEventListener("contextmenu", stopCtx);
            document.addEventListener("keydown", stopKey);
            return () => {
                document.removeEventListener("contextmenu", stopCtx);
                document.removeEventListener("keydown", stopKey);
                document.body.classList.remove("no-select");
            };
        }
        return undefined;
    }, [(siteSettings as any)?.disableTextSelection, location.pathname]);

    const maint = (siteSettings as any)?.maintenanceMode || {};
    const onAdmin = location.pathname.startsWith("/admin");
    const hasAdminToken = typeof window !== "undefined" && !!localStorage.getItem("dukkank_admin_token");
    const showMaint = maint.enabled && !onAdmin && !hasAdminToken;

    return (
        <>
            {children}
            {showMaint && <MaintenanceOverlay title={maint.title} message={maint.message} estimatedReturn={maint.estimatedReturn} />}
        </>
    );
}

const SectionHeader = ({ eyebrow, title, description, accent = "blue" }: any) => (
    <div className="mb-8 sm:mb-12 max-w-3xl">
        <div className={`inline-block text-xs font-bold uppercase tracking-[0.18em] mb-3 ${accent === "red" ? "text-[hsl(var(--brand-red))]" : "text-[hsl(var(--brand-blue-deep))]"}`}>
            {eyebrow}
        </div>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[hsl(var(--brand-ink))] leading-tight">{title}</h2>
        {description && <p className="mt-3 text-base sm:text-lg text-[hsl(var(--brand-ink))]/70 leading-relaxed">{description}</p>}
    </div>
);

const FeatureHighlight = ({ title, bullets, accent = "blue" }: any) => (
    <div className={`rounded-2xl border-2 border-dashed p-7 sm:p-8 flex flex-col justify-center ${
        accent === "red"
            ? "border-[hsl(var(--brand-red))]/30 bg-[hsl(var(--brand-red))]/5"
            : accent === "amber" || accent === "yellow"
            ? "border-amber-500/40 bg-amber-500/5"
            : "border-[hsl(var(--brand-blue))]/30 bg-[hsl(var(--brand-blue))]/5"
    }`}>
        <h3 className="text-xl sm:text-2xl font-bold text-[hsl(var(--brand-ink))] mb-4">{title}</h3>
        <ul className="space-y-3">
            {bullets.map((b: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-[hsl(var(--brand-ink))]/80">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${
                        accent === "red"
                            ? "bg-[hsl(var(--brand-red))]"
                            : accent === "amber" || accent === "yellow"
                            ? "bg-amber-500"
                            : "bg-[hsl(var(--brand-blue-deep))]"
                    }`} />
                    <span>{b}</span>
                </li>
            ))}
        </ul>
    </div>
);

function VisitorTracker() {
    useVisitorHeartbeat();
    return null;
}

function ThemeAndSeoLoader() {
    const { theme: storeTheme } = useStoreData();

    useEffect(() => {
        if (storeTheme && typeof storeTheme === "object" && Object.keys(storeTheme).length > 0) {
            applyTheme(storeTheme);
        } else {
            const saved = getTheme();
            if (saved && typeof saved === "object" && Object.keys(saved).length > 0) {
                applyTheme(saved);
            }
        }
    }, [storeTheme]);

    useEffect(() => {
        const handleThemeChange = (e: any) => {
            if (e.detail) applyTheme(e.detail);
        };
        window.addEventListener("dukkank-theme-change", handleThemeChange);

        const applySeoData = (seo: any) => {
            if (!seo) return;
            const currentTitle = seo.title || "دُكانك | متجر الاشتراكات والألعاب الرقمية";
            const currentDesc = seo.description || "متجر دُكانك لشراء وتفعيل اشتراكات PlayStation Plus والألعاب الرقمية الأصلية بأفضل الأسعار مع تسليم فوري ودعم مباشر.";
            const currentKeywords = seo.keywords || "بلايستيشن, العاب, بلس, PS Plus, دكانك, العاب رقمية, شحن كوينز";
            const currentOgImage = seo.ogImage || "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?w=1200&q=80";

            document.title = currentTitle;

            const setMeta = (attr: string, name: string, content: string) => {
                let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
                if (!tag) {
                    tag = document.createElement("meta");
                    tag.setAttribute(attr, name);
                    document.head.appendChild(tag);
                }
                tag.content = content;
            };

            setMeta("name", "description", currentDesc);
            setMeta("name", "keywords", currentKeywords);

            // Open Graph (WhatsApp, Facebook, Discord)
            setMeta("property", "og:title", currentTitle);
            setMeta("property", "og:description", currentDesc);
            setMeta("property", "og:image", currentOgImage);
            setMeta("property", "og:url", window.location.href);
            setMeta("property", "og:type", "website");
            setMeta("property", "og:site_name", "دُكانك - Dukkank");

            // Twitter Cards (X)
            setMeta("name", "twitter:card", "summary_large_image");
            setMeta("name", "twitter:title", currentTitle);
            setMeta("name", "twitter:description", currentDesc);
            setMeta("name", "twitter:image", currentOgImage);

            // JSON-LD Structured Data Schema for Google Search Console
            let schemaTag = document.querySelector("#dukkank-store-schema") as HTMLScriptElement | null;
            if (!schemaTag) {
                schemaTag = document.createElement("script");
                schemaTag.id = "dukkank-store-schema";
                schemaTag.type = "application/ld+json";
                document.head.appendChild(schemaTag);
            }
            schemaTag.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "OnlineStore",
                "name": "دُكانك - Dukkank",
                "description": currentDesc,
                "url": window.location.origin,
                "image": currentOgImage,
                "currenciesAccepted": "USD, SAR, KWD, AED, JOD",
                "paymentAccepted": "Credit Card, Apple Pay, Mada, Cash",
                "priceRange": "$$",
                "potentialAction": {
                    "@type": "SearchAction",
                    "target": `${window.location.origin}/all-games?q={search_term_string}`,
                    "query-input": "required name=search_term_string"
                }
            });
        };

        // Apply initially
        applySeoData(getSeo());

        // Listen to dynamic changes from SEO tab
        const handleSeoChange = (e: any) => {
            if (e.detail) applySeoData(e.detail);
        };
        window.addEventListener("dukkank-seo-change", handleSeoChange);

        return () => {
            window.removeEventListener("dukkank-theme-change", handleThemeChange);
            window.removeEventListener("dukkank-seo-change", handleSeoChange);
        };
    }, []);
    return null;
}

function App() {
    return (
        <HelmetProvider>
            <BrowserRouter>
                <ThemeProvider>
                    <LanguageProvider>
                        <AuthProvider>
                            <DataProvider>
                                <CurrencyProvider>
                                    <WishlistProvider>
                                        <CartProvider>
                                            <CustomerProvider>
                                                <VisitorTracker />
                                                <ThemeAndSeoLoader />
                                                <SiteGuards>
                                                    <ErrorBoundary>
                                                        <Suspense fallback={<HomeSkeleton />}>
                                                            <Routes>
                                                                <Route path="/" element={<HomePage />} />
                                                                <Route path="/games" element={<AllGamesPage />} />
                                                                <Route path="/reviews" element={<AllReviewsPage />} />
                                                                <Route path="/account" element={<AllAccountPage />} />
                                                                <Route path="/cart" element={<AllCartPage />} />
                                                                <Route path="/login" element={<LoginPage />} />
                                                                <Route path="/policies" element={<PoliciesPage />} />
                                                                <Route path="/admin/login" element={<AdminLogin />} />
                                                                <Route path="/admin" element={<AdminDashboard />} />
                                                            </Routes>
                                                        </Suspense>
                                                    </ErrorBoundary>
                                                </SiteGuards>
                                                <Toaster
                                                    position="top-center"
                                                    richColors
                                                    closeButton
                                                    toastOptions={{ style: { fontFamily: "'Tajawal', sans-serif", direction: "rtl", textAlign: "right" } }}
                                                />
                                            </CustomerProvider>
                                        </CartProvider>
                                    </WishlistProvider>
                                </CurrencyProvider>
                            </DataProvider>
                        </AuthProvider>
                    </LanguageProvider>
                </ThemeProvider>
            </BrowserRouter>
        </HelmetProvider>
    );
}

export default App;
