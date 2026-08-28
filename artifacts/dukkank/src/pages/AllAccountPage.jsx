import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCustomer } from "../contexts/CustomerContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useWishlist } from "../contexts/WishlistContext";
import { useCart } from "../contexts/CartContext";
import { useStoreData } from "../contexts/DataContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { WishlistDrawer } from "../components/WishlistDrawer";
import { CustomerAuthModal } from "../components/CustomerAuthModal";
import { PaymentResultModal } from "../components/PaymentResultModal";
import { StickyCartBar } from "../components/StickyCartBar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SEO } from "../components/SEO";
import {
    ShoppingBag, Heart, LogOut, Instagram,
    Gamepad2, Home, Wallet, BookOpen, User,
} from "lucide-react";

// ── Tab Components ──
import AccountOrdersTab from "../components/account/AccountOrdersTab";
import AccountLibraryTab from "../components/account/AccountLibraryTab";
import AccountGuideTab from "../components/account/AccountGuideTab";
import AccountWalletTab from "../components/account/AccountWalletTab";
import AccountWishlistTab from "../components/account/AccountWishlistTab";
import AccountProfileTab from "../components/account/AccountProfileTab";

export default function AllAccountPage() {
    const navigate = useNavigate();
    const { customer, orders, walletBalance, logout, updateProfile, topUpWallet } = useCustomer();

    const handleLogout = () => {
        logout();
        navigate("/");
    };
    const { format } = useCurrency();
    const { ids: wishIds, count: wishCount, remove: removeWish } = useWishlist();
    const { games } = useStoreData();
    const { add: addToCart } = useCart();

    const [cartOpen, setCartOpen] = useState(false);
    const [wishOpen, setWishOpen] = useState(false);
    const [authOpen, setAuthOpen] = useState(false);
    const [activeTab, setActiveTab] = useState("orders");

    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

    const wishGames = useMemo(() => {
        const list = games || [];
        return (wishIds || []).map((id) => list.find((g) => g.id === id)).filter(Boolean);
    }, [wishIds, games]);

    const libraryGames = useMemo(() => {
        const gameList = games || [];
        const purchasedItemNames = (orders || []).flatMap((o) => o.items || []);
        return purchasedItemNames.map((name, i) => {
            const found = gameList.find((g) => g.name && name.includes(g.name));
            if (found) return { ...found, purchaseName: name, id: `${found.id}-${i}` };
            return { id: `lib-item-${i}`, name, sub: "تفعيل رقمي موثق", image: null, five: 20, purchaseName: name };
        });
    }, [orders, games]);

    const totalOrdersCount = orders ? orders.length : 0;
    const membershipLevel =
        totalOrdersCount >= 5 ? { title: "عضوية ماسيّة 💎", color: "from-amber-400 via-orange-500 to-amber-600" } :
        totalOrdersCount >= 2 ? { title: "عضوية ذهبية 🥇", color: "from-yellow-400 to-amber-500" } :
        { title: "عضوية فضية 🥈", color: "from-blue-400 to-indigo-500" };

    // ── Sidebar tabs config ──
    const tabs = [
        { id: "orders",   icon: ShoppingBag, label: "طلباتي",           badge: totalOrdersCount },
        { id: "library",  icon: Gamepad2,    label: "مكتبتي الرقمية",   badge: libraryGames.length, iconColor: "text-purple-500" },
        { id: "guide",    icon: BookOpen,    label: "دليل التفعيل",     iconColor: "text-blue-500" },
        { id: "wallet",   icon: Wallet,      label: "محفظتي",           badgeText: `$${walletBalance?.toFixed(2)}`, iconColor: "text-emerald-500" },
        { id: "wishlist", icon: Heart,       label: "المفضلة",          badge: wishCount || 0, iconColor: "text-red-500" },
        { id: "profile",  icon: User,        label: "إعدادات الحساب" },
    ];

    return (
        <div className="min-h-screen bg-[hsl(var(--brand-cream))] grain-bg flex flex-col" data-testid="all-account-page">
            <SEO
                title={`حسابي | ${customer?.name || "متجر دُكانك"}`}
                description="لوحة تحكم حساب العميل — الطلبات، المكتبة، المحفظة، والمزيد."
                canonical={`${origin}/account`}
                image=""
                jsonLd={[]}
            />
            <Header
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setAuthOpen(true)}
            />

            {/* ── Top Banner ── */}
            <div className="bg-gradient-to-br from-[hsl(var(--brand-blue-deep))] via-[hsl(220_35%_18%)] to-[hsl(var(--brand-blue-deep))] text-white py-10 sm:py-14 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 keffiyeh-pattern opacity-15 rotate-12 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative space-y-6">
                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2 text-xs font-bold opacity-80">
                        <Link to="/" className="flex items-center gap-1 hover:underline">
                            <Home className="w-3.5 h-3.5" />
                            <span>الرئيسية</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[hsl(var(--brand-gold))]">حسابي</span>
                    </div>

                    {/* Customer Info */}
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4 sm:gap-6">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[hsl(var(--brand-gold))] to-amber-300 text-[#3a2400] font-black text-2xl sm:text-3xl flex items-center justify-center shadow-xl ring-4 ring-white/10 shrink-0">
                                {customer ? customer.name.charAt(0) : "ع"}
                            </div>
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                                        {customer ? customer.name : "عميل دُكانك"}
                                    </h1>
                                    <span className={`px-3 py-1 rounded-full text-xs font-extrabold shadow-sm bg-gradient-to-r ${membershipLevel.color} text-white`}>
                                        {membershipLevel.title}
                                    </span>
                                </div>
                                <p className="text-xs sm:text-sm opacity-80 font-medium">
                                    {customer?.email || customer?.phone || "حساب رقمي موثق"}
                                </p>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="flex items-center gap-3 flex-wrap">
                            <div className="bg-white/10 backdrop-blur border border-white/15 px-4 py-2.5 rounded-2xl text-center min-w-[100px]">
                                <div className="text-xl font-black text-[hsl(var(--brand-gold))]">${walletBalance?.toFixed(2)}</div>
                                <div className="text-[11px] opacity-80 font-bold flex items-center justify-center gap-1">
                                    <Wallet className="w-3 h-3 text-[hsl(var(--brand-gold))]" /> رصيد المحفظة
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur border border-white/15 px-4 py-2.5 rounded-2xl text-center min-w-[90px]">
                                <div className="text-xl font-black text-white">{totalOrdersCount}</div>
                                <div className="text-[11px] opacity-80 font-bold">الطلبات</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Main Body ── */}
            <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-14 w-full grid grid-cols-1 lg:grid-cols-4 gap-8">

                {/* Sidebar */}
                <aside className="space-y-4 lg:col-span-1">
                    <div className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-3 shadow-sm space-y-1">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`w-full h-11 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center justify-between transition-all ${
                                    activeTab === tab.id
                                        ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md"
                                        : "text-[hsl(var(--brand-ink))]/80 hover:bg-[hsl(var(--brand-ink))]/5"
                                }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <tab.icon className={`w-4 h-4 ${activeTab === tab.id ? "" : (tab.iconColor || "")}`} />
                                    <span>{tab.label}</span>
                                </div>
                                {tab.badge != null && (
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${activeTab === tab.id ? "bg-white/20 text-white" : "bg-black/10"}`}>
                                        {tab.badge}
                                    </span>
                                )}
                                {tab.badgeText && (
                                    <span className="text-xs font-black text-emerald-600">
                                        {tab.badgeText}
                                    </span>
                                )}
                            </button>
                        ))}

                        {customer && (
                            <button
                                onClick={handleLogout}
                                className="w-full h-11 px-4 rounded-2xl text-xs sm:text-sm font-extrabold flex items-center gap-2.5 text-red-600 hover:bg-red-50 transition-all pt-2 border-t border-[hsl(var(--brand-ink))]/10 cursor-pointer"
                            >
                                <LogOut className="w-4 h-4" />
                                <span>تسجيل الخروج</span>
                            </button>
                        )}
                    </div>

                    {/* Instagram Support Box */}
                    <div className="bg-gradient-to-br from-pink-500/10 via-rose-500/10 to-purple-500/10 border border-pink-500/20 p-5 rounded-3xl space-y-3">
                        <div className="flex items-center gap-2 text-pink-700 font-extrabold text-xs">
                            <Instagram className="w-4 h-4" />
                            <span>الدعم الفني عبر إنستجرام</span>
                        </div>
                        <p className="text-xs text-[hsl(var(--brand-ink))]/70 leading-relaxed font-medium">
                            واجهتك مشكلة أو استفسار؟ تواصل مباشرة مع فريق المتجر على إنستجرام.
                        </p>
                        <a
                            href="https://ig.me/m/dukkank15"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full h-10 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-90 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md transition-opacity cursor-pointer"
                        >
                            <Instagram className="w-4 h-4" />
                            <span>مراسلة الدعم على إنستجرام 💬</span>
                        </a>
                    </div>
                </aside>

                {/* Tab Content */}
                <section className="lg:col-span-3 space-y-6">
                    {activeTab === "orders" && (
                        <AccountOrdersTab orders={orders} addToCart={addToCart} setCartOpen={setCartOpen} />
                    )}
                    {activeTab === "library" && (
                        <AccountLibraryTab libraryGames={libraryGames} addToCart={addToCart} setCartOpen={setCartOpen} />
                    )}
                    {activeTab === "guide" && (
                        <AccountGuideTab />
                    )}
                    {activeTab === "wallet" && (
                        <AccountWalletTab walletBalance={walletBalance} topUpWallet={topUpWallet} addToCart={addToCart} setCartOpen={setCartOpen} />
                    )}
                    {activeTab === "wishlist" && (
                        <AccountWishlistTab wishGames={wishGames} wishCount={wishCount} addToCart={addToCart} removeWish={removeWish} format={format} />
                    )}
                    {activeTab === "profile" && (
                        <AccountProfileTab customer={customer} updateProfile={updateProfile} />
                    )}
                </section>
            </main>

            <Footer />

            <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
            <WishlistDrawer open={wishOpen} onOpenChange={setWishOpen} />
            <CustomerAuthModal open={authOpen} onOpenChange={setAuthOpen} />
            <PaymentResultModal />
            <StickyCartBar onOpenCart={() => setCartOpen(true)} />
            <MobileBottomNav
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => setAuthOpen(true)}
            />
        </div>
    );
}
