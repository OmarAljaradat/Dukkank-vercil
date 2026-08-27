import { useState, useEffect, useRef } from "react";
import { useStoreData } from "../contexts/DataContext";
import { ShoppingCart, MessageCircle, Star, Shield, Zap, Clock, Flame, Gift, Trophy, Activity } from "lucide-react";
import { quickInquiry } from "../lib/whatsapp";

/* ─────────────────────────────────────────────────────
   Live countdown hook
   ───────────────────────────────────────────────────── */
function useCountdown(targetDateStr) {
    const calc = () => {
        if (!targetDateStr) return null;
        const target = new Date(targetDateStr).getTime();
        const now = Date.now();
        const diff = target - now;
        if (diff <= 0) return { released: true, days: 0, hours: 0, minutes: 0, seconds: 0 };
        return {
            released: false,
            days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
            hours:   Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((diff % (1000 * 60)) / 1000),
        };
    };
    const [state, setState] = useState(calc);
    useEffect(() => {
        if (!targetDateStr) return;
        setState(calc());
        const id = setInterval(() => setState(calc()), 1000);
        return () => clearInterval(id);
    }, [targetDateStr]);
    return state;
}

/* ─────────────────────────────────────────────────────
   Countdown Box — FC 27 mint green style
   ───────────────────────────────────────────────────── */
function CountdownBox({ value, label }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums overflow-hidden"
                style={{
                    background: "rgba(0,0,0,0.4)",
                    border: "1px solid rgba(0,230,118,0.3)",
                    color: "#00e676",
                    boxShadow: "0 0 20px rgba(0,230,118,0.1) inset, 0 8px 30px rgba(0,0,0,0.3)",
                    backdropFilter: "blur(10px)",
                }}
            >
                <span style={{ textShadow: "0 0 15px rgba(0,230,118,0.5)" }}>
                    {String(value).padStart(2, "0")}
                </span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase" style={{ color: "rgba(0,0,0,0.5)" }}>{label}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────
   CSS Animations — EA FC 27 Style
   ───────────────────────────────────────────────────── */
const EAFC_STYLES = `
@keyframes eafc-bg-slow {
    0% { transform: scale(1); }
    100% { transform: scale(1.06); }
}
@keyframes eafc-glow {
    0%, 100% { opacity: 0.7; }
    50% { opacity: 1; }
}
@keyframes eafc-fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}
@keyframes eafc-shimmer {
    0% { background-position: 200% 50%; }
    100% { background-position: -200% 50%; }
}
@keyframes eafc-float {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-8px); }
}
@keyframes eafc-diagonal-slide {
    0% { transform: translateX(-100%) rotate(-25deg); }
    100% { transform: translateX(200%) rotate(-25deg); }
}
`;

/* ─────────────────────────────────────────────────────
   MAIN EA FC 27 SECTION
   ───────────────────────────────────────────────────── */
export function EAFCSection() {
    const { launchAnnouncement, store, waTemplates } = useStoreData();
    const la = launchAnnouncement || {};
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState("five");

    const countdown = useCountdown(la.launchDate || la.countdownTarget || null);

    useEffect(() => {
        if (!sectionRef.current) return;
        const observer = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
            { threshold: 0.15 }
        );
        observer.observe(sectionRef.current);
        return () => observer.disconnect();
    }, []);

    if (!la.enabled) return null;

    const hasPricePS4 = la.price4 != null && la.price4 !== "" && Number(la.price4) > 0;
    const hasPricePS5 = la.price5 != null && la.price5 !== "" && Number(la.price5) > 0;
    const currency = la.currency || "$";
    const price = selectedPlatform === "five" ? la.price5 : la.price4;

    function handleBuy() {
        const href = la.ctaHref || "#games";
        if (href.startsWith("http") || href.startsWith("wa.me") || href.startsWith("https")) {
            window.open(href, "_blank");
        } else if (href.startsWith("#")) {
            const el = document.querySelector(href);
            if (el) el.scrollIntoView({ behavior: "smooth" });
        } else {
            window.location.href = href;
        }
    }

    function handleWhatsApp() {
        quickInquiry(la.gameName || "EA FC 27", store, waTemplates);
    }

    const imageUrl = la.imageUrl || la.image || "";

    return (
        <>
            <style>{EAFC_STYLES}</style>
            <section
                ref={sectionRef}
                id="gamelaunch"
                data-testid="gamelaunch-section"
                className="relative overflow-hidden"
                style={{
                    background: "linear-gradient(135deg, #e8fff0 0%, #80ffb4 20%, #2bda7e 45%, #00c853 65%, #009e42 100%)",
                    minHeight: "700px",
                }}
                dir="rtl"
            >
                {/* ── Full-Bleed FC 27 Background Image ── */}
                <div className="absolute inset-0 z-0 overflow-hidden">
                    <img
                        loading="lazy"
                        src="/eafc-bg.jpg"
                        alt=""
                        className="w-full h-full object-cover"
                        style={{
                            opacity: 0.6,
                            mixBlendMode: "overlay",
                            animation: "eafc-bg-slow 30s ease-in-out infinite alternate",
                        }}
                    />
                </div>

                {/* ── Diagonal Light Streaks (FC 27 signature style) ── */}
                <div className="absolute inset-0 z-[1] pointer-events-none overflow-hidden">
                    {/* Main diagonal cut */}
                    <div style={{
                        position: "absolute",
                        top: "-20%", right: "-10%",
                        width: "60%", height: "150%",
                        background: "linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
                        transform: "rotate(-15deg)",
                    }} />
                    {/* Thin accent line */}
                    <div style={{
                        position: "absolute",
                        top: "-10%", right: "15%",
                        width: "3px", height: "130%",
                        background: "linear-gradient(180deg, transparent, rgba(255,255,255,0.15), transparent)",
                        transform: "rotate(-25deg)",
                    }} />
                    <div style={{
                        position: "absolute",
                        top: "-10%", right: "25%",
                        width: "1px", height: "130%",
                        background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.1), transparent)",
                        transform: "rotate(-25deg)",
                    }} />
                </div>

                {/* ── Light Glow from top-left ── */}
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: "radial-gradient(ellipse at 10% 10%, rgba(255,255,255,0.3) 0%, transparent 50%)",
                }} />

                {/* ── Bottom fade to dark ── */}
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: "linear-gradient(180deg, transparent 60%, rgba(0,40,20,0.4) 100%)",
                }} />

                {/* ── MAIN CONTENT ── */}
                <div className="relative z-[10] max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
                    <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16 items-center">

                        {/* ── LEFT: Content ── */}
                        <div
                            className="order-2 lg:order-1"
                            style={{ animation: isVisible ? "eafc-fade-up 0.8s ease-out both" : "none" }}
                        >
                            {/* EA SPORTS FC Badge */}
                            <div className="flex items-center gap-3 mb-5 flex-wrap">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black tracking-[0.3em] uppercase"
                                    style={{
                                        background: "rgba(0,0,0,0.15)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                        color: "rgba(0,0,0,0.75)",
                                    }}>
                                    <Trophy className="w-3.5 h-3.5" />
                                    EA SPORTS™ FC 27
                                </div>
                                {la.badge && (
                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black"
                                        style={{
                                            background: "rgba(0,0,0,0.12)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(0,0,0,0.08)",
                                            color: "rgba(0,0,0,0.7)",
                                        }}>
                                        <Activity className="w-3.5 h-3.5" />
                                        {la.badge}
                                    </div>
                                )}
                            </div>

                            {/* ── Logo & Title ── */}
                            <div className="mb-6">
                                {(!la.gameName || la.gameName.toLowerCase().includes("ea sports") || la.gameName.toLowerCase().includes("fc")) ? (
                                    <img
                                        src="/eafc-logo-clean.png"
                                        alt="EA SPORTS FC 27"
                                        className="h-24 sm:h-32 md:h-40 object-contain mb-3"
                                        style={{
                                            filter: "drop-shadow(0 4px 20px rgba(0,0,0,0.2))",
                                            animation: "eafc-float 6s ease-in-out infinite",
                                        }}
                                    />
                                ) : (
                                    <div className="mb-3">
                                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-slate-950">
                                            {la.gameName}
                                        </h2>
                                    </div>
                                )}
                                <h2 className="sr-only">{la.gameName || "EA SPORTS FC 27"}</h2>

                                {/* Divider */}
                                <div className="flex items-center gap-4 mt-2">
                                    <div className="h-[2px] flex-shrink-0 w-16"
                                        style={{ background: "linear-gradient(90deg, rgba(0,0,0,0.4), transparent)" }} />
                                    <span className="text-[10px] font-black tracking-[0.5em] uppercase flex-shrink-0"
                                        style={{ color: "rgba(0,0,0,0.45)" }}>
                                        {la.gameName ? `${la.gameName} • الموسم الجديد` : "ULTIMATE TEAM • الموسم الجديد"}
                                    </span>
                                    <div className="h-[2px] flex-1"
                                        style={{ background: "linear-gradient(270deg, rgba(0,0,0,0.3), transparent)" }} />
                                </div>
                            </div>

                            {/* Description */}
                            {(la.description || la.subtitle) && (
                                <p className="text-sm sm:text-[15px] leading-relaxed max-w-xl mb-6 font-semibold"
                                    style={{ color: "rgba(0,30,15,0.7)" }}
                                >
                                    {la.description || la.subtitle}
                                </p>
                            )}

                            {/* ── Countdown ── */}
                            {countdown && !countdown.released && (
                                <div className="mb-8"
                                    style={{ animation: isVisible ? "eafc-fade-up 0.8s ease-out 0.2s both" : "none" }}
                                >
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4" style={{ color: "rgba(0,0,0,0.6)" }} />
                                        <span className="text-xs font-black tracking-[0.2em] uppercase"
                                            style={{ color: "rgba(0,0,0,0.5)" }}>
                                            ركلة البداية خلال
                                        </span>
                                    </div>
                                    <div className="flex gap-3 rtl:flex-row">
                                        <CountdownBox value={countdown.days}    label="يوم" />
                                        <CountdownBox value={countdown.hours}   label="ساعة" />
                                        <CountdownBox value={countdown.minutes} label="دقيقة" />
                                        <CountdownBox value={countdown.seconds} label="ثانية" />
                                    </div>
                                </div>
                            )}



                            {la.bonusGift && (
                                <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-black"
                                    style={{
                                        background: "rgba(0,0,0,0.1)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(0,0,0,0.08)",
                                        color: "rgba(0,0,0,0.7)",
                                    }}
                                >
                                    <Gift className="w-5 h-5 shrink-0" />
                                    <span>{la.bonusGift}</span>
                                </div>
                            )}

                            {/* ── Feature Badges ── */}
                            <div className="flex flex-wrap gap-2.5 mb-8"
                                style={{ animation: isVisible ? "eafc-fade-up 0.8s ease-out 0.4s both" : "none" }}
                            >
                                {[
                                    { icon: Zap,    label: "تسليم فوري ⚡",       color: "#004d25" },
                                    { icon: Shield, label: "ضمان ذهبي كامل 🛡️", color: "#004d25" },
                                    { icon: Star,   label: "حساب Primary 🎮",    color: "#004d25" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <span key={label}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                                        style={{
                                            background: "rgba(255,255,255,0.25)",
                                            backdropFilter: "blur(10px)",
                                            border: "1px solid rgba(255,255,255,0.3)",
                                            color: "rgba(0,30,15,0.75)",
                                        }}
                                    >
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        {label}
                                    </span>
                                ))}
                            </div>

                            {/* ── CTA Buttons ── */}
                            <div className="flex flex-wrap gap-3"
                                style={{ animation: isVisible ? "eafc-fade-up 0.8s ease-out 0.6s both" : "none" }}
                            >
                                <button
                                    onClick={handleBuy}
                                    className="relative inline-flex items-center gap-2.5 h-14 px-8 rounded-2xl font-black text-sm transition-all active:scale-95 overflow-hidden group"
                                    style={{
                                        background: "linear-gradient(135deg, #111, #222)",
                                        color: "#00e676",
                                        boxShadow: "0 6px 30px rgba(0,0,0,0.3), 0 0 0 1px rgba(0,230,118,0.15) inset",
                                    }}
                                >
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        style={{
                                            background: "linear-gradient(110deg, transparent 25%, rgba(0,230,118,0.1) 50%, transparent 75%)",
                                            backgroundSize: "200% 100%",
                                            animation: "eafc-shimmer 1.5s ease infinite",
                                        }}
                                    />
                                    <ShoppingCart className="w-4.5 h-4.5 relative z-10" />
                                    <span className="relative z-10">{la.ctaLabel || "احصل على نسختك الآن ⚡"}</span>
                                </button>

                                <button
                                    onClick={handleWhatsApp}
                                    className="inline-flex items-center gap-2 h-14 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95"
                                    style={{
                                        background: "rgba(0,0,0,0.12)",
                                        backdropFilter: "blur(10px)",
                                        border: "1px solid rgba(0,0,0,0.1)",
                                        color: "rgba(0,30,15,0.8)",
                                    }}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    تواصل على واتساب
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT: Visual & Purchase Card ── */}
                        <div
                            className="order-1 lg:order-2 flex flex-col items-center gap-6"
                            style={{ animation: isVisible ? "eafc-fade-up 0.8s ease-out 0.2s both" : "none" }}
                        >
                            {imageUrl ? (
                                <div className="relative w-full max-w-[380px] mx-auto group">
                                    <div className="absolute -inset-3 rounded-3xl"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(0,230,118,0.3), rgba(0,200,83,0.15))",
                                            filter: "blur(25px)", opacity: 0.8,
                                        }}
                                    />
                                    <img
                                        src={imageUrl}
                                        alt={la.gameName || "EA FC 27"}
                                        className="relative z-10 w-full rounded-3xl object-cover shadow-2xl transition-transform duration-700 group-hover:scale-[1.03]"
                                        style={{ border: "2px solid rgba(0,0,0,0.1)" }}
                                    />
                                </div>
                            ) : (
                                <div className="relative flex items-center justify-center w-full max-w-[380px] aspect-square mx-auto">
                                    <div className="absolute inset-0 rounded-full pointer-events-none"
                                        style={{
                                            background: "radial-gradient(circle, rgba(0,0,0,0.08) 0%, transparent 60%)",
                                            filter: "blur(30px)",
                                        }}
                                    />
                                    <img
                                        src="/eafc-logo-clean.png"
                                        alt="EA FC 27 Logo"
                                        className="relative z-10 w-4/5 h-4/5 object-contain"
                                        style={{
                                            filter: "drop-shadow(0 8px 30px rgba(0,0,0,0.25))",
                                            animation: "eafc-float 6s ease-in-out infinite",
                                        }}
                                    />
                                </div>
                            )}

                            {/* ── Purchase Card (Dark glass on green) ── */}
                            {(hasPricePS4 || hasPricePS5) && (
                                <div className="w-full max-w-[380px] rounded-3xl p-5 space-y-4"
                                    style={{
                                        background: "rgba(0,0,0,0.65)",
                                        backdropFilter: "blur(25px)",
                                        border: "1px solid rgba(0,230,118,0.15)",
                                        boxShadow: "0 24px 60px rgba(0,0,0,0.4)",
                                    }}
                                >
                                    <div className="text-xs font-black text-center tracking-widest uppercase"
                                        style={{ color: "#00e676" }}>
                                        اختر نسخة جهازك:
                                    </div>

                                    <div className="space-y-2.5">
                                        {hasPricePS5 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPlatform("five")}
                                                className="w-full p-4 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between"
                                                style={{
                                                    background: selectedPlatform === "five" ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.04)",
                                                    border: selectedPlatform === "five" ? "2px solid rgba(0,230,118,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-white">PlayStation 5 🎮</div>
                                                    <div className="text-[11px] font-medium mt-0.5 text-slate-400">حساب أصلي Primary — تسليم فوري</div>
                                                </div>
                                                <div className="text-xl font-black" style={{ color: "#00e676" }}>
                                                    {currency}{Number(la.price5).toFixed(2)}
                                                </div>
                                            </button>
                                        )}
                                        {hasPricePS4 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPlatform("four")}
                                                className="w-full p-4 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between"
                                                style={{
                                                    background: selectedPlatform === "four" ? "rgba(0,230,118,0.12)" : "rgba(255,255,255,0.04)",
                                                    border: selectedPlatform === "four" ? "2px solid rgba(0,230,118,0.5)" : "1px solid rgba(255,255,255,0.08)",
                                                }}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-white">PlayStation 4 🎮</div>
                                                    <div className="text-[11px] font-medium mt-0.5 text-slate-400">حساب أصلي Primary — تسليم فوري</div>
                                                </div>
                                                <div className="text-xl font-black" style={{ color: "#00e676" }}>
                                                    {currency}{Number(la.price4).toFixed(2)}
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    <div className="pt-3 flex items-center justify-between gap-3"
                                        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
                                    >
                                        <div>
                                            <div className="text-[10px] font-bold uppercase text-slate-500">السعر النهائي:</div>
                                            <div className="text-2xl font-black" style={{ color: "#00e676" }}>
                                                {currency}{price ? Number(price).toFixed(2) : "—"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleBuy}
                                            className="px-6 py-3 rounded-xl font-black text-xs transition-all active:scale-95"
                                            style={{
                                                background: "#00e676",
                                                color: "#001a0a",
                                                boxShadow: "0 4px 20px rgba(0,230,118,0.3)",
                                            }}
                                        >
                                            شراء الحين ⚡
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
