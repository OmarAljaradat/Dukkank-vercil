// Admin: Site Content (CMS) editor - Overhauled Visual Tabbed CMS
import { useEffect, useState } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { apiUpdateContent, formatApiError } from "../../lib/api";
import { toast } from "sonner";
import { Input, Field, Textarea } from "./_widgets";
import {
    FileText, Save, Loader2, Plus, Trash2, Sparkles, Megaphone,
    Crown, GitCompare, Gamepad2, Star, HelpCircle, Layout, Search,
    RotateCcw, Check, X, Eye, ScrollText
} from "lucide-react";

// Categorized Sections for easy navigation
const CMS_CATEGORIES = [
    { id: "hero", label: "📢 الواجهة الرئيسية (Hero)", keys: ["hero"] },
    { id: "games", label: "🎮 الألعاب والمخزون", keys: ["games"] },
    { id: "subs", label: "📦 الاشتراكات والـ PS Plus", keys: ["essential", "extra", "deluxe", "comparison"] },
    { id: "accountGuide", label: "📖 دليل التفعيل وقواعد الضمان", keys: ["accountGuide"] },
    { id: "guide", label: "🪜 دليل الشراء والضمان الصفحة الرئيسية", keys: ["howItWorks", "goldenGuarantee"] },
    { id: "policies", label: "📜 سياسات وشروط المتجر", keys: ["policies"] },
    { id: "footer", label: "🏪 عن المتجر والفوتر", keys: ["aboutStore", "reviews", "faq", "footer"] },
];

const SECTIONS_MAP = {
    hero: {
        title: "📢 نصوص الواجهة الرئيسية (Hero)",
        icon: Megaphone,
        hint: "العنوان الرئيسي، البادج، الشارات، وأزرار التصفح والواتساب بالقمة.",
        fields: [
            { key: "badge", label: "البادج العلوي", type: "text" },
            { key: "titleLine1", label: "العنوان الرئيسي — السطر الأول", type: "text" },
            { key: "titleLine2", label: "العنوان الرئيسي — السطر الثاني (مميز)", type: "text" },
            { key: "subtitle", label: "النص التوضيحي الفرعي", type: "textarea" },
            { key: "ctaBrowse", label: "نص زر التصفّح", type: "text" },
            { key: "ctaWhatsApp", label: "نص زر المراسلة على الواتساب", type: "text" },
            { key: "benefitInstant", label: "ميزة 1: التسليم الفوري", type: "text" },
            { key: "benefitOriginal", label: "ميزة 2: حسابات أصلية", type: "text" },
            { key: "benefitSupport", label: "ميزة 3: الدعم المباشر", type: "text" },
        ],
    },
    games: {
        title: "🎮 نصوص قسم الألعاب والمخزون",
        icon: Gamepad2,
        hint: "عناوين الألعاب والنص الخاص بطلب ألعاب مخصصة للزبون.",
        fields: [
            { key: "eyebrow", label: "نص فوق العنوان (Eyebrow)", type: "text" },
            { key: "title", label: "العنوان الرئيسي لقسم الألعاب", type: "text" },
            { key: "description", label: "الوصف الفرعي لقسم الألعاب", type: "textarea" },
            { key: "customGameTitle", label: "عنوان كرت \"طلب لعبة مخصصة\"", type: "text" },
            { key: "customGameSubtitle", label: "وصف كرت \"طلب لعبة مخصصة\"", type: "textarea" },
            { key: "customGameCta", label: "نص زر التواصل للعبة المخصصة", type: "text" },
        ],
    },
    essential: {
        title: "📦 نصوص الاشتراك الأساسي (Essential)",
        icon: Crown,
        hint: "عناوين ونقاط مميزات باقة البلايستيشن بلس أساسي.",
        fields: [
            { key: "eyebrow", label: "نص فوق العنوان (Eyebrow)", type: "text" },
            { key: "title", label: "عنوان الباقة", type: "text" },
            { key: "description", label: "وصف الباقة", type: "textarea" },
            { key: "featureTitle", label: "عنوان قائمة المميزات الجانبية", type: "text" },
            { key: "featureBullets", label: "نقاط المميزات", type: "array-string", placeholder: "ميزة جديدة" },
        ],
    },
    extra: {
        title: "📦 نصوص الاشتراك الإضافي (Extra)",
        icon: Crown,
        hint: "عناوين ونقاط مميزات باقة البلايستيشن بلس إضافي.",
        fields: [
            { key: "eyebrow", label: "نص فوق العنوان (Eyebrow)", type: "text" },
            { key: "title", label: "عنوان الباقة", type: "text" },
            { key: "description", label: "وصف الباقة", type: "textarea" },
            { key: "featureTitle", label: "عنوان قائمة المميزات الجانبية", type: "text" },
            { key: "featureBullets", label: "نقاط المميزات", type: "array-string", placeholder: "ميزة جديدة" },
        ],
    },
    deluxe: {
        title: "👑 نصوص الاشتراك الفاخر (Deluxe)",
        icon: Crown,
        hint: "عناوين ونقاط مميزات باقة البلايستيشن بلس فاخر Deluxe.",
        fields: [
            { key: "eyebrow", label: "نص فوق العنوان (Eyebrow)", type: "text" },
            { key: "title", label: "عنوان الباقة", type: "text" },
            { key: "description", label: "وصف الباقة", type: "textarea" },
            { key: "featureTitle", label: "عنوان قائمة المميزات الجانبية", type: "text" },
            { key: "featureBullets", label: "نقاط المميزات", type: "array-string", placeholder: "ميزة جديدة" },
        ],
    },
    comparison: {
        title: "⚖️ نصوص جدول مقارنة الباقات",
        icon: GitCompare,
        hint: "عناوين مقارنة الباقات ونقاط الصلاحيات لكل خطة.",
        fields: [
            { key: "eyebrow", label: "EyeBrow", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "description", label: "الوصف", type: "textarea" },
            { key: "popularBadge", label: "بادج \"الأكثر طلباً\"", type: "text" },
            { key: "essentialColLabel", label: "عنوان عمود الأساسي", type: "text" },
            { key: "extraColLabel", label: "عنوان عمود الإضافي", type: "text" },
            { key: "ctaStart", label: "النص الدعائي قبل الأزرار", type: "text" },
            { key: "ctaEssential", label: "نص زر الأساسي", type: "text" },
            { key: "ctaExtra", label: "نص زر الإضافي", type: "text" },
            {
                key: "rows",
                label: "صفوف مقارنة الميزات (✓/✗)",
                type: "array-row",
                rowSchema: [
                    { key: "feature", label: "اسم الميزة", type: "text", flex: 1 },
                    { key: "essential", label: "الأساسي", type: "bool", width: "90px" },
                    { key: "extra", label: "الإضافي", type: "bool", width: "90px" },
                ],
            },
        ],
    },
    howItWorks: {
        title: "🪜 نصوص كيف يشتري الزبون (4 خطوات)",
        icon: Sparkles,
        hint: "الشرح العناوين والوصف للخطوات الأربع في التسليم.",
        fields: [
            { key: "eyebrow", label: "العنوان الفرعي الصغير", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "description", label: "الوصف العام", type: "textarea" },
            { key: "step1Title", label: "الخطوة 1 — العنوان", type: "text" },
            { key: "step1Desc", label: "الخطوة 1 — الوصف", type: "textarea" },
            { key: "step2Title", label: "الخطوة 2 — العنوان", type: "text" },
            { key: "step2Desc", label: "الخطوة 2 — الوصف", type: "textarea" },
            { key: "step3Title", label: "الخطوة 3 — العنوان", type: "text" },
            { key: "step3Desc", label: "الخطوة 3 — الوصف", type: "textarea" },
            { key: "step4Title", label: "الخطوة 4 — العنوان", type: "text" },
            { key: "step4Desc", label: "الخطوة 4 — الوصف", type: "textarea" },
        ],
    },
    accountGuide: {
        title: "📖 محتوى نصوص دليل التفعيل وقواعد الحسابات",
        icon: HelpCircle,
        hint: "تعديل جميع شروحات إظهار الـ QR Code لـ PS5/PS4 والقواعد الصارمة والضمان الذهبي.",
        fields: [
            { key: "pageTitle", label: "العنوان الرئيسي لصفحة الدليل", type: "text" },
            { key: "pageSubtitle", label: "الوصف الفرعي لصفحة الدليل", type: "textarea" },
            { key: "qrHeaderTitle", label: "عنوان قسم إظهار الـ QR Code", type: "text" },
            { key: "ps5Title", label: "عنوان قسم PS5", type: "text" },
            { key: "ps5Steps", label: "خطوات تفعيل PS5 (بالترتيب)", type: "array-string", placeholder: "الخطوة" },
            { key: "ps4Title", label: "عنوان قسم PS4", type: "text" },
            { key: "ps4Steps", label: "خطوات تفعيل PS4 (بالترتيب)", type: "array-string", placeholder: "الخطوة" },
            { key: "rule1Title", label: "القاعدة 1 — العنوان", type: "text" },
            { key: "rule1Desc", label: "القاعدة 1 — الوصف", type: "textarea" },
            { key: "rule2Title", label: "القاعدة 2 — العنوان (تنبيه الخروج)", type: "text" },
            { key: "rule2Desc", label: "القاعدة 2 — الوصف", type: "textarea" },
            { key: "rule3Title", label: "القاعدة 3 — العنوان (البيانات)", type: "text" },
            { key: "rule3Desc", label: "القاعدة 3 — الوصف", type: "textarea" },
            { key: "guaranteeTitle", label: "عنوان الضمان الذهبي", type: "text" },
            { key: "guaranteeItem1", label: "بند الضمان 1", type: "textarea" },
            { key: "guaranteeItem2", label: "بند الضمان 2", type: "textarea" },
        ],
    },
    goldenGuarantee: {
        title: "🏅 نصوص الضمان الذهبي",
        icon: Crown,
        hint: "عناوين وشارات ومميزات الضمان الذهبي الـ 4.",
        fields: [
            { key: "eyebrow", label: "العنوان الفرعي الصغير", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "description", label: "الوصف العام", type: "textarea" },
            { key: "badgeText", label: "نص الشارة السفلية", type: "text" },
            { key: "item1Title", label: "ضمان 1 — عنوان", type: "text" },
            { key: "item1Desc", label: "ضمان 1 — وصف", type: "textarea" },
            { key: "item2Title", label: "ضمان 2 — عنوان", type: "text" },
            { key: "item2Desc", label: "ضمان 2 — وصف", type: "textarea" },
            { key: "item3Title", label: "ضمان 3 — عنوان", type: "text" },
            { key: "item3Desc", label: "ضمان 3 — وصف", type: "textarea" },
            { key: "item4Title", label: "ضمان 4 — عنوان", type: "text" },
            { key: "item4Desc", label: "ضمان 4 — وصف", type: "textarea" },
        ],
    },
    aboutStore: {
        title: "🏪 نصوص عن المتجر والتسليم",
        icon: Layout,
        hint: "بطاقات من نحن، طريقة التسليم الفورية، ونوع الحساب المعتمد.",
        fields: [
            { key: "eyebrow", label: "العنوان الفرعي الصغير", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "aboutTitle", label: "بطاقة «من نحن» — عنوان", type: "text" },
            { key: "aboutText", label: "بطاقة «من نحن» — نص", type: "textarea" },
            { key: "deliveryTitle", label: "بطاقة «التسليم» — عنوان", type: "text" },
            { key: "deliveryText", label: "بطاقة «التسليم» — نص", type: "textarea" },
            { key: "accountTitle", label: "بطاقة «نوع الحساب» — عنوان", type: "text" },
            { key: "accountText", label: "بطاقة «نوع الحساب» — نص", type: "textarea" },
        ],
    },
    reviews: {
        title: "⭐ نصوص قسم التقييمات",
        icon: Star,
        hint: "العناوين الرئيسية ونصوص النجوم لثقة الزبائن.",
        fields: [
            { key: "eyebrow", label: "EyeBrow", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "description", label: "الوصف", type: "textarea" },
            { key: "ratingOutOf5", label: "نص \"من 5 نجوم\"", type: "text" },
            { key: "basedOn", label: "نص \"مبني على\"", type: "text" },
        ],
    },
    faq: {
        title: "❓ نصوص قسم الأسئلة الشائعة",
        icon: HelpCircle,
        hint: "عنوان ووصف تجميعة الأسئلة والإجابات.",
        fields: [
            { key: "badge", label: "البادج العلوي", type: "text" },
            { key: "title", label: "العنوان الرئيسي", type: "text" },
            { key: "description", label: "الوصف العام", type: "textarea" },
        ],
    },
    footer: {
        title: "📐 نصوص الفوتر وتذييل الصفحة",
        icon: Layout,
        hint: "وصف المتجر أسفل الشاشة وحقوق النشر والتصميم.",
        fields: [
            { key: "tagline", label: "وصف المتجر بالفوتر", type: "textarea" },
            { key: "linksTitle", label: "عنوان قائمة «روابط سريعة»", type: "text" },
            { key: "contactTitle", label: "عنوان قائمة «تواصل معنا»", type: "text" },
            { key: "copyright", label: "نص حقوق النشر والترخيص", type: "text" },
        ],
    },
    policies: {
        title: "📜 سياسات وشروط المتجر الرسمية",
        icon: ScrollText,
        hint: "تحرير سياسة الخصوصية، الشروط والأحكام، سياسة الاسترجاع والاستبدال، والضمان الذهبي.",
        fields: [
            { key: "privacy", label: "سياسة الخصوصية وأمان البيانات", type: "textarea", placeholder: "اكتب نصوص وبنود سياسة الخصوصية هنا..." },
            { key: "terms", label: "الشروط والأحكام واتفاقية الاستخدام", type: "textarea", placeholder: "اكتب الشروط والأحكام وقواعد الشراء هنا..." },
            { key: "refund", label: "سياسة الاسترجاع والاستبدال", type: "textarea", placeholder: "اكتب سياسة استرجاع الأموال واستبدال الحسابات هنا..." },
            { key: "warranty", label: "سياسة الضمان الذهبي وتعويض الحسابات", type: "textarea", placeholder: "اكتب شروط وضوابط الضمان الذهبي هنا..." },
        ],
    },
};

function ArrayStringEditor({ value, onChange, placeholder }) {
    const list = Array.isArray(value) ? value : [];
    const update = (idx, val) => {
        const next = [...list];
        next[idx] = val;
        onChange(next);
    };
    const add = () => onChange([...list, ""]);
    const remove = (idx) => onChange(list.filter((_, i) => i !== idx));
    return (
        <div className="space-y-2">
            {list.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                    <span className="text-[11px] font-mono font-bold text-slate-400 w-6 text-center">
                        #{i + 1}
                    </span>
                    <Input value={v} onChange={(e) => update(i, e.target.value)} placeholder={placeholder} />
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition shrink-0 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>إضافة ميزة جديدة</span>
            </button>
        </div>
    );
}

function ArrayRowEditor({ value, onChange, schema }) {
    const list = Array.isArray(value) ? value : [];
    const update = (idx, key, val) => {
        const next = [...list];
        next[idx] = { ...next[idx], [key]: val };
        onChange(next);
    };
    const add = () => {
        const empty = {};
        schema.forEach((c) => (empty[c.key] = c.type === "bool" ? false : ""));
        onChange([...list, empty]);
    };
    const remove = (idx) => onChange(list.filter((_, i) => i !== idx));

    return (
        <div className="space-y-2">
            {list.map((row, i) => (
                <div key={i} className="flex items-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-2.5">
                    {schema.map((c) => (
                        <div key={c.key} style={{ width: c.width, flex: c.flex }}>
                            {c.type === "bool" ? (
                                <button
                                    type="button"
                                    onClick={() => update(i, c.key, !row[c.key])}
                                    className={`w-9 h-9 rounded-xl flex items-center justify-center transition cursor-pointer ${
                                        row[c.key] ? "bg-emerald-500 text-white" : "bg-slate-200 dark:bg-slate-800 text-slate-400"
                                    }`}
                                >
                                    {row[c.key] ? <Check className="w-4 h-4" strokeWidth={3} /> : <X className="w-4 h-4" strokeWidth={2.5} />}
                                </button>
                            ) : (
                                <Input value={row[c.key] || ""} onChange={(e) => update(i, c.key, e.target.value)} />
                            )}
                        </div>
                    ))}
                    <button
                        type="button"
                        onClick={() => remove(i)}
                        className="w-9 h-9 rounded-xl flex items-center justify-center bg-red-500/10 text-red-500 hover:bg-red-500/20 transition shrink-0 cursor-pointer"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>
            ))}
            <button
                type="button"
                onClick={add}
                className="px-3.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
            >
                <Plus className="w-4 h-4" />
                <span>إضافة صف مقارنة جديد</span>
            </button>
        </div>
    );
}

const DEFAULT_CONTENT_FALLBACKS = {
    hero: {
        badge: "متجر موثوق • تسليم فوري",
        titleLine1: "كل ألعابك واشتراكاتك",
        titleLine2: "بضغطة زر.",
        subtitle: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.",
        ctaBrowse: "تصفّح المنتجات",
        ctaWhatsApp: "راسلنا على واتساب",
        benefitInstant: "تسليم فوري",
        benefitOriginal: "حسابات أصلية",
        benefitSupport: "دعم مباشر",
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
    deluxe: {
        eyebrow: "الاشتراكات",
        title: "بلايستيشن بلس فاخر (Deluxe)",
        description: "للاعب المستعد لتجربة كافة الألعاب الكلاسيكية والتجريبية قبل الشراء وبأفضل الأداء.",
        featureTitle: "ليش الاشتراك الفاخر؟",
        featureBullets: [
            "جميع مميزات باقتي Essential و Extra بالكامل",
            "مكتبة ألعاب كلاسيكية عريقة (PS1, PS2, PSP)",
            "تجربة الألعاب الضخمة الجديدة قبل الشراء (Trials)",
            "أولوية السيرفرات السريعة والدعم الفني الذهبي"
        ],
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
    games: {
        eyebrow: "ألعاب رقمية",
        title: "أبرز الألعاب المتاحة",
        description: "اضغط على أي لعبة لرؤية تفاصيلها الكاملة.",
        customGameTitle: "لعبة محددة بدّك إياها؟",
        customGameSubtitle: "احكينا على واتساب.",
        customGameCta: "اطلب لعبة مخصصة",
    },
    howItWorks: {
        eyebrow: "كيف تشتري؟",
        title: "٤ خطوات وتوصلك اللعبة",
        description: "عملية سريعة وبسيطة من أول ما تختار للحظة ما تستلم.",
        step1Title: "اختر ما تبي", step1Desc: "تصفّح الألعاب والاشتراكات واختار اللي يناسبك.",
        step2Title: "أضف للسلة", step2Desc: "حدد الجهاز والمدة وابني باقتك بخصم.",
        step3Title: "أرسل طلبك", step3Desc: "اضغط طلب وينفتح واتساب مع رقم طلبك وكل التفاصيل.",
        step4Title: "استلم فوراً", step4Desc: "بعد تأكيد الدفع، تسليم فوري خلال دقائق.",
    },
    accountGuide: {
        pageTitle: "دليل وشروحات التفعيل والضمان",
        pageSubtitle: "كل ما تحتاج معرفته لتفعيل حسابك على السوني وقواعد الضمان الذهبي",
        qrHeaderTitle: "كيف تُظهر رمز الـ QR Code من شاشة السوني الخاصة بك؟ 📸",
        ps5Title: "طريقة إظهار الـ QR على سوني 5:",
        ps5Steps: [
            "افتح جهاز الـ PS5 الخاص بك.",
            "اضغط على صورة حسابك الشخصي بأعلى الشاشة.",
            "اختر \"تبديل المستخدم\" ➔ \"إضافة مستخدم جديد\" (Add User).",
            "اختر \"تسجيل الدخول بواسطة تطبيق PlayStation App\".",
            "سيظهر رمز الـ QR Code عريضاً على شاشة التلفزيون 📸.",
            "صور الرمز بجوالك وأرسله فوراً للدعم في الواتساب!"
        ],
        ps4Title: "طريقة إظهار الـ QR على سوني 4:",
        ps4Steps: [
            "من القائمة الرئيسية، اختر \"مستخدم جديد\" (New User).",
            "اختر \"إنشاء مستخدم جديد\" (Create User).",
            "اختر \"تسجيل الدخول بواسطة التطبيق\" لإظهار رمز الـ QR Code.",
            "التقط صورة بوضوح للشاشة بجوالك.",
            "أرسل الصورة لفريق الدعم ليفعلوا الحساب على جهازك!"
        ],
        rule1Title: "1. جهاز واحد فقط",
        rule1Desc: "الحساب مخصص ومصرح بالعمل على جهاز سوني واحد فقط ولا يمكن نقله لجهاز آخر.",
        rule2Title: "2. يُمنع تسجيل الخروج! ⛔",
        rule2Desc: "ممنوع ممنوع الخروج من الحساب أو حذفه لأي ظرف من الظروف! الخروج يتسبب في فقدان التفعيل فوراً وانسحاب الضمان.",
        rule3Title: "3. عدم تعديل البيانات",
        rule3Desc: "يُمنع تغيير البريد أو الرمز أو إعدادات الأمان الخاصة بالحساب لضمان استمرارية الضمان.",
        guaranteeTitle: "سياسة الضمان الذهبي لمتجر دُكانك 🛡️",
        guaranteeItem1: "نضمن لك عمل الحساب واللعبة أو الاشتراك بنسبة 100% طوال الفترة المشترك بها دون أي انقطاع.",
        guaranteeItem2: "في حال حدوث أي مشكلة تقنية من طرفنا، يتولى فريق الدعم حل المشكلة فوراً أو استبدال الحساب."
    },
    goldenGuarantee: {
        eyebrow: "الضمان الذهبي",
        title: "نضمن لك ١٠٠٪",
        description: "راحة بالك أهم شي عنا.",
        badgeText: "ضمانك معنا على كل طلب — بدون استثناء",
        item1Title: "حسابات أصلية مضمونة", item1Desc: "كل منتجاتنا أصلية ١٠٠٪ من مصادر موثوقة.",
        item2Title: "تسليم فوري بدون انتظار", item2Desc: "طلبك يوصلك خلال دقائق من تأكيد الدفع.",
        item3Title: "دعم ٢٤/٧ على واتساب", item3Desc: "فريقنا موجود دائماً لأي استفسار أو مشكلة.",
        item4Title: "ضمان حل المشاكل", item4Desc: "في حال أي إشكال، نضمن حل المشكلة فوراً.",
    },
    aboutStore: {
        eyebrow: "عن المتجر",
        title: "دُكانك — متجرك الموثوق",
        aboutTitle: "من نحن",
        aboutText: "دُكانك متجر متخصص في الاشتراكات والألعاب الرقمية للـ PlayStation. نسعى لتوفير أفضل الأسعار مع خدمة عملاء ممتازة على مدار الساعة.",
        deliveryTitle: "طريقة التسليم",
        deliveryText: "التسليم يتم فوراً عبر الواتساب بعد تأكيد الدفع. نرسل لك بيانات الحساب أو رمز التفعيل مباشرة.",
        accountTitle: "نوع الحساب",
        accountText: "الاشتراكات تفعَّل على حسابك الشخصي مباشرة — لا نطلب كلمة مرورك أبداً. الألعاب تحمَّل على حساب مخصص.",
    },
    reviews: {
        eyebrow: "آراء العملاء",
        title: "ثقة عملائنا أهم شي عنا.",
        description: "عملاء جربوا دُكانك.",
        ratingOutOf5: "من 5 نجوم",
        basedOn: "مبني على",
    },
    faq: { badge: "الأسئلة الشائعة", title: "أي استفسار عندك؟", description: "فريقنا متواجد ٢٤/٧ على واتساب لمساعدتك." },
    footer: {
        tagline: "متجرك الموثوق للاشتراكات والألعاب الرقمية.",
        linksTitle: "روابط سريعة",
        contactTitle: "تواصل معنا",
        copyright: "© دُكانك — كل الحقوق محفوظة.",
    },
};

// Single Section Visual Editor Component
function SectionVisualEditor({ sectionKey, content, onSave, onReload }) {
    const sec = SECTIONS_MAP[sectionKey];
    if (!sec) return null;

    const fallback = DEFAULT_CONTENT_FALLBACKS[sectionKey] || {};
    const [form, setForm] = useState(() => ({ ...fallback, ...(content?.[sectionKey] || {}) }));
    const [dirty, setDirty] = useState(false);
    const [saving, setSaving] = useState(false);
    const Icon = sec.icon || FileText;

    useEffect(() => {
        if (!dirty) {
            const fb = DEFAULT_CONTENT_FALLBACKS[sectionKey] || {};
            setForm({ ...fb, ...(content?.[sectionKey] || {}) });
        }
    }, [content, sectionKey, dirty]);

    const setField = (k, v) => {
        setForm((prev) => ({ ...prev, [k]: v }));
        setDirty(true);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await onSave(sectionKey, form);
            toast.success(`تم حفظ "${sec.title}" بنجاح 💾`);
            setDirty(false);
            onReload?.();
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 sm:p-6 shadow-sm space-y-5">
            {/* Section Header */}
            <div className="flex items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                            <span>{sec.title}</span>
                            {dirty && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600">تغييرات غير محفوظة</span>}
                        </h3>
                        <p className="text-xs text-slate-400 mt-0.5">{sec.hint}</p>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    data-testid={`save-content-${sectionKey}`}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black transition shadow disabled:opacity-40 cursor-pointer flex items-center gap-1.5"
                >
                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    <span>حفظ هذا القسم 💾</span>
                </button>
            </div>

            {/* Editor Grid & Live Preview */}
            <div className="grid lg:grid-cols-12 gap-6">
                {/* Inputs Column */}
                <div className="lg:col-span-7 space-y-4">
                    {sec.fields.map((f) => (
                        <Field key={f.key} label={f.label}>
                            {f.type === "text" && (
                                <Input
                                    value={form[f.key] || ""}
                                    data-testid={`content-${sectionKey}-${f.key}`}
                                    onChange={(e) => setField(f.key, e.target.value)}
                                />
                            )}
                            {f.type === "textarea" && (
                                <Textarea
                                    rows={3}
                                    value={form[f.key] || ""}
                                    data-testid={`content-${sectionKey}-${f.key}`}
                                    onChange={(e) => setField(f.key, e.target.value)}
                                />
                            )}
                            {f.type === "array-string" && (
                                <ArrayStringEditor
                                    value={form[f.key]}
                                    onChange={(val) => setField(f.key, val)}
                                    placeholder={f.placeholder}
                                />
                            )}
                            {f.type === "array-row" && (
                                <ArrayRowEditor
                                    value={form[f.key]}
                                    onChange={(val) => setField(f.key, val)}
                                    schema={f.rowSchema}
                                />
                            )}
                        </Field>
                    ))}
                </div>

                {/* Live Preview Box */}
                <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between space-y-4 self-start sticky top-20">
                    <div>
                        <div className="text-xs font-black text-blue-400 flex items-center gap-1.5 mb-3 border-b border-slate-800 pb-2">
                            <Eye className="w-4 h-4" />
                            <span>معاينة حية وتنسيق النص بالمتجر:</span>
                        </div>

                        {sectionKey === "hero" && (
                            <div className="bg-[#0f172a] text-slate-100 rounded-2xl p-4 space-y-2.5 text-center dir-rtl">
                                <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-[11px] font-bold">
                                    {form.badge || "متجر موثوق"}
                                </span>
                                <h2 className="text-lg font-black text-slate-100 leading-tight">
                                    {form.titleLine1 || "كل ألعابك واشتراكاتك"} <span className="text-red-500">{form.titleLine2 || "بضغطة زر"}</span>
                                </h2>
                                <p className="text-xs text-slate-400 leading-relaxed">
                                    {form.subtitle || "اشتراكات أصلية وتسليم فوري على الواتساب."}
                                </p>
                            </div>
                        )}

                        {sectionKey !== "hero" && (
                            <div className="bg-[#0f172a] text-slate-100 rounded-2xl p-4 space-y-2 dir-rtl">
                                {form.eyebrow && <div className="text-[11px] font-bold text-blue-400">{form.eyebrow}</div>}
                                {form.title && <div className="text-base font-black text-white">{form.title}</div>}
                                {form.description && <div className="text-xs text-slate-400 leading-relaxed">{form.description}</div>}
                                {form.badgeText && <div className="text-xs font-bold text-amber-400 pt-1">{form.badgeText}</div>}
                            </div>
                        )}
                    </div>

                    <div className="text-[11px] text-slate-500 border-t border-slate-800 pt-2 flex items-center justify-between">
                        <span>معاينة لحظية أثناء الكتابة</span>
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function ContentTab({ onChanged }) {
    const { content, setContent, reload } = useStoreData();
    const [activeTab, setActiveTab] = useState("hero");
    const [searchQuery, setSearchQuery] = useState("");

    const handleSaveSection = async (sectionKey, sectionValue) => {
        const updated = { ...(content || {}), [sectionKey]: sectionValue };
        if (setContent) setContent(updated);
        try {
            await apiUpdateContent({ [sectionKey]: sectionValue });
        } catch (err) {
            console.error("apiUpdateContent error:", err);
        }
        onChanged?.();
    };

    const currentCat = CMS_CATEGORIES.find((c) => c.id === activeTab) || CMS_CATEGORIES[0];

    return (
        <div data-testid="content-tab" className="space-y-5">
            {/* Header Title Card */}
            <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                            <Sparkles className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>محرر كافة نصوص المتجر الشامل (Visual CMS)</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                اختر القسم المراد تعديل نصوصه من الأزرار العلوية المنظمة لتعديل وتنسيق العناوين مع معاينة فورية!
                            </p>
                        </div>
                    </div>

                    {/* Instant Search Bar */}
                    <div className="relative min-w-[240px]">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                        <input
                            type="text"
                            placeholder="ابحث عن أي كلمة بالموقع..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-2xl bg-slate-800 border border-slate-700 pr-9 pl-4 py-2 text-xs font-bold text-white focus:border-blue-500 focus:outline-none placeholder:text-slate-500"
                        />
                    </div>
                </div>

                {/* Top Category Tabs Bar */}
                <div className="pt-3 border-t border-slate-800 flex items-center gap-2 overflow-x-auto scrollbar-hide flex-wrap">
                    {CMS_CATEGORIES.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => {
                                setActiveTab(cat.id);
                                setSearchQuery("");
                            }}
                            className={`px-4 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                                activeTab === cat.id
                                    ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-[1.02]"
                                    : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                            }`}
                        >
                            <span>{cat.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Active Category Sections */}
            <div className="space-y-6">
                {currentCat.keys.map((secKey) => (
                    <SectionVisualEditor
                        key={secKey}
                        sectionKey={secKey}
                        content={content}
                        onSave={handleSaveSection}
                        onReload={reload}
                    />
                ))}
            </div>
        </div>
    );
}
