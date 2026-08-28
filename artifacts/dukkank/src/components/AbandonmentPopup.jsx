import { useState, useEffect } from "react";
import { getPopupSettings } from "../lib/storage";
import { useStoreData } from "../contexts/DataContext";
import { quickInquiry } from "../lib/whatsapp";
import { X, MessageCircle } from "lucide-react";

const SHOWN_KEY = "dk_popup_shown";

export function AbandonmentPopup() {
    const [visible, setVisible] = useState(false);
    const { store, waTemplates }  = useStoreData();

    useEffect(() => {
        const settings = getPopupSettings();
        if (!settings.enabled) return;

        // Show only once per session
        try {
            if (sessionStorage.getItem(SHOWN_KEY)) return;
        } catch { /* ignore */ }

        const delay = (settings.delay || 30) * 1000;
        const id = setTimeout(() => {
            setVisible(true);
            try { sessionStorage.setItem(SHOWN_KEY, "1"); } catch { /* ignore */ }
        }, delay);

        return () => clearTimeout(id);
    }, []);

    const settings = getPopupSettings();
    if (!visible || !settings.enabled) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                onClick={() => setVisible(false)}
            />
            <div className="relative w-full max-w-sm rounded-3xl bg-[hsl(var(--brand-cream))] border border-[hsl(var(--brand-ink))]/10 shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="bg-[hsl(var(--brand-blue-deep))] px-6 py-5 relative overflow-hidden">
                    <div className="absolute -top-6 -left-6 w-24 h-24 keffiyeh-pattern opacity-20 rotate-12" />
                    <button
                        onClick={() => setVisible(false)}
                        className="absolute top-3 left-3 w-7 h-7 rounded-full bg-white/15 flex items-center justify-center text-white hover:bg-white/25"
                    >
                        <X className="w-3.5 h-3.5" />
                    </button>
                    <div className="text-2xl mb-1">👋</div>
                    <h3 className="text-white font-bold text-lg leading-tight relative">مهلاً!</h3>
                    <p className="text-white/75 text-sm mt-1 relative">هل لديك استفسار قبل المغادرة؟</p>
                </div>

                {/* Body */}
                <div className="px-6 py-5">
                    <p className="text-[hsl(var(--brand-ink))]/80 text-sm leading-relaxed mb-5">
                        {settings.message}
                    </p>

                    <button
                        onClick={() => {
                            setVisible(false);
                            quickInquiry(null, store, waTemplates);
                        }}
                        className="w-full inline-flex items-center justify-center gap-2 rounded-full h-12 bg-[#25D366] text-white font-bold hover:bg-[#1DA851] transition-colors"
                    >
                        <MessageCircle className="w-5 h-5 wa-pulse" />
                        تواصل معنا عبر إنستجرام
                    </button>

                    <button
                        onClick={() => setVisible(false)}
                        className="w-full mt-2 text-xs text-[hsl(var(--brand-ink))]/40 hover:text-[hsl(var(--brand-ink))]/60 transition-colors py-2"
                    >
                        لا شكراً، أكمل التصفح
                    </button>
                </div>
            </div>
        </div>
    );
}
