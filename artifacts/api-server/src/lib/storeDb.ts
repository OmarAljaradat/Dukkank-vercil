import pg from "pg";
import { verifyToken } from "../routes/auth.js";

export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

// Fallback in-memory state when DB is not available
export let memNextOrderNum = 46;
export let memSuppliers: any[] = [
  { id: 1, name: "أبو خالد (مورد الألعاب الرئيسية)", phone: "962775585112", notes: "توفير فوري خلال 15 دقيقة", is_active: true, created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: 2, name: "شركة الألعاب العالمية (مورد الاشتراكات)", phone: "962791234567", notes: "متخصص باشتراكات بلس إكسترا وفاخر", is_active: true, created_at: new Date(Date.now() - 86400000 * 5).toISOString() }
];

export let memOrders: any[] = [
  {
    id: 101,
    order_number: "DK-00045",
    customer_name: "أحمد العبداللات",
    customer_phone: "0775589911",
    contact_whatsapp: "0775589911",
    customer_email: "ahmed.abdal@gmail.com",
    product_type: "game",
    game_name: "EA Sports FC 27",
    platform: "PS5",
    customer_paid: 38.68,
    payment_platform: "PayTabs",
    gateway_fee: 1.93,
    cost_price: null,
    status: "new",
    order_source: "paytabs",
    paytabs_tran_ref: "TST260729112233",
    items_json: JSON.stringify([{ id: "eafc27", name: "EA Sports FC 27 (PS5)", price: 38.68, quantity: 1, platform: "PS5" }]),
    notes: "طلب أونلاين عبر الموقع - دفع بطاقة إلكترونية",
    created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 12).toISOString()
  }
];

// ── DB persistence helpers with fallback memory cache ────────────────────────
const memStoreConfig = new Map<string, any>();

export async function dbLoad(key: string, defaultVal: any): Promise<any> {
  try {
    const { rows } = await pool.query("SELECT value FROM store_config WHERE key = $1", [key]);
    if (rows.length > 0) {
      memStoreConfig.set(key, rows[0].value);
      return rows[0].value;
    }
  } catch {}
  return memStoreConfig.has(key) ? memStoreConfig.get(key) : defaultVal;
}

export const dbGet = dbLoad;

export async function dbSave(key: string, value: any): Promise<void> {
  memStoreConfig.set(key, value);
  try {
    await pool.query(
      `INSERT INTO store_config (key, value, updated_at)
       VALUES ($1, $2::jsonb, NOW())
       ON CONFLICT (key) DO UPDATE SET value = $2::jsonb, updated_at = NOW()`,
      [key, JSON.stringify(value)]
    );
  } catch (_) {}
}

export function requireAdmin(req: any, res: any): boolean {
  const email = verifyToken(req.headers.authorization);
  if (!email) { res.status(401).json({ error: "غير مصرح — يرجى تسجيل الدخول كـ أدمن" }); return false; }
  return true;
}

// ── Default data ──────────────────────────────────────────────────────────────

export const DEFAULT_STORE = {
  name: "دُكانك",
  tagline: "اشتراكات وألعاب رقمية بأفضل الأسعار",
  whatsapp: "962775585112",
  whatsappDisplay: "0775585112",
  instagram: "https://www.instagram.com/dukkank15/",
};

export const DEFAULT_SUBSCRIPTIONS = [
  {
    id: "essential",
    name: "اشتراك أساسي",
    tagline: "خطط ألعاب أساسية بسعر مميز",
    accent: "blue",
    visible: true,
    durations: [
      { id: "ess-1m",  label: "شهر واحد",  four: 6.5, five: 10.0, originalFour: 10.0,  originalFive: 10.0,  costPriceFour: 2.5, costPriceFive: 6.5, stockStatus: "available" },
      { id: "ess-3m",  label: "٣ شهور",    four: 14.0, five: 19.0, originalFour: 25.0,  originalFive: 25.0,  costPriceFour: 4.0, costPriceFive: 15.0, stockStatus: "available" },
      { id: "ess-12m", label: "سنة كاملة", four: 27.0, five: 47.0, originalFour: 80.0,  originalFive: 80.0,  costPriceFour: 9.0, costPriceFive: 32.0, stockStatus: "available" },
    ],
  },
  {
    id: "extra",
    name: "اشتراك إضافي",
    tagline: "تجربة أوسع مع مكتبة ألعاب أكبر",
    accent: "red",
    visible: true,
    durations: [
      { id: "ext-1m",  label: "شهر واحد",  four: 8.0,  five: 14.0, originalFour: 15.0,  originalFive: 15.0,  costPriceFour: 4.0, costPriceFive: 10.0, stockStatus: "available" },
      { id: "ext-3m",  label: "٣ شهور",    four: 19.0, five: 26.0, originalFour: 40.0,  originalFive: 40.0,  costPriceFour: 7.0, costPriceFive: 22.0, stockStatus: "available" },
      { id: "ext-12m", label: "سنة كاملة", four: 41.0, five: 59.0, originalFour: 135.0, originalFive: 135.0, costPriceFour: 15.0, costPriceFive: 50.0, stockStatus: "available" },
    ],
  },
  {
    id: "deluxe",
    name: "بلايستيشن بلس فاخر",
    tagline: "الباقة الملكية والشاملة لكافة الألعاب الكلاسيكية والتجريبية",
    accent: "amber",
    visible: true,
    durations: [
      { id: "del-1m",  label: "شهر واحد",  four: 11.0, five: 16.0, originalFour: 18.0,  originalFive: 18.0,  costPriceFour: 6.0, costPriceFive: 11.0, stockStatus: "available" },
      { id: "del-3m",  label: "٣ شهور",    four: 22.0, five: 33.0, originalFour: 50.0,  originalFive: 50.0,  costPriceFour: 12.0, costPriceFive: 24.0, stockStatus: "available" },
      { id: "del-12m", label: "سنة كاملة", four: 49.0, five: 69.0, originalFour: 160.0, originalFive: 160.0, costPriceFour: 22.0, costPriceFive: 55.0, stockStatus: "available" },
    ],
  },
];

export const DEFAULT_GAMES = [];

export const DEFAULT_BUNDLES = [
  {
    id: "action-pack",
    title: "باقة الأكشن الأسطورية",
    subtitle: "GTA V + Call of Duty: Black Ops 7",
    discountPercent: 15,
    badge: "الأكثر طلباً",
    games: ["gta5", "blackops7"]
  }
];

export const DEFAULT_REVIEWS = [
  { id: 1, name: "محمد العتيبي", rating: 5, comment: "خدمة سريعة جداً وتم تفعيل حساب البلس خلال 10 دقائق!", date: "قبل يومين", order: 1 }
];

export const DEFAULT_FAQS = [
  { id: "faq-1", icon: "zap", q: "كيف يتم تسليم الحساب أو الاشتراك بعد الدفع؟", a: "بعد إتمام الطلب، يتواصل معك فريقنا مباشرة عبر إنستغرام أو واتساب لطلب صورة كود الـ (QR Code) من شاشة السوني، وندخلك الحساب فوراً خلال دقائق ⚡", visible: true },
  { id: "faq-2", icon: "shield-check", q: "هل الحسابات والاشتراكات رسمية ومضمونة 100%؟", a: "نعم بكل تأكيد، جميع الحسابات والاشتراكات رسمية ومحمية بالضمان الذهبي طوال كامل فترة الاشتراك ❤️", visible: true },
  { id: "faq-3", icon: "help-circle", q: "ما الفرق بين الحساب الأساسي والحساب الثانوي؟", a: "الحساب الأساسي يتيح لك اللعب من حسابك الشخصي والتروفيات، بينما الحساب الثانوي تلعب منه مباشرة عبر الإنترنت بسعر أوفر 🎮", visible: true },
  { id: "faq-4", icon: "credit-card", q: "ما هي طرق الدفع المتاحة داخل المتجر؟", a: "نوفر الدفع الآمن عبر البطاقات البنكية، خدمة أبل باي (Apple Pay)، نظام كليك (CliQ)، والمحافظ الرقمية 💳", visible: true },
  { id: "faq-5", icon: "truck", q: "كيف يتم تفعيل اللعبة أو الاشتراك على جهازي البلايستيشن؟", a: "تختار من شاشة السوني تسجيل الدخول عبر كود (QR Code) وتصوره وترسله لنا في المحادثة؛ نقوم بمسح الكود وتفعيل الحساب بجهازك فوراً بأمان 🛠️", visible: true },
  { id: "faq-6", icon: "headphones", q: "ماذا أفعل إذا واجهت أي مشكلة أو استفسار؟", a: "تواصل معنا مباشرة عبر زر الواتساب أو إنستغرام، وفريق الدعم متواجد لخدمتك ومساعدتك خطوة بخطوة 💬", visible: true }
];

export const DEFAULT_SECTIONS = [
  { id: "gamelaunch", name: "قسم إطلاق الألعاب (Vice City / FC 27)", visible: true },
  { id: "recommender", name: "مساعد اختيار الاشتراك Smart Wizard", visible: true },
  { id: "essential", name: "باقة بلايستيشن بلس أساسي (Essential)", visible: true },
  { id: "extra", name: "باقة بلايستيشن بلس إكسترا (Extra)", visible: true },
  { id: "deluxe", name: "باقة بلايستيشن بلس فاخر (Deluxe)", visible: true },
  { id: "games", name: "متجر الألعاب الرقمية Games Grid", visible: true },
  { id: "reviews", name: "تقييمات وآراء العملاء", visible: true },
  { id: "faq", name: "الأسئلة الشائعة", visible: true }
];

export const DEFAULT_PROMO = {
  enabled: true,
  activeBanner: "default",
  customText: "⚡ عرض خاص: خصم 10% عند الشراء اليوم كود الخصم: DUKKANK10",
  headerBanner: {
    enabled: true,
    title: "🔥 خصم 15% بمناسبة عطلة نهاية الأسبوع!",
    code: "DUKKANK15",
    badge: "عرض خاص",
    buttonText: "تسوّق الآن",
    bgColor: "amber"
  },
  flashSale: {
    enabled: false,
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
  applePayNotice: {
    enabled: true,
    title: "تنبيه الدفع السريع عبر Apple Pay ",
    subtitle: "للدفع المباشر السلس عبر Apple Pay، يرجى فتح المتجر في متصفح Safari.",
    buttonText: "📋 نسخ رابط المتجر لـ Safari"
  },
  socialProof: {
    enabled: true
  }
};

export const DEFAULT_SOCIAL_PROOF = {
  enabled: true,
  intervalSeconds: 12,
  items: [
    { customer: "أحمد الماجد (عمان)", text: "اشترى اشتراك بلايستيشن بلس إكسترا — سنة كاملة", time: "قبل 3 دقائق" }
  ]
};

export const DEFAULT_WA_TEMPLATES = {
  quickInquiry: "مرحباً دُكانك 🎮 أريد الاستفسار عن الألعاب والاشتراكات المتوفرة.",
  gameOrder: "مرحباً دُكانك 🎮 أريد شراء لعبة {{gameName}} على منصة {{platform}} بسعر {{price}}.",
  subOrder: "مرحباً دُكانك 🎮 أريد شراء {{subTitle}} بسعر {{price}}."
};

export const DEFAULT_CONTENT = {
  hero: {
    badge: "🔥 الموزع المعتمد الموثوق للألعاب والاشتراكات في الوطن العربي",
    title: "عالمك الأسطوري للألعاب والاشتراكات الرقمية",
    subtitle: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.",
  }
};

export const DEFAULT_SITE_SETTINGS = {
  maintenanceMode: { enabled: false, title: "الموقع قيد الصيانة", message: "نعمل على تحديثات جديدة لخدمتكم بشكل أفضل.", estimatedReturn: "ساعة واحدة" },
  disableTextSelection: false,
};

export const DEFAULT_LAUNCH_ANNOUNCEMENT = {
  enabled: true,
  theme: "vice",
  gameName: "Grand Theft Auto VI",
  badge: "🔥 الإصدار الأضخم في تاريخ الألعاب",
  subtitle: "عيش تجربة فايس سيتي بالكامل — عالم مفتوح بلا حدود مع Rockstar Games",
  description: "احصل على حسابك الأصلي المضمون لأضخم لعبة في تاريخ صناعة الألعاب. Grand Theft Auto VI يأخذك في رحلة ملحمية داخل مدينة فايس سيتي المعاد بناؤها بالكامل مع رسومات الجيل القادم وعالم حي يتنفس. تسليم فوري مع ضمان ذهبي شامل.",
  price5: 45.0,
  price4: 28.0,
  ctaLabel: "احجز نسختك الآن 🔥",
  ctaHref: "#games",
  image: "",
  imageUrl: "",
  bonusGift: "🎁 ضمان ذهبي مدى الحياة + GTA Online مجاناً + شحن $500,000 داخل اللعبة",
  rating: "⭐ الأكثر انتظاراً في تاريخ الألعاب • 🏆 Rockstar Games",
  stockLeft: 12,
  trailerUrl: "https://www.youtube.com/embed/QdBZY2fkU-0",
  countdownTarget: "2026-10-28",
  launchDate: "2026-10-28",
  note: "⚠️ الطلب المسبق يضمن لك أولوية التسليم فور الإطلاق الرسمي",
  currency: "$",
  platform5: "PS5",
  platform4: "PS4"
};

export const DEFAULT_COUPONS = [
  { id: "dukkank10", code: "DUKKANK10", discount_type: "percentage", discount_value: 10, max_uses: 100, current_uses: 12, is_active: true }
];

// Active State Cache
export let store = { ...DEFAULT_STORE };
export let subscriptions = [...DEFAULT_SUBSCRIPTIONS];
export let games = [...DEFAULT_GAMES];
export let bundles = [...DEFAULT_BUNDLES];
export let reviews = [...DEFAULT_REVIEWS];
export let faqs = [...DEFAULT_FAQS];
export let sections = [...DEFAULT_SECTIONS];
export let promo = { ...DEFAULT_PROMO };
export let socialProof = { ...DEFAULT_SOCIAL_PROOF };
export let waTemplates = { ...DEFAULT_WA_TEMPLATES };
export let content = { ...DEFAULT_CONTENT };
export let siteSettings = { ...DEFAULT_SITE_SETTINGS };
export let launchAnnouncement = { ...DEFAULT_LAUNCH_ANNOUNCEMENT };
export let coupons = [...DEFAULT_COUPONS];

export async function initStoreDb() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS store_config (
        key        VARCHAR(100) PRIMARY KEY,
        value      JSONB NOT NULL,
        updated_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    // Reset games inventory in PostgreSQL to clean empty array []
    await pool.query(`INSERT INTO store_config (key, value, updated_at) VALUES ('games', '[]'::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = '[]'::jsonb, updated_at = NOW()`).catch(() => {});

    [
      store, subscriptions, games, bundles, reviews, faqs,
      sections, promo, socialProof, waTemplates, content,
      siteSettings, launchAnnouncement, coupons
    ] = await Promise.all([
      dbLoad("store",              DEFAULT_STORE),
      dbLoad("subscriptions",      DEFAULT_SUBSCRIPTIONS),
      dbLoad("games",              DEFAULT_GAMES),
      dbLoad("bundles",            DEFAULT_BUNDLES),
      dbLoad("reviews",            DEFAULT_REVIEWS),
      dbLoad("faqs",               DEFAULT_FAQS),
      dbLoad("sections",           DEFAULT_SECTIONS),
      dbLoad("promo",              DEFAULT_PROMO),
      dbLoad("socialProof",        DEFAULT_SOCIAL_PROOF),
      dbLoad("waTemplates",        DEFAULT_WA_TEMPLATES),
      dbLoad("content",            DEFAULT_CONTENT),
      dbLoad("siteSettings",       DEFAULT_SITE_SETTINGS),
      dbLoad("launchAnnouncement", DEFAULT_LAUNCH_ANNOUNCEMENT),
      dbLoad("coupons",            DEFAULT_COUPONS),
    ]);
  } catch (_) {}
}

initStoreDb();
