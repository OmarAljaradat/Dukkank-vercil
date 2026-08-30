import { createContext, useContext, useEffect, useState, useCallback } from "react";
import axios from "axios";
import { getToken } from "../lib/api";
import { applyTheme } from "../lib/storage";
import {
    STORE as FALLBACK_STORE,
    SUBSCRIPTIONS as FALLBACK_SUBS,
    GAMES as FALLBACK_GAMES,
    BUNDLES as FALLBACK_BUNDLES,
} from "../data/products";

const API = `${import.meta.env.VITE_BACKEND_URL || ""}/api`;
const DataContext = createContext(null);

const FALLBACK_SECTIONS = [
    { id: "hero",          label: "الواجهة الرئيسية (Hero)",     visible: true },
    { id: "gamelaunch",    label: "إعلان إصدار لعبة",             visible: true },
    { id: "essential",     label: "الاشتراك الأساسي",            visible: true },
    { id: "extra",         label: "الاشتراك الإضافي",            visible: true },
    { id: "deluxe",        label: "الاشتراك الفاخر (Deluxe)",   visible: true },
    { id: "comparison",    label: "مقارنة الاشتراكات",           visible: true },
    { id: "games",         label: "الألعاب",                     visible: true },
    { id: "reviews",       label: "آراء العملاء",                visible: true },
    { id: "faq",           label: "الأسئلة الشائعة",             visible: true },
];

const FALLBACK_PROMO = {
    enabled: true,
    headerBanner: {
        enabled: true,
        title: "🔥 خصم 15% بمناسبة عطلة نهاية الأسبوع!",
        code: "DUKKANK15",
        badge: "عرض خاص",
        buttonText: "تسوّق الآن",
        bgColor: "amber"
    },
    flashSale: {
        enabled: true,
        title: "⚡ عروض الفلاش السريعة — تنتهي قريباً!",
        subtitle: "احصل على خصم 20% على جميع ألعاب البلايستيشن واشتراكات بلس",
        code: "FLASH20",
        discount: 20,
        endTime: new Date(Date.now() + 86400000 * 2).toISOString(),
        badge: "ساعات محددة ⏳"
    },
    popupModal: {
        enabled: false,
        title: "🎁 هدية خاصة لزيارتك الأولى!",
        description: "احصل على خصم 10% فوري على طلبتك الأولى بمتجر دُكانك 🎮",
        code: "WELCOME10",
        discount: 10,
        buttonText: "تفعيل الخصم 🚀",
        delaySeconds: 3
    },
    rewardBox: {
        enabled: false,
        title: "🎯 جرب حظك واحصل على خصم يصل لـ 25%!",
        code: "LUCKY25",
        discount: 25
    },
    applePayNotice: {
        enabled: true,
        title: "تنبيه الدفع السريع عبر Apple Pay ",
        subtitle: "للدفع المباشر السلس عبر Apple Pay، يرجى فتح المتجر في متصفح Safari. إذا كنت تتصفح من انستغرام، انسخ الرابط وافتحه بسفاري.",
        buttonText: "📋 نسخ رابط المتجر لـ Safari"
    }
};

const FALLBACK_SOCIAL_PROOF = {
    enabled: true,
    intervalSeconds: 12,
    messages: [],
};

const FALLBACK_WA = {
    general: "السلام عليكم 👋\nأود الاستفسار عن منتجات متجر {storeName}.",
    productInquiry: "السلام عليكم 👋\nشفت {productName} في متجركم وأبغى أطلبه.\n\nهل لا يزال متوفر؟",
    orderHeader: "السلام عليكم 👋\nأرغب بطلب من متجر *{storeName}*:",
    orderFooter: "شكراً لكم 🌟",
};

const FALLBACK_SITE_SETTINGS = {
    maintenanceMode: {
        enabled: false,
        title: "الموقع تحت الصيانة",
        message: "نعمل على تحسينات رهيبة وراح نرجعلكم قريباً 🚀",
        estimatedReturn: "",
        showCountdown: false,
    },
    disableTextSelection: false,
};

const FALLBACK_LAUNCH_ANNOUNCEMENT = {
    enabled: false,
    theme: "eafc",
    gameName: "EA SPORTS FC 27",
    badge: "⚽ انطلاقة الموسم الكروي الجديد",
    subtitle: "عِش متعة كرة القدم الحقيقية في Ultimate Team وأنماط المهنة الرقمية",
    description: "احصل على حسابك الأصلي المضمون لنسخة EA SPORTS FC الرسمية مع كافة التحديثات التنافسية وأولوية التسليم الفوري طوال الموسم الكروي.",
    price5: 42.0,
    price4: 24.0,
    ctaLabel: "احصل على نسختك الآن ⚡",
    ctaHref: "#games",
    imageUrl: "",
    bonusGift: "🎁 شامل 4600 FC Points + ضمان ذهبي طوال الموسم الكروي",
    rating: "⭐ اللعبة الكروية الأولى عالمياً • 🏆 EA SPORTS",
    stockLeft: 15,
    trailerUrl: "",
    countdownTarget: "2026-09-10",
    launchDate: "2026-09-10",
    note: "⚡ تسليم أوتوماتيكي مباشر كحساب أصلي Primary",
    currency: "$",
    platform5: "PS5",
    platform4: "PS4",
};

const FALLBACK_REVIEWS = [
    { id: "rev-1", name: "جعفر", rating: 5, text: "تعامل ممتاز ومتجر موثوق 🙏", order: 0 },
    { id: "rev-2", name: "زيد", rating: 5, text: "ما شاء الله تعامل ممتاز 🔥", order: 1 },
];

const FALLBACK_FAQS = [
    { id: "faq-1", icon: "zap", q: "كيف يتم تسليم الحساب أو الاشتراك بعد الدفع؟", a: "بعد إتمام الطلب، يتواصل معك فريقنا مباشرة عبر إنستغرام أو واتساب لطلب صورة كود الـ (QR Code) من شاشة السوني، وندخلك الحساب فوراً خلال دقائق ⚡", visible: true },
    { id: "faq-2", icon: "shield-check", q: "هل الحسابات والاشتراكات رسمية ومضمونة 100%؟", a: "نعم بكل تأكيد، جميع الحسابات والاشتراكات رسمية ومحمية بالضمان الذهبي طوال كامل فترة الاشتراك ❤️", visible: true },
    { id: "faq-3", icon: "help-circle", q: "ما الفرق بين الحساب الأساسي والحساب الثانوي؟", a: "الحساب الأساسي يتيح لك اللعب من حسابك الشخصي والتروفيات، بينما الحساب الثانوي تلعب منه مباشرة عبر الإنترنت بسعر أوفر 🎮", visible: true },
    { id: "faq-4", icon: "credit-card", q: "ما هي طرق الدفع المتاحة داخل المتجر؟", a: "نوفر الدفع الآمن عبر البطاقات البنكية، خدمة أبل باي (Apple Pay)، نظام كليك (CliQ)، والمحافظ الرقمية 💳", visible: true },
    { id: "faq-5", icon: "truck", q: "كيف يتم تفعيل اللعبة أو الاشتراك على جهازي البلايستيشن؟", a: "تختار من شاشة السوني تسجيل الدخول عبر كود (QR Code) وتصوره وترسله لنا في المحادثة؛ نقوم بمسح الكود وتفعيل الحساب بجهازك فوراً بأمان 🛠️", visible: true },
    { id: "faq-6", icon: "headphones", q: "ماذا أفعل إذا واجهت أي مشكلة أو استفسار؟", a: "تواصل معنا مباشرة عبر زر الواتساب أو إنستغرام، وفريق الدعم متواجد لخدمتك ومساعدتك خطوة بخطوة 💬", visible: true }
];

const FALLBACK_CONTENT = {
    hero: {
        badge: "متجر موثوق • تسليم فوري ⚡",
        titleLine1: "كل ألعابك وااشتراكاتك",
        titleLine2: "بضغطة زر واحدة.",
        subtitle: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على إنستجرام.",
        ctaBrowse: "تصفّح المنتجات 🎮",
        ctaWhatsApp: "تواصل مع الدعم الفني 💬",
        benefitInstant: "تسليم فوري ⚡",
        benefitOriginal: "حسابات أصلية 🛡️",
        benefitSupport: "دعم مخصص 24/7",
    },
    essential: {
        eyebrow: "الاشتراكات",
        title: "بلايستيشن بلس أساسي",
        description: "للاعب اللي بدو الأساسيات: ألعاب شهرية، أونلاين متعدد اللاعبين.",
        featureTitle: "ليش الاشتراك الأساسي؟",
        featureBullets: ["اللعب أونلاين مع أصدقائك", "ألعاب شهرية مجانية"],
    },
    extra: {
        eyebrow: "الاشتراكات",
        title: "بلايستيشن بلس إضافي",
        description: "مكتبة أوسع تتجاوز ٤٠٠ لعبة من Sony وشركاء آخرين، بسعر يستاهل.",
        featureTitle: "ليش الاشتراك الإضافي؟",
        featureBullets: ["مكتبة ضخمة (+400 لعبة)", "تجارب لعب مجانية", "كل ميزات الأساسي"],
    },
    comparison: {
        eyebrow: "مقارنة الباقات",
        title: "أساسي ولا إضافي؟ شو الفرق؟",
        description: "كل خطة لها نقاط قوتها — هاي مقارنة سريعة عشان تختار صح من أول مرة.",
        popularBadge: "الأكثر طلباً",
        essentialColLabel: "أساسي",
        extraColLabel: "إضافي",
        ctaStart: "جاهز تبدأ؟",
        ctaEssential: "اختر الأساسي",
        ctaExtra: "اختر الإضافي",
        rows: [
            { feature: "اللعب أونلاين عبر الشبكة (Online Multiplayer)", essential: true, extra: true, deluxe: true },
            { feature: "ألعاب شهرية مجانية متجددة كل شهر", essential: true, extra: true, deluxe: true },
            { feature: "مكتبة ألعاب ضخمة (+400 لعبة كتالوج PS4 & PS5)", essential: false, extra: true, deluxe: true },
            { feature: "كتالوج ألعاب يوبي سوفت (Ubisoft+ Classics)", essential: false, extra: true, deluxe: true },
            { feature: "ألعاب استوديوهات بلايستيشن الحصرية (PlayStation Studios)", essential: false, extra: true, deluxe: true },
            { feature: "تفعيل فوري مضمون كامل فترة الاشتراك 100%", essential: true, extra: true, deluxe: true },
        ],
    },
    bundles: {
        eyebrow: "باقات مدمجة",
        title: "خذ اشتراك + لعبة بسعر أقل",
        description: "وفّر أكثر مع باقاتنا الجاهزة.",
    },
    bundleBuilder: {
        eyebrow: "ابني باقتك",
        title: "اختار أنت، واحنا نخصملك",
        description: "ضمّ اشتراك + ألعاب، وكل ما زدت عنصر زاد الخصم تلقائياً.",
        discountsLabel: "نسب الخصم حسب الاشتراك والمدة",
        step1: "١) اختر جهازك",
        step1Hint: "السعر يتغير حسب الجهاز",
        step2: "٢) أضف اشتراك (اختياري)",
        step3: "٣) أضف ألعاب",
        summaryTitle: "ملخص باقتك",
        summaryEmpty: "لسه ما اخترت شي.",
        subtotal: "المجموع الفرعي",
        discountLabel: "خصم باقتك",
        totalLabel: "المجموع",
        hintNoSub: "💡 أضف اشتراك للحصول على خصم!",
        addAll: "أضف باقتك للسلة",
        addedAll: "أُضيفت!",
        reset: "ابدأ من جديد",
    },
    games: {
        eyebrow: "ألعاب رقمية",
        title: "أبرز الألعاب المتاحة",
        description: "اختر جهازك واشترِ بضغطة زر واحدة.",
        customGameTitle: "لعبة محددة بدّك إياها؟",
        customGameSubtitle: "احكينا على الواتساب للدعم المباشر.",
        customGameCta: "اطلب لعبة مخصصة",
    },
    reviews: {
        eyebrow: "آراء العملاء",
        title: "ثقة عملائنا أهم شي عنا.",
        description: "عملاء جربوا دُكانك وتجربتهم الموثقة.",
        ratingOutOf5: "من 5 نجوم",
        basedOn: "مبني على",
    },
    faq: {
        badge: "الأسئلة الشائعة",
        title: "أي استفسار عندك؟",
        description: "فريقنا متواجد ٢٤/٧ لمساعدتك.",
    },
    emailSignup: {
        eyebrow: "اشترك بنشرتنا",
        title: "احصل على خصم 10% فوراً 🎁",
        description: "سجّل إيميلك واستلم كوبون خصم شخصي.",
        placeholder: "your-email@example.com",
        cta: "احصل على الكوبون",
        success: "تم! نسخت الكوبون لك.",
    },
    footer: {
        tagline: "متجرك الموثوق للاشتراكات والألعاب الرقمية مع تسليم فوري وضمان ذهبي.",
        linksTitle: "روابط سريعة",
        contactTitle: "تواصل معنا",
        copyright: "© دُكانك — كل الحقوق محفوظة.",
    },
    policies: {
        privacyText: "",
        termsText: "",
        refundText: "",
        warrantyText: "",
    }
};

const saveLocal = (key, val) => {
    try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
};
const loadLocal = (key, fallback) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch {
        return fallback;
    }
};

// Persistent User Override System (Never allow serverless cold start to overwrite explicit admin choices)
const loadOverrides = () => {
    try {
        const item = localStorage.getItem("dukkank_admin_overrides_v2");
        return item ? JSON.parse(item) : { sections: {}, subscriptions: {}, games: {}, theme: {}, launch: {}, promo: {} };
    } catch {
        return { sections: {}, subscriptions: {}, games: {}, theme: {}, launch: {}, promo: {} };
    }
};

const saveOverrides = (overrides) => {
    try {
        localStorage.setItem("dukkank_admin_overrides_v2", JSON.stringify(overrides));
    } catch {}
};

export function DataProvider({ children }) {
    const [store, setStoreState] = useState(() => loadLocal("dukkank_live_store", FALLBACK_STORE));
    const [subscriptions, setSubscriptionsState] = useState(() => loadLocal("dukkank_live_subscriptions", FALLBACK_SUBS));
    const [games, setGamesState] = useState(() => {
        try {
            const v = localStorage.getItem("dukkank_games_inventory_v54_final");
            if (v !== "loaded_52") {
                localStorage.setItem("dukkank_games_inventory_v54_final", "loaded_52");
                saveLocal("dukkank_live_games", FALLBACK_GAMES);
                saveLocal("dukkank_live_admin_games", FALLBACK_GAMES);
                return FALLBACK_GAMES;
            }
        } catch (_) {}
        return loadLocal("dukkank_live_games", FALLBACK_GAMES || []);
    });
    const [adminGames, setAdminGamesState] = useState(() => {
        try {
            const v = localStorage.getItem("dukkank_games_inventory_v54_final");
            if (v !== "loaded_52") {
                return FALLBACK_GAMES;
            }
        } catch (_) {}
        return loadLocal("dukkank_live_admin_games", FALLBACK_GAMES || []);
    });
    const [bundles, setBundlesState] = useState(() => loadLocal("dukkank_live_bundles", FALLBACK_BUNDLES));
    const [sections, setSectionsState] = useState(() => loadLocal("dukkank_live_sections", FALLBACK_SECTIONS));
    const [promo, setPromoState] = useState(() => loadLocal("dukkank_live_promo", FALLBACK_PROMO));
    const [socialProof, setSocialProofState] = useState(() => loadLocal("dukkank_live_social_proof", FALLBACK_SOCIAL_PROOF));
    const [waTemplates, setWATemplatesState] = useState(() => loadLocal("dukkank_live_wa_templates", FALLBACK_WA));
    const [reviews, setReviewsState] = useState(() => loadLocal("store_reviews_list", loadLocal("dukkank_live_reviews", FALLBACK_REVIEWS)));
    const [faqs, setFaqsState] = useState(() => loadLocal("store_faqs_list", loadLocal("dukkank_live_faqs", FALLBACK_FAQS)));
    const [content, setContentState] = useState(() => loadLocal("dukkank_live_content", FALLBACK_CONTENT));
    const [siteSettings, setSiteSettingsState] = useState(() => loadLocal("dukkank_live_site_settings", FALLBACK_SITE_SETTINGS));
    const [launchAnnouncement, setLaunchAnnouncementState] = useState(() => loadLocal("dukkank_live_launch", FALLBACK_LAUNCH_ANNOUNCEMENT));
    const [theme, setThemeState] = useState(() => loadLocal("dukkank_live_theme", {}));
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const setStore = (val) => { setStoreState(val); saveLocal("dukkank_live_store", val); };
    const setGames = (val) => {
        if (Array.isArray(val)) {
            const overrides = loadOverrides();
            val.forEach(g => {
                if (g && g.id) {
                    overrides.games[g.id] = { hidden: !!g.hidden, available: g.available !== false, updatedAt: Date.now() };
                }
            });
            saveOverrides(overrides);
        }
        setGamesState(val);
        saveLocal("dukkank_live_games", val);
        setAdminGamesState(val);
        saveLocal("dukkank_live_admin_games", val);
    };
    const setAdminGames = (val) => { setAdminGamesState(val); saveLocal("dukkank_live_admin_games", val); };
    
    const setSubscriptions = (val) => {
        if (Array.isArray(val)) {
            const overrides = loadOverrides();
            val.forEach(s => {
                if (s && s.id) {
                    overrides.subscriptions[s.id] = { visible: s.visible !== false, hidden: !!s.hidden, updatedAt: Date.now() };
                }
            });
            saveOverrides(overrides);
        }
        setSubscriptionsState(val);
        saveLocal("dukkank_live_subscriptions", val);
    };

    const setBundles = (val) => { setBundlesState(val); saveLocal("dukkank_live_bundles", val); };
    
    const setSections = (val) => {
        if (Array.isArray(val)) {
            const overrides = loadOverrides();
            val.forEach(s => {
                if (s && s.id) {
                    overrides.sections[s.id] = { visible: s.visible !== false, updatedAt: Date.now() };
                }
            });
            saveOverrides(overrides);
        }
        setSectionsState(val);
        saveLocal("dukkank_live_sections", val);
    };

    const setPromo = (val) => {
        if (val && typeof val === "object") {
            const overrides = loadOverrides();
            overrides.promo = { ...val, updatedAt: Date.now() };
            saveOverrides(overrides);
        }
        setPromoState(val);
        saveLocal("dukkank_live_promo", val);
        const token = getToken();
        if (token) {
            axios.put(`${API}/admin/promo`, val, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
    };
    const setSocialProof = (val) => { setSocialProofState(val); saveLocal("dukkank_live_social_proof", val); };
    const setWATemplates = (val) => { setWATemplatesState(val); saveLocal("dukkank_live_wa_templates", val); };
    const setReviews = (val) => { setReviewsState(val); saveLocal("dukkank_live_reviews", val); saveLocal("store_reviews_list", val); };
    const setFaqs = (val) => {
        setFaqsState(val);
        saveLocal("dukkank_live_faqs", val);
        saveLocal("store_faqs_list", val);
        const token = getToken();
        if (token && Array.isArray(val)) {
            axios.put(`${API}/admin/faqs`, val, { headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
        }
    };
    const setContent = (val) => { setContentState(val); saveLocal("dukkank_live_content", val); };
    const setSiteSettings = (val) => { setSiteSettingsState(val); saveLocal("dukkank_live_site_settings", val); };
    const setLaunchAnnouncement = (val) => {
        if (val && typeof val === "object") {
            const overrides = loadOverrides();
            overrides.launch = { ...val, updatedAt: Date.now() };
            saveOverrides(overrides);
        }
        setLaunchAnnouncementState(val);
        saveLocal("dukkank_live_launch", val);
    };

    const setTheme = (val) => {
        if (val && typeof val === "object") {
            const overrides = loadOverrides();
            overrides.theme = { ...val };
            saveOverrides(overrides);
        }
        setThemeState(val);
        saveLocal("dukkank_live_theme", val);
        if (val && typeof val === "object") applyTheme(val);
    };

    const mergeSections = (fetched) => {
        if (!Array.isArray(fetched) || fetched.length === 0) return sections;
        const overrides = loadOverrides();
        const localCurrent = loadLocal("dukkank_live_sections", sections || FALLBACK_SECTIONS);
        const localMap = new Map((localCurrent || []).map(s => [s.id, s]));

        // Base array: if user has a custom ordering in localCurrent, preserve that order
        const baseList = (localCurrent && localCurrent.length >= fetched.length) ? localCurrent : fetched;

        return baseList.map(item => {
            const serverMatch = fetched.find(f => f.id === item.id);
            const localMatch = localMap.get(item.id);
            const override = overrides.sections?.[item.id];

            let visible = item.visible !== false;
            if (override !== undefined && override.visible !== undefined) {
                visible = override.visible;
            } else if (localMatch !== undefined && localMatch.visible !== undefined) {
                visible = localMatch.visible;
            } else if (serverMatch !== undefined && serverMatch.visible !== undefined) {
                visible = serverMatch.visible;
            }

            return {
                ...item,
                ...(serverMatch || {}),
                ...(localMatch || {}),
                visible
            };
        });
    };

    const mergeSubscriptions = (fetched) => {
        if (!Array.isArray(fetched) || fetched.length === 0) return subscriptions;
        const overrides = loadOverrides();
        const localCurrent = loadLocal("dukkank_live_subscriptions", subscriptions || FALLBACK_SUBS);
        const localMap = new Map((localCurrent || []).map(s => [s.id, s]));

        const defaultSubsMap = new Map((FALLBACK_SUBS || []).map(s => [s.id, s]));

        return fetched.map(item => {
            const localMatch = localMap.get(item.id);
            const defaultSub = defaultSubsMap.get(item.id);
            const override = overrides.subscriptions?.[item.id];

            let visible = item.visible !== false;
            let hidden = !!item.hidden;

            if (override !== undefined) {
                if (override.visible !== undefined) visible = override.visible;
                if (override.hidden !== undefined) hidden = override.hidden;
            } else if (localMatch !== undefined) {
                if (localMatch.visible !== undefined) visible = localMatch.visible;
                if (localMatch.hidden !== undefined) hidden = localMatch.hidden;
            }

            // Merge durations to preserve originalFive and originalFour official store prices
            const mergedDurations = (item.durations || defaultSub?.durations || []).map((d, idx) => {
                const localDur = localMatch?.durations?.[idx] || {};
                const defaultDur = defaultSub?.durations?.[idx] || {};
                return {
                    ...defaultDur,
                    ...d,
                    ...localDur,
                    originalFour: localDur.originalFour ?? d.originalFour ?? defaultDur.originalFour,
                    originalFive: localDur.originalFive ?? d.originalFive ?? defaultDur.originalFive,
                };
            });

            return {
                ...item,
                ...(localMatch || {}),
                durations: mergedDurations,
                visible,
                hidden
            };
        });
    };

    const mergeGames = (fetched) => {
        if (!Array.isArray(fetched) || fetched.length === 0) return games && games.length > 0 ? games : FALLBACK_GAMES;
        const overrides = loadOverrides();
        const localCurrent = loadLocal("dukkank_live_games", games || FALLBACK_GAMES);
        const localMap = new Map((localCurrent || []).map(g => [g.id, g]));

        return fetched.map(item => {
            const localMatch = localMap.get(item.id);
            const override = overrides.games?.[item.id];

            let hidden = !!item.hidden;
            let available = item.available !== false;

            if (override !== undefined) {
                if (override.hidden !== undefined) hidden = override.hidden;
                if (override.available !== undefined) available = override.available;
            } else if (localMatch !== undefined) {
                if (localMatch.hidden !== undefined) hidden = localMatch.hidden;
                if (localMatch.available !== undefined) available = localMatch.available;
            }

            return {
                ...item,
                ...(localMatch || {}),
                hidden,
                available
            };
        });
    };

    const mergeContent = (fetched) => {
        if (!fetched || typeof fetched !== "object" || Array.isArray(fetched)) return content;
        const out = {};
        for (const key of Object.keys(FALLBACK_CONTENT)) {
            const fb = content[key] || FALLBACK_CONTENT[key];
            const fc = fetched[key];
            if (fc && typeof fc === "object" && !Array.isArray(fc)) {
                out[key] = { ...fb, ...fc };
            } else {
                out[key] = fc != null ? fc : fb;
            }
        }
        return out;
    };

    const mergePromo = (fetched) => {
        const overrides = loadOverrides();
        const promoOverride = overrides.promo && typeof overrides.promo === "object" ? overrides.promo : {};
        const base = {
            ...FALLBACK_PROMO,
            ...(fetched || {}),
            ...promoOverride,
            headerBanner: { ...FALLBACK_PROMO.headerBanner, ...(fetched?.headerBanner || {}), ...(promoOverride.headerBanner || {}) },
            flashSale: { ...FALLBACK_PROMO.flashSale, ...(fetched?.flashSale || {}), ...(promoOverride.flashSale || {}) },
            popupModal: { ...FALLBACK_PROMO.popupModal, ...(fetched?.popupModal || {}), ...(promoOverride.popupModal || {}) },
            rewardBox: { ...FALLBACK_PROMO.rewardBox, ...(fetched?.rewardBox || {}), ...(promoOverride.rewardBox || {}) },
            applePayNotice: { ...FALLBACK_PROMO.applePayNotice, ...(fetched?.applePayNotice || {}), ...(promoOverride.applePayNotice || {}) },
        };
        return base;
    };

    const mergeLaunchAnnouncement = (fetched) => {
        if (fetched && typeof fetched === "object" && !Array.isArray(fetched) && Object.keys(fetched).length > 0) {
            return fetched;
        }
        const local = loadLocal("dukkank_live_launch", null);
        if (local && typeof local === "object") return local;
        const overrides = loadOverrides();
        if (overrides.launch && Object.keys(overrides.launch).length > 0) {
            return { ...FALLBACK_LAUNCH_ANNOUNCEMENT, ...overrides.launch };
        }
        return FALLBACK_LAUNCH_ANNOUNCEMENT;
    };

    const mergeThemeData = (fetched) => {
        const overrides = loadOverrides();
        const userTheme = overrides.theme;
        if (userTheme && typeof userTheme === "object" && Object.keys(userTheme).length > 0) {
            return userTheme;
        }
        const localTheme = loadLocal("dukkank_live_theme", {});
        if (localTheme && typeof localTheme === "object" && Object.keys(localTheme).length > 0) {
            return localTheme;
        }
        return (fetched && typeof fetched === "object") ? fetched : {};
    };

    const asArray = (v, fallback) => (Array.isArray(v) && v.length > 0 ? v : fallback);
    const asObject = (v, fallback) => v && typeof v === "object" && !Array.isArray(v) ? v : fallback;

    const fetchAll = useCallback(async () => {
        try {
            setLoading(true);
            const t = Date.now();
            const results = await Promise.allSettled([
                axios.get(`${API}/store?t=${t}`),
                axios.get(`${API}/subscriptions?t=${t}`),
                axios.get(`${API}/games?t=${t}`),
                axios.get(`${API}/bundles?t=${t}`),
                axios.get(`${API}/sections?t=${t}`),
                axios.get(`${API}/promo?t=${t}`),
                axios.get(`${API}/social-proof?t=${t}`),
                axios.get(`${API}/wa-templates?t=${t}`),
                axios.get(`${API}/reviews?t=${t}`),
                axios.get(`${API}/faqs?t=${t}`),
                axios.get(`${API}/content?t=${t}`),
                axios.get(`${API}/site-settings?t=${t}`),
                axios.get(`${API}/launch-announcement?t=${t}`),
                axios.get(`${API}/theme?t=${t}`),
            ]);

            const getVal = (idx) => (results[idx]?.status === "fulfilled" ? results[idx].value?.data : null);

            const s = getVal(0);
            const subs = getVal(1);
            const gms = getVal(2);
            const bnds = getVal(3);
            const secs = getVal(4);
            const prom = getVal(5);
            const sp = getVal(6);
            const wat = getVal(7);
            const rvs = getVal(8);
            const fqs = getVal(9);
            const cnt = getVal(10);
            const ss = getVal(11);
            const la = getVal(12);
            const thm = getVal(13);

            if (s) { const obj = asObject(s, store); setStoreState(obj); saveLocal("dukkank_live_store", obj); }
            if (subs) { const m = mergeSubscriptions(subs); setSubscriptionsState(m); saveLocal("dukkank_live_subscriptions", m); }
            if (gms) { const m = mergeGames(gms); setGamesState(m); saveLocal("dukkank_live_games", m); }
            if (bnds) { const arr = asArray(bnds, bundles); setBundlesState(arr); saveLocal("dukkank_live_bundles", arr); }
            if (secs) { const m = mergeSections(secs); setSectionsState(m); saveLocal("dukkank_live_sections", m); }
            if (prom) { const m = mergePromo(prom); setPromoState(m); saveLocal("dukkank_live_promo", m); }
            if (sp) { const obj = asObject(sp, socialProof); setSocialProofState(obj); saveLocal("dukkank_live_social_proof", obj); }
            if (wat) { const obj = asObject(wat, waTemplates); setWATemplatesState(obj); saveLocal("dukkank_live_wa_templates", obj); }
            if (rvs) {
                const localRev = loadLocal("store_reviews_list", null);
                if (localRev && Array.isArray(localRev) && localRev.length >= 40) {
                    setReviewsState(localRev);
                } else {
                    const arr = asArray(rvs, reviews);
                    setReviewsState(arr);
                    saveLocal("dukkank_live_reviews", arr);
                }
            }

            if (fqs) { const arr = asArray(fqs, faqs); setFaqsState(arr); saveLocal("dukkank_live_faqs", arr); }
            if (cnt) { const m = mergeContent(cnt); setContentState(m); saveLocal("dukkank_live_content", m); }
            if (ss) { const obj = asObject(ss, siteSettings); setSiteSettingsState(obj); saveLocal("dukkank_live_site_settings", obj); }
            if (la) { const m = mergeLaunchAnnouncement(la); setLaunchAnnouncementState(m); saveLocal("dukkank_live_launch", m); }
            if (thm || Object.keys(loadOverrides().theme || {}).length > 0) {
                const finalTheme = mergeThemeData(thm);
                if (Object.keys(finalTheme).length > 0) {
                    setThemeState(finalTheme);
                    saveLocal("dukkank_live_theme", finalTheme);
                }
            }

            const token = getToken();
            if (token) {
                try {
                    const adminRes = await axios.get(`${API}/admin/games`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (adminRes?.data) setAdminGames(mergeGames(adminRes.data));
                } catch (_e) { }
            }
            setError(null);
        } catch (e) {
            console.warn("DataProvider using persistent local data");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAll();

        // 1. Live cross-tab sync: update state immediately when admin modifies data in another tab
        const handleStorageChange = (e) => {
            if (!e.key || !e.newValue) return;
            try {
                const parsed = JSON.parse(e.newValue);
                if (e.key === "dukkank_live_subscriptions") setSubscriptionsState(parsed);
                else if (e.key === "dukkank_live_sections") setSectionsState(parsed);
                else if (e.key === "dukkank_live_games") setGamesState(parsed);
                else if (e.key === "dukkank_live_theme") {
                    setThemeState(parsed);
                    if (parsed && typeof parsed === "object") applyTheme(parsed);
                }
                else if (e.key === "dukkank_live_launch") setLaunchAnnouncementState(parsed);
                else if (e.key === "dukkank_live_promo") setPromoState(parsed);
                else if (e.key === "dukkank_live_store") setStoreState(parsed);
                else if (e.key === "dukkank_live_content") setContentState(parsed);
                else if (e.key === "dukkank_live_site_settings") setSiteSettingsState(parsed);
            } catch (_) {}
        };

        // 2. Tab focus / visibility sync: refetch fresh data from server when user switches back to tab
        const handleVisibilityOrFocus = () => {
            if (document.visibilityState === "visible") {
                fetchAll();
            }
        };

        window.addEventListener("storage", handleStorageChange);
        window.addEventListener("focus", handleVisibilityOrFocus);
        document.addEventListener("visibilitychange", handleVisibilityOrFocus);

        return () => {
            window.removeEventListener("storage", handleStorageChange);
            window.removeEventListener("focus", handleVisibilityOrFocus);
            document.removeEventListener("visibilitychange", handleVisibilityOrFocus);
        };
    }, [fetchAll]);

    return (
        <DataContext.Provider
            value={{
                store,
                setStore,
                subscriptions,
                setSubscriptions,
                games,
                setGames,
                adminGames,
                setAdminGames,
                bundles,
                setBundles,
                sections,
                setSections,
                promo,
                setPromo,
                socialProof,
                setSocialProof,
                waTemplates,
                setWATemplates,
                reviews,
                setReviews,
                faqs,
                setFaqs,
                content,
                setContent,
                siteSettings,
                setSiteSettings,
                launchAnnouncement,
                setLaunchAnnouncement,
                theme,
                setTheme,
                loading,
                error,
                reload: fetchAll,
            }}
        >
            {children}
        </DataContext.Provider>
    );
}

export function useStoreData() {
    const ctx = useContext(DataContext);
    if (!ctx) throw new Error("useStoreData must be used within DataProvider");
    return ctx;
}
