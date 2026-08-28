import { useState, useEffect, useRef } from "react";
import { useStoreData } from "../contexts/DataContext";
import { ShoppingCart, Instagram, Star, Shield, Zap, Clock, Flame, Gift, Award, ChevronDown } from "lucide-react";
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
        const days    = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours   = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        return { released: false, days, hours, minutes, seconds };
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
   Animated Countdown Box
   ───────────────────────────────────────────────────── */
function CountdownBox({ value, label }) {
    return (
        <div className="flex flex-col items-center gap-1.5">
            <div
                className="relative w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl flex items-center justify-center font-black text-2xl sm:text-3xl tabular-nums overflow-hidden"
                style={{
                    background: "linear-gradient(145deg, rgba(255,45,120,0.18) 0%, rgba(255,140,60,0.1) 100%)",
                    border: "1px solid rgba(255,45,120,0.35)",
                    color: "#ff6ea8",
                    boxShadow: "0 0 24px rgba(255,45,120,0.15) inset, 0 8px 32px rgba(0,0,0,0.3)",
                }}
            >
                {/* Glass reflection */}
                <div className="absolute top-0 left-0 right-0 h-1/2" style={{
                    background: "linear-gradient(180deg, rgba(255,255,255,0.08) 0%, transparent 100%)",
                    borderRadius: "16px 16px 0 0",
                }} />
                <span style={{ textShadow: "0 0 20px rgba(255,45,120,0.6)" }}>
                    {String(value).padStart(2, "0")}
                </span>
            </div>
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-white/40">{label}</span>
        </div>
    );
}

/* ─────────────────────────────────────────────────────
   Floating Particles Component
   ───────────────────────────────────────────────────── */
function FloatingParticles() {
    const particles = Array.from({ length: 25 }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        size: Math.random() * 3 + 1,
        delay: Math.random() * 8,
        duration: Math.random() * 6 + 8,
        color: i % 3 === 0 ? "#ff2d78" : i % 3 === 1 ? "#00e5ff" : "#ffd700",
        opacity: Math.random() * 0.4 + 0.1,
    }));

    return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
            {particles.map(p => (
                <div
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        left: p.left,
                        bottom: "-10px",
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        background: p.color,
                        opacity: p.opacity,
                        boxShadow: `0 0 ${p.size * 3}px ${p.color}`,
                        animation: `gtavi-float-up ${p.duration}s ${p.delay}s infinite ease-out`,
                    }}
                />
            ))}
        </div>
    );
}

/* ─────────────────────────────────────────────────────
   Palm Tree SVG Silhouette
   ───────────────────────────────────────────────────── */
function PalmTreeSilhouette({ side = "left", className = "" }) {
    const isLeft = side === "left";
    return (
        <svg
            viewBox="0 0 120 300"
            fill="none"
            className={`absolute bottom-0 ${isLeft ? "left-0 sm:left-4" : "right-0 sm:right-4"} h-[200px] sm:h-[280px] opacity-[0.06] pointer-events-none ${className}`}
            style={{ transform: isLeft ? "scaleX(1)" : "scaleX(-1)" }}
        >
            {/* Trunk */}
            <path d="M58 300 Q56 220 60 160 Q62 130 58 100" stroke="white" strokeWidth="6" fill="none" />
            {/* Fronds */}
            <path d="M58 100 Q30 60 5 70" stroke="white" strokeWidth="3" fill="none" />
            <path d="M58 100 Q20 40 10 25" stroke="white" strokeWidth="3" fill="none" />
            <path d="M58 100 Q50 30 65 10" stroke="white" strokeWidth="3" fill="none" />
            <path d="M58 100 Q80 40 110 25" stroke="white" strokeWidth="3" fill="none" />
            <path d="M58 100 Q90 60 115 70" stroke="white" strokeWidth="3" fill="none" />
            <path d="M58 100 Q70 50 100 45" stroke="white" strokeWidth="2.5" fill="none" />
            <path d="M58 100 Q40 50 20 45" stroke="white" strokeWidth="2.5" fill="none" />
        </svg>
    );
}

/* ─────────────────────────────────────────────────────
   Vice City Skyline
   ───────────────────────────────────────────────────── */
function ViceCitySkyline() {
    return (
        <div className="absolute bottom-0 left-0 right-0 h-[120px] sm:h-[160px] pointer-events-none opacity-[0.04]">
            <svg viewBox="0 0 1200 160" preserveAspectRatio="none" className="w-full h-full" fill="white">
                {/* Buildings silhouette */}
                <rect x="50" y="80" width="40" height="80" />
                <rect x="100" y="50" width="30" height="110" />
                <rect x="140" y="70" width="50" height="90" />
                <rect x="200" y="30" width="35" height="130" />
                <rect x="250" y="60" width="60" height="100" />
                <rect x="320" y="40" width="40" height="120" />
                <rect x="370" y="80" width="55" height="80" />
                <rect x="440" y="20" width="30" height="140" />
                <rect x="480" y="55" width="50" height="105" />
                <rect x="540" y="35" width="70" height="125" />
                <rect x="620" y="65" width="40" height="95" />
                <rect x="670" y="45" width="55" height="115" />
                <rect x="735" y="70" width="35" height="90" />
                <rect x="780" y="25" width="45" height="135" />
                <rect x="835" y="55" width="60" height="105" />
                <rect x="905" y="75" width="40" height="85" />
                <rect x="955" y="40" width="50" height="120" />
                <rect x="1015" y="60" width="35" height="100" />
                <rect x="1060" y="50" width="45" height="110" />
                <rect x="1115" y="70" width="40" height="90" />
            </svg>
        </div>
    );
}

/* ─────────────────────────────────────────────────────
   STYLE TAG — CSS Animations
   ───────────────────────────────────────────────────── */
const GTAVI_STYLES = `
@keyframes gtavi-float-up {
    0% { transform: translateY(0) scale(1); opacity: 0; }
    10% { opacity: 1; }
    90% { opacity: 0.5; }
    100% { transform: translateY(-600px) scale(0.3); opacity: 0; }
}

@keyframes gtavi-sunset-shift {
    0%, 100% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
}

@keyframes gtavi-neon-flicker {
    0%, 100% { opacity: 1; }
    5% { opacity: 0.8; }
    10% { opacity: 1; }
    15% { opacity: 0.6; }
    20% { opacity: 1; }
    50% { opacity: 1; }
    52% { opacity: 0.4; }
    54% { opacity: 1; }
}

@keyframes gtavi-glow-pulse {
    0%, 100% { filter: drop-shadow(0 0 20px rgba(255,45,120,0.4)) drop-shadow(0 0 40px rgba(255,45,120,0.2)); }
    50% { filter: drop-shadow(0 0 30px rgba(255,45,120,0.6)) drop-shadow(0 0 60px rgba(255,45,120,0.35)); }
}

@keyframes gtavi-slide-in-right {
    from { opacity: 0; transform: translateX(40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes gtavi-slide-in-left {
    from { opacity: 0; transform: translateX(-40px); }
    to { opacity: 1; transform: translateX(0); }
}

@keyframes gtavi-fade-up {
    from { opacity: 0; transform: translateY(30px); }
    to { opacity: 1; transform: translateY(0); }
}

@keyframes gtavi-scale-in {
    from { opacity: 0; transform: scale(0.85); }
    to { opacity: 1; transform: scale(1); }
}

@keyframes gtavi-badge-shimmer {
    0% { background-position: -200% center; }
    100% { background-position: 200% center; }
}

@keyframes gtavi-border-glow {
    0%, 100% { border-color: rgba(255,45,120,0.3); box-shadow: 0 0 20px rgba(255,45,120,0.1); }
    50% { border-color: rgba(255,45,120,0.6); box-shadow: 0 0 40px rgba(255,45,120,0.2); }
}

@keyframes gtavi-stock-pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
}

@keyframes gtavi-bg-zoom {
    0% { transform: scale(1); }
    100% { transform: scale(1.08); }
}
`;

/* ─────────────────────────────────────────────────────
   MAIN GTA VI SECTION COMPONENT
   ───────────────────────────────────────────────────── */
export function GTAVISection() {
    const { launchAnnouncement, store, waTemplates } = useStoreData();
    const la = launchAnnouncement || {};
    const sectionRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState("five");

    const countdown = useCountdown(la.launchDate || la.countdownTarget || null);

    // Intersection observer for entrance animations
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

    function handleInstagram() {
        window.open("https://ig.me/m/dukkank15", "_blank");
    }

    const imageUrl = la.imageUrl || la.image || "";

    return (
        <>
            <style>{GTAVI_STYLES}</style>
            <section
                ref={sectionRef}
                id="gamelaunch"
                data-testid="gamelaunch-section"
                className="relative overflow-hidden"
                style={{
                    background: "#0a0015",
                    minHeight: "700px",
                }}
                dir="rtl"
            >
                {/* ── Full-Bleed Vice City Background Image ── */}
                <div className="absolute inset-0 z-0">
                    <img
                        loading="lazy"
                        src="/gtavi-bg.jpg"
                        alt=""
                        className="w-full h-full object-cover object-center"
                        style={{
                            opacity: 0.45,
                            filter: "saturate(1.3) contrast(1.1)",
                            animation: "gtavi-bg-zoom 30s ease-in-out infinite alternate",
                        }}
                    />
                </div>

                {/* ── Cinematic Gradient Overlays on top of image ── */}
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: "linear-gradient(180deg, rgba(10,0,21,0.7) 0%, rgba(26,0,40,0.5) 30%, rgba(10,0,21,0.4) 60%, rgba(10,0,21,0.85) 100%)",
                }} />
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: "linear-gradient(90deg, rgba(10,0,21,0.8) 0%, transparent 30%, transparent 70%, rgba(10,0,21,0.8) 100%)",
                }} />

                {/* ── Animated Sunset Gradient Layer ── */}
                <div className="absolute inset-0 z-[1] pointer-events-none" style={{
                    background: "linear-gradient(180deg, rgba(255,100,50,0.08) 0%, rgba(255,45,120,0.06) 25%, transparent 55%)",
                }} />

                {/* ── Neon ambient blobs ── */}
                <div className="absolute inset-0 z-[2] pointer-events-none overflow-hidden">
                    <div style={{
                        position: "absolute", top: "-100px", right: "-80px",
                        width: "600px", height: "600px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,45,120,0.2) 0%, transparent 60%)",
                        filter: "blur(80px)",
                        animation: "gtavi-glow-pulse 4s ease-in-out infinite",
                    }} />
                    <div style={{
                        position: "absolute", bottom: "-100px", left: "-100px",
                        width: "550px", height: "550px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(0,200,255,0.16) 0%, transparent 60%)",
                        filter: "blur(80px)",
                        animation: "gtavi-glow-pulse 5s ease-in-out infinite 1s",
                    }} />
                    <div style={{
                        position: "absolute", top: "30%", left: "45%",
                        width: "400px", height: "400px", borderRadius: "50%",
                        background: "radial-gradient(circle, rgba(255,215,0,0.06) 0%, transparent 65%)",
                        filter: "blur(90px)",
                    }} />
                    {/* Vice City orange sunset glow */}
                    <div style={{
                        position: "absolute", top: "-50px", left: "20%",
                        width: "500px", height: "300px", borderRadius: "50%",
                        background: "radial-gradient(ellipse, rgba(255,140,60,0.1) 0%, transparent 70%)",
                        filter: "blur(60px)",
                    }} />
                </div>

                {/* ── Scanline texture ── */}
                <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,1) 2px, rgba(255,255,255,1) 3px)",
                    }}
                />

                {/* ── Neon grid lines ── */}
                <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.025]"
                    style={{
                        backgroundImage: "linear-gradient(rgba(255,45,120,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(0,229,255,0.4) 1px, transparent 1px)",
                        backgroundSize: "100px 100px",
                    }}
                />

                {/* ── Palm Trees ── */}
                <PalmTreeSilhouette side="left" />
                <PalmTreeSilhouette side="right" />

                {/* ── Vice City Skyline ── */}
                <ViceCitySkyline />

                {/* ── Floating particles ── */}
                <FloatingParticles />

                {/* ── MAIN CONTENT ── */}
                <div className="relative z-[10] max-w-7xl mx-auto px-5 sm:px-8 py-16 sm:py-24">
                    <div className="grid lg:grid-cols-[1fr_440px] gap-12 lg:gap-16 items-center">

                        {/* ── LEFT: Content ── */}
                        <div
                            className="order-2 lg:order-1"
                            style={{
                                animation: isVisible ? "gtavi-slide-in-right 0.8s ease-out forwards" : "none",
                                opacity: isVisible ? 1 : 0,
                            }}
                        >
                            {/* Rockstar Games badge */}
                            <div className="flex items-center gap-3 mb-5">
                                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-[11px] font-black tracking-[0.4em] uppercase"
                                    style={{
                                        background: "rgba(255,165,60,0.08)",
                                        border: "1px solid rgba(255,165,60,0.2)",
                                        color: "rgba(255,165,60,0.7)",
                                    }}>
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    ROCKSTAR GAMES
                                </div>
                                {la.badge && (
                                    <div className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-black"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,45,120,0.15), rgba(255,140,60,0.1))",
                                            border: "1px solid rgba(255,45,120,0.35)",
                                            color: "#ff6ea8",
                                            animation: "gtavi-neon-flicker 4s ease-in-out infinite",
                                        }}>
                                        <Flame className="w-3.5 h-3.5" />
                                        {la.badge}
                                    </div>
                                )}
                            </div>

                            {/* ── Giant Dynamic Game Title & Neon Presentation ── */}
                            <div className="mb-6">
                                {(!la.gameName || la.gameName.toLowerCase().includes("grand theft auto") || la.gameName.toLowerCase().includes("gta")) ? (
                                    <div className="mb-3">
                                        <img
                                            src="/gtavi-logo-clean.png"
                                            alt="Grand Theft Auto VI Logo"
                                            className="h-28 sm:h-36 md:h-44 object-contain filter drop-shadow-[0_0_30px_rgba(255,45,120,0.65)]"
                                            style={{ animation: "gtavi-glow-pulse 3s ease-in-out infinite" }}
                                        />
                                    </div>
                                ) : (
                                    <div className="mb-3 space-y-2">
                                        <h2 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight leading-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-amber-300 to-cyan-400 drop-shadow-[0_0_25px_rgba(255,45,120,0.5)]">
                                            {la.gameName}
                                        </h2>
                                    </div>
                                )}
                                <h2 className="font-black leading-[0.9] sr-only">
                                    {la.gameName || "Grand Theft Auto VI"}
                                </h2>

                                {/* Vice City divider line */}
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="h-[2px] flex-shrink-0 w-16"
                                        style={{ background: "linear-gradient(90deg, #ff2d78, rgba(255,45,120,0.2))" }} />
                                    <span className="text-xs font-black tracking-[0.4em] uppercase flex-shrink-0"
                                        style={{
                                            color: "#ff8c42",
                                            textShadow: "0 0 20px rgba(255,140,66,0.4)",
                                        }}>
                                        {la.gameName || "VICE CITY"}
                                    </span>
                                    <div className="h-[2px] flex-1"
                                        style={{ background: "linear-gradient(270deg, #00e5ff, rgba(0,229,255,0.1))" }} />
                                </div>
                            </div>

                            {/* Description */}
                            {(la.description || la.subtitle) && (
                                <p className="text-sm sm:text-[15px] leading-relaxed max-w-xl mb-6"
                                    style={{
                                        color: "rgba(255,255,255,0.6)",
                                        animation: isVisible ? "gtavi-fade-up 0.8s ease-out 0.2s both" : "none",
                                    }}>
                                    {la.description || la.subtitle}
                                </p>
                            )}

                            {/* ── Countdown ── */}
                            {countdown && !countdown.released && (
                                <div className="mb-8" style={{
                                    animation: isVisible ? "gtavi-fade-up 0.8s ease-out 0.3s both" : "none",
                                }}>
                                    <div className="flex items-center gap-2 mb-4">
                                        <Clock className="w-4 h-4" style={{ color: "rgba(255,200,80,0.8)" }} />
                                        <span className="text-xs font-black tracking-[0.3em] uppercase"
                                            style={{ color: "rgba(255,200,80,0.6)" }}>
                                            ينطلق خلال
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

                            {countdown?.released && (
                                <div className="mb-8 inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full font-black text-sm"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(0,229,255,0.12))",
                                        border: "1px solid rgba(255,45,120,0.3)",
                                        color: "#ff6ea8",
                                        animation: "gtavi-stock-pulse 2s ease-in-out infinite",
                                    }}>
                                    <span className="w-2.5 h-2.5 rounded-full bg-[#ff6ea8] animate-pulse inline-block"
                                        style={{ boxShadow: "0 0 8px #ff6ea8" }} />
                                    متاح الآن — احصل عليها قبل ما تنفذ 🎮
                                </div>
                            )}

                            {/* ── Stock alert ── */}
                            {la.stockLeft && Number(la.stockLeft) > 0 && (
                                <div className="mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black"
                                    style={{
                                        background: "rgba(255,30,30,0.12)",
                                        border: "1px solid rgba(255,30,30,0.3)",
                                        color: "#ff6b6b",
                                        animation: "gtavi-stock-pulse 1.5s ease-in-out infinite",
                                    }}>
                                    <Flame className="w-3.5 h-3.5" />
                                    ⚡ متبقي {la.stockLeft} حسابات فقط — الكمية محدودة!
                                </div>
                            )}

                            {/* ── Rating ── */}
                            {la.rating && (
                                <div className="mb-6 flex items-center gap-2 text-xs font-black"
                                    style={{ color: "rgba(255,215,0,0.8)" }}>
                                    <Award className="w-4 h-4" />
                                    <span>{la.rating}</span>
                                </div>
                            )}

                            {/* ── Bonus gift ── */}
                            {la.bonusGift && (
                                <div className="mb-6 p-4 rounded-2xl flex items-center gap-3 text-xs font-black"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,140,60,0.06))",
                                        border: "1px solid rgba(255,215,0,0.2)",
                                        color: "#ffd700",
                                        animation: isVisible ? "gtavi-fade-up 0.8s ease-out 0.4s both" : "none",
                                    }}>
                                    <Gift className="w-5 h-5 shrink-0" />
                                    <span>{la.bonusGift}</span>
                                </div>
                            )}

                            {/* ── Feature badges ── */}
                            <div className="flex flex-wrap gap-2.5 mb-8" style={{
                                animation: isVisible ? "gtavi-fade-up 0.8s ease-out 0.5s both" : "none",
                            }}>
                                {[
                                    { icon: Zap,    label: "تسليم فوري ⚡", color: "#ffd700" },
                                    { icon: Shield, label: "ضمان ذهبي 🛡️", color: "#4ade80" },
                                    { icon: Star,   label: "حساب أصلي Primary", color: "#60a5fa" },
                                ].map(({ icon: Icon, label, color }) => (
                                    <span key={label}
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold"
                                        style={{
                                            background: "rgba(255,255,255,0.05)",
                                            border: "1px solid rgba(255,255,255,0.08)",
                                            color: "rgba(255,255,255,0.7)",
                                            backdropFilter: "blur(8px)",
                                        }}>
                                        <Icon className="w-3.5 h-3.5" style={{ color }} />
                                        {label}
                                    </span>
                                ))}
                            </div>

                            {/* ── CTA Buttons ── */}
                            <div className="flex flex-wrap gap-3" style={{
                                animation: isVisible ? "gtavi-fade-up 0.8s ease-out 0.6s both" : "none",
                            }}>
                                <button
                                    onClick={handleBuy}
                                    className="relative inline-flex items-center gap-2.5 h-14 px-8 rounded-2xl font-black text-sm text-white transition-all active:scale-95 overflow-hidden group"
                                    style={{
                                        background: "linear-gradient(135deg, #ff2d78, #ff8c42)",
                                        boxShadow: "0 6px 30px rgba(255,45,120,0.4), 0 0 0 1px rgba(255,45,120,0.2) inset",
                                        letterSpacing: "0.03em",
                                    }}
                                    onMouseEnter={e => e.currentTarget.style.boxShadow = "0 8px 40px rgba(255,45,120,0.55), 0 0 0 1px rgba(255,45,120,0.3) inset"}
                                    onMouseLeave={e => e.currentTarget.style.boxShadow = "0 6px 30px rgba(255,45,120,0.4), 0 0 0 1px rgba(255,45,120,0.2) inset"}
                                >
                                    {/* Shimmer effect */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                                        style={{
                                            background: "linear-gradient(110deg, transparent 25%, rgba(255,255,255,0.15) 50%, transparent 75%)",
                                            backgroundSize: "200% 100%",
                                            animation: "gtavi-badge-shimmer 1.5s ease infinite",
                                        }} />
                                    <ShoppingCart className="w-4.5 h-4.5 relative z-10" />
                                    <span className="relative z-10">{la.ctaLabel || "اشتري الحين"}</span>
                                </button>

                                <button
                                    onClick={handleInstagram}
                                    className="inline-flex items-center gap-2 h-14 px-6 rounded-2xl font-bold text-sm transition-all active:scale-95 cursor-pointer"
                                    style={{
                                        background: "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))",
                                        border: "1px solid rgba(236, 72, 153, 0.3)",
                                        color: "#f472b6",
                                    }}
                                    onMouseEnter={e => {
                                        e.currentTarget.style.background = "rgba(236, 72, 153, 0.25)";
                                        e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.5)";
                                    }}
                                    onMouseLeave={e => {
                                        e.currentTarget.style.background = "linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(168, 85, 247, 0.15))";
                                        e.currentTarget.style.borderColor = "rgba(236, 72, 153, 0.3)";
                                    }}
                                >
                                    <Instagram className="w-4 h-4" />
                                    اسألنا على إنستجرام
                                </button>
                            </div>
                        </div>

                        {/* ── RIGHT: Visual & Purchase Card ── */}
                        <div
                            className="order-1 lg:order-2 flex flex-col items-center gap-6"
                            style={{
                                animation: isVisible ? "gtavi-slide-in-left 0.8s ease-out 0.2s forwards" : "none",
                                opacity: isVisible ? 1 : 0,
                            }}
                        >
                            {/* Game Cover Art */}
                            {imageUrl ? (
                                <div className="relative w-full max-w-[380px] mx-auto group">
                                    {/* Animated border glow */}
                                    <div className="absolute -inset-2 rounded-3xl"
                                        style={{
                                            background: "linear-gradient(135deg, rgba(255,45,120,0.4), rgba(0,229,255,0.3), rgba(255,215,0,0.2))",
                                            filter: "blur(25px)",
                                            transform: "scale(0.92) translateY(6px)",
                                            animation: "gtavi-glow-pulse 3s ease-in-out infinite",
                                        }}
                                    />
                                    <img
                                        src={imageUrl}
                                        alt={la.gameName || "GTA VI"}
                                        className="relative z-10 w-full rounded-3xl object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                                        style={{
                                            border: "2px solid rgba(255,45,120,0.25)",
                                            boxShadow: "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,45,120,0.1)",
                                            animation: "gtavi-border-glow 3s ease-in-out infinite",
                                        }}
                                    />
                                    {/* Neon corner accents */}
                                    <div className="absolute top-3 right-3 w-8 h-8 border-t-2 border-r-2 rounded-tr-xl z-20"
                                        style={{ borderColor: "rgba(255,45,120,0.5)" }} />
                                    <div className="absolute bottom-3 left-3 w-8 h-8 border-b-2 border-l-2 rounded-bl-xl z-20"
                                        style={{ borderColor: "rgba(0,229,255,0.5)" }} />
                                </div>
                            ) : (
                                /* Official GTA VI Logo Artwork presentation */
                                <div className="relative flex items-center justify-center w-full max-w-[380px] aspect-square mx-auto">
                                    <div className="absolute inset-0 rounded-full pointer-events-none"
                                        style={{
                                            background: "radial-gradient(circle, rgba(255,45,120,0.2) 0%, transparent 65%)",
                                            filter: "blur(30px)",
                                            animation: "gtavi-glow-pulse 3s ease-in-out infinite",
                                        }}
                                    />
                                    <img
                                        src="/gtavi-logo-clean.png"
                                        alt="GTA VI Official Logo"
                                        className="relative z-10 w-4/5 h-4/5 object-contain filter drop-shadow-[0_0_35px_rgba(255,45,120,0.6)]"
                                        style={{
                                            animation: "gtavi-glow-pulse 3s ease-in-out infinite",
                                        }}
                                    />
                                    <div className="absolute bottom-4 font-black text-xs tracking-[0.5em] uppercase pointer-events-none"
                                        style={{
                                            color: "rgba(255,165,60,0.7)",
                                            textShadow: "0 0 15px rgba(255,165,60,0.5)",
                                        }}>
                                        ★ ROCKSTAR GAMES ★
                                    </div>
                                </div>
                            )}

                            {/* ── Glassmorphic Purchase Card ── */}
                            {(hasPricePS4 || hasPricePS5) && (
                                <div className="w-full max-w-[380px] rounded-3xl p-5 space-y-4"
                                    style={{
                                        background: "linear-gradient(145deg, rgba(15,5,30,0.95), rgba(10,15,30,0.9))",
                                        border: "1px solid rgba(255,45,120,0.15)",
                                        boxShadow: "0 16px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,45,120,0.05) inset",
                                        backdropFilter: "blur(20px)",
                                        animation: isVisible ? "gtavi-scale-in 0.6s ease-out 0.5s both" : "none",
                                    }}>
                                    <div className="text-xs font-black text-center tracking-widest uppercase"
                                        style={{ color: "rgba(255,130,170,0.6)" }}>
                                        اختر نسختك المفضلة
                                    </div>

                                    <div className="space-y-2.5">
                                        {hasPricePS5 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPlatform("five")}
                                                className="w-full p-4 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between group"
                                                style={{
                                                    background: selectedPlatform === "five"
                                                        ? "linear-gradient(135deg, rgba(255,45,120,0.2), rgba(255,140,60,0.1))"
                                                        : "rgba(255,255,255,0.03)",
                                                    border: selectedPlatform === "five"
                                                        ? "1px solid rgba(255,45,120,0.4)"
                                                        : "1px solid rgba(255,255,255,0.06)",
                                                    transform: selectedPlatform === "five" ? "scale(1.02)" : "scale(1)",
                                                    boxShadow: selectedPlatform === "five" ? "0 8px 24px rgba(255,45,120,0.15)" : "none",
                                                }}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-white flex items-center gap-2">
                                                        نسخة PS5
                                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                                                            style={{
                                                                background: "rgba(255,45,120,0.15)",
                                                                color: "#ff6ea8",
                                                            }}>4K HDR</span>
                                                    </div>
                                                    <div className="text-[11px] text-white/40 font-medium mt-0.5">حساب أصلي Primary — تسليم فوري</div>
                                                </div>
                                                <div className="text-xl font-black" style={{ color: "#ff6ea8" }}>
                                                    {currency}{Number(la.price5).toFixed(2)}
                                                </div>
                                            </button>
                                        )}

                                        {hasPricePS4 && (
                                            <button
                                                type="button"
                                                onClick={() => setSelectedPlatform("four")}
                                                className="w-full p-4 rounded-2xl text-right transition-all cursor-pointer flex items-center justify-between group"
                                                style={{
                                                    background: selectedPlatform === "four"
                                                        ? "linear-gradient(135deg, rgba(0,229,255,0.15), rgba(59,130,246,0.1))"
                                                        : "rgba(255,255,255,0.03)",
                                                    border: selectedPlatform === "four"
                                                        ? "1px solid rgba(0,229,255,0.4)"
                                                        : "1px solid rgba(255,255,255,0.06)",
                                                    transform: selectedPlatform === "four" ? "scale(1.02)" : "scale(1)",
                                                    boxShadow: selectedPlatform === "four" ? "0 8px 24px rgba(0,229,255,0.1)" : "none",
                                                }}
                                            >
                                                <div>
                                                    <div className="font-black text-sm text-white flex items-center gap-2">
                                                        نسخة PS4
                                                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-md"
                                                            style={{
                                                                background: "rgba(0,229,255,0.12)",
                                                                color: "#4dd9ff",
                                                            }}>Full HD</span>
                                                    </div>
                                                    <div className="text-[11px] text-white/40 font-medium mt-0.5">حساب أصلي Primary — تسليم فوري</div>
                                                </div>
                                                <div className="text-xl font-black" style={{ color: "#4dd9ff" }}>
                                                    {currency}{Number(la.price4).toFixed(2)}
                                                </div>
                                            </button>
                                        )}
                                    </div>

                                    {/* Total & Buy */}
                                    <div className="pt-3 border-t flex items-center justify-between gap-3"
                                        style={{ borderColor: "rgba(255,255,255,0.06)" }}>
                                        <div>
                                            <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">السعر النهائي</div>
                                            <div className="text-2xl font-black" style={{
                                                color: "#4ade80",
                                                textShadow: "0 0 20px rgba(74,222,128,0.3)",
                                            }}>
                                                {currency}{price ? Number(price).toFixed(2) : "—"}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleBuy}
                                            className="px-6 py-3 rounded-xl font-black text-xs text-white transition-all active:scale-95"
                                            style={{
                                                background: "linear-gradient(135deg, #ff2d78, #ff8c42)",
                                                boxShadow: "0 4px 20px rgba(255,45,120,0.3)",
                                            }}
                                        >
                                            <span className="flex items-center gap-2">
                                                <ShoppingCart className="w-4 h-4" />
                                                أضف للسلة ⚡
                                            </span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Scroll indicator ── */}
                    <div className="flex justify-center mt-10 sm:mt-14">
                        <div className="flex flex-col items-center gap-2 text-white/20">
                            <span className="text-[10px] font-bold tracking-widest uppercase">اكتشف المزيد</span>
                            <ChevronDown className="w-5 h-5 animate-bounce" />
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
