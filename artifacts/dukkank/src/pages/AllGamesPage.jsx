import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useStoreData } from "../contexts/DataContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { GamesGrid } from "../components/GamesGrid";
import { CartDrawer } from "../components/CartDrawer";
import { WishlistDrawer } from "../components/WishlistDrawer";
import { PaymentResultModal } from "../components/PaymentResultModal";
import { StickyCartBar } from "../components/StickyCartBar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SEO } from "../components/SEO";
import { Gamepad2, ArrowRight, Home } from "lucide-react";
import { CustomerAuthModal } from "../components/CustomerAuthModal";

export default function AllGamesPage() {
    const [cartOpen, setCartOpen] = useState(false);
    const [wishOpen, setWishOpen] = useState(false);
    const [customerAuthOpen, setCustomerAuthOpen] = useState(false);
    const { games, loading } = useStoreData();

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, []);

    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden relative bg-[hsl(var(--brand-cream))] grain-bg flex flex-col" data-testid="all-games-page">
            <SEO
                title="جميع الألعاب الرقمية | متجر دُكانك"
                description="تصفح مكتبة الألعاب الرقمية المتاحة للتفعيل الفوري على بلايستيشن 5 وبلايستيشن 4 بأفضل الأسعار."
                canonical={`${origin}/games`}
                image=""
                jsonLd={[]}
            />
            <Header onOpenCart={() => setCartOpen(true)} onOpenWishlist={() => setWishOpen(true)} onOpenCustomerAuth={() => setCustomerAuthOpen(true)} />

            {/* Games Page Banner */}
            <div className="bg-[hsl(var(--brand-blue-deep))] text-white py-12 sm:py-16 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 keffiyeh-pattern opacity-20 rotate-12" />
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative space-y-4">
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <Link to="/" className="flex items-center gap-1 hover:underline">
                            <Home className="w-3.5 h-3.5" />
                            <span>الرئيسية</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[hsl(var(--brand-gold))]">جميع الألعاب</span>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight flex items-center gap-3">
                                <Gamepad2 className="w-8 h-8 text-[hsl(var(--brand-gold))]" />
                                مكتبة الألعاب الرقمية
                            </h1>
                            <p className="text-sm sm:text-base opacity-85">
                                اختر لعبتك المفضلة لـ PS5 و PS4 واستلمها فوراً مع ضمان أصلي وتفعيل آمن 100%.
                            </p>
                        </div>

                        <div className="bg-white/10 backdrop-blur border border-white/15 px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2">
                            <span>عدد الألعاب المتوفرة:</span>
                            <span className="bg-[hsl(var(--brand-gold))] text-[hsl(var(--brand-ink))] px-2.5 py-0.5 rounded-full font-mono text-sm font-extrabold">
                                {games?.length || 0}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 w-full">
                <GamesGrid games={games} isCatalogPage={true} />
            </main>

            <Footer />

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
            <WishlistDrawer open={wishOpen} onOpenChange={setWishOpen} />
            <CustomerAuthModal open={customerAuthOpen} onOpenChange={setCustomerAuthOpen} />
            <PaymentResultModal />
            <StickyCartBar onOpenCart={() => setCartOpen(true)} />
            <MobileBottomNav
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setCustomerAuthOpen(true)}
            />
        </div>
    );
}
