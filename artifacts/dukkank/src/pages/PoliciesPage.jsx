import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useStoreData } from "../contexts/DataContext";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { CartDrawer } from "../components/CartDrawer";
import { WishlistDrawer } from "../components/WishlistDrawer";
import { PaymentResultModal } from "../components/PaymentResultModal";
import { StickyCartBar } from "../components/StickyCartBar";
import { MobileBottomNav } from "../components/MobileBottomNav";
import { SEO } from "../components/SEO";
import { ShieldCheck, Lock, FileText, RefreshCw, Wallet, Cookie, CreditCard, Home, Search, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export default function PoliciesPage() {
    const { store } = useStoreData();
    const storeName = store?.name || "دُكانك";
    const origin = typeof window !== "undefined" ? `${window.location.protocol}//${window.location.host}` : "";

    const [searchParams] = useSearchParams();
    const tabFromUrl = searchParams.get("tab");
    const [activeTab, setActiveTab] = useState(tabFromUrl || "all");
    const [searchQuery, setSearchQuery] = useState("");
    const [cartOpen, setCartOpen] = useState(false);
    const [wishOpen, setWishOpen] = useState(false);

    useEffect(() => {
        const tab = searchParams.get("tab");
        if (tab) {
            setActiveTab(tab);
        }
        window.scrollTo({ top: 0, behavior: "smooth" });
    }, [searchParams]);

    const tabs = [
        { id: "all", label: "جميع السياسات والشروط", icon: FileText },
        { id: "privacy", label: "سياسة الخصوصية", icon: Lock },
        { id: "terms", label: "شروط الاستخدام", icon: FileText },
        { id: "refund", label: "سياسة الاسترجاع والتبديل", icon: RefreshCw },
        { id: "warranty", label: "سياسة الضمان والتعويض", icon: ShieldCheck },
        { id: "wallet", label: "الكاش باك والمحفظة", icon: Wallet },
        { id: "cookies", label: "الكوكيز وتأكيد الدفع", icon: Cookie },
    ];

    return (
        <div className="min-h-screen w-full max-w-full overflow-x-hidden relative bg-[hsl(var(--brand-cream))] grain-bg flex flex-col" data-testid="policies-page">
            <SEO
                title={`الشروط والسياسات والضمان | ${storeName}`}
                description={`مستند الشروط والأحكام وسياسة الخصوصية والضمان والاسترجاع المعتمدة لمتجر ${storeName}.`}
                canonical={`${origin}/policies`}
                image=""
                jsonLd={[]}
            />

            <Header
                onOpenCart={() => setCartOpen(true)}
                onOpenWishlist={() => setWishOpen(true)}
                onOpenCustomerAuth={() => {}}
            />

            {/* Hero Banner Header */}
            <div className="bg-[hsl(var(--brand-blue-deep))] text-white py-12 sm:py-16 relative overflow-hidden">
                <div className="absolute -top-12 -right-12 w-64 h-64 keffiyeh-pattern opacity-15 rotate-12 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-5 sm:px-8 relative space-y-4 text-center sm:text-right">
                    <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-bold opacity-80">
                        <Link to="/" className="flex items-center gap-1 hover:underline">
                            <Home className="w-3.5 h-3.5" />
                            <span>الرئيسية</span>
                        </Link>
                        <span>/</span>
                        <span className="text-[hsl(var(--brand-gold))]">الشروط والسياسات والضمان</span>
                    </div>

                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                        <div className="space-y-2 text-center sm:text-right">
                            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                                الشروط والسياسات والضمان 📜
                            </h1>
                            <p className="text-xs sm:text-sm opacity-80 font-medium max-w-xl">
                                دليل حقوقك والتزاماتك وحماية بياناتك وضمانك الكامل في متجر {storeName}.
                            </p>
                        </div>

                        {/* Search Filter */}
                        <div className="relative w-full sm:w-80">
                            <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-white/50" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="ابحث في السياسات والشروط..."
                                className="w-full h-11 pr-10 pl-4 rounded-2xl bg-white/10 backdrop-blur border border-white/20 text-xs font-bold text-white placeholder:text-white/50 focus:border-[hsl(var(--brand-gold))] focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <main className="flex-1 max-w-7xl mx-auto px-5 sm:px-8 py-10 sm:py-16 w-full space-y-8">
                
                {/* Horizontal Category Nav Pills */}
                <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none dir-rtl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        const isActive = activeTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-3 rounded-2xl text-xs font-extrabold whitespace-nowrap transition-all flex items-center gap-2 border shrink-0 ${
                                    isActive
                                        ? "bg-[hsl(var(--brand-blue-deep))] text-white border-[hsl(var(--brand-blue-deep))] shadow-md scale-102"
                                        : "bg-white dark:bg-white/5 text-[hsl(var(--brand-ink))]/70 border-[hsl(var(--brand-ink))]/10 hover:bg-[hsl(var(--brand-ink))]/5"
                                }`}
                            >
                                <Icon className={`w-4 h-4 ${isActive ? "text-[hsl(var(--brand-gold))]" : "opacity-60"}`} />
                                <span>{tab.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Policies Accordions / Cards Grid */}
                <div className="space-y-8">

                    {/* SECTION 1: PRIVACY POLICY */}
                    {(activeTab === "all" || activeTab === "privacy") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                                    <Lock className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">سياسة الخصوصية 🔐</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">خصوصية بياناتك وأمن حسابك هي أولويتنا القصوى في متجر {storeName}</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[hsl(var(--brand-ink))]/85 leading-relaxed font-medium">
                                <p className="bg-[hsl(var(--brand-cream))]/60 p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10">
                                    نحتفظ بالحق في إضافة أو تعديل أو حذف أو تغيير هذه السياسة من وقت لآخر عن طريق تحديث هذه الصفحة. يجب عليك مراجعة هذه الصفحة من وقت لآخر للتأكد من رضاك عن أي تغييرات.
                                    استمرار استخدامك لـ متجر <strong>{storeName}</strong> الإلكتروني والخدمات يشكل موافقتك على سياسة الخصوصية هذه، بصيغتها المعدلة من وقت لآخر.
                                </p>

                                <div className="space-y-2">
                                    <h3 className="font-extrabold text-sm text-[hsl(var(--brand-blue-deep))] flex items-center gap-2">
                                        <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                        <span>حماية وسرية البيانات:</span>
                                    </h3>
                                    <ul className="list-disc list-inside space-y-1.5 pl-2 text-xs opacity-90">
                                        <li>لا نسمح بأي أفراد أو مؤسسات غير مصرح لها لاستخدام أي معلومات تم جمعها منك.</li>
                                        <li>يرجى ملاحظة أن متجر <strong>{storeName}</strong> لن يطلب منك مطلقاً تحت أي ظرف من الظروف كلمة المرور الخاصة بك عبر البريد الإلكتروني أو الرسائل أو الهاتف. يُنصح المستخدمون بعدم الرد على أي رسائل مشبوهة تطلب هذه المعلومات.</li>
                                        <li>لن يتم تخزين أو بيع أو مشاركة أو تأجير تفاصيل البطاقات الائتمانية أو المعلومات الشخصية مع أي طرف ثالث.</li>
                                        <li>يتخذ متجر <strong>{storeName}</strong> الخطوات المناسبة لضمان خصوصية البيانات وأمنها عبر التشفير المتقدم.</li>
                                    </ul>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4 pt-2">
                                    <div className="p-4 rounded-2xl bg-[hsl(var(--brand-cream))]/50 border border-[hsl(var(--brand-ink))]/10 space-y-2">
                                        <h4 className="font-extrabold text-xs text-[hsl(var(--brand-ink))]">جمع المعلومات:</h4>
                                        <p className="text-xs opacity-80">
                                            لتمكينك من تقديم طلب على موقعنا، نحتاج إلى المعلومات الأساسية: الاسم، رقم التواصل، والبريد الإلكتروني.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-[hsl(var(--brand-cream))]/50 border border-[hsl(var(--brand-ink))]/10 space-y-2">
                                        <h4 className="font-extrabold text-xs text-[hsl(var(--brand-ink))]">استخدام ومشاركة المعلومات:</h4>
                                        <p className="text-xs opacity-80">
                                            نستخدم بريدك الإلكتروني وهاتفك المحمول لتأكيد الطلبات والتواصل لخدمة العملاء. لا نبيع أو نؤجر معلوماتك لأي جهة خوارج نطاق تنفيذ طلبك.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* SECTION 2: TERMS OF USE */}
                    {(activeTab === "all" || activeTab === "terms") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                                    <FileText className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">شروط الاستخدام 📜</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">الشروط الحاكمة للخدمات والطلبات الرقمية في متجر {storeName}</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[hsl(var(--brand-ink))]/85 leading-relaxed font-medium">
                                <p>
                                    إن شروط الاستخدام هذه والوثائق القانونية خاضعة للتعديل من قبلنا في متجر <strong>{storeName}</strong> في أي وقت. إن استمرار استخدامك للموقع بعد نشر أي تغيير يعني موافقتك على شروط الاستخدام هذه.
                                </p>

                                <div className="grid md:grid-cols-3 gap-4 pt-2">
                                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/30 space-y-1">
                                        <div className="font-extrabold text-xs text-amber-800 dark:text-amber-300">طبيعة المتجر:</div>
                                        <p className="text-xs text-amber-900/80 dark:text-amber-200/80">
                                            متجر إلكتروني يتيح للمستخدمين شراء مجموعة متنوعة من الكوينز والبطاقات والخدمات الرقمية وألعاب وحسابات فيفا.
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/30 space-y-1">
                                        <div className="font-extrabold text-xs text-blue-800 dark:text-blue-300">مدة التسليم المتوقعة:</div>
                                        <p className="text-xs text-blue-900/80 dark:text-blue-200/80">
                                            من 10 دقائق إلى 24 ساعة (وقد تصل إلى 7 أيام في حالات نادرة أو ضغط عمل التحديات الكبرى).
                                        </p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/30 space-y-1">
                                        <div className="font-extrabold text-xs text-emerald-800 dark:text-emerald-300">تغيير الأسعار والعروض:</div>
                                        <p className="text-xs text-emerald-900/80 dark:text-emerald-200/80">
                                            تتغير الأسعار بشكل دوري بناءً على العروض والموردين ولا يحق للعميل مطالبة فرق السعر بعد إتمام الشراء.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* SECTION 3: REFUND POLICY */}
                    {(activeTab === "all" || activeTab === "refund") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                                    <RefreshCw className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">سياسة الاسترجاع والإلغاء 🔄</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">ضوابط وشروط استرجاع المبالغ والمنتجات الرقمية</p>
                                </div>
                            </div>

                            <div className="space-y-4 text-xs sm:text-sm text-[hsl(var(--brand-ink))]/85 leading-relaxed font-medium">
                                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-900 dark:text-red-300 text-xs space-y-2">
                                    <div className="font-extrabold flex items-center gap-1.5 text-sm">
                                        <AlertCircle className="w-4 h-4 shrink-0" />
                                        <span>تنبيه هائم على المنتجات الرقمية والخدمات:</span>
                                    </div>
                                    <p>
                                        المنتجات الرقمية والقسائم الإلكترونية والخدمات التي تم إدراجها في حسابك أو إيصالها عبر البريد الإلكتروني أو الرسائل ليست قابلة للاسترداد أو التبديل أو الإلغاء نهائياً ما لم يكن بها خلل مثبت.
                                    </p>
                                </div>

                                <ul className="list-disc list-inside space-y-2 text-xs opacity-95">
                                    <li>جميع الخدمات الرقمية والحلول مثل خدمات SBC واللعب بالنيابة غير قابلة للاسترداد بعد بدء تنفيذها.</li>
                                    <li>في حال وجود مشكلة، يجب تبليغ الدعم الفني خلال <strong>24 ساعة</strong> من إنشاء الطلب، ولا يحق للمستخدم المطالبة بأي مبالغ بعد مرور 24 ساعة من تسليم الطلب الناجح.</li>
                                    <li>يتم إعادة المبلغ إلكترونياً في حالات استثنائية فقط مثل عدم توفر المنتج أو عدم القدرة على تقديمه للعميل.</li>
                                    <li>الاسترداد عبر بطاقات مدى/فيزا/أبل باي يستغرق من <strong>1 إلى 15 يوم عمل</strong> كحد أقصى حسب سياسة البنك (مع مراعاة وجود رسوم استرداد بقيمة 2.7% لبوابة الدفع).</li>
                                    <li>صلاحية رصيد المحفظة الإلكترونية في متجر <strong>{storeName}</strong> صالحة لمدة سنة كاملة من تاريخ إنشاء الطلب.</li>
                                </ul>
                            </div>
                        </section>
                    )}

                    {/* SECTION 4: WARRANTY POLICY */}
                    {(activeTab === "all" || activeTab === "warranty") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-blue-deep))]/20 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                                    <ShieldCheck className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">سياسة الضمان والتعويض 🛡️</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">الضمان الكامل والضمان العادي لحماية ألعابك وحساباتك</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Gold Warranty */}
                                <div className="p-5 rounded-3xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 space-y-3">
                                    <div className="flex items-center gap-2 text-amber-900 dark:text-amber-300 font-extrabold text-sm">
                                        <ShieldCheck className="w-5 h-5 text-amber-500" />
                                        <span>ضمان النادي كامل (حاملي بطاقة الضمان الذهبي):</span>
                                    </div>
                                    <ul className="text-xs text-[hsl(var(--brand-ink))]/80 space-y-2 list-disc list-inside">
                                        <li>مدة الضمان لباند سوق الانتقالات هي <strong>5 أيام</strong> من آخر شحنة.</li>
                                        <li>يتم تعويضك بشحن كوينز بقيمة النادي كامل في حال حدوث باند سوق الانتقالات في حسابك.</li>
                                        <li>مدة الضمان في حال التصفير <strong>48 ساعة</strong> من انتهاء الشحن ويجب استخدام الكمية مباشرة.</li>
                                    </ul>
                                </div>

                                {/* Regular Warranty */}
                                <div className="p-5 rounded-3xl bg-slate-500/5 border border-slate-500/20 space-y-3">
                                    <div className="flex items-center gap-2 text-[hsl(var(--brand-blue-deep))] font-extrabold text-sm">
                                        <CheckCircle2 className="w-5 h-5 text-blue-500" />
                                        <span>الضمان العادي (لمدة 24 ساعة من آخر شحنة):</span>
                                    </div>
                                    <ul className="text-xs text-[hsl(var(--brand-ink))]/80 space-y-2 list-disc list-inside">
                                        <li>في حال حدوث باند، يتم التعويض بشحن نفس الكمية لآخر طلب بحساب آخر لديك أو إعادة المبلغ.</li>
                                        <li>في حال التصفير قبل الاستخدام، يتم تعويضك بشحن نفس كمية الطلب بحسابك مرة أخرى.</li>
                                    </ul>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
                                <span>تنويه هام: يصبح الضمان ملغياً في حال الشراء من مصدر غير آمن أو نقل الكوينز لحساب آخر. يرجى تغيير كلمة السر لحساب EA بعد الشحن مباشرة.</span>
                            </div>
                        </section>
                    )}

                    {/* SECTION 5: CASHBACK & WALLET */}
                    {(activeTab === "all" || activeTab === "wallet") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                                    <Wallet className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">الشروط والأحكام للكاش باك والمحفظة 💳</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">ضوابط استخدام المحفظة الرقمية ورصيد الكاش باك</p>
                                </div>
                            </div>

                            <ul className="list-disc list-inside space-y-2 text-xs sm:text-sm text-[hsl(var(--brand-ink))]/85 leading-relaxed font-medium">
                                <li>يتم إضافة مبلغ الكاش باك مباشرة إلى رصيد محفظتك الخاصة في الموقع الإلكتروني بعد نجاح الطلب.</li>
                                <li>صلاحية رصيد الكاش باك هي <strong>3 أشهر</strong> من تاريخ إنشاء الطلب.</li>
                                <li>يمكنك الاستفادة من عروض الكاش باك عند الدفع بجميع طرق الدفع المتاحة ما عدا الدفع برصيد المحفظة نفسها.</li>
                                <li>لا يمكن استرداد مبلغ الكاش باك نقداً أو عبر التحويل البنكي بل لشراء المنتجات المتاحة في المتجر فقط.</li>
                                <li>في حالة الاسترجاع الكلي أو الجزئي للطلب، سيتم خصم قيمة الكاش باك المكتسبة لهذا الطلب من محفظتك.</li>
                            </ul>
                        </section>
                    )}

                    {/* SECTION 6: COOKIES & GENERAL CONFIRMATIONS */}
                    {(activeTab === "all" || activeTab === "cookies") && (
                        <section className="bg-white dark:bg-white/[0.04] rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 sm:p-8 shadow-sm space-y-6 animate-in fade-in duration-300">
                            <div className="flex items-center gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="w-12 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center font-bold">
                                    <Cookie className="w-6 h-6" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))]">سياسة الكوكيز وتأكيد الدفع 🍪</h2>
                                    <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">ملفات الارتباط وتأكيد المعاملات المالية والشروط العامة</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-4 text-xs">
                                <div className="p-4 rounded-2xl bg-[hsl(var(--brand-cream))]/60 border border-[hsl(var(--brand-ink))]/10 space-y-2">
                                    <h3 className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">سياسة الكوكيز (Cookies):</h3>
                                    <p className="opacity-80">
                                        يستخدم موقعنا ملفات الارتباط الأساسية لضمان عمل الموقع بالشكل الصحيح وتحسين التجربة. لا تقوم هذه الملفات بتخزين أي معلومات مالية أو بيانات شخصية حساسة.
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-[hsl(var(--brand-cream))]/60 border border-[hsl(var(--brand-ink))]/10 space-y-2">
                                    <h3 className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">تأكيد الدفع الإلكتروني:</h3>
                                    <p className="opacity-80">
                                        بمجرد إجراء الدفع الإلكتروني بنجاح (فيزا، مدى، أبل باي)، يتم إرسال إشعار التأكيد وتحديث حالة الطلب عبر البريد أو الواتساب خلال 24 ساعة من الاستلام والتأكيد.
                                    </p>
                                </div>
                            </div>
                        </section>
                    )}

                </div>

            </main>

            <Footer />
            <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
            <WishlistDrawer open={wishOpen} onClose={() => setWishOpen(false)} />
            <PaymentResultModal />
            <StickyCartBar onOpenCart={() => setCartOpen(true)} />
            <MobileBottomNav onOpenCart={() => setCartOpen(true)} onOpenCustomerAuth={() => {}} />
        </div>
    );
}
