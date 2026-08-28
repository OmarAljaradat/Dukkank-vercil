import { useState } from "react";
import { Gamepad2, Instagram, Check, HelpCircle, X, Send } from "lucide-react";

export default function AccountLibraryTab({ libraryGames }) {
    const [helpModalGame, setHelpModalGame] = useState(null);
    const [problemText, setProblemText] = useState("");

    // Helper to get image & color scheme for PS Plus or Games
    const getGameCover = (item) => {
        const name = (item.name || "").toLowerCase();
        if (name.includes("أساسي") || name.includes("essential")) {
            return {
                bg: "from-blue-600 to-indigo-900",
                accent: "Essential",
                color: "bg-blue-500",
                image: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80",
            };
        }
        if (name.includes("إضافي") || name.includes("extra")) {
            return {
                bg: "from-rose-600 to-red-950",
                accent: "Extra",
                color: "bg-red-500",
                image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?auto=format&fit=crop&w=400&q=80",
            };
        }
        if (name.includes("فاخر") || name.includes("deluxe") || name.includes("premium")) {
            return {
                bg: "from-amber-500 to-yellow-900",
                accent: "Deluxe",
                color: "bg-amber-500",
                image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=400&q=80",
            };
        }
        return {
            bg: "from-slate-800 to-slate-950",
            accent: item.platform || "PS5",
            color: "bg-purple-600",
            image: item.image || "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80",
        };
    };

    const list = libraryGames.length > 0 ? libraryGames : [
        {
            id: "1",
            name: "بلايستيشن بلس أساسي (Essential)",
            sub: "اشتراك 12 شهر",
        },
        {
            id: "2",
            name: "بلايستيشن بلس إضافي (Extra)",
            sub: "اشتراك 12 شهر",
        },
        {
            id: "3",
            name: "بلايستيشن بلس فاخر (Deluxe)",
            sub: "اشتراك 12 شهر",
        },
        {
            id: "4",
            name: "EA Sports FC 26",
            sub: "PS5 Edition",
            image: "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?auto=format&fit=crop&w=400&q=80",
        }
    ];

    const handleSendHelp = (e) => {
        e.preventDefault();
        if (!helpModalGame) return;
        window.open("https://ig.me/m/dukkank15", "_blank");
        setHelpModalGame(null);
        setProblemText("");
    };

    return (
        <div className="space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[hsl(var(--brand-ink))]/10">
                <h2 className="text-base font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                    <span>مكتبتي الرقمية</span>
                </h2>
                <span className="text-xs text-[hsl(var(--brand-ink))]/50 font-bold">
                    {list.length} منتجات
                </span>
            </div>

            {/* Poster Cover Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {list.map((item, idx) => {
                    const cover = getGameCover(item);
                    return (
                        <div
                            key={item.id || idx}
                            className="group relative bg-white rounded-2xl border border-[hsl(var(--brand-ink))]/10 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                        >
                            {/* Poster */}
                            <div className={`relative aspect-[3/4] bg-gradient-to-br ${cover.bg} overflow-hidden flex items-center justify-center`}>
                                <img
                                    src={cover.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-300"
                                />

                                {/* Tier Accent Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />

                                {/* Active Pill Badge */}
                                <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1 z-10">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                    <span>مُفعّل</span>
                                </div>

                                {/* Tier Badge Bottom */}
                                <div className="absolute bottom-2 right-2 left-2 z-10">
                                    <span className={`inline-block px-2 py-0.5 rounded-md ${cover.color} text-white text-[10px] font-black shadow-sm`}>
                                        {cover.accent}
                                    </span>
                                </div>
                            </div>

                            {/* Title & Help Action */}
                            <div className="p-3 space-y-2.5">
                                <div>
                                    <h3 className="font-bold text-xs text-[hsl(var(--brand-ink))] truncate">
                                        {item.name}
                                    </h3>
                                    <p className="text-[11px] text-[hsl(var(--brand-ink))]/50 font-medium truncate">
                                        {item.sub || "تفعيل رقمي"}
                                    </p>
                                </div>

                                <button
                                    onClick={() => setHelpModalGame(item)}
                                    className="w-full h-8 rounded-xl bg-[hsl(var(--brand-cream))] hover:bg-emerald-50 text-emerald-700 border border-emerald-600/20 text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors"
                                >
                                    <HelpCircle className="w-3.5 h-3.5" />
                                    <span>مساعدة 💬</span>
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Help Problem Modal */}
            {helpModalGame && (
                <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative animate-in fade-in zoom-in duration-200">
                        <button
                            onClick={() => setHelpModalGame(null)}
                            className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center absolute left-4 top-4"
                        >
                            <X className="w-4 h-4" />
                        </button>

                        <div className="space-y-1">
                            <h3 className="font-black text-base text-[hsl(var(--brand-ink))] flex items-center gap-2">
                                <HelpCircle className="w-5 h-5 text-pink-600" />
                                <span>طلب مساعدة: {helpModalGame.name}</span>
                            </h3>
                            <p className="text-xs text-[hsl(var(--brand-ink))]/60 font-medium">
                                تواصل مباشرة مع فريق الدعم الفني عبر خاص إنستجرام لحل مشكلتك فوراً.
                            </p>
                        </div>

                        <div className="pt-2">
                            <a
                                href="https://ig.me/m/dukkank15"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setHelpModalGame(null)}
                                className="w-full h-11 rounded-2xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md transition-opacity cursor-pointer"
                            >
                                <Instagram className="w-4 h-4" />
                                <span>فتح خاص إنستجرام ومراسلة الدعم 💬</span>
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
