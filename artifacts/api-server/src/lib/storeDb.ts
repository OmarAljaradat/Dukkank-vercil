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

export const DEFAULT_GAMES = [
  {
    "id": "007-first-light",
    "name": "007 First Light",
    "sub": "لعبة التجسس والأكشن المنتظرة لجيمس بوند",
    "image": "https://images.igdb.com/igdb/image/upload/t_cover_big/co20vo.jpg",
    "gradientFrom": "#1a202c",
    "gradientTo": "#0f172a",
    "five": 29,
    "four": 20.5,
    "secondary": 12.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "007",
      "james bond",
      "first light",
      "spy",
      "action",
      "جيمس بوند",
      "تجسس",
      "أكشن"
    ]
  },
  {
    "id": "crimson-desert-enhanced",
    "name": "Crimson Desert Enhanced",
    "sub": "مغامرة العالم المفتوح والآكشن الأسطورية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202012/0306/b8C7B0rC1wV390C8e3y3z0v8.png",
    "gradientFrom": "#7c2d12",
    "gradientTo": "#1c1917",
    "five": 29,
    "four": 20.5,
    "secondary": 12.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "crimson desert",
      "open world",
      "rpg",
      "action",
      "عالم مفتوح",
      "آكشن",
      "مغامرات"
    ]
  },
  {
    "id": "ufc-6",
    "name": "EA Sports UFC 6",
    "sub": "أقوى تجربة فنون قتالية مختلطة MMA",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202308/0416/9ba4e4ca7db7b15d2db2eead1bbdf7ecfa1743a6d713c7a0.png",
    "gradientFrom": "#991b1b",
    "gradientTo": "#18181b",
    "five": 33,
    "four": 23,
    "secondary": 14,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "ufc 6",
      "ufc",
      "mma",
      "fighting",
      "قتال",
      "ملاكمة",
      "رياضة"
    ]
  },
  {
    "id": "battlefield-6",
    "name": "Battlefield 6",
    "sub": "حروب شاملة ومعارك ملحمية حديثة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202106/0721/t0w3wP90Q2bV3qgN2c8M4V3b.png",
    "gradientFrom": "#0369a1",
    "gradientTo": "#0f172a",
    "five": 22.5,
    "four": 16,
    "secondary": 9.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "battlefield 6",
      "bf6",
      "shooter",
      "warfare",
      "باتلفيلد",
      "شوتر",
      "حرب"
    ]
  },
  {
    "id": "resident-evil-requiem-deluxe",
    "name": "Resident Evil Requiem Deluxe",
    "sub": "رعب البقاء والغموض في نسخته الملكية الكاملة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202210/0706/EVWyvD9n8fKqQGq9Z9n9X9m9.png",
    "gradientFrom": "#450a0a",
    "gradientTo": "#09090b",
    "five": 33,
    "four": 23,
    "secondary": 14,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "resident evil",
      "requiem",
      "deluxe",
      "horror",
      "survival",
      "رعب",
      "ريزدنت ايفل"
    ]
  },
  {
    "id": "arc-raiders",
    "name": "ARC Raiders",
    "sub": "شوتر تعاوني خيال علمي ضد الآلات الفضائية",
    "image": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1808500/header.jpg",
    "gradientFrom": "#c2410c",
    "gradientTo": "#18181b",
    "five": 17.5,
    "four": 12.5,
    "secondary": 7.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "arc raiders",
      "shooter",
      "coop",
      "scifi",
      "أرك رايدرز",
      "شوتر",
      "تعاوني"
    ]
  },
  {
    "id": "split-fiction",
    "name": "Split Fiction",
    "sub": "أكشن ومغامرات الخيال العلمي والتشويق",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202309/2012/76251b5da87ec42a8b981504eeefef94119d675662768d6f.png",
    "gradientFrom": "#4c1d95",
    "gradientTo": "#0f172a",
    "five": 18,
    "four": 12.5,
    "secondary": 8,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "split fiction",
      "action",
      "story",
      "خيال علمي",
      "أكشن"
    ]
  },
  {
    "id": "rdr2",
    "name": "Red Dead Redemption 2",
    "sub": "التحفة الخالدة والعالم المفتوح الأكثر واقعية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202011/0402/p9nC1wV390C8e3y3z0v8C1wV.png",
    "gradientFrom": "#991b1b",
    "gradientTo": "#1c1917",
    "five": 10.5,
    "four": 7.5,
    "secondary": 4.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 8,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "red dead redemption 2",
      "rdr2",
      "arthur morgan",
      "rockstar",
      "ريد ديد",
      "عالم مفتوح",
      "راعي بقر"
    ]
  },
  {
    "id": "it-takes-two",
    "name": "It Takes Two",
    "sub": "لعبة السنة الجماعية والمغامرة الزوجية الأروع",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202012/0815/h55YvVqT89B0V1Z1C1wV390C.png",
    "gradientFrom": "#0284c7",
    "gradientTo": "#1e1b4b",
    "five": 7.5,
    "four": 5.5,
    "secondary": 3.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "it takes two",
      "coop",
      "family",
      "party",
      "ايت تيكس تو",
      "زوجي",
      "تعاوني",
      "جماعي"
    ]
  },
  {
    "id": "a-way-out",
    "name": "A Way Out",
    "sub": "مغامرة الهروب من السجن والتعاون الثنائي المشوق",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2620/b3a1a6b0c2d3e4f5a6b7c8d9.png",
    "gradientFrom": "#334155",
    "gradientTo": "#0f172a",
    "five": 6.5,
    "four": 4.5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "a way out",
      "prison escape",
      "coop",
      "ايه واي اوت",
      "هروب من السجن",
      "تعاوني"
    ]
  },
  {
    "id": "palworld",
    "name": "Palworld",
    "sub": "عالم البال والبقاء وصيد المخلوقات المفتوح",
    "image": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1623730/header.jpg",
    "gradientFrom": "#059669",
    "gradientTo": "#064e3b",
    "five": 10.5,
    "four": 7.5,
    "secondary": 4.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "palworld",
      "pokemon",
      "survival",
      "crafting",
      "بالورلد",
      "بوكيمون",
      "بقاء"
    ]
  },
  {
    "id": "ready-or-not",
    "name": "Ready or Not",
    "sub": "شوتر تكتيكي واقتحامات SWAT فائقة الواقعية",
    "image": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1144200/header.jpg",
    "gradientFrom": "#1e293b",
    "gradientTo": "#020617",
    "five": 20.5,
    "four": 14.5,
    "secondary": 9,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "ready or not",
      "swat",
      "tactical shooter",
      "ريدي اور نت",
      "اقتحام",
      "تكتيكي"
    ]
  },
  {
    "id": "escape-the-backrooms",
    "name": "Escape the Backrooms",
    "sub": "رعب نفسي وتعاوني في متاهات الباكرومز الغامضة",
    "image": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1814970/header.jpg",
    "gradientFrom": "#854d0e",
    "gradientTo": "#1c1917",
    "five": 7,
    "four": 5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "backrooms",
      "horror",
      "escape",
      "باكرومز",
      "رعب",
      "متاهة"
    ]
  },
  {
    "id": "hitman-world-of-assassination",
    "name": "HITMAN World of Assassination",
    "sub": "ثلاثية العميل 47 الكاملة والتسلل الاحترافي",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202301/0517/fca4013197607ea7dc8ef025e1a2f643e2e5ec4687b3226a.png",
    "gradientFrom": "#991b1b",
    "gradientTo": "#09090b",
    "five": 17,
    "four": 12,
    "secondary": 7.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "hitman",
      "agent 47",
      "stealth",
      "assassination",
      "هيتمان",
      "اغتيال",
      "تسلل"
    ]
  },
  {
    "id": "clair-obscur-expedition-33",
    "name": "Clair Obscur: Expedition 33",
    "sub": "لعبة الآربيجي والمغامرات الفنية المبهرة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202405/2916/61794715f206584283597b8efec621d9600e13204ea29fa9.png",
    "gradientFrom": "#701a75",
    "gradientTo": "#18181b",
    "five": 21.5,
    "four": 15.5,
    "secondary": 9.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "clair obscur",
      "expedition 33",
      "rpg",
      "آربيجي",
      "مغامرات"
    ]
  },
  {
    "id": "wwe-2k26-king-of-kings",
    "name": "WWE 2K26 King of Kings",
    "sub": "إصدار الملوك والمصارعة الحرة الأقوى",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202401/1618/489069d2eb05b7ec44400508a8a47466dc09101ff2a02ca8.png",
    "gradientFrom": "#b45309",
    "gradientTo": "#1e1b4b",
    "five": 29,
    "four": 20.5,
    "secondary": 12.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "wwe 2k26",
      "wrestling",
      "king of kings",
      "مصارعة",
      "دبليو دبليو اي"
    ]
  },
  {
    "id": "wwe-2k26-attitude-era",
    "name": "WWE 2K26 Attitude Era",
    "sub": "النسخة الأسطورية لجيل العصر الذهبي للمصارعة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202401/1618/59cbbe17d91d6c8b939f50e9be0381665a363dbec3f7902b.png",
    "gradientFrom": "#1e1b4b",
    "gradientTo": "#09090b",
    "five": 37,
    "four": 26,
    "secondary": 16,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "wwe 2k26",
      "attitude era",
      "stone cold",
      "the rock",
      "مصارعة أساطير"
    ]
  },
  {
    "id": "mafia-the-old-country",
    "name": "Mafia: The Old Country",
    "sub": "جذور عالم المافيا والجريمة المنظمة في صقلية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202408/1315/f290d2ba2cb2b4cc1945d8b760775d7e35b71946059d64b2.png",
    "gradientFrom": "#78350f",
    "gradientTo": "#0f172a",
    "five": 17.5,
    "four": 12.5,
    "secondary": 7.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "mafia",
      "the old country",
      "sicily",
      "مافيا",
      "عصابات",
      "جريمة"
    ]
  },
  {
    "id": "star-wars-jedi-survivor",
    "name": "STAR WARS Jedi: Survivor",
    "sub": "مغامرة الفضاء وسيوف الجيداي الملحمية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202212/0122/gB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#1e3a8a",
    "gradientTo": "#09090b",
    "five": 6.5,
    "four": 4.5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "star wars",
      "jedi survivor",
      "lightsaber",
      "ستار وورز",
      "جيداي",
      "فضاء"
    ]
  },
  {
    "id": "borderlands-4",
    "name": "Borderlands 4",
    "sub": "جنون إطلاق النار ونهب الأسلحة اللانهائي",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202408/1417/63b2dbd5918731d6837130282b84293fe28430b0b8cbb316.png",
    "gradientFrom": "#eab308",
    "gradientTo": "#18181b",
    "five": 19.5,
    "four": 13.5,
    "secondary": 8.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "borderlands 4",
      "looter shooter",
      "بوردرلاندز",
      "أسلحة",
      "شوتر"
    ]
  },
  {
    "id": "warhammer-space-marine-2",
    "name": "Warhammer 40,000: Space Marine 2",
    "sub": "سحق جحافل التيرانيدز بأسلحة الفضاء المدمرة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202312/0118/489069d2eb05b7ec44400508a8a47466dc09101ff2a02ca8.png",
    "gradientFrom": "#1d4ed8",
    "gradientTo": "#0f172a",
    "five": 11.5,
    "four": 8,
    "secondary": 5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "warhammer",
      "space marine 2",
      "tyranids",
      "وارهامر",
      "سبيس مارين",
      "أكشن"
    ]
  },
  {
    "id": "resident-evil-4-gold",
    "name": "Resident Evil 4 Gold Edition",
    "sub": "ريميك التحفة الأسطورية مع إضافة Separate Ways",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202311/2717/3a233b8a1c970c79f33b1e327178a9463ce820790e72251a.png",
    "gradientFrom": "#991b1b",
    "gradientTo": "#18181b",
    "five": 9,
    "four": 6.5,
    "secondary": 4,
    "available": true,
    "stockStatus": "available",
    "stockCount": 7,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "resident evil 4",
      "re4 gold",
      "leon kennedy",
      "ريزدنت ايفل 4",
      "رعب"
    ]
  },
  {
    "id": "the-last-of-us-remastered-ps4",
    "name": "The Last of Us Remastered",
    "sub": "رحلة جويل وإيلي الخالدة في عالم ما بعد الكارثة",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/Y02ljdBodKFBiziorYgqftAF.png",
    "gradientFrom": "#065f46",
    "gradientTo": "#0f172a",
    "five": 4.5,
    "four": 3.5,
    "secondary": 2,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "the last of us",
      "tlou",
      "joel",
      "ellie",
      "ذا لاست اوف اس",
      "جويل",
      "ايلي"
    ]
  },
  {
    "id": "gta-the-trilogy",
    "name": "Grand Theft Auto: The Trilogy - The Definitive",
    "sub": "ثلاثية GTA الأسطورية: San Andreas, Vice City, III",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202110/1908/30p4b9c1d0e1f2a3b4c5d6e7.png",
    "gradientFrom": "#e11d48",
    "gradientTo": "#0f172a",
    "five": 11.5,
    "four": 8,
    "secondary": 5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 8,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "gta trilogy",
      "san andreas",
      "vice city",
      "gta 3",
      "قراند",
      "سان اندرياس",
      "فايس سيتي"
    ]
  },
  {
    "id": "god-of-war-ragnarok",
    "name": "God of War Ragnarök",
    "sub": "معركة راجناروك الملحمية ونهاية الميثولوجيا الإسكندنافية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202207/1210/4xJ8XB3irZBP6zZmMNOQIbOF.png",
    "gradientFrom": "#0284c7",
    "gradientTo": "#0369a1",
    "five": 20.5,
    "four": 14.5,
    "secondary": 9,
    "available": true,
    "stockStatus": "available",
    "stockCount": 7,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "god of war",
      "ragnarok",
      "kratos",
      "قود اوف وار",
      "راجناروك",
      "كريتوس"
    ]
  },
  {
    "id": "horizon-forbidden-west",
    "name": "Horizon Forbidden West",
    "sub": "رحلة إيلوي في الغرب المحظور وعالم الآلات الساحر",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202107/3100/HO8ttkr7yzL2BnxXMSqFwZjg.png",
    "gradientFrom": "#d97706",
    "gradientTo": "#0f172a",
    "five": 20.5,
    "four": 14.5,
    "secondary": 9,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "horizon forbidden west",
      "aloy",
      "هولايزن",
      "الغرب المحظور",
      "ايلوي"
    ]
  },
  {
    "id": "red-dead-redemption-1",
    "name": "Red Dead Redemption 1",
    "sub": "قصة جون مارستون الكلاسيكية ورحلة الانتقام في الغرب",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202308/0410/68dfdc20c45155f65dcae98d9e26210f44da233a0429712a.png",
    "gradientFrom": "#b91c1c",
    "gradientTo": "#1c1917",
    "five": 13.5,
    "four": 9.5,
    "secondary": 6,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "red dead redemption 1",
      "rdr1",
      "john marston",
      "ريد ديد 1",
      "جون مارستون"
    ]
  },
  {
    "id": "mortal-kombat-1",
    "name": "Mortal Kombat 1",
    "sub": "إعادة ولادة عالم القتال والقتال الدامي بحركات Kameo",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202305/1715/07f59ea0dd26c927f872ad41c8f180be4061a9bc3ddc8e03.png",
    "gradientFrom": "#dc2626",
    "gradientTo": "#09090b",
    "five": 9.5,
    "four": 6.5,
    "secondary": 4,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "mortal kombat 1",
      "mk1",
      "scorpion",
      "sub zero",
      "مورتال كومبات",
      "قتال"
    ]
  },
  {
    "id": "mortal-kombat-elder-god",
    "name": "Mortal Kombat: Elder God Bundle",
    "sub": "باقة الآلهة الشاملة لجميع الإضافات والشخصيات",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202308/1118/396ba2598379c23bc9389f4eb806659c0490b4bf9e140d58.png",
    "gradientFrom": "#ea580c",
    "gradientTo": "#0f172a",
    "five": 15.5,
    "four": 11,
    "secondary": 7,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "mortal kombat",
      "elder god bundle",
      "مورتال كومبات باقة الآلهة"
    ]
  },
  {
    "id": "sackboy-a-big-adventure",
    "name": "Sackboy: A Big Adventure",
    "sub": "مغامرات البلاتفورمر الممتعة لجميع أفراد العائلة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202009/1614/kfnR8d9b1c0e1f2a3b4c5d6e.png",
    "gradientFrom": "#ca8a04",
    "gradientTo": "#1e1b4b",
    "five": 12,
    "four": 8.5,
    "secondary": 5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "sackboy",
      "platformer",
      "family",
      "ساكبوي",
      "مغامرات عائلية"
    ]
  },
  {
    "id": "god-of-war-2018",
    "name": "God of War (2018)",
    "sub": "بداية رحلة كريتوس وابنه آتريوس في عالم النورس",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2217/LsaCrHG2IrUAq1OaLw5us133.png",
    "gradientFrom": "#1e293b",
    "gradientTo": "#0f172a",
    "five": 7,
    "four": 5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "god of war",
      "kratos 2018",
      "قود اوف وار 2018"
    ]
  },
  {
    "id": "dragon-ball-xenoverse-2",
    "name": "DRAGON BALL XENOVERSE 2",
    "sub": "حماية تاريخ دراغون بول وخوض أشرس المعارك الخارقة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202404/2407/6ea09bf4a87ec42a8b981504eeefef94119d675662768d6f.png",
    "gradientFrom": "#f97316",
    "gradientTo": "#1e1b4b",
    "five": 4,
    "four": 3,
    "secondary": 2,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "dragon ball",
      "xenoverse 2",
      "goku",
      "دراغون بول",
      "غوكو"
    ]
  },
  {
    "id": "mafia-trilogy",
    "name": "Mafia Trilogy",
    "sub": "ثلاثية المافيا الكاملة المعاد تصميمها بالكامل",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202008/1717/G8B7B0rC1wV390C8e3y3z0v8.png",
    "gradientFrom": "#451a03",
    "gradientTo": "#0f172a",
    "five": 4.5,
    "four": 3.5,
    "secondary": 2,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "mafia trilogy",
      "tommy angelo",
      "مافيا ثلاثية",
      "عصابات"
    ]
  },
  {
    "id": "detroit-become-human-deluxe",
    "name": "Detroit: Become Human Digital Deluxe",
    "sub": "القصة التفاعلية الأكثر تأثيراً وقراراتك تحدد المصير",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/A6B7C8D9E0F1A2B3C4D5E6F7.png",
    "gradientFrom": "#0284c7",
    "gradientTo": "#0f172a",
    "five": 11.5,
    "four": 8,
    "secondary": 5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "detroit become human",
      "connor",
      "interactive story",
      "ديترويت",
      "قصصية"
    ]
  },
  {
    "id": "need-for-speed-unbound",
    "name": "Need for Speed Unbound",
    "sub": "سباقات الشوارع الحماسية وأسلوب الرسم والغرافيتي",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202210/0517/hB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#84cc16",
    "gradientTo": "#0f172a",
    "five": 7,
    "four": 5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "nfs unbound",
      "racing",
      "cars",
      "نيد فور سبيد",
      "سباق سيارات"
    ]
  },
  {
    "id": "street-fighter-6",
    "name": "Street Fighter 6",
    "sub": "ثورة ألعاب القتال وأنماط World Tour الحماسية",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202211/1818/jB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#e11d48",
    "gradientTo": "#1e1b4b",
    "five": 10,
    "four": 7,
    "secondary": 4.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "street fighter 6",
      "sf6",
      "capcom",
      "ستريت فايتر",
      "قتال"
    ]
  },
  {
    "id": "batman-arkham-collection",
    "name": "Batman: Arkham Collection",
    "sub": "ثلاثية فارس الظلام الكاملة: Asylum, City, Knight",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202009/2518/cB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#1e293b",
    "gradientTo": "#020617",
    "five": 6,
    "four": 4,
    "secondary": 2.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "batman",
      "arkham collection",
      "joker",
      "باتمان",
      "فارس الظلام",
      "ثلاثية"
    ]
  },
  {
    "id": "tekken-7",
    "name": "TEKKEN 7",
    "sub": "صراع عائلة ميشيما الأسطوري وأقوى حركات القتال",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/bB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#dc2626",
    "gradientTo": "#09090b",
    "five": 7,
    "four": 5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "tekken 7",
      "jin",
      "kazuya",
      "تيكن 7",
      "قتال"
    ]
  },
  {
    "id": "resident-evil-village-gold",
    "name": "Resident Evil Village Gold Edition",
    "sub": "قرية الرعب وقصر ديميتريسكو مع إضافة Shadow of Rose",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/mB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#ca8a04",
    "gradientTo": "#0f172a",
    "five": 9,
    "four": 6.5,
    "secondary": 4,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "resident evil village",
      "re8 gold",
      "lady dimitrescu",
      "ريزدنت ايفل فيليج",
      "رعب"
    ]
  },
  {
    "id": "lies-of-p",
    "name": "Lies of P",
    "sub": "تحفة السولز المظلمة المستوحاة من قصة بينوكيو",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202306/0816/nB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#1e1b4b",
    "gradientTo": "#020617",
    "five": 15,
    "four": 10.5,
    "secondary": 6.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "lies of p",
      "souls like",
      "pinocchio",
      "لايز اوف بي",
      "سولز"
    ]
  },
  {
    "id": "resident-evil-7-biohazard-gold",
    "name": "RESIDENT EVIL 7 biohazard Gold Edition",
    "sub": "كابوس عائلة بيكر والرعب من المنظور الأول",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/pB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#14532d",
    "gradientTo": "#0f172a",
    "five": 7,
    "four": 5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "resident evil 7",
      "biohazard gold",
      "ريزدنت ايفل 7",
      "رعب"
    ]
  },
  {
    "id": "the-last-of-us-part-1-deluxe",
    "name": "The Last of Us Part I Digital Deluxe",
    "sub": "النسخة المطورة بالكامل لجهاز PS5 ورسومات الجيل الجديد",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202206/0720/eB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#15803d",
    "gradientTo": "#0f172a",
    "five": 24.5,
    "four": 17.5,
    "secondary": 10.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "the last of us part 1",
      "tlou remake",
      "ذا لاست اوف اس ريميك"
    ]
  },
  {
    "id": "the-last-of-us-part-2-deluxe",
    "name": "The Last of Us Part II Digital Deluxe",
    "sub": "قصة الانتقام العميقة ونمط No Return الحماسي",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202311/1717/uB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#b91c1c",
    "gradientTo": "#0f172a",
    "five": 15,
    "four": 10.5,
    "secondary": 6.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 6,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "the last of us part 2",
      "tlou 2 deluxe",
      "ذا لاست اوف اس 2"
    ]
  },
  {
    "id": "trail-out",
    "name": "TRAIL OUT",
    "sub": "سباقات التدمير والاصطدام المجنونة على الحلبات",
    "image": "https://shared.cloudflare.steamstatic.com/store_item_assets/steam/apps/1664220/header.jpg",
    "gradientFrom": "#c2410c",
    "gradientTo": "#0f172a",
    "five": 10.5,
    "four": 7.5,
    "secondary": 4.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "trail out",
      "flatout",
      "demolition racing",
      "تريل اوت",
      "سباق وتدمير"
    ]
  },
  {
    "id": "sifu",
    "name": "Sifu",
    "sub": "فنون الكونغ فو ورحلة الانتقام والتقدم بالعمر",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202111/0416/vB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#b91c1c",
    "gradientTo": "#09090b",
    "five": 6,
    "four": 4,
    "secondary": 2.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "sifu",
      "martial arts",
      "kung fu",
      "سيفو",
      "كونغ فو",
      "قتال"
    ]
  },
  {
    "id": "life-is-strange-double-exposure",
    "name": "Life is Strange: Double Exposure",
    "sub": "عودة ماكس كولفيلد وقدرة التنقل بين خطين زمنيين",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202406/0517/wB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#0284c7",
    "gradientTo": "#1e1b4b",
    "five": 12,
    "four": 8.5,
    "secondary": 5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "life is strange",
      "double exposure",
      "max caulfield",
      "لايف از سترينج",
      "قصصية"
    ]
  },
  {
    "id": "sonic-x-shadow-generations",
    "name": "SONIC X SHADOW GENERATIONS",
    "sub": "سرعة سونيك الفائقة مع قوى شادو الخارقة الجديدة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202406/0418/xB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#1e3a8a",
    "gradientTo": "#991b1b",
    "five": 9.5,
    "four": 6.5,
    "secondary": 4,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "sonic x shadow",
      "generations",
      "sega",
      "سونيك",
      "شادو"
    ]
  },
  {
    "id": "sonic-frontiers",
    "name": "Sonic Frontiers",
    "sub": "مغامرة العالم المفتوح والجزر الغامضة السريعة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202208/2301/yB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#0284c7",
    "gradientTo": "#0f172a",
    "five": 7.5,
    "four": 5.5,
    "secondary": 3.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "sonic frontiers",
      "sonic open zone",
      "سونيك فرونتيرز"
    ]
  },
  {
    "id": "assassins-creed-syndicate",
    "name": "Assassin's Creed Syndicate",
    "sub": "لندن في عصر الثورة الصناعية وحروب العصابات",
    "image": "https://image.api.playstation.com/vulcan/img/rnd/202010/2618/zB0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#334155",
    "gradientTo": "#0f172a",
    "five": 5,
    "four": 3.5,
    "secondary": 2.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "assassins creed syndicate",
      "jacob frye",
      "اساسنز كريد سنديكيت",
      "لندن"
    ]
  },
  {
    "id": "dragon-ball-fighterz",
    "name": "DRAGON BALL FighterZ",
    "sub": "معارك 3 ضد 3 برسومات أنمي خرافية وسرعة مذهلة",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202402/2607/1B0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#ea580c",
    "gradientTo": "#1e1b4b",
    "five": 6.5,
    "four": 4.5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": true,
    "featured": true,
    "tags": [
      "dragon ball fighterz",
      "dbfz",
      "anime fighter",
      "دراغون بول فايترز",
      "قتال أنمي"
    ]
  },
  {
    "id": "marvels-guardians-of-the-galaxy",
    "name": "Marvel's Guardians of the Galaxy",
    "sub": "مغامرة حراس المجرة الفضائية بقيادة ستار لورد",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202106/0719/2B0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#7c3aed",
    "gradientTo": "#0f172a",
    "five": 6.5,
    "four": 4.5,
    "secondary": 3,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "guardians of the galaxy",
      "marvel",
      "star lord",
      "حراس المجرة",
      "مارفل"
    ]
  },
  {
    "id": "ghost-recon-breakpoint-gold",
    "name": "Tom Clancy's Ghost Recon Breakpoint Gold",
    "sub": "بقاء عسكري وتكتيك القوات الخاصة خلف خطوط العدو",
    "image": "https://image.api.playstation.com/vulcan/ap/rnd/202008/1317/3B0B3qZ9N1C1wV390C8e3y3z.png",
    "gradientFrom": "#15803d",
    "gradientTo": "#09090b",
    "five": 6,
    "four": 4,
    "secondary": 2.5,
    "available": true,
    "stockStatus": "available",
    "stockCount": 5,
    "bestSeller": false,
    "featured": true,
    "tags": [
      "ghost recon",
      "breakpoint gold",
      "tom clancy",
      "قوست ريكون",
      "تكتيكي",
      "قوات خاصة"
    ]
  }
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
    await pool.query(`INSERT INTO store_config (key, value, updated_at) VALUES ('games', $1::jsonb, NOW()) ON CONFLICT (key) DO UPDATE SET value = $1::jsonb, updated_at = NOW()`, [JSON.stringify(DEFAULT_GAMES)]).catch(() => {});

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
