import { ShoppingBag, User, Gamepad2, Compass } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../contexts/CartContext";
import { useStoreData } from "../contexts/DataContext";
import { useCustomer } from "../contexts/CustomerContext";
import { CurrencySwitcher } from "./CurrencySwitcher";
import { ThemeToggle } from "./ThemeToggle";

const NAV_LINKS = [
    { href: "#essential", label: "أساسي" },
    { href: "#extra",     label: "إضافي" },
    { href: "/games",     label: "الألعاب", isRoute: true },
    { href: "#reviews",   label: "التقييمات" },
    { href: "#faq",       label: "الأسئلة" },
];

export const Header = ({ onOpenCart, onOpenCustomerAuth, onOpenWishlist }) => {
    const { totalQty } = useCart();
    const { store } = useStoreData();
    const { customer } = useCustomer();
    const location = useLocation();
    const navigate = useNavigate();
    const storeName = store?.name || "دُكانك";

    const handleNavClick = (e, link) => {
        e.preventDefault();
        if (typeof link === "object" && link.isRoute) {
            navigate(link.href);
            return;
        }

        const href = typeof link === "string" ? link : link.href;
        const targetId = href.replace("#", "");

        if (location.pathname === "/") {
            if (targetId === "top") {
                window.scrollTo({ top: 0, behavior: "smooth" });
            } else {
                const el = document.getElementById(targetId);
                if (el) {
                    el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
            }
        } else {
            navigate(`/${href}`);
            setTimeout(() => {
                if (targetId === "top") {
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    const el = document.getElementById(targetId);
                    if (el) {
                        el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }
                }
            }, 250);
        }
    };

    return (
        <header
            data-testid="site-header"
            className="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/80 dark:border-slate-800 transition-colors shadow-2xs"
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 sm:h-18 flex items-center justify-between gap-6">

                {/* Left: Brand Logo & Title */}
                <a
                    href="#top"
                    onClick={(e) => handleNavClick(e, "#top")}
                    className="flex items-center gap-3 shrink-0 group"
                    data-testid="header-brand"
                >
                    <div className="w-10 h-10 rounded-2xl bg-[hsl(var(--brand-blue-deep))] text-white p-0.5 shadow-sm group-hover:scale-105 transition-transform overflow-hidden">
                        <img src="/logo.png" alt={storeName} className="w-full h-full object-cover rounded-xl" />
                    </div>
                    <div className="leading-tight">
                        <div className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                            <span>{storeName}</span>
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        </div>
                        <div className="hidden sm:block text-[11px] font-bold text-slate-500 dark:text-slate-400 -mt-0.5">
                            متجر رقمي معتمد 🎮
                        </div>
                    </div>
                </a>

                {/* Center Navigation Links (Pill Style with Awesome Hover Animation) */}
                <nav className="hidden md:flex items-center gap-1.5 bg-slate-100/90 dark:bg-slate-800/60 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
                    {NAV_LINKS.map((l) => {
                        const isActive = l.isRoute ? location.pathname === l.href : false;
                        return (
                            <a
                                key={l.href}
                                href={l.href}
                                onClick={(e) => handleNavClick(e, l)}
                                className={`relative px-4 py-2 rounded-xl text-xs font-black transition-all duration-300 ease-out flex items-center justify-center gap-1 group cursor-pointer ${
                                    isActive
                                        ? "bg-white dark:bg-slate-900 text-[hsl(var(--brand-blue-deep))] dark:text-blue-400 shadow-md scale-105 ring-1 ring-slate-200 dark:ring-slate-700"
                                        : "text-slate-600 dark:text-slate-300 hover:text-[hsl(var(--brand-blue-deep))] dark:hover:text-white hover:bg-white dark:hover:bg-slate-900 hover:shadow-md hover:scale-105 hover:-translate-y-0.5"
                                }`}
                                data-testid={`nav-${l.href.replace("#", "").replace("/", "")}`}
                            >
                                <span className="relative z-10 transition-transform duration-300 group-hover:scale-105">
                                    {l.label}
                                </span>

                                {/* Glowing Underline Accent Indicator on Hover */}
                                <span className={`absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 ${
                                    isActive ? "w-auto opacity-100" : "w-0 group-hover:w-auto"
                                }`} />
                            </a>
                        );
                    })}
                </nav>

                {/* Right Controls */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    
                    <div className="flex items-center gap-1.5">
                        <CurrencySwitcher compact />
                        <ThemeToggle />
                    </div>

                    <div className="h-5 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

                    {/* Customer Account Button — Desktop only (available in bottom nav on mobile) */}
                    <button
                        onClick={() => {
                            if (customer) {
                                navigate("/account");
                            } else {
                                navigate("/login");
                            }
                        }}
                        data-testid="open-customer-auth"
                        className="hidden sm:flex h-10 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-black text-slate-800 dark:text-white items-center gap-2 transition-colors cursor-pointer"
                    >
                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        <span>
                            {customer ? customer.name.split(" ")[0] : "حسابي"}
                        </span>
                    </button>

                    {/* Cart Button — Desktop only (available in bottom nav on mobile) */}
                    <Link
                        to="/cart"
                        data-testid="open-cart-button"
                        className="hidden sm:flex h-10 sm:h-11 px-4.5 rounded-2xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-blue-600 dark:hover:bg-slate-100 font-black text-xs sm:text-sm items-center gap-2 transition-all shadow-sm cursor-pointer"
                    >
                        <ShoppingBag className="w-4 h-4" />
                        <span>السلة</span>
                        {totalQty > 0 && (
                            <span data-testid="cart-badge" className="min-w-[19px] h-[19px] px-1 rounded-full bg-blue-600 dark:bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                                {totalQty}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
};
