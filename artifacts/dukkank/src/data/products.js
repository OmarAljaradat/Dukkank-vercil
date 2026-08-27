// ════════════════════════════════════════════════════════════════════════════
//  ملف بيانات متجر "دُكانك"
// ════════════════════════════════════════════════════════════════════════════
//  هذا الملف الوحيد يلي بدك تعدل عليه عشان تغيّر:
//    1) رقم الواتساب وروابط المتجر (في قسم STORE تحت)
//    2) أسعار الاشتراكات (في قسم SUBSCRIPTIONS)
//    3) أسعار وحالة توفر الألعاب (في قسم GAMES)
//  بعد أي تعديل ⇒ احفظ الملف ⇒ الموقع يتحدّث تلقائياً.
// ════════════════════════════════════════════════════════════════════════════


// ┌───────────────────────────────────────────────────────────────────────┐
// │  ① معلومات المتجر — غيّر رقم الواتساب من هنا فقط                       │
// │     • whatsapp: الرقم بصيغة دولية (لازم يبدأ بكود الدولة، بدون +)       │
// │       مثال: 962775585112  (962 = كود الأردن، 0775585112 رقمك المحلي)   │
// │     • whatsappDisplay: نفس الرقم بالشكل اللي يطلع للعميل بالموقع        │
// └───────────────────────────────────────────────────────────────────────┘
export const STORE = {
    name: "دُكانك",
    tagline: "اشتراكات وألعاب رقمية بأفضل الأسعار",

    // 👇 رقم الواتساب — عدّل من هنا فقط، رح يتغيّر بكل الموقع تلقائياً
    whatsapp: "962775585112",          // الرقم الدولي (بدون + أو 00)
    whatsappDisplay: "0775585112",     // الرقم اللي يطلع للعميل

    instagram: "https://www.instagram.com/dukkank15/",
};


// ┌───────────────────────────────────────────────────────────────────────┐
// │  ② اشتراكات بلايستيشن بلس                                              │
// │     • four = سعر PS4 بالدولار                                          │
// │     • five = سعر PS5 بالدولار                                          │
// │     • حط null إذا الخطة ما متوفرة على هذا الجهاز                       │
// │       (مثلاً اشتراك الشهر الواحد ما متوفر على PS5 ⇒ five: null)        │
// └───────────────────────────────────────────────────────────────────────┘
export const SUBSCRIPTIONS = [
    {
        id: "essential",
        name: "اشتراك أساسي",
        tagline: "خطط ألعاب أساسية بسعر مميز",
        accent: "blue",
        durations: [
            { id: "ess-1m",  label: "شهر واحد",  four: 6.5, five: 10.0 },
            { id: "ess-3m",  label: "٣ شهور",    four: 12,  five: 19   },
            { id: "ess-12m", label: "سنة كاملة", four: 24,  five: 48   },
        ],
    },
    {
        id: "extra",
        name: "اشتراك إضافي",
        tagline: "تجربة أوسع مع مكتبة ألعاب أكبر",
        accent: "red",
        durations: [
            { id: "ext-1m",  label: "شهر واحد",  four: 9,  five: 14.0 },
            { id: "ext-3m",  label: "٣ شهور",    four: 19, five: 28   },
            { id: "ext-12m", label: "سنة كاملة", four: 42, five: 59   },
        ],
    },
    {
        id: "deluxe",
        name: "اشتراك فاخر (Deluxe)",
        tagline: "الباقة الملكية والشاملة لكافة الألعاب الكلاسيكية والتجريبية",
        accent: "amber",
        durations: [
            { id: "del-1m",  label: "شهر واحد",  four: 11, five: 16.0 },
            { id: "del-3m",  label: "٣ شهور",    four: 22, five: 33.0 },
            { id: "del-12m", label: "سنة كاملة", four: 49, five: 69.0 },
        ],
    },
];


// ┌───────────────────────────────────────────────────────────────────────┐
// │  ③ الألعاب                                                             │
// │                                                                       │
// │     لكل لعبة عدّل ٤ أشياء فقط:                                          │
// │                                                                       │
// │     • four:       سعر PS4 (مثلاً 16) أو null إذا اللعبة بس على PS5     │
// │     • five:       سعر PS5 (مثلاً 26) أو null إذا اللعبة بس على PS4     │
// │     • available:  true  ⇐  اللعبة متوفرة بالمخزون                      │
// │                   false ⇐  اللعبة غير متوفرة حالياً (تظهر بشارة حمراء  │
// │                           "غير متوفرة" وما يقدر العميل يضيفها للسلة)   │
// │     • bestSeller: true  ⇐  تظهر شارة ذهبية "الأكثر مبيعاً" على البطاقة │
// │                   false ⇐  لا شارة                                     │
// │                                                                       │
// │     ملاحظة: لإضافة لعبة جديدة تماماً، انسخ أي بلوك تحت وعدّل عليه.      │
// │             لإخفاء لعبة كلياً من الموقع، احذف البلوك.                  │
// └───────────────────────────────────────────────────────────────────────┘
export const GAMES = [
    {
        id: "spiderman2",
        name: "Marvel's Spider-Man 2 (عربي)",
        sub: "أكشن ومغامرات • بالدبلجة والترجمة العربية الكاملة",
        image: "/games/spiderman2.jpg",
        gradientFrom: "#5a0a0a", gradientTo: "#1d0306",
        four: null,
        five: 26,
        secondary: 21,
        available: true,
        bestSeller: true,
    },
    {
        id: "forza5",
        name: "Forza Horizon 5",
        sub: "سباقات وعالم مفتوح • أضخم مهرجان سيارات",
        image: "/games/forza5.jpg",
        gradientFrom: "#0d3a4a", gradientTo: "#031018",
        four: null,
        five: 26,
        secondary: 23,
        available: true,
        bestSeller: true,
    },
    {
        id: "mk11",
        name: "Mortal Kombat 11",
        sub: "قتال وحماس • النسخة المحسنة مع كامل الشخصيات",
        image: "/games/mk11.jpg",
        gradientFrom: "#3a1a08", gradientTo: "#120602",
        four: 8,
        five: 9,
        secondary: 7.5,
        available: true,
        bestSeller: true,
    },
    {
        id: "gta5",
        name: "Grand Theft Auto V",
        sub: "عالم مفتوح وأكشن • النسخة المحسنة + GTA Online",
        image: "/games/gta5.jpg",
        gradientFrom: "#13343f", gradientTo: "#04141a",
        four: 13,
        five: 14,
        secondary: 12,
        available: true,
        bestSeller: true,
    },
    {
        id: "blackops7",
        name: "Call of Duty: Black Ops 7",
        sub: "تصويب وحرب • طور القصة واللعب الجماعي والزومبي",
        image: "/games/blackops7.jpg",
        gradientFrom: "#2a2f1a", gradientTo: "#0d0f08",
        four: 13,
        five: 28,
        available: true,
        bestSeller: true,
    },
    {
        id: "eafc26",
        name: "EA Sports FC 26",
        sub: "Football • Career & Ultimate Team",
        image: "/games/eafc26.jpg",
        gradientFrom: "#1c5e3a", gradientTo: "#0f2e1c",
        four: 16,
        five: 26,
        available: true,
        bestSeller: true,
    },
    {
        id: "blackops6",
        name: "Call of Duty: Black Ops 6",
        sub: "FPS • Campaign, MP, Zombies",
        image: "/games/blackops6.jpg",
        gradientFrom: "#1f2310", gradientTo: "#080a04",
        four: 18,
        five: 23,
        available: true,
    },
    {
        id: "battlefield6",
        name: "Battlefield 6",
        sub: "Large-scale war shooter",
        image: "/games/bf6.jpg",
        gradientFrom: "#3d2a14", gradientTo: "#160e05",
        four: null,
        five: 36,
        available: true,
    },
    {
        id: "re9",
        name: "Resident Evil Requiem",
        sub: "Survival horror",
        image: "/games/re9.jpg",
        gradientFrom: "#4a0e0e", gradientTo: "#1a0303",
        four: null,
        five: 36,
        available: true,
    },
    {
        id: "wwe26",
        name: "WWE 2K26",
        sub: "Wrestling • Top superstars",
        image: "/games/wwe26.jpg",
        gradientFrom: "#3a1a1a", gradientTo: "#0e0405",
        four: null,
        five: 42,
        available: true,
    },
    {
        id: "rdr2",
        name: "Red Dead Redemption 2",
        sub: "Western adventure epic",
        image: "/games/rdr2.jpg",
        gradientFrom: "#4a2412", gradientTo: "#180a04",
        four: 17,
        five: 19,
        available: true,
        bestSeller: true,
    },
    {
        id: "arc-raiders",
        name: "Arc Raiders",
        sub: "Sci-fi extraction shooter",
        image: "/games/arc-raiders.jpg",
        gradientFrom: "#2a3340", gradientTo: "#0a0e14",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "ghost-tsushima",
        name: "Ghost of Tsushima (Arabic)",
        sub: "Samurai open-world • Arabic Dubbed",
        image: "/games/ghost-tsushima.jpg",
        gradientFrom: "#5a1010", gradientTo: "#1a0405",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "ghost-yotei",
        name: "Ghost of Yotei",
        sub: "Samurai action-adventure",
        image: "/games/ghost-yotei.jpg",
        gradientFrom: "#3a0d0d", gradientTo: "#120303",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "ready-or-not",
        name: "Ready or Not",
        sub: "Tactical SWAT shooter",
        image: "/games/ready-or-not.jpg",
        gradientFrom: "#1a1a1a", gradientTo: "#050505",
        four: null,
        five: 30,
        available: true,
    },
    {
        id: "tlou2",
        name: "The Last of Us Part II",
        sub: "Story-driven survival action",
        image: "/games/tlou2.jpg",
        gradientFrom: "#2c2415", gradientTo: "#0c0a05",
        four: 19,
        five: 26,
        available: true,
    },
    {
        id: "tlou1",
        name: "The Last of Us Part I — Remastered",
        sub: "Story-driven survival epic",
        image: "/games/tlou1.jpg",
        gradientFrom: "#1d2a18", gradientTo: "#070a05",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "crew-motorfest",
        name: "The Crew Motorfest",
        sub: "Open-world racing playground",
        image: "/games/crew-motorfest.jpg",
        gradientFrom: "#1a4f7a", gradientTo: "#04161f",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "elden-ring",
        name: "Elden Ring",
        sub: "Dark fantasy souls-like",
        image: "/games/elden-ring.jpg",
        gradientFrom: "#3a2710", gradientTo: "#100905",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "re8",
        name: "Resident Evil 8: Village",
        sub: "Survival horror",
        image: "/games/re8.jpg",
        gradientFrom: "#2a1010", gradientTo: "#0a0202",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "re7",
        name: "Resident Evil 7: Biohazard",
        sub: "First-person survival horror",
        image: "/games/re7.jpg",
        gradientFrom: "#1e1a1a", gradientTo: "#080606",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "nba2k26",
        name: "NBA 2K26 Slam Edition",
        sub: "Basketball simulation",
        image: "/games/nba2k26.webp",
        gradientFrom: "#3a1a05", gradientTo: "#120602",
        four: null,
        five: null,
        available: true,
    },
    {
        id: "horizon-fw",
        name: "Horizon Forbidden West",
        sub: "Action RPG • Post-apocalyptic",
        image: "/games/horizon-fw.jpg",
        gradientFrom: "#1c4a5e", gradientTo: "#05161e",
        four: null,
        five: null,
        available: true,
    },
];


// ┌───────────────────────────────────────────────────────────────────────┐
// │  ④ الباقات المدمجة (Bundles) — اشتراك + لعبة بسعر مخفض                │
// │                                                                       │
// │     لكل باقة عدّل:                                                      │
// │     • subId        ⇐ "essential" أو "extra"                            │
// │     • durationId   ⇐ "ess-3m" / "ess-12m" / "ext-3m" / "ext-12m" ...   │
// │     • gameId       ⇐ معرّف اللعبة من قائمة GAMES فوق                  │
// │     • tier         ⇐ "four" (PS4) أو "five" (PS5)                      │
// │     • bundlePrice  ⇐ السعر المخفّض بالدولار (يحسب الموقع الفرق تلقائياً)│
// │     • available    ⇐ true / false                                      │
// │                                                                       │
// │     لإخفاء كل قسم الباقات: خلي المصفوفة فاضية []                       │
// └───────────────────────────────────────────────────────────────────────┘
export const BUNDLES = [
    {
        id: "bundle-extra12-fc26",
        subId: "extra",
        durationId: "ext-12m",
        gameId: "eafc26",
        tier: "five",
        bundlePrice: 75,
        available: true,
    },
    {
        id: "bundle-ess12-blackops7",
        subId: "essential",
        durationId: "ess-12m",
        gameId: "blackops7",
        tier: "five",
        bundlePrice: 75,
        available: true,
    },
    {
        id: "bundle-extra3-gta5",
        subId: "extra",
        durationId: "ext-3m",
        gameId: "gta5",
        tier: "five",
        bundlePrice: 40,
        available: true,
    },
    {
        id: "bundle-extra12-rdr2",
        subId: "extra",
        durationId: "ext-12m",
        gameId: "rdr2",
        tier: "five",
        bundlePrice: 70,
        available: true,
    },
];
