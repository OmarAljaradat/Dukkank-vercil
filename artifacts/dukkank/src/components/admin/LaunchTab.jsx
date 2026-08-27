import { useState, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
    apiUpdateLaunchAnnouncement,
    apiGenerateAiLaunchTheme,
    apiUpdateSections,
    formatApiError
} from "../../lib/api";
import { toast } from "sonner";
import {
    Save, Loader2, Megaphone, Sparkles, Gamepad2, Eye, EyeOff,
    Zap, Clock, Palette, CheckCircle2, Layout, Share2, ShieldCheck, Flame, Gift, Star, Video, FlameKindling, Instagram, Copy, Bot, Wand2, Search
} from "lucide-react";

export default function LaunchTab({ onChanged }) {
    const { launchAnnouncement, setLaunchAnnouncement, games, sections, setSections } = useStoreData();
    const [form, setForm] = useState(launchAnnouncement || {});
    const [saving, setSaving] = useState(false);
    const [aiPrompt, setAiPrompt] = useState("");
    const [aiGenerating, setAiGenerating] = useState(false);
    const [gameSearch, setGameSearch] = useState("");
    const [showAllGames, setShowAllGames] = useState(false);

    useEffect(() => {
        if (launchAnnouncement) {
            setForm(launchAnnouncement);
        }
    }, [launchAnnouncement]);

    const set = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));

    const ensureSectionVisible = async () => {
        if (sections && setSections) {
            const isVisible = sections.some((s) => s.id === "gamelaunch" && s.visible);
            if (!isVisible) {
                const updatedSecs = sections.map((s) => (s.id === "gamelaunch" ? { ...s, visible: true } : s));
                setSections(updatedSecs);
                try {
                    await apiUpdateSections(
                        updatedSecs.map((s) => ({
                            id: s.id,
                            label: s.label || s.id,
                            visible: !!s.visible,
                        }))
                    );
                } catch (_) {}
            }
        }
    };

    // 1-Click Game Auto-Filler Handler
    const handleSelectGame = (gameId) => {
        if (!gameId) return;
        const game = (games || []).find((g) => g.id === gameId);
        if (!game) return;

        setForm((prev) => ({
            ...prev,
            gameId: game.id,
            gameName: game.name,
            badge: "🔥 متوفر الآن للطلب المباشر والتسليم الفوري",
            subtitle: game.sub || "احصل على حسابك الفوري الأصلي المضمون بأفضل سعر في السوق",
            description: `احصل على أحدث إصدارات ${game.name} بخيارات أجهزة PS4 و PS5 مع ضمان ذهبي شامل وتفعيل فوري.`,
            price5: game.five || 38.5,
            price4: game.four || 18.5,
            ctaLabel: "احصل عليها الآن ⚡",
            image: game.image || "",
            theme: prev.theme || "gold",
            bonusGift: "🎁 شامل ضمان ذهبي طوال فترة اللعب",
            rating: "⭐ 9.8/10 IGN • 🏆 لعبة السنة",
            stockLeft: 7,
            trailerUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        }));

        toast.success(`تم استيراد وتحديد (${game.name}) للبنر بنجاح 🎮!`);
    };

    // Clear Selected Store Game Handler
    const handleClearGameSelection = () => {
        setForm((prev) => ({
            ...prev,
            gameId: null,
            gameName: prev.theme === "vice" ? "Grand Theft Auto VI" : prev.theme === "eafc" ? "EA SPORTS FC 27" : "Call of Duty: Black Ops 7",
            image: "",
            imageUrl: "",
        }));
        toast.info("تم إلغاء تحديد اللعبة من المخزون بنجاح 🔄");
    };

    const getSavedTheme = (theme) => {
        try {
            const item = localStorage.getItem(`dukkank_saved_theme_${theme}`);
            return item ? JSON.parse(item) : null;
        } catch {
            return null;
        }
    };

    const saveThemeData = (theme, data) => {
        try {
            if (theme && data) {
                localStorage.setItem(`dukkank_saved_theme_${theme}`, JSON.stringify(data));
            }
        } catch {}
    };

    // 🎮 GTA VI VICE CITY - Clean Explicit Theme Preset (Toggleable)
    const handleGTAVIPreset = async () => {
        if (form.enabled && form.theme === "vice" && form.gameName === "Grand Theft Auto VI") {
            const newData = { ...form, enabled: false };
            setForm(newData);
            saveThemeData("vice", newData);
            try {
                setLaunchAnnouncement(newData);
                await apiUpdateLaunchAnnouncement(newData);
                toast.success("🙈 تم إيقاف وإخفاء ثيم GTA VI من المتجر!");
                onChanged?.();
            } catch (err) {
                toast.error(formatApiError(err));
            }
            return;
        }

        const defaultLaunchIso = "2025-10-28";

        const newData = {
            ...form,
            enabled: true,
            theme: "vice",
            gameId: null,
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
            countdownTarget: defaultLaunchIso,
            launchDate: defaultLaunchIso,
            note: "⚠️ الطلب المسبق يضمن لك أولوية التسليم فور الإطلاق الرسمي",
            currency: "$",
            platform5: "PS5",
            platform4: "PS4",
        };

        setForm(newData);
        saveThemeData("vice", newData);
        try {
            setLaunchAnnouncement(newData);
            await apiUpdateLaunchAnnouncement(newData);
            await ensureSectionVisible();
            toast.success("🌴 تم تفعيل ثيم GTA VI الأصلي وإلغاء اختيار اللعبة السابقة بنجاح! 🎮🔥");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        }
    };

    // ⚽ EA SPORTS FC - Clean Explicit Theme Preset (Toggleable)
    const handleEAFCPreset = async () => {
        if (form.enabled && form.theme === "eafc" && form.gameName === "EA SPORTS FC 27") {
            const newData = { ...form, enabled: false };
            setForm(newData);
            saveThemeData("eafc", newData);
            try {
                setLaunchAnnouncement(newData);
                await apiUpdateLaunchAnnouncement(newData);
                toast.success("🙈 تم إيقاف وإخفاء ثيم EA SPORTS FC من المتجر!");
                onChanged?.();
            } catch (err) {
                toast.error(formatApiError(err));
            }
            return;
        }

        const launchDate = new Date();
        launchDate.setDate(launchDate.getDate() + 14);
        const defaultLaunchIso = launchDate.toISOString().split("T")[0];

        const newData = {
            ...form,
            enabled: true,
            theme: "eafc",
            gameId: null,
            gameName: "EA SPORTS FC 27",
            badge: "⚽ انطلاقة الموسم الكروي الجديد",
            subtitle: "عِش متعة كرة القدم الحقيقية في Ultimate Team وأنماط المهنة الرقمية",
            description: "احصل على حسابك الأصلي المضمون لنسخة EA SPORTS FC الرسمية مع كافة التحديثات التنافسية وأولوية التسليم الفوري طوال الموسم الكروي.",
            price5: 42.0,
            price4: 24.0,
            ctaLabel: "احصل على نسختك الآن ⚡",
            ctaHref: "#games",
            image: "",
            imageUrl: "",
            bonusGift: "🎁 شامل 4600 FC Points + ضمان ذهبي طوال الموسم الكروي",
            rating: "⭐ اللعبة الكروية الأولى عالمياً • 🏆 EA SPORTS",
            stockLeft: 15,
            trailerUrl: "",
            countdownTarget: defaultLaunchIso,
            launchDate: defaultLaunchIso,
            note: "⚡ تسليم أوتوماتيكي مباشر كحساب أصلي Primary",
            currency: "$",
            platform5: "PS5",
            platform4: "PS4",
        };

        setForm(newData);
        saveThemeData("eafc", newData);
        try {
            setLaunchAnnouncement(newData);
            await apiUpdateLaunchAnnouncement(newData);
            await ensureSectionVisible();
            toast.success("⚽ تم تفعيل ثيم EA SPORTS FC الأصلي وإلغاء اختيار اللعبة السابقة بنجاح! 🏆");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        }
    };

    // 🏆 Gold Theme Preset
    const handleGoldPreset = async () => {
        if (form.enabled && form.theme === "gold") {
            const newData = { ...form, enabled: false };
            setForm(newData);
            saveThemeData("gold", newData);
            try {
                setLaunchAnnouncement(newData);
                await apiUpdateLaunchAnnouncement(newData);
                toast.success("🙈 تم إيقاف وإخفاء ثيم الإطلاق من المتجر!");
                onChanged?.();
            } catch (err) {
                toast.error(formatApiError(err));
            }
            return;
        }

        const saved = getSavedTheme("gold");
        const newData = {
            ...(saved || form),
            enabled: true,
            theme: "gold",
            gameName: (saved?.gameName || form.gameName) || "Call of Duty: Black Ops 7",
            badge: (saved?.badge || form.badge) || "🔥 متوفر الآن للطلب المباشر والتسليم الفوري",
            subtitle: (saved?.subtitle || form.subtitle) || "احصل على حسابك الفوري الأصلي المضمون بأفضل سعر في السوق",
            description: (saved?.description || form.description) || "احصل على اللعبة بأفضل سعر مع ضمان ذهبي شامل وتفعيل فوري على أجهزة PS4 و PS5.",
            price5: (saved?.price5 ?? form.price5) ?? 38.5,
            price4: (saved?.price4 ?? form.price4) ?? 18.5,
            currency: "$",
        };
        setForm(newData);
        saveThemeData("gold", newData);
        try {
            setLaunchAnnouncement(newData);
            await apiUpdateLaunchAnnouncement(newData);
            await ensureSectionVisible();
            toast.success("🏆 تم تفعيل ونشر الثيم الذهبي الملكي بنجاح! ✨");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        }
    };

    // Global Master Toggle
    const handleToggleGlobal = async () => {
        const nextEnabled = !form.enabled;
        const newData = { ...form, enabled: nextEnabled };
        setForm(newData);
        saveThemeData(form.theme || "vice", newData);
        try {
            setLaunchAnnouncement(newData);
            await apiUpdateLaunchAnnouncement(newData);
            if (nextEnabled) await ensureSectionVisible();
            toast.success(nextEnabled ? "🟢 تم تفعيل وعرض بنر الإطلاق في المتجر بنجاح!" : "🙈 تم إيقاف وإخفاء بنر الإطلاق من المتجر بنجاح!");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        }
    };

    // ⚪ Default Store Mode (Disable Launch Banner)
    const handleDisablePreset = async () => {
        const newData = { ...form, enabled: false };
        setForm(newData);
        try {
            setLaunchAnnouncement(newData);
            await apiUpdateLaunchAnnouncement(newData);
            toast.success("⚪ تم تعطيل ثيم الإطلاق — المتجر الآن بالوضع الطبيعي الافتراضي!");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        }
    };

    // Quick Countdown Date Setters
    const setQuickDays = (days) => {
        const d = new Date();
        d.setDate(d.getDate() + days);
        const iso = d.toISOString().split("T")[0];
        set("countdownTarget", iso);
        toast.success(`تم تحديد موعد الإطلاق بعد ${days} يوم ⏱️`);
    };

    // Save Announcement Handler
    const handleSave = async (e) => {
        e?.preventDefault?.();
        setSaving(true);
        try {
            saveThemeData(form.theme || "vice", form);
            setLaunchAnnouncement(form);
            await apiUpdateLaunchAnnouncement(form);
            await ensureSectionVisible();
            toast.success("تم نشر وحفظ إعلان الإطلاق بنجاح في الموقع 📢");
            onChanged?.();
        } catch (err) {
            toast.error(formatApiError(err));
        } finally {
            setSaving(false);
        }
    };

    // Copy WhatsApp Promotional Announcement Text
    const copyWhatsAppPromoText = () => {
        const promoText = `🚨 *إعلان إطلاق ضخم وحصري من متجر دُكانك!* 🎮

🔥 *اللعبة:* \`${form.gameName || "Call of Duty: Black Ops 7"}\`
🏷️ *شارة العرض:* ${form.badge || "متوفر الآن للطلب المباشر"}

⚡ *المخزون الفوري:* متبقي ${form.stockLeft || 7} حسابات فقط!
⭐ *التقييم:* ${form.rating || "⭐ 9.8/10 IGN"}

💰 *الأسعار الحصرية:*
• نسخة PS5: *$${form.price5 || 38.5}*
• نسخة PS4: *$${form.price4 || 18.5}*

✨ *مميزات الطلب الآن:*
🛡️ ضمان ذهبي شامل طوال فترة اللعب
⚡ تسليم وتفعيل فوري كحساب رئيسي Primary
${form.bonusGift ? `🎁 ${form.bonusGift}\n` : ""}
🔗 *اطلب حسابك الأصلي الآن عبر الرابط:*
https://dukkank.com`;

        navigator.clipboard.writeText(promoText);
        toast.success("تم نسخ إعلان الإطلاق التسويقي للواتساب 📋", {
            description: "جاهز الآن للصقه وإرساله فوراً في حالة الواتساب والقنوات!",
        });
    };

    // Copy Instagram Story Text
    const copyInstagramStoryText = () => {
        const text = `🎮 *جديد متجر دُكانك!* 🚀
🔥 ${form.gameName || "Call of Duty: Black Ops 7"} متوفرة الآن!
⚡ متبقي ${form.stockLeft || 7} حسابات فقط!
💰 يبدأ السعر من $${form.price4 || 18.5}
🔗 اطلبها الآن عبر الرابط بالبايو!`;

        navigator.clipboard.writeText(text);
        toast.success("تم نسخ كابشن ستوري الانستغرام 📲!");
    };

    // Theme Gradients for Live Preview & Site Banner
    const getThemeGradient = (theme) => {
        switch (theme) {
            case "red":
                return "from-red-950 via-slate-900 to-black border-red-500/50 text-red-400";
            case "blue":
                return "from-blue-950 via-slate-900 to-black border-blue-500/50 text-blue-400";
            case "cyber":
                return "from-purple-950 via-slate-900 to-black border-purple-500/50 text-purple-400";
            case "vice":
                return "from-pink-950 via-slate-900 to-black border-pink-500/50 text-pink-400";
            case "eafc":
                return "from-emerald-950 via-slate-900 to-black border-emerald-500/50 text-emerald-400";
            case "gold":
            default:
                return "from-amber-950 via-slate-900 to-black border-amber-500/50 text-amber-400";
        }
    };

    // 🤖 AI Automatic Theme Generator (Gemini AI)
    const handleAiGenerate = async (e) => {
        e?.preventDefault();
        if (!aiPrompt.trim()) {
            toast.error("يرجى كتابة اسم اللعبة لإنشاء الثيم بواسطة الذكاء الاصطناعي");
            return;
        }

        setAiGenerating(true);
        try {
            const res = await apiGenerateAiLaunchTheme(aiPrompt);
            if (res.ok && res.themeData) {
                const td = res.themeData;
                const launchDate = new Date();
                launchDate.setDate(launchDate.getDate() + 10);
                const launchIso = launchDate.toISOString().split("T")[0];

                const newData = {
                    ...form,
                    enabled: true,
                    gameName: td.gameName || aiPrompt,
                    badge: td.badge || "🔥 متوفر الآن للطلب المباشر والتسليم الفوري",
                    subtitle: td.subtitle || "",
                    description: td.description || "",
                    theme: td.theme || "gold",
                    price5: td.price5 || 38.5,
                    price4: td.price4 || 18.5,
                    ctaLabel: td.ctaLabel || "احصل على نسختك الآن ⚡",
                    bonusGift: td.bonusGift || "🎁 شامل ضمان ذهبي طوال فترة اللعب",
                    rating: td.rating || "⭐ 9.8/10 IGN • 🏆 لعبة السنة",
                    stockLeft: td.stockLeft || 7,
                    image: td.image || form.image || "",
                    trailerUrl: td.trailerUrl || form.trailerUrl || "",
                    countdownTarget: launchIso,
                    currency: "$",
                    platform5: "PS5",
                    platform4: "PS4",
                };

                setForm(newData);
                setLaunchAnnouncement(newData);
                await apiUpdateLaunchAnnouncement(newData);
                toast.success(`✨ تم بناء ونشر ثيم (${td.gameName || aiPrompt}) تلقائياً بواسطة Gemini AI! 🎮🔥`);
                onChanged?.();
            }
        } catch (err) {
            toast.error(formatApiError(err));
        } finally {
            setAiGenerating(false);
        }
    };

    return (
        <div data-testid="launch-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Header Banner */}
            <div className="bg-slate-900 text-white p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Megaphone className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <span>إدارة بنر الإطلاق والتسويق للألعاب (Launch Master Control)</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-300 font-medium">
                            تحكّم في البنر الإعلاني الذهبي بالصفحة الرئيسية لأهم الألعاب، أضف عداد المخزون، فيديو التريلر، وهدايا الحجز.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                        type="button"
                        onClick={copyInstagramStoryText}
                        className="px-3.5 py-2.5 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 font-black text-xs transition flex items-center gap-1.5 cursor-pointer shadow"
                    >
                        <Instagram className="w-4 h-4" />
                        <span>ستوري انستغرام</span>
                    </button>

                    <button
                        type="button"
                        onClick={copyWhatsAppPromoText}
                        className="px-4 py-2.5 rounded-2xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 font-black text-xs transition flex items-center gap-2 cursor-pointer shadow"
                    >
                        <Share2 className="w-4 h-4" />
                        <span>📢 إعلان الواتساب</span>
                    </button>

                    <button
                        type="button"
                        onClick={async () => {
                            const newEnabled = !form.enabled;
                            const newData = { ...form, enabled: newEnabled };
                            setForm(newData);
                            try {
                                setLaunchAnnouncement(newData);
                                await apiUpdateLaunchAnnouncement(newData);
                                toast.success(newEnabled ? "🟢 تم تفعيل وعرض ثيم الإطلاق بالمتجر!" : "🙈 تم إخفاء ثيم إعلان الإطلاق من المتجر بالكامل!");
                                onChanged?.();
                            } catch (err) {
                                toast.error(formatApiError(err));
                            }
                        }}
                        className={`px-5 py-2.5 rounded-2xl font-black text-xs transition-all flex items-center gap-2 cursor-pointer shadow-lg ${
                            form.enabled
                                ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                                : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                    >
                        {form.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        <span>{form.enabled ? "مفعّل بالمتجر 🟢" : "مخفي من المتجر 🙈"}</span>
                    </button>
                </div>
            </div>

            {/* 🤖 Gemini AI Generator Bar */}
            <div className="relative rounded-3xl p-6 bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border-2 border-purple-500/40 shadow-2xl overflow-hidden text-white space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-400 shrink-0">
                            <Bot className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <div className="text-xs font-black text-purple-300 flex items-center gap-1.5">
                                <span>صانع الثيمات بالذكاء الاصطناعي (Gemini AI Theme Studio)</span>
                                <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-purple-500/30 text-purple-200">AI Powered ✨</span>
                            </div>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                اكتب اسم أي لعبة جديدة (مثل: Spider-Man 2, Call of Duty, Cyberpunk, Silent Hill, Dragon Ball) وسيقوم الذكاء الاصطناعي بإنشاء الثيم، النصوص التسويقية، الألوان، والهدايا بنقرة زر!
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleAiGenerate} className="flex flex-col sm:flex-row items-center gap-3">
                    <div className="relative flex-1 w-full">
                        <input
                            type="text"
                            value={aiPrompt}
                            onChange={(e) => setAiPrompt(e.target.value)}
                            placeholder="اكتب اسم اللعبة هنا... (مثال: God of War Ragnarok أو Resident Evil 4)"
                            className="w-full h-12 pr-4 pl-10 rounded-2xl bg-black/40 border border-purple-500/30 text-white text-xs font-bold focus:border-purple-400 focus:outline-none placeholder:text-slate-400"
                        />
                        <Wand2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
                    </div>

                    <button
                        type="submit"
                        disabled={aiGenerating || !aiPrompt.trim()}
                        className="w-full sm:w-auto px-6 h-12 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40 shrink-0"
                    >
                        {aiGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-amber-300" />}
                        <span>{aiGenerating ? "جاري البناء بالذكاء الاصطناعي..." : "توليد ونشر الثيم بالذكاء الاصطناعي 🎨"}</span>
                    </button>
                </form>

                <div className="flex items-center gap-2 text-[11px] text-slate-400 font-bold overflow-x-auto pb-1">
                    <span className="text-purple-400 shrink-0">أمثلة سريعة للتجربة:</span>
                    {[
                        "Spider-Man 2", "God of War Ragnarok", "Resident Evil 4 Remake",
                        "Elden Ring: Shadow of the Erdtree", "Tekken 8", "FC 25", "GTA VI"
                    ].map((example) => (
                        <button
                            key={example}
                            type="button"
                            onClick={() => { setAiPrompt(example); }}
                            className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-purple-500/20 text-slate-300 hover:text-purple-200 transition shrink-0 cursor-pointer border border-white/10"
                        >
                            + {example}
                        </button>
                    ))}
                </div>
            </div>

            {/* Quick Auto-Fill Selector from Existing Store Games (Full Store Picker) */}
            <div className="bg-slate-900/80 p-5 rounded-3xl border border-slate-800 space-y-4 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                            <Zap className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="text-xs font-black text-white">اختيار لعبة من مخزون المتجر لتعبئة البنر بنقرة واحدة</h3>
                            <p className="text-[11px] text-slate-400 font-medium">
                                اختر أي لعبة مسجلة في المتجر ({games?.length || 0} لعبة متوفرة) لتعبئة الصورة والأسعار والاسم فوراً.
                            </p>
                        </div>
                    </div>

                    {(form.gameId || form.gameName) && (
                        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                            <div className="px-3 py-1 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1.5">
                                <span>اللعبة المختارة للبنر:</span>
                                <span className="text-white font-black">{form.gameName}</span>
                            </div>
                            <button
                                type="button"
                                onClick={handleClearGameSelection}
                                className="px-2.5 py-1 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-bold transition cursor-pointer flex items-center gap-1 active:scale-95"
                                title="إلغاء تحديد اللعبة والعودة للوضع الحر"
                            >
                                <span>✕ إلغاء تحديد اللعبة</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Quick Search and Dropdown Filter Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="relative">
                        <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={gameSearch}
                            onChange={(e) => setGameSearch(e.target.value)}
                            placeholder="ابحث باسم أي لعبة بالمتجر... (مثلاً: GTA, FIFA, Call of Duty)"
                            className="w-full h-10 pr-10 pl-8 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white placeholder-slate-500 focus:border-amber-400 focus:outline-none"
                        />
                        {gameSearch && (
                            <button
                                type="button"
                                onClick={() => setGameSearch("")}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs font-bold"
                            >
                                ✕
                            </button>
                        )}
                    </div>

                    <div>
                        <select
                            value={form.gameId || ""}
                            onChange={(e) => {
                                if (e.target.value === "") {
                                    handleClearGameSelection();
                                } else {
                                    handleSelectGame(e.target.value);
                                }
                            }}
                            className="w-full h-10 px-3 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-white focus:border-amber-400 focus:outline-none cursor-pointer"
                        >
                            <option value="">-- ✕ بدون تحديد لعبة (تخصيص حر / GTA VI / EA FC) --</option>
                            {(games || []).map((g) => (
                                <option key={g.id} value={g.id}>
                                    {g.name} (PS5: ${g.five || 0} | PS4: ${g.four || 0})
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Interactive Cards Grid */}
                {(() => {
                    const filtered = (games || []).filter((g) => {
                        if (!gameSearch.trim()) return true;
                        const q = gameSearch.toLowerCase().trim();
                        return (
                            (g.name || "").toLowerCase().includes(q) ||
                            (g.id || "").toLowerCase().includes(q) ||
                            (g.sub || "").toLowerCase().includes(q)
                        );
                    });

                    return (
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 max-h-[340px] overflow-y-auto pr-1">
                                {(showAllGames || gameSearch ? filtered : filtered.slice(0, 9)).map((g) => {
                                    const isSelected = form.gameId === g.id || form.gameName === g.name;
                                    return (
                                        <button
                                            key={g.id}
                                            type="button"
                                            onClick={() => handleSelectGame(g.id)}
                                            className={`p-2.5 rounded-2xl border text-right flex items-center gap-3 transition cursor-pointer group ${
                                                isSelected
                                                    ? "bg-amber-500/20 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                                                    : "bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-slate-600"
                                            }`}
                                        >
                                            {g.image ? (
                                                <img src={g.image} alt={g.name} className="w-10 h-10 rounded-xl object-cover shrink-0 border border-slate-600" />
                                            ) : (
                                                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center shrink-0">
                                                    <Gamepad2 className="w-5 h-5 text-slate-400" />
                                                </div>
                                            )}
                                            <div className="space-y-0.5 overflow-hidden flex-1 min-w-0">
                                                <div className="text-xs font-black text-white group-hover:text-amber-400 transition truncate">{g.name}</div>
                                                <div className="text-[10px] text-emerald-400 font-bold flex items-center gap-2">
                                                    <span>PS5: ${g.five || 0}</span>
                                                    <span className="text-slate-500">•</span>
                                                    <span>PS4: ${g.four || 0}</span>
                                                </div>
                                            </div>
                                            {isSelected && (
                                                <div className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shrink-0 font-black text-xs">
                                                    ✓
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>

                            {!gameSearch && (games || []).length > 9 && (
                                <div className="text-center pt-2 border-t border-slate-800">
                                    <button
                                        type="button"
                                        onClick={() => setShowAllGames(!showAllGames)}
                                        className="text-xs font-bold text-amber-400 hover:text-amber-300 underline cursor-pointer"
                                    >
                                        {showAllGames ? "▲ إظهار عدد أقل" : `▼ عرض كل ألعاب المتجر المتاحة (${games.length} لعبة)`}
                                    </button>
                                </div>
                            )}
                        </div>
                    );
                })()}
            </div>

            {/* 🚦 Live Store Banner Global Status Bar */}
            <div className={`p-4 rounded-3xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                form.enabled
                    ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-300"
                    : "bg-slate-900/80 border-slate-800 text-slate-400"
            }`}>
                <div className="flex items-center gap-3">
                    <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${
                        form.enabled ? "bg-emerald-400 shadow-[0_0_12px_#34d399] animate-pulse" : "bg-slate-600"
                    }`} />
                    <div className="text-xs font-bold">
                        <span>حالة البنر بالصفحة الرئيسية للمتجر: </span>
                        {form.enabled ? (
                            <strong className="text-white font-black">مفعّل ويظهر للزوار حالياً ({form.gameName || "ثيم إطلاق"}) 🟢</strong>
                        ) : (
                            <strong className="text-slate-300 font-bold">معطّل ومخفي (الوضع الافتراضي للمتجر بدون ثيم إطلاق) ⚪</strong>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {form.enabled ? (
                        <button
                            type="button"
                            onClick={handleToggleGlobal}
                            className="px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40 text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95"
                        >
                            <EyeOff className="w-4 h-4" />
                            <span>إيقاف البنر وإخفاؤه من المتجر الآن 🚫</span>
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleToggleGlobal}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black transition cursor-pointer flex items-center gap-1.5 shrink-0 active:scale-95 shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                        >
                            <Eye className="w-4 h-4" />
                            <span>تفعيل البنر بنصوصك الحالية بالمتجر 🟢</span>
                        </button>
                    )}
                </div>
            </div>

            {/* 🎮 Major Game Launch Presets Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* ⚽ EA SPORTS FC Quick Preset */}
                <div className={`relative rounded-3xl overflow-hidden shadow-xl bg-slate-900/90 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                    form.enabled && form.theme === "eafc"
                        ? "border-2 border-emerald-400 ring-2 ring-emerald-400/30 shadow-emerald-400/20"
                        : "border border-emerald-500/20 opacity-80 hover:opacity-100"
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-black text-lg">
                                ⚽
                            </div>
                            <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>⚽ EA SPORTS FC</span>
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300">EA FC 27</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    ثيم الملعب الكروي الفسفوري
                                </p>
                            </div>
                        </div>
                        {form.enabled && form.theme === "eafc" && (
                            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/50 text-emerald-300 text-[10px] font-black shrink-0">
                                ✅ مفعّل
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleEAFCPreset}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                            form.enabled && form.theme === "eafc"
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                                : "bg-gradient-to-r from-emerald-400 to-teal-300 text-slate-950 shadow-[0_4px_15px_rgba(52,211,153,0.3)]"
                        }`}
                    >
                        {form.enabled && form.theme === "eafc" ? (
                            <>
                                <EyeOff className="w-4 h-4 text-red-400" />
                                <span>إيقاف وتعطيل الثيم ⏸️</span>
                            </>
                        ) : (
                            <>
                                <Zap className="w-4 h-4" />
                                <span>تفعيل ثيم EA SPORTS FC ⚽</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 🌴 GTA VI Vice City Quick Preset */}
                <div className={`relative rounded-3xl overflow-hidden shadow-xl bg-slate-900/90 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                    form.enabled && form.theme === "vice"
                        ? "border-2 border-pink-500 ring-2 ring-pink-500/30 shadow-pink-500/20"
                        : "border border-pink-500/20 opacity-80 hover:opacity-100"
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0"
                                style={{
                                    background: "linear-gradient(135deg, rgba(255,45,120,0.25), rgba(0,229,255,0.15))",
                                    border: "1px solid rgba(255,45,120,0.3)",
                                }}>
                                <span className="text-lg font-black" style={{
                                    background: "linear-gradient(130deg, #ff2d78, #ffd700, #00e5ff)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                }}>VI</span>
                            </div>
                            <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>🌴 GTA VI Vice City</span>
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-pink-500/20 text-pink-300">ROCKSTAR</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    ثيم فايس سيتي النيون مع العداد
                                </p>
                            </div>
                        </div>
                        {form.enabled && form.theme === "vice" && (
                            <span className="px-2.5 py-1 rounded-full bg-pink-500/20 border border-pink-500/50 text-pink-300 text-[10px] font-black shrink-0">
                                ✅ مفعّل
                            </span>
                        )}
                    </div>
                    <button
                        type="button"
                        onClick={handleGTAVIPreset}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-2 ${
                            form.enabled && form.theme === "vice"
                                ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                                : "text-white"
                        }`}
                        style={form.enabled && form.theme === "vice" ? {} : {
                            background: "linear-gradient(135deg, #ff2d78, #ff8c42)",
                            boxShadow: "0 4px 15px rgba(255,45,120,0.3)",
                        }}
                    >
                        {form.enabled && form.theme === "vice" ? (
                            <>
                                <EyeOff className="w-4 h-4 text-red-400" />
                                <span>إيقاف وتعطيل الثيم ⏸️</span>
                            </>
                        ) : (
                            <>
                                <Flame className="w-4 h-4" />
                                <span>تفعيل ثيم GTA VI 🎮</span>
                            </>
                        )}
                    </button>
                </div>

                {/* 🏆 Gold Theme / Default Mode Preset */}
                <div className={`relative rounded-3xl overflow-hidden shadow-xl bg-slate-900/90 p-5 flex flex-col justify-between space-y-4 transition-all duration-300 ${
                    form.enabled && form.theme === "gold"
                        ? "border-2 border-amber-400 ring-2 ring-amber-400/30 shadow-amber-400/20"
                        : "border border-amber-500/20 opacity-80 hover:opacity-100"
                }`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 bg-amber-500/20 border border-amber-500/40 text-amber-400 font-black text-lg">
                                🏆
                            </div>
                            <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                    <span>🏆 البنر الذهبي الملكي</span>
                                    <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300">GOLD</span>
                                </div>
                                <p className="text-[11px] text-slate-400 font-medium mt-0.5">
                                    الثيم الذهبي الكلاسيكي لكافة الألعاب
                                </p>
                            </div>
                        </div>
                        {form.enabled && form.theme === "gold" && (
                            <span className="px-2.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-300 text-[10px] font-black shrink-0">
                                ✅ مفعّل
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleGoldPreset}
                            className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95 flex items-center justify-center gap-1.5 ${
                                form.enabled && form.theme === "gold"
                                    ? "bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/40"
                                    : "bg-gradient-to-r from-amber-400 to-yellow-300 text-slate-950 shadow-[0_4px_15px_rgba(251,191,36,0.3)]"
                            }`}
                        >
                            {form.enabled && form.theme === "gold" ? (
                                <>
                                    <EyeOff className="w-3.5 h-3.5" />
                                    <span>إيقاف ⏸️</span>
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>تفعيل الذهبي 🏆</span>
                                </>
                            )}
                        </button>

                        {form.enabled && (
                            <button
                                type="button"
                                onClick={handleDisablePreset}
                                className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-[11px] font-bold transition cursor-pointer"
                                title="إخفاء البنر بالكامل والعودة للوضع الافتراضي"
                            >
                                ⚪ بدون ثيم
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Form Controls & Live Interactive Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Form controls (7 cols) */}
                <form onSubmit={handleSave} className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-5 shadow-sm">
                    <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <Layout className="w-4 h-4 text-blue-500" />
                        <h3 className="font-black text-sm text-slate-900 dark:text-white">إعداد حقول وعناصر البنر الإعلاني</h3>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم اللعبة المعلن عنها *</label>
                            <input
                                type="text"
                                required
                                value={form.gameName || ""}
                                onChange={(e) => set("gameName", e.target.value)}
                                placeholder="مثال: Call of Duty: Black Ops 7"
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">شارة البادج العلوية</label>
                                <input
                                    type="text"
                                    value={form.badge || ""}
                                    onChange={(e) => set("badge", e.target.value)}
                                    placeholder="مثال: 🔥 متوفر الآن للطلب المباشر"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">ثيم ولون البنر بالموقع</label>
                                <select
                                    value={form.theme || "gold"}
                                    onChange={(e) => set("theme", e.target.value)}
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                >
                                    <option value="gold">🏆 الذهبي الملكي (Royal Gold)</option>
                                    <option value="red">🔴 الأحمـر الحماسي (Crimson Red)</option>
                                    <option value="blue">🟦 الأزرق البلايستيشن (PS Blue)</option>
                                    <option value="cyber">⚡ البنفسجي النيون (Cyber Purple)</option>
                                    <option value="vice">🌴 فايس سيتي نيون (Vice City — GTA VI)</option>
                                    <option value="eafc">⚽ الملعب الكروي (EA SPORTS FC — Green)</option>
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عدد المخزون المتبقي (الاستعجال)</label>
                                <input
                                    type="number"
                                    min="1"
                                    value={form.stockLeft != null ? form.stockLeft : ""}
                                    onChange={(e) => set("stockLeft", parseInt(e.target.value) || 0)}
                                    placeholder="مثال: 7 حسابات"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-amber-500 dark:text-amber-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">تقييم وشارة النقاد (Rating)</label>
                                <input
                                    type="text"
                                    value={form.rating || ""}
                                    onChange={(e) => set("rating", e.target.value)}
                                    placeholder="⭐ 9.8/10 IGN • 🏆 لعبة السنة"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط صورة بوستر اللعبة (صورة سينمائية)</label>
                            <input
                                type="text"
                                value={form.image || ""}
                                onChange={(e) => set("image", e.target.value)}
                                placeholder="https://..."
                                dir="ltr"
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط فيديو التريلر الرسمي (YouTube Embed)</label>
                            <input
                                type="text"
                                value={form.trailerUrl || ""}
                                onChange={(e) => set("trailerUrl", e.target.value)}
                                placeholder="مثال: https://www.youtube.com/embed/..."
                                dir="ltr"
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-mono text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">العنوان الفرعي الجذاب</label>
                            <input
                                type="text"
                                value={form.subtitle || ""}
                                onChange={(e) => set("subtitle", e.target.value)}
                                placeholder="مثال: الإصدار الأكثر انتظاراً في التاريخ • احصل على حسابك الفوري الآن"
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">مكافأة وهدية الطلب المسبق (Bonus)</label>
                            <input
                                type="text"
                                value={form.bonusGift || ""}
                                onChange={(e) => set("bonusGift", e.target.value)}
                                placeholder="مثال: 🎁 شامل ضمان ذهبي طوال فترة اللعب + تسليم أولوية"
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-amber-500 dark:text-amber-400"
                            />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سعر PS5 ($)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={form.price5 != null ? form.price5 : ""}
                                    onChange={(e) => set("price5", parseFloat(e.target.value) || 0)}
                                    placeholder="38.50"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-emerald-600 dark:text-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">سعر PS4 ($)</label>
                                <input
                                    type="number"
                                    step="0.5"
                                    value={form.price4 != null ? form.price4 : ""}
                                    onChange={(e) => set("price4", parseFloat(e.target.value) || 0)}
                                    placeholder="18.50"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-black text-emerald-600 dark:text-emerald-400"
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص زر الشراء</label>
                                <input
                                    type="text"
                                    value={form.ctaLabel || ""}
                                    onChange={(e) => set("ctaLabel", e.target.value)}
                                    placeholder="شراء الآن ⚡"
                                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">تاريخ العداد التنازلي لإطلاق اللعبة</label>
                                <div className="flex items-center gap-1.5 text-[10px] text-amber-500 font-bold">
                                    <button type="button" onClick={() => setQuickDays(0)} className="hover:underline">اليوم 🔥</button>
                                    <span>•</span>
                                    <button type="button" onClick={() => setQuickDays(7)} className="hover:underline">بعد 7 أيام</button>
                                    <span>•</span>
                                    <button type="button" onClick={() => setQuickDays(30)} className="hover:underline">بعد شهر</button>
                                </div>
                            </div>
                            <input
                                type="date"
                                value={form.countdownTarget || ""}
                                onChange={(e) => set("countdownTarget", e.target.value)}
                                className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold text-slate-900 dark:text-white"
                                dir="ltr"
                            />
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={copyWhatsAppPromoText}
                            className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 hover:bg-slate-200 transition cursor-pointer"
                        >
                            <Share2 className="w-4 h-4" />
                            <span>نسخ إعلان الواتساب 📢</span>
                        </button>

                        <button
                            type="submit"
                            disabled={saving}
                            className="px-8 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-lg transition flex items-center gap-2 cursor-pointer"
                        >
                            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                            <span>حفظ ونشر بنر الإطلاق فوراً ✅</span>
                        </button>
                    </div>
                </form>

                {/* Live Admin Interactive Banner Preview Box (5 cols) */}
                <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                            <Eye className="w-4 h-4 text-emerald-500" />
                            <span>معاينة حية لشكل البنر بالصفحة الرئيسية للمتجر:</span>
                        </h3>
                        <span className="text-[10px] font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">Live Preview</span>
                    </div>

                    <div className={`relative rounded-3xl p-6 bg-gradient-to-br ${getThemeGradient(form.theme)} border-2 shadow-2xl overflow-hidden text-white space-y-5 min-h-[440px] flex flex-col justify-between`}>
                        <div className="space-y-3 relative z-10">
                            <div className="flex flex-wrap items-center gap-2">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur border border-white/20 text-xs font-black">
                                    <Flame className="w-3.5 h-3.5 text-amber-400" />
                                    <span>{form.badge || "🔥 متوفر الآن للطلب المباشر والتسليم الفوري"}</span>
                                </div>

                                {form.stockLeft > 0 && (
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-500/20 border border-red-500/40 text-red-300 text-[11px] font-extrabold animate-pulse">
                                        ⚡ متبقي {form.stockLeft} حسابات!
                                    </span>
                                )}
                            </div>

                            <div className="flex items-start gap-3">
                                {form.image && (
                                    <img src={form.image} alt={form.gameName} className="w-16 h-20 rounded-xl object-cover border border-amber-400/50 shadow-lg shrink-0" />
                                )}
                                <div>
                                    <h2 className="text-xl font-black leading-tight text-white">
                                        {form.gameName || "Call of Duty: Black Ops 7"}
                                    </h2>
                                    {form.rating && (
                                        <div className="text-[11px] font-black text-amber-300 mt-1 flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                            <span>{form.rating}</span>
                                        </div>
                                    )}
                                    <p className="text-[11px] text-white/80 font-medium leading-relaxed mt-1 line-clamp-2">
                                        {form.subtitle || "احصل على حسابك الأصلي المضمون فوراً بأسعار توفيرية وسرعة تسليم خيالية."}
                                    </p>
                                </div>
                            </div>

                            {form.bonusGift && (
                                <div className="p-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-[11px] font-black text-amber-300 flex items-center gap-1.5">
                                    <Gift className="w-3.5 h-3.5" />
                                    <span>{form.bonusGift}</span>
                                </div>
                            )}

                            {/* Features badges */}
                            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold text-white/90">
                                <div className="flex items-center gap-1 bg-white/10 p-2 rounded-lg">
                                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>ضمان ذهبي شامل 🛡️</span>
                                </div>
                                <div className="flex items-center gap-1 bg-white/10 p-2 rounded-lg">
                                    <Zap className="w-3.5 h-3.5 text-amber-400" />
                                    <span>تسليم وتفعيل فوري ⚡</span>
                                </div>
                            </div>
                        </div>

                        {/* Banner Footer Price & Action */}
                        <div className="pt-3 border-t border-white/15 flex items-center justify-between gap-3 relative z-10">
                            <div>
                                <div className="text-[10px] text-white/70 font-bold">سعر PS5 الحالي:</div>
                                <div className="text-2xl font-black text-emerald-400">
                                    ${form.price5 || 38.5}
                                </div>
                            </div>

                            <button type="button" className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 font-black text-xs shadow-lg hover:bg-emerald-400 transition cursor-pointer">
                                {form.ctaLabel || "شراء الآن ⚡"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
