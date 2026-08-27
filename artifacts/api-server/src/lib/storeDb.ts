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
      { id: "ess-1m",  label: "شهر واحد",  four: 6.5, five: 10.0, stockStatus: "available" },
      { id: "ess-3m",  label: "٣ شهور",    four: 12,  five: 19, stockStatus: "available"   },
      { id: "ess-12m", label: "سنة كاملة", four: 24,  five: 48, stockStatus: "available"   },
    ],
  },
  {
    id: "extra",
    name: "اشتراك إضافي",
    tagline: "تجربة أوسع مع مكتبة ألعاب أكبر",
    accent: "red",
    visible: true,
    durations: [
      { id: "ext-1m",  label: "شهر واحد",  four: 9,  five: 14.0, stockStatus: "available" },
      { id: "ext-3m",  label: "٣ شهور",    four: 19, five: 28, stockStatus: "available"   },
      { id: "ext-12m", label: "سنة كاملة", four: 42, five: 59, stockStatus: "available"   },
    ],
  },
  {
    id: "deluxe",
    name: "بلايستيشن بلس فاخر",
    tagline: "الباقة الملكية والشاملة لكافة الألعاب الكلاسيكية والتجريبية",
    accent: "amber",
    visible: true,
    durations: [
      { id: "del-1m",  label: "شهر واحد",  four: 11, five: 16, stockStatus: "available" },
      { id: "del-3m",  label: "٣ شهور",    four: 22, five: 33, stockStatus: "available" },
      { id: "del-12m", label: "سنة كاملة", four: 49, five: 69, stockStatus: "available" },
    ],
  },
];

export const DEFAULT_GAMES = [
  { id: "spiderman2", name: "Marvel's Spider-Man 2 (عربي)", sub: "أكشن ومغامرات • بالدبلجة والترجمة العربية الكاملة", image: "/games/spiderman2.jpg", gradientFrom: "#5a0a0a", gradientTo: "#1d0306", four: null, five: 26.0, secondary: 21.0, available: true, bestSeller: true, order: 0 },
  { id: "forza5", name: "Forza Horizon 5", sub: "سباقات وعالم مفتوح • أضخم مهرجان سيارات", image: "/games/forza5.jpg", gradientFrom: "#0d3a4a", gradientTo: "#031018", four: null, five: 26.0, secondary: 23.0, available: true, bestSeller: true, order: 1 },
  { id: "mk11", name: "Mortal Kombat 11", sub: "قتال وحماس • النسخة المحسنة مع كامل الشخصيات", image: "/games/mk11.jpg", gradientFrom: "#3a1a08", gradientTo: "#120602", four: 8.0, five: 9.0, secondary: 7.5, available: true, bestSeller: true, order: 2 },
  { id: "gta5", name: "Grand Theft Auto V", sub: "عالم مفتوح وأكشن • النسخة المحسنة + GTA Online", image: "/games/gta5.jpg", gradientFrom: "#13343f", gradientTo: "#04141a", four: 13.0, five: 14.0, secondary: 12.0, available: true, bestSeller: true, order: 3 },
  { id: "blackops7", name: "Call of Duty: Black Ops 7", sub: "تصويب وحرب • طور القصة واللعب الجماعي والزومبي", image: "/games/blackops7.jpg", gradientFrom: "#2a2f1a", gradientTo: "#0d0f08", four: 13.0, five: 28.0, available: true, bestSeller: true, order: 4 },
  { id: "eafc26", name: "EA Sports FC 26", sub: "كرة القدم • Career & Ultimate Team", image: "/games/eafc26.jpg", gradientFrom: "#1c5e3a", gradientTo: "#0f2e1c", four: 16.0, five: 26.0, available: true, bestSeller: true, order: 5 }
];

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
  { id: 1, q: "كيف يتم تسليم الحساب بعد الشراء؟", a: "يصلك الحساب مباشرة عبر الواتساب أو الإيميل مع خطوات التفعيل بالتفصيل.", order: 1 }
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
