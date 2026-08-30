import { useState } from "react";
import { Check, Zap, Sparkles, Crown, Gamepad2, ShieldCheck, Plus, AlertTriangle, Clock } from "lucide-react";
import { useCart } from "../contexts/CartContext";
import { useCurrency } from "../contexts/CurrencyContext";
import { useStoreData } from "../contexts/DataContext";
import { toast } from "sonner";

const PS_PLUS_TIERS_CONFIG = [
    {
        id: "essential",
        name: "PlayStation Plus Essential",
        nameAr: "باقة أساسي (Essential)",
        badge: "الأكثر اقتصادياً 🏷️",
        accentColor: "from-blue-600 via-blue-700 to-indigo-800",
        borderColor: "border-blue-500/40",
        shadowColor: "shadow-blue-500/10",
        icon: Sparkles,
        iconColor: "text-blue-500",
        bgLight: "bg-blue-50/50 dark:bg-blue-950/20",
        defaultDurations: {
            five: [
                { id: "ess-1m", label: "شهر واحد", price: 10.0, stockStatus: "available" },
                { id: "ess-3m", label: "3 أشهر", price: 19.0, stockStatus: "available" },
                { id: "ess-12m", label: "12 شهر (سنة)", price: 48.0, badge: "توفير 40%", stockStatus: "available" },
            ],
            four: [
                { id: "ess-1m", label: "شهر واحد", price: 6.5, stockStatus: "available" },
                { id: "ess-3m", label: "3 أشهر", price: 12.0, stockStatus: "available" },
                { id: "ess-12m", label: "12 شهر (سنة)", price: 24.0, badge: "توفير 40%", stockStatus: "available" },
            ],
        },
        features: [
            "3 ألعاب مجانية شهرياً يمكنك الاحتفاظ بها",
            "إمكانية اللعب الجماعي أونلاين عبر الشبكة",
            "تخزين سحابي لحفظ تقدم الألعاب تلقائياً",
            "تخفيضات وعروض حصرية خاصة بالمشتركين",
        ],
    },
    {
        id: "extra",
        name: "PlayStation Plus Extra",
        nameAr: "باقة إضافي (Extra)",
        badge: "الأكثر طلباً ومبيعاً 🔥",
        accentColor: "from-red-600 via-red-700 to-rose-800",
        borderColor: "border-red-500/50",
        shadowColor: "shadow-red-500/20",
        icon: Zap,
        iconColor: "text-red-500",
        bgLight: "bg-red-50/50 dark:bg-red-950/20",
        isPopular: true,
        defaultDurations: {
            five: [
                { id: "ext-1m", label: "شهر واحد", price: 14.0, stockStatus: "available" },
                { id: "ext-3m", label: "3 أشهر", price: 28.0, stockStatus: "available" },
                { id: "ext-12m", label: "12 شهر (سنة)", price: 59.0, badge: "توفير 35%", stockStatus: "available" },
            ],
            four: [
                { id: "ext-1m", label: "شهر واحد", price: 9.0, stockStatus: "available" },
                { id: "ext-3m", label: "3 أشهر", price: 19.0, stockStatus: "available" },
                { id: "ext-12m", label: "12 شهر (سنة)", price: 42.0, badge: "توفير 35%", stockStatus: "available" },
            ],
        },
        features: [
            "جميع مميزات باقة Essential بالكامل",
            "كتالوج أكثر من 400+ لعبة ضخمة PS4 & PS5",
            "مكتبة ألعاب يوبيسوفت كلاسيك (Ubisoft+ Classics)",
            "ألعاب متجددة ومضافة شهرياً بدون تكلفة إضافية",
        ],
    },
    {
        id: "deluxe",
        name: "PlayStation Plus Deluxe",
        nameAr: "باقة فاخر (Deluxe / Premium)",
        badge: "المكتبة الشاملة والملكية 👑",
        accentColor: "from-purple-600 via-amber-500 to-yellow-500",
        borderColor: "border-amber-500/50",
        shadowColor: "shadow-amber-500/20",
        icon: Crown,
        iconColor: "text-amber-500",
        bgLight: "bg-amber-50/50 dark:bg-amber-950/20",
        defaultDurations: {
            five: [
                { id: "del-1m", label: "شهر واحد", price: 16.0, stockStatus: "available" },
                { id: "del-3m", label: "3 أشهر", price: 33.0, stockStatus: "available" },
                { id: "del-12m", label: "12 شهر (سنة)", price: 69.0, badge: "توفير 30%", stockStatus: "available" },
            ],
            four: [
                { id: "del-1m", label: "شهر واحد", price: 11.0, stockStatus: "available" },
                { id: "del-3m", label: "3 أشهر", price: 22.0, stockStatus: "available" },
                { id: "del-12m", label: "12 شهر (سنة)", price: 49.0, badge: "توفير 30%", stockStatus: "available" },
            ],
        },
        features: [
            "جميع مميزات فئتي Essential و Extra بالكامل",
            "مكتبة ألعاب كلاسيكية عريقة (PS1, PS2, PSP)",
            "تجربة الألعاب الضخمة الجديدة قبل الشراء (Trials)",
            "أولوية السيرفرات السريعة والدعم الفني الذهبي",
        ],
    },
];

export function PsPlusPricingTable() {
    const [platform, setPlatform] = useState("five"); // "five" | "four"
    const [selectedDurations, setSelectedDurations] = useState({});

    const { add } = useCart();
    const { format } = useCurrency();
    const { subscriptions } = useStoreData();

    // Dynamically build tier data for standard config
    const baseTiers = PS_PLUS_TIERS_CONFIG.map((cfg) => {
        const foundSub = (subscriptions || []).find((s) => s.id === cfg.id);
        if (!foundSub || !foundSub.durations || foundSub.durations.length === 0) {
            return cfg;
        }

        const buildPlatformDurations = (p) => {
            return foundSub.durations.map((d) => {
                const rawPrice = d[p];
                const numP = rawPrice != null && rawPrice !== "" ? Number(rawPrice) : 0;
                const isZero = numP <= 0;
                const rawOrig = p === "five" ? (d.originalFive ?? d.originalPrice) : (d.originalFour ?? d.originalPrice);
                const numOrig = rawOrig != null && rawOrig !== "" ? Number(rawOrig) : null;
                return {
                    id: d.id,
                    label: d.label,
                    price: numP,
                    originalPrice: numOrig != null && numOrig > numP ? numOrig : null,
                    isZero: isZero,
                    stockStatus: isZero ? "out" : (d.stockStatus || "available"),
                    badge: d.id.includes("12m") ? "توفير مميز ✨" : null,
                };
            });
        };

        return {
            ...cfg,
            durations: {
                five: buildPlatformDurations("five"),
                four: buildPlatformDurations("four"),
            },
        };
    });

    // Dynamically build tiers for any NEW CUSTOM subscriptions added by admin
    const customTiers = (subscriptions || [])
        .filter((s) => !PS_PLUS_TIERS_CONFIG.some((cfg) => cfg.id === s.id))
        .map((s) => {
            const buildPlatformDurations = (p) => {
                return (s.durations || []).map((d) => {
                    const rawPrice = d[p];
                    const numP = rawPrice != null && rawPrice !== "" ? Number(rawPrice) : 0;
                    const isZero = numP <= 0;
                    return {
                        id: d.id,
                        label: d.label,
                        price: numP,
                        isZero: isZero,
                        stockStatus: isZero ? "out" : (d.stockStatus || "available"),
                    };
                });
            };

            return {
                id: s.id,
                name: s.name_en || s.name,
                nameAr: s.name,
                badge: "خطة مخصصة ✨",
                accentColor: s.accent === "red" ? "from-red-600 via-rose-600 to-red-700" : s.accent === "amber" || s.accent === "yellow" ? "from-amber-500 via-yellow-500 to-amber-600" : "from-blue-600 via-indigo-600 to-blue-700",
                borderColor: s.accent === "red" ? "border-red-500/40" : s.accent === "amber" || s.accent === "yellow" ? "border-amber-500/40" : "border-blue-500/40",
                shadowColor: "shadow-blue-500/10",
                icon: Sparkles,
                iconColor: "text-blue-500",
                bgLight: "bg-blue-50/50 dark:bg-blue-950/20",
                durations: {
                    five: buildPlatformDurations("five"),
                    four: buildPlatformDurations("four"),
                },
                features: [
                    s.tagline || "تفعيل فوري وضمان كامل مع دعم متواصل 24/7",
                    "تسليم آمن ومضمون 100% عبر متجر دُكانك",
                ],
            };
        });

    const allTiers = [...baseTiers, ...customTiers].filter((tier) => {
        const foundSub = (subscriptions || []).find((s) => s.id === tier.id);
        if (tier.id === "deluxe") {
            // Deluxe tier is DISABLED by default unless explicitly set to visible: true in Admin panel
            return foundSub ? foundSub.visible === true : false;
        }
        return foundSub ? foundSub.visible !== false : true;
    });

    const handleDurationSelect = (tierId, durationId) => {
        setSelectedDurations((prev) => ({ ...prev, [tierId]: durationId }));
    };

    const handleAddToCart = (tier) => {
        const durList = (tier && tier.durations && tier.durations[platform]) ? tier.durations[platform] : [];
        const activeDurId = selectedDurations[tier.id] || durList[0]?.id;
        const durObj = durList.find((d) => d.id === activeDurId) || durList[0];

        if (!durObj || durObj.stockStatus === "out" || durObj.isZero) {
            toast.error("عذراً، هذه المدة غير متوفرة لهذا الجهاز 🚫");
            return;
        }

        const platformLabel = platform === "five" ? "PS5" : "PS4";

        add({
            key: `sub-${tier.id}-${platform}-${durObj.id}`,
            type: "subscription",
            title: `${tier.nameAr} — ${durObj.label}`,
            subtitle: `جهاز ${platformLabel} • تفعيل فوري وضمان كامل`,
            price: durObj.price,
        });

        toast.success(`تمت إضافة ${tier.nameAr} بالسلة! 🎮`, {
            description: `${durObj.label} • بسعر ${format(durObj.price)}`,
        });
    };

    return (
        <div className="space-y-8" data-testid="ps-plus-pricing-table">
            {/* Platform Switcher (PS5 vs PS4) */}
            <div className="flex flex-col items-center justify-center space-y-3">
                <div className="text-xs font-extrabold uppercase tracking-widest text-[hsl(var(--brand-ink))]/60 flex items-center gap-1.5">
                    <Gamepad2 className="w-4 h-4 text-[hsl(var(--brand-blue-deep))]" />
                    <span>اختر نوع جهاز بلايستيشن الخاص بك:</span>
                </div>

                <div className="w-full max-w-sm grid grid-cols-2 p-1.5 rounded-2xl bg-white dark:bg-white/[0.06] border border-[hsl(var(--brand-ink))]/15 shadow-sm">
                    <button
                        onClick={() => setPlatform("five")}
                        className={`h-12 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            platform === "five"
                                ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md"
                                : "text-[hsl(var(--brand-ink))]/70 hover:bg-[hsl(var(--brand-ink))]/5"
                        }`}
                    >
                        <span>🎮 سوني 5 (PS5)</span>
                    </button>
                    <button
                        onClick={() => setPlatform("four")}
                        className={`h-12 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 ${
                            platform === "four"
                                ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-md"
                                : "text-[hsl(var(--brand-ink))]/70 hover:bg-[hsl(var(--brand-ink))]/5"
                        }`}
                    >
                        <span>🎮 سوني 4 (PS4)</span>
                    </button>
                </div>
            </div>

            {/* Dynamic Grid of ALL Subscriptions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch">
                {allTiers.map((tier) => {
                    const durList = (tier && tier.durations && tier.durations[platform]) ? tier.durations[platform] : [];
                    const activeDurId = selectedDurations[tier.id] || durList[0]?.id;
                    const activeDur = durList.find((d) => d.id === activeDurId) || durList[0] || { price: 0, stockStatus: "available", isZero: false };
                    const IconComp = tier.icon || Sparkles;
                    const isZeroPrice = activeDur.isZero || activeDur.price <= 0;
                    const isOutOfStock = activeDur.stockStatus === "out" || isZeroPrice;
                    const isFastDelivery = activeDur.stockStatus === "fast";

                    return (
                        <div
                            key={tier.id}
                            className={`relative rounded-3xl bg-white dark:bg-white/[0.04] border-2 ${tier.borderColor} p-6 sm:p-7 flex flex-col justify-between space-y-6 shadow-xl ${tier.shadowColor} ${
                                tier.isPopular ? "ring-2 ring-red-500 scale-[1.02] md:-translate-y-2 z-10" : ""
                            } transition-all duration-300 hover:scale-[1.03]`}
                        >
                            {/* Top Popular Ribbon */}
                            {tier.isPopular && (
                                <div className="absolute -top-4 inset-x-0 flex justify-center">
                                    <span className="bg-gradient-to-r from-red-600 to-rose-600 text-white text-[11px] font-black px-4 py-1 rounded-full shadow-lg border border-white/20">
                                        🔥 الباقة الأكثر شعبية واختياراً
                                    </span>
                                </div>
                            )}

                            <div className="space-y-5">
                                {/* Card Header */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tier.accentColor} text-white flex items-center justify-center shadow-md`}>
                                            <IconComp className="w-6 h-6" />
                                        </div>
                                        <span className="text-[11px] font-extrabold text-[hsl(var(--brand-ink))]/70 bg-[hsl(var(--brand-cream))] dark:bg-white/10 px-3 py-1 rounded-full border border-[hsl(var(--brand-ink))]/10">
                                            {tier.badge}
                                        </span>
                                    </div>

                                    <div>
                                        <h3 className="font-extrabold text-lg sm:text-xl text-[hsl(var(--brand-ink))] leading-snug">
                                            {tier.nameAr}
                                        </h3>
                                        <p className="text-xs text-[hsl(var(--brand-ink))]/50 font-medium">{tier.name}</p>
                                    </div>
                                </div>

                                {/* Duration Selector Tabs */}
                                <div className="space-y-2">
                                    <div className="text-[11px] font-bold text-[hsl(var(--brand-ink))]/60">اختر مدة الاشتراك:</div>
                                    <div className="grid grid-cols-3 gap-1.5 p-1 rounded-2xl bg-[hsl(var(--brand-cream))]/80 dark:bg-white/[0.05] border border-[hsl(var(--brand-ink))]/10">
                                        {durList.map((dur) => (
                                            <button
                                                key={dur.id}
                                                onClick={() => handleDurationSelect(tier.id, dur.id)}
                                                className={`py-2 px-1 rounded-xl text-center flex flex-col items-center justify-center transition-all cursor-pointer ${
                                                    activeDurId === dur.id
                                                        ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-sm font-extrabold scale-105"
                                                        : "text-[hsl(var(--brand-ink))]/70 hover:bg-[hsl(var(--brand-ink))]/5 font-bold"
                                                }`}
                                            >
                                                <span className="text-[11px]">{dur.label}</span>
                                                {dur.isZero ? (
                                                    <span className="text-[9px] px-1 rounded-full font-black bg-slate-200 text-slate-700">
                                                        غير متوفر 🚫
                                                    </span>
                                                ) : dur.stockStatus === "out" ? (
                                                    <span className="text-[9px] px-1 rounded-full font-black bg-red-100 text-red-600">
                                                        نفد المخزون 🔴
                                                    </span>
                                                ) : dur.badge ? (
                                                    <span className={`text-[9px] px-1 rounded-full font-black ${activeDurId === dur.id ? "bg-amber-400 text-black" : "text-amber-600 bg-amber-100"}`}>
                                                        {dur.badge}
                                                    </span>
                                                ) : null}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Display & Stock Badge */}
                                <div className={`${tier.bgLight} p-4 rounded-2xl border border-[hsl(var(--brand-ink))]/10 text-center space-y-1`}>
                                    <div className="text-[11px] font-bold text-[hsl(var(--brand-ink))]/60">السعر النهائي للتفعيل:</div>
                                    
                                    {/* Official Store Strikethrough Price */}
                                    {activeDur.originalPrice && activeDur.originalPrice > activeDur.price && !isZeroPrice && (
                                        <div className="flex items-center justify-center gap-1.5 pb-0.5">
                                            <span className="line-through text-xs font-bold text-slate-400">
                                                {format(activeDur.originalPrice)}
                                            </span>
                                            <span className="px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-black shadow-xs">
                                                وفّر {Math.round(((activeDur.originalPrice - activeDur.price) / activeDur.originalPrice) * 100)}% 🔥
                                            </span>
                                        </div>
                                    )}

                                    <div className="text-3xl font-black text-[hsl(var(--brand-ink))]">
                                        {isZeroPrice ? "غير متوفر 🚫" : format(activeDur.price)}
                                    </div>

                                    {/* Stock Badge */}
                                    <div className="pt-1">
                                        {isZeroPrice ? (
                                            <div className="text-[11px] font-black text-slate-600 bg-slate-200 dark:bg-slate-800 py-1 px-3 rounded-xl inline-flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span>غير متوفر لهذا الجهاز 🚫</span>
                                            </div>
                                        ) : isOutOfStock ? (
                                            <div className="text-[11px] font-black text-red-600 bg-red-100 dark:bg-red-950/60 py-1 px-3 rounded-xl inline-flex items-center gap-1">
                                                <AlertTriangle className="w-3.5 h-3.5" />
                                                <span>غير متوفر حالياً بالمنشأة 🔴</span>
                                            </div>
                                        ) : isFastDelivery ? (
                                            <div className="text-[10px] text-blue-600 font-bold flex items-center justify-center gap-1">
                                                <Clock className="w-3.5 h-3.5 text-blue-500" />
                                                <span>تسليم وتفعيل خلال 15 دقيقة ⚡</span>
                                            </div>
                                        ) : (
                                            <div className="text-[10px] text-emerald-600 font-bold flex items-center justify-center gap-1">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                <span>تسليم وتفعيل فوري وضمان ذهبي كامل 🟢</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Included Features Checklist */}
                                <div className="space-y-2.5 pt-2">
                                    <div className="text-[11px] font-bold text-[hsl(var(--brand-ink))]/70">المميزات المشمولة بالباقة:</div>
                                    <ul className="space-y-2 text-xs font-medium text-[hsl(var(--brand-ink))]/80">
                                        {tier.features.map((feat, idx) => (
                                            <li key={idx} className="flex items-start gap-2">
                                                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                                                <span className="leading-snug">{feat}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={() => handleAddToCart(tier)}
                                disabled={isOutOfStock}
                                className={`w-full h-13 rounded-2xl bg-gradient-to-r ${tier.accentColor} text-white font-extrabold text-xs sm:text-sm shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`}
                            >
                                <Plus className="w-4 h-4" />
                                <span>{isZeroPrice ? "غير متوفر لهذا الجهاز 🚫" : isOutOfStock ? "عذراً، غير متوفر حالياً 🔴" : `إضافة ${tier.nameAr.split(" ")[0]} للسلة 🛒`}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
