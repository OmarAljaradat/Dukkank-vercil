import { useMemo, useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Search, X, SlidersHorizontal, Gamepad2, ChevronDown, RefreshCw, Filter, Instagram, Sparkles } from "lucide-react";
import { GameCard } from "./GameCard";

const PAGE_SIZE = 12;

const MOOD_OPTIONS = [
    { value: "all", label: "🔥 الكل", keywords: [] },
    { value: "action", label: "⚔️ أكشن وشوتر", keywords: ["call of duty", "cod", "warfare", "black ops", "shooter", "action", "battlefield", "ghost"] },
    { value: "sports", label: "⚽ كورة ورياضة", keywords: ["fifa", "fc", "sports", "football", "soccer", "ea sports"] },
    { value: "racing", label: "🏎️ سباق وسيارات", keywords: ["need for speed", "nfs", "racing", "cars", "drive", "heat"] },
    { value: "stealth", label: "🕵️ غموض وتسلل", keywords: ["hitman", "stealth", "assassin", "agent 47", "horror", "resident evil"] },
    { value: "openworld", label: "🤠 عالم مفتوح", keywords: ["red dead", "gta", "open world", "rdr", "rdr2", "cowboy", "witcher", "cyberpunk"] },
    { value: "party", label: "🎉 ضحك وجماعي", keywords: ["gang beasts", "party", "multiplayer", "fun", "friends", "overcooked"] },
];

const BUDGET_OPTIONS = [
    { value: "all", label: "السعر" },
    { value: "low", label: "💸 أقل من 15$" },
    { value: "mid", label: "💰 15$ - 30$" },
    { value: "high", label: "👑 أكثر من 30$" },
];

const SORT_OPTIONS = [
    { value: "default",        label: "الترتيب" },
    { value: "price-asc",      label: "السعر: الأقل أولاً" },
    { value: "price-desc",     label: "السعر: الأعلى أولاً" },
    { value: "name-asc",       label: "الاسم: أبجدي" },
    { value: "available-first",label: "المتوفر أولاً" },
];

const PLATFORM_OPTIONS = [
    { value: "all",  label: "الأجهزة" },
    { value: "five", label: "PS5 فقط" },
    { value: "four", label: "PS4 فقط" },
];

const lowestPrice = (g) => {
    const prices = ["five", "four"].map((t) => g[t]).filter((v) => v != null);
    return prices.length ? Math.min(...prices) : Infinity;
};

function normalizeText(text) {
    if (!text) return "";
    return String(text)
        .toLowerCase()
        .replace(/[أإآ]/g, "ا")
        .replace(/ة/g, "ه")
        .replace(/ى/g, "ي")
        .replace(/[\u064B-\u0652]/g, "")
        .replace(/^(ال)/, "")
        .trim();
}

function matchSmartSearch(game, query) {
    if (!query) return true;
    const normQuery = normalizeText(query);
    if (!normQuery) return true;

    const gameNameNorm = normalizeText(game.name);
    const gameSubNorm  = normalizeText(game.sub);

    if (gameNameNorm.includes(normQuery) || gameSubNorm.includes(normQuery)) return true;

    const queryTokens = normQuery.split(/\s+/).filter(Boolean);
    const fullBlob    = `${gameNameNorm} ${gameSubNorm} ${(game.tags || []).map(normalizeText).join(" ")}`;

    return queryTokens.every((token) => {
        if (fullBlob.includes(token)) return true;
        for (const mood of MOOD_OPTIONS) {
            const keywords = mood.keywords || [];
            const tokenMatchesCategory = keywords.some((k) => normalizeText(k).includes(token) || token.includes(normalizeText(k)));
            if (tokenMatchesCategory) {
                const gameMatchesCategory = keywords.some((k) => fullBlob.includes(normalizeText(k)));
                if (gameMatchesCategory) return true;
            }
        }
        return false;
    });
}

export const GamesGrid = ({ games, isCatalogPage = false }) => {
    const [query, setQuery]       = useState("");
    const [platform, setPlatform] = useState("all");
    const [sort, setSort]         = useState("default");
    const [mood, setMood]         = useState("all");
    const [budget, setBudget]     = useState("all");

    const filtered = useMemo(() => {
        let list = (games || []).filter((g) => {
            if (g.visible === false || g.hidden === true) return false;
            if (!matchSmartSearch(g, query)) return false;
            if (platform === "five" && g.five == null) return false;
            if (platform === "four" && g.four == null) return false;

            // Mood filter
            if (mood !== "all") {
                const moodObj = MOOD_OPTIONS.find((m) => m.value === mood);
                if (moodObj && moodObj.keywords.length > 0) {
                    const blob = `${g.name || ""} ${g.sub || ""} ${(g.tags || []).join(" ")}`.toLowerCase();
                    const matchesMood = moodObj.keywords.some((k) => blob.includes(k.toLowerCase()));
                    if (!matchesMood) return false;
                }
            }

            // Budget filter
            const price = g.five != null ? g.five : (g.four != null ? g.four : 0);
            if (budget === "low" && price >= 15) return false;
            if (budget === "mid" && (price < 15 || price > 30)) return false;
            if (budget === "high" && price <= 30) return false;

            return true;
        });

        if (sort === "price-asc")        list = [...list].sort((a, b) => lowestPrice(a) - lowestPrice(b));
        else if (sort === "price-desc")  list = [...list].sort((a, b) => lowestPrice(b) - lowestPrice(a));
        else if (sort === "name-asc")    list = [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        else if (sort === "available-first") list = [...list].sort((a, b) => (a.available === false ? 1 : 0) - (b.available === false ? 1 : 0));

        return list;
    }, [games, query, platform, sort, mood, budget]);

    const [isExpanded, setIsExpanded] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const GAMES_PER_PAGE = 9;
    const totalPages = Math.ceil(filtered.length / GAMES_PER_PAGE);

    useEffect(() => {
        setCurrentPage(1);
    }, [query, platform, sort, mood, budget]);

    const visible = isCatalogPage
        ? filtered.slice((currentPage - 1) * GAMES_PER_PAGE, currentPage * GAMES_PER_PAGE)
        : (isExpanded ? filtered : filtered.slice(0, 6));

    const activeFiltersCount =
        (query ? 1 : 0) +
        (platform !== "all" ? 1 : 0) +
        (sort !== "default" ? 1 : 0) +
        (mood !== "all" ? 1 : 0) +
        (budget !== "all" ? 1 : 0);

    const clearAll = () => {
        setQuery("");
        setPlatform("all");
        setSort("default");
        setMood("all");
        setBudget("all");
    };

    return (
        <div data-testid="games-grid-wrapper" className="space-y-6">
            
            {/* ── Lightweight Minimal Filter Toolbar ── */}
            <div className="space-y-4">
                
                {/* 1. Centered Sleek Category Pills */}
                <div className="flex items-center justify-center flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none no-scrollbar w-full">
                    {MOOD_OPTIONS.map((m) => (
                        <button
                            key={m.value}
                            onClick={() => setMood(m.value)}
                            className={`px-4 h-9 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 shrink-0 border ${
                                mood === m.value
                                    ? "bg-[hsl(var(--brand-blue-deep))] text-white border-[hsl(var(--brand-blue-deep))] shadow-sm"
                                    : "bg-white/80 dark:bg-white/5 text-[hsl(var(--brand-ink))]/80 border-[hsl(var(--brand-ink))]/10 hover:border-[hsl(var(--brand-blue-deep))]/40"
                            }`}
                        >
                            <span>{m.label}</span>
                        </button>
                    ))}
                </div>

                {/* 2. Search + Compact Custom Select Badges */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                    
                    {/* Search Field */}
                    <div className="relative flex-1 w-full">
                        <Search className="absolute top-1/2 -translate-y-1/2 right-3.5 w-4 h-4 text-[hsl(var(--brand-ink))]/40 pointer-events-none" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="ابحث عن لعبة…"
                            data-testid="games-search-input"
                            className="w-full h-11 pr-10 pl-10 rounded-2xl bg-white dark:bg-white/5 border border-[hsl(var(--brand-ink))]/15 text-xs font-bold text-[hsl(var(--brand-ink))] placeholder:text-[hsl(var(--brand-ink))]/40 focus:border-[hsl(var(--brand-blue-deep))] focus:outline-none transition-colors shadow-xs"
                        />
                        {query && (
                            <button onClick={() => setQuery("")} className="absolute top-1/2 -translate-y-1/2 left-3 inline-flex items-center justify-center w-6 h-6 rounded-full hover:bg-[hsl(var(--brand-ink))]/10 text-[hsl(var(--brand-ink))]/50">
                                <X className="w-3.5 h-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Compact Custom Styled Filter Select Dropdowns */}
                    <div className="flex items-center gap-2.5 w-full sm:w-auto shrink-0">
                        
                        {/* Device Select */}
                        <div className="relative flex-1 sm:flex-initial">
                            <select
                                value={platform}
                                onChange={(e) => setPlatform(e.target.value)}
                                className="h-10 sm:h-11 appearance-none pr-2.5 pl-6 sm:pr-3.5 sm:pl-8 rounded-2xl bg-white dark:bg-white/5 border border-[hsl(var(--brand-ink))]/15 text-[11px] sm:text-xs font-black text-[hsl(var(--brand-ink))] outline-none cursor-pointer hover:border-[hsl(var(--brand-blue-deep))]/40 transition-colors shadow-xs w-full"
                            >
                                {PLATFORM_OPTIONS.map((p) => (
                                    <option key={p.value} value={p.value} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                                        🎮 {p.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--brand-ink))]/50 pointer-events-none" />
                        </div>

                        {/* Budget Select */}
                        <div className="relative flex-1 sm:flex-initial">
                            <select
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                className="h-10 sm:h-11 appearance-none pr-2.5 pl-6 sm:pr-3.5 sm:pl-8 rounded-2xl bg-white dark:bg-white/5 border border-[hsl(var(--brand-ink))]/15 text-[11px] sm:text-xs font-black text-[hsl(var(--brand-ink))] outline-none cursor-pointer hover:border-[hsl(var(--brand-blue-deep))]/40 transition-colors shadow-xs w-full"
                            >
                                {BUDGET_OPTIONS.map((b) => (
                                    <option key={b.value} value={b.value} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                                        💰 {b.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--brand-ink))]/50 pointer-events-none" />
                        </div>

                        {/* Sort Select */}
                        <div className="relative flex-1 sm:flex-initial">
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value)}
                                className="h-10 sm:h-11 appearance-none pr-2.5 pl-6 sm:pr-3.5 sm:pl-8 rounded-2xl bg-white dark:bg-white/5 border border-[hsl(var(--brand-ink))]/15 text-[11px] sm:text-xs font-black text-[hsl(var(--brand-ink))] outline-none cursor-pointer hover:border-[hsl(var(--brand-blue-deep))]/40 transition-colors shadow-xs w-full"
                            >
                                {SORT_OPTIONS.map((s) => (
                                    <option key={s.value} value={s.value} className="bg-white dark:bg-slate-900 text-black dark:text-white">
                                        🔃 {s.label}
                                    </option>
                                ))}
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(var(--brand-ink))]/50 pointer-events-none" />
                        </div>

                    </div>

                </div>

                {/* Status Bar */}
                {activeFiltersCount > 0 && (
                    <div className="flex items-center justify-between text-xs font-extrabold px-1 pt-1">
                        <div className="text-[hsl(var(--brand-ink))]/70 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span>عرض {filtered.length} لعبة متوفرة</span>
                        </div>
                        <button
                            onClick={clearAll}
                            className="text-[hsl(var(--brand-red))] hover:underline flex items-center gap-1 font-bold text-xs"
                        >
                            <RefreshCw className="w-3 h-3" />
                            <span>مسح الفلاتر ✕</span>
                        </button>
                    </div>
                )}

            </div>

            {/* ── Games Cards Grid ── */}
            {allGames.length === 0 ? (
                <div className="rounded-3xl bg-white dark:bg-white/[0.04] p-8 sm:p-14 text-center border border-[hsl(var(--brand-ink))]/10 shadow-xs space-y-4 max-w-2xl mx-auto">
                    <div className="w-16 h-16 rounded-3xl bg-[hsl(var(--brand-blue-deep))]/10 text-[hsl(var(--brand-blue-deep))] flex items-center justify-center mx-auto shadow-inner">
                        <Gamepad2 className="w-8 h-8" />
                    </div>
                    <div className="space-y-1.5">
                        <h3 className="font-black text-lg sm:text-xl text-[hsl(var(--brand-ink))]">
                            جاري تحديث وتجهيز قائمة الألعاب المتوفرة حالياً 🎮
                        </h3>
                        <p className="text-xs sm:text-sm text-[hsl(var(--brand-ink))]/70 font-medium leading-relaxed">
                            نقوم حالياً بتحديث المخزون وإضافة الألعاب المتوفرة للتسليم الفوري بأفضل الأسعار. إذا كنت تبحث عن لعبة معينة الآن، يمكنك طلبها مباشرة وسنوفرها لك فوراً!
                        </p>
                    </div>

                    <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                        <a
                            href="https://ig.me/m/dukkank15"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-2 rounded-full px-6 h-12 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                        >
                            <Instagram className="w-4 h-4" />
                            <span>طلب أي لعبة مخصصة عبر إنستجرام 💬</span>
                        </a>
                    </div>
                </div>
            ) : filtered.length === 0 ? (
                <div className="rounded-3xl bg-white dark:bg-white/[0.04] p-12 text-center border border-[hsl(var(--brand-ink))]/10 space-y-3">
                    <Gamepad2 className="w-12 h-12 text-[hsl(var(--brand-ink))]/30 mx-auto" />
                    <p className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">لم يتم العثور على ألعاب بهذه الفلاتر</p>
                    <button onClick={clearAll} className="text-xs text-[hsl(var(--brand-blue-deep))] font-extrabold underline cursor-pointer">
                        إعادة عرض جميع الألعاب ↺
                    </button>
                </div>
            ) : (
                <div data-testid="games-cards-grid" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 stagger">
                    {visible.map((g) => (
                        <GameCard key={g.id} game={g} />
                    ))}
                </div>
            )}

            {/* Catalog Page Pagination with Clickable Page Numbers */}
            {isCatalogPage && totalPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-8 flex-wrap">
                    {/* Previous Button */}
                    <button
                        onClick={() => {
                            setCurrentPage((p) => Math.max(p - 1, 1));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === 1}
                        className="px-4 h-10 rounded-xl bg-white dark:bg-white/10 border border-[hsl(var(--brand-ink))]/15 text-xs font-bold text-[hsl(var(--brand-ink))] disabled:opacity-40 hover:bg-[hsl(var(--brand-ink))]/5 transition-colors"
                    >
                        السابق
                    </button>

                    {/* Page Number Buttons */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                        <button
                            key={pageNum}
                            onClick={() => {
                                setCurrentPage(pageNum);
                                window.scrollTo({ top: 0, behavior: "smooth" });
                            }}
                            className={`w-10 h-10 rounded-xl text-xs font-extrabold transition-all ${
                                currentPage === pageNum
                                    ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow-sm scale-105"
                                    : "bg-white dark:bg-white/10 text-[hsl(var(--brand-ink))]/80 border border-[hsl(var(--brand-ink))]/15 hover:border-[hsl(var(--brand-blue-deep))]"
                            }`}
                        >
                            {pageNum}
                        </button>
                    ))}

                    {/* Next Button */}
                    <button
                        onClick={() => {
                            setCurrentPage((p) => Math.min(p + 1, totalPages));
                            window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        disabled={currentPage === totalPages}
                        className="px-4 h-10 rounded-xl bg-white dark:bg-white/10 border border-[hsl(var(--brand-ink))]/15 text-xs font-bold text-[hsl(var(--brand-ink))] disabled:opacity-40 hover:bg-[hsl(var(--brand-ink))]/5 transition-colors"
                    >
                        التالي
                    </button>
                </div>
            )}

            {/* Homepage Navigate to /games Catalog Button */}
            {!isCatalogPage && (
                <div className="text-center pt-4">
                    <Link
                        to="/games"
                        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                        className="inline-flex items-center justify-center px-8 h-12 rounded-2xl bg-[hsl(var(--brand-blue-deep))] text-white text-xs sm:text-sm font-extrabold shadow-md hover:shadow-lg transition-all active:scale-95 gap-2"
                    >
                        <span>🎮 تصفح جميع الألعاب والمكتبة الكاملة ({games?.length || 22} لعبة)</span>
                    </Link>
                </div>
            )}

        </div>
    );
};
