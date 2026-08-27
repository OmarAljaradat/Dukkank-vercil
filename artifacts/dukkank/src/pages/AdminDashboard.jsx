import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useStoreData } from "../contexts/DataContext";
import { useLang } from "../contexts/LanguageContext";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";
import { LogOut, ExternalLink, Loader2 } from "lucide-react";
import { ThemeToggle } from "../components/ThemeToggle";
import StoreSettingsTab   from "../components/admin/StoreSettingsTab";
import SubscriptionsTab   from "../components/admin/SubscriptionsTab";
import GamesTab           from "../components/admin/GamesTab";
import BundlesTab         from "../components/admin/BundlesTab";
import SectionsTab        from "../components/admin/SectionsTab";
import MarketingTab       from "../components/admin/MarketingTab";
import AuditTab           from "../components/admin/AuditTab";
import ReviewsTab         from "../components/admin/ReviewsTab";
import FaqTab             from "../components/admin/FaqTab";
import AccountTab         from "../components/admin/AccountTab";
import NotifyTab          from "../components/admin/NotifyTab";
import AnalyticsTab       from "../components/admin/AnalyticsTab";
import ContentTab         from "../components/admin/ContentTab";
import SiteSettingsTab    from "../components/admin/SiteSettingsTab";
import OrdersDashboardTab from "../components/admin/OrdersDashboardTab";
import CompletedOrdersTab from "../components/admin/CompletedOrdersTab";
import SuppliersTab       from "../components/admin/SuppliersTab";
import StoreInfoTab       from "../components/admin/StoreInfoTab";
import CouponsTab         from "../components/admin/CouponsTab";
import ThemeTab           from "../components/admin/ThemeTab";
import SeoTab             from "../components/admin/SeoTab";
import InsightsTab        from "../components/admin/InsightsTab";
import SecurityTab        from "../components/admin/SecurityTab";
import SchedulerTab       from "../components/admin/SchedulerTab";
import WeeklyReportTab    from "../components/admin/WeeklyReportTab";
import ProductsCSVTab     from "../components/admin/ProductsCSVTab";
import FinanceTab         from "../components/admin/FinanceTab";
import PaymentOrdersTab   from "../components/admin/PaymentOrdersTab";
import LaunchTab          from "../components/admin/LaunchTab";
import CustomerCrmTab     from "../components/admin/CustomerCrmTab";
import AffiliateTab       from "../components/admin/AffiliateTab";
import BackupTab          from "../components/admin/BackupTab";
import PerformanceTab     from "../components/admin/PerformanceTab";
import GiftsTab           from "../components/admin/GiftsTab";

const TABS = [
    // ── الإحصائيات والتقارير
    { value: "analytics",    label: "📊 الإحصائيات العامة",   group: "analytics" },
    { value: "orders",          label: "📦 إدارة الطلبات (OrderDukkank)",group: "analytics" },
    { value: "completedOrders", label: "🗃️ أرشيف الحسابات المسلمة", group: "analytics" },
    { value: "insights",        label: "🔍 تحليل الزوار",     group: "analytics" },
    { value: "weeklyReport", label: "📋 التقرير الأسبوعي", group: "analytics" },
    { value: "finance",      label: "💹 لوحة الأرباح",     group: "analytics" },
    // ── المتجر والمنتجات
    { value: "games",        label: "🎮 الألعاب والمخزون",   group: "store" },
    { value: "subscriptions",label: "📦 الاشتراكات",       group: "store" },
    { value: "suppliers",    label: "🚚 إدارة الموردين",       group: "store" },
    { value: "gifts",        label: "🎁 طلبات الهدايا الرقمية",group: "store" },
    { value: "coupons",      label: "🎟️ الكوبونات والعروض", group: "store" },
    { value: "launch",       label: "📢 إعلان الألعاب الضخمة",group: "store" },
    { value: "productsCSV",  label: "📄 تصدير واستيراد CSV",group: "store" },
    // ── المحتوى والتصميم
    { value: "sections",     label: "📑 ترتيب الأقسام",    group: "design" },
    { value: "content",      label: "✏️ محتوى نصوص الموقع",group: "design" },
    { value: "theme",        label: "🎨 الألوان والتثيم",   group: "design" },
    // ── العملاء والتسويق
    { value: "crm",          label: "👥 قاعدة العملاء والـ VIP",group: "customers" },
    { value: "affiliate",    label: "🎁 التسويق بالعمولة والإحالات",group: "customers" },
    { value: "reviews",      label: "⭐ التقييمات وآراء العملاء",group: "customers" },
    { value: "faqs",         label: "❓ الأسئلة الشائعة",  group: "customers" },
    { value: "notify",       label: "🔔 إشعارات وتنبيهات المخزون",group: "customers" },
    { value: "marketing",    label: "🚀 الحملات التسويقية", group: "customers" },
    // ── النظام
    { value: "store",        label: "⚙️ إعدادات المتجر العامة",group: "system" },
    { value: "seo",          label: "🔎 SEO ومحركات البحث", group: "system" },
    { value: "security",     label: "🛡️ الأمان والحماية",  group: "system" },
    { value: "backup",       label: "⚙️ النسخ الاحتياطي",  group: "system" },
    { value: "siteSettings", label: "🔧 الصيانة والسياسات", group: "system" },
    { value: "performance",  label: "⚡ الأداء والكاش",     group: "system" },
    { value: "audit",        label: "📜 سجل التدقيق",      group: "system" },
    { value: "account",      label: "👤 الحساب",            group: "system" },
];

const GROUPS = [
    { key: "analytics", label: "الإحصائيات والتقارير" },
    { key: "store",     label: "المتجر والمنتجات" },
    { key: "design",    label: "المحتوى والتصميم" },
    { key: "customers", label: "العملاء والتسويق" },
    { key: "system",    label: "النظام" },
];

export default function AdminDashboard() {
    const { user, loading, logout } = useAuth();
    const { t } = useLang();
    const { reload } = useStoreData();
    const navigate = useNavigate();
    const [tab, setTab] = useState("analytics");
    const [activeGroup, setActiveGroup] = useState("analytics");

    useEffect(() => {
        if (!loading && !user) navigate("/admin/login", { replace: true });
    }, [user, loading, navigate]);

    useEffect(() => {
        const found = TABS.find((tb) => tb.value === tab);
        if (found) setActiveGroup(found.group);
    }, [tab]);

    if (loading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[hsl(var(--brand-cream))]">
                <Loader2 className="w-8 h-8 animate-spin text-[hsl(var(--brand-blue-deep))]" />
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        navigate("/admin/login", { replace: true });
    };

    const groupTabs = TABS.filter((tb) => tb.group === activeGroup);

    return (
        <div className="min-h-screen bg-[hsl(var(--brand-cream))] grain-bg" data-testid="admin-dashboard">
            {/* Top bar */}
            <header className="sticky top-0 z-30 bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))] border-b border-black/20 shadow-md">
                <div className="max-w-7xl mx-auto px-4 sm:px-8 h-14 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img src="/logo.png" alt="logo" className="w-8 h-8 rounded-xl ring-2 ring-white/20" />
                        <div className="hidden sm:block">
                            <div className="text-sm font-bold leading-none">{t("admin.dashboard")}</div>
                            <div className="text-[10px] opacity-60 mt-0.5">{user?.email || "admin@dukkank.com"}</div>
                        </div>
                    </div>

                    {/* Group nav (horizontal) */}
                    <nav className="flex items-center gap-1 overflow-x-auto scrollbar-hide">
                        {GROUPS.map((g) => (
                            <button
                                key={g.key}
                                onClick={() => {
                                    setActiveGroup(g.key);
                                    const first = TABS.find((tb) => tb.group === g.key);
                                    if (first) setTab(first.value);
                                }}
                                className={`whitespace-nowrap px-3 h-8 rounded-full text-xs font-bold transition-colors flex-shrink-0 ${
                                    activeGroup === g.key
                                        ? "bg-white text-[hsl(var(--brand-blue-deep))]"
                                        : "text-white/70 hover:text-white hover:bg-white/15"
                                }`}
                            >
                                {g.label}
                            </button>
                        ))}
                    </nav>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        <ThemeToggle variant="light" />
                        <a href="/" target="_blank" rel="noopener noreferrer"
                            className="hidden sm:inline-flex items-center gap-1.5 rounded-full px-3 h-8 bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" />
                            الموقع
                        </a>
                        <button onClick={handleLogout}
                            className="inline-flex items-center gap-1.5 rounded-full px-3 h-8 bg-[hsl(var(--brand-red))] hover:bg-[hsl(var(--brand-red))]/85 text-xs font-semibold transition-colors">
                            <LogOut className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">خروج</span>
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-3 sm:px-8 py-5 sm:py-8">
                <Tabs value={tab} onValueChange={setTab} className="w-full">
                    {/* Sub-tab list (for current group) */}
                    <TabsList
                        data-testid="admin-tabs"
                        className="w-full flex flex-wrap gap-1 bg-white/70 dark:bg-white/[0.06] border border-[hsl(var(--brand-ink))]/10 dark:border-white/10 rounded-2xl p-1.5 h-auto mb-5"
                    >
                        {groupTabs.map((tb) => (
                            <TabsTrigger
                                key={tb.value}
                                value={tb.value}
                                data-testid={`tab-${tb.value}`}
                                className="data-[state=active]:bg-[hsl(var(--brand-ink))] data-[state=active]:text-[hsl(var(--brand-cream))] rounded-xl py-2 px-3 font-bold text-xs sm:text-sm whitespace-nowrap"
                            >
                                {tb.label}
                            </TabsTrigger>
                        ))}
                    </TabsList>

                    {/* Tab contents (Lazy rendered per active tab) */}
                    <TabsContent value="analytics"    className="mt-0">{tab === "analytics" && <AnalyticsTab />}</TabsContent>
                    <TabsContent value="orders"          className="mt-0">{tab === "orders" && <OrdersDashboardTab />}</TabsContent>
                    <TabsContent value="completedOrders" className="mt-0">{tab === "completedOrders" && <CompletedOrdersTab />}</TabsContent>
                    <TabsContent value="insights"     className="mt-0">{tab === "insights" && <InsightsTab />}</TabsContent>
                    <TabsContent value="weeklyReport" className="mt-0">{tab === "weeklyReport" && <WeeklyReportTab />}</TabsContent>
                    <TabsContent value="finance"      className="mt-0">{tab === "finance" && <FinanceTab />}</TabsContent>
                    <TabsContent value="store"        className="mt-0">{tab === "store" && <StoreSettingsTab onSaved={reload} />}</TabsContent>
                    <TabsContent value="games"        className="mt-0">{tab === "games" && <GamesTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="subscriptions"className="mt-0">{tab === "subscriptions" && <SubscriptionsTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="suppliers"    className="mt-0">{tab === "suppliers" && <SuppliersTab />}</TabsContent>
                    <TabsContent value="gifts"        className="mt-0">{tab === "gifts" && <GiftsTab />}</TabsContent>
                    <TabsContent value="bundles"      className="mt-0">{tab === "bundles" && <BundlesTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="coupons"      className="mt-0">{tab === "coupons" && <CouponsTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="launch"       className="mt-0">{tab === "launch" && <LaunchTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="productsCSV"  className="mt-0">{tab === "productsCSV" && <ProductsCSVTab />}</TabsContent>
                    <TabsContent value="storeInfo"    className="mt-0">{tab === "storeInfo" && <StoreInfoTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="content"      className="mt-0">{tab === "content" && <ContentTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="theme"        className="mt-0">{tab === "theme" && <ThemeTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="seo"          className="mt-0">{tab === "seo" && <SeoTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="sections"     className="mt-0">{tab === "sections" && <SectionsTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="crm"          className="mt-0">{tab === "crm" && <CustomerCrmTab />}</TabsContent>
                    <TabsContent value="affiliate"    className="mt-0">{tab === "affiliate" && <AffiliateTab />}</TabsContent>
                    <TabsContent value="reviews"      className="mt-0">{tab === "reviews" && <ReviewsTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="faqs"         className="mt-0">{tab === "faqs" && <FaqTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="marketing"    className="mt-0">{tab === "marketing" && <MarketingTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="notify"       className="mt-0">{tab === "notify" && <NotifyTab />}</TabsContent>
                    <TabsContent value="security"     className="mt-0">{tab === "security" && <SecurityTab />}</TabsContent>
                    <TabsContent value="siteSettings" className="mt-0">{tab === "siteSettings" && <SiteSettingsTab onChanged={reload} />}</TabsContent>
                    <TabsContent value="audit"        className="mt-0">{tab === "audit" && <AuditTab />}</TabsContent>
                    <TabsContent value="account"      className="mt-0">{tab === "account" && <AccountTab />}</TabsContent>
                    <TabsContent value="backup"       className="mt-0">{tab === "backup" && <BackupTab />}</TabsContent>
                    <TabsContent value="performance"  className="mt-0">{tab === "performance" && <PerformanceTab />}</TabsContent>
                </Tabs>
            </main>
        </div>
    );
}
