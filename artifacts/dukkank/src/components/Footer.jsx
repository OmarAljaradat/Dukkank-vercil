import { MessageCircle, Instagram, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useStoreData } from "../contexts/DataContext";
import { useLang, pickLocalized } from "../contexts/LanguageContext";
import { quickInquiry } from "../lib/whatsapp";

export const Footer = () => {
    const { store, waTemplates } = useStoreData();
    const { t, lang } = useLang();
    const name = pickLocalized(store, "name", lang);
    const tagline = pickLocalized(store, "tagline", lang);

    return (
        <footer
            id="contact"
            data-testid="site-footer"
            className="relative bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-cream))] mt-16"
        >
            <div className="h-2 keffiyeh-pattern" />
            <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {/* Column 1: About Store */}
                <div>
                    <div className="flex items-center gap-3 mb-4">
                        <img
                            src="/logo.png"
                            alt={name}
                            className="w-12 h-12 rounded-xl"
                        />
                        <div>
                            <div className="text-xl font-bold">{name}</div>
                            <div className="text-xs opacity-75">{tagline}</div>
                        </div>
                    </div>
                    <p className="text-sm opacity-80 leading-relaxed">
                        {t("footer.about")}
                    </p>
                </div>

                {/* Column 2: Contact Info (تواصل) */}
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 mb-4">
                        {t("footer.contact")}
                    </h4>
                    <div className="space-y-3">
                        <a
                            href={store.instagram || "https://www.instagram.com/dukkank15/"}
                            target="_blank"
                            rel="noopener noreferrer"
                            data-testid="footer-instagram"
                            className="flex items-center gap-3 group"
                        >
                            <span className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#f09433] via-[#e6683c] to-[#bc1888] flex items-center justify-center group-hover:scale-110 transition-transform shadow-md">
                                <Instagram className="w-4 h-4 text-white" />
                            </span>
                            <div className="flex flex-col">
                                <span className="text-sm font-bold">إنستجرام المتجر الرسمي</span>
                                <span className="text-xs opacity-75 font-mono dir-ltr text-right">@dukkank15</span>
                            </div>
                        </a>
                        <a
                            href="https://ig.me/m/dukkank15"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-bold transition cursor-pointer"
                        >
                            <span>مراسلة الدعم عبر الخاص 💬</span>
                        </a>
                    </div>
                </div>

                {/* Column 3: Guarantees (ضماناتنا) */}
                <div>
                    <h4 className="text-sm font-bold uppercase tracking-wider opacity-75 mb-4">
                        {t("footer.guarantees")}
                    </h4>
                    <ul className="space-y-3 text-sm">
                        {[t("footer.g1"), t("footer.g2"), t("footer.g3")].map((g, i) => (
                            <li key={i} className="flex items-start gap-2">
                                <ShieldCheck className="w-4 h-4 mt-0.5 flex-shrink-0 text-emerald-400" />
                                <span>{g}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Column 4: Policies (الروابط والسياسات) */}
                <div>
                    <h4 className="text-sm font-extrabold uppercase tracking-wider text-[hsl(var(--brand-gold))] mb-4">
                        الروابط والسياسات
                    </h4>
                    <ul className="space-y-3 text-sm font-bold opacity-90">
                        <li>
                            <Link to="/policies?tab=privacy" className="hover:text-[hsl(var(--brand-gold))] hover:underline transition-colors block">
                                سياسة الخصوصية
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies?tab=terms" className="hover:text-[hsl(var(--brand-gold))] hover:underline transition-colors block">
                                شروط الاستخدام
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies?tab=refund" className="hover:text-[hsl(var(--brand-gold))] hover:underline transition-colors block">
                                سياسة الاسترجاع
                            </Link>
                        </li>
                        <li>
                            <Link to="/policies?tab=warranty" className="hover:text-[hsl(var(--brand-gold))] hover:underline transition-colors block">
                                سياسة الضمان
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>

            <div className="border-t border-[hsl(var(--brand-cream))]/15">
                <div className="max-w-7xl mx-auto px-5 sm:px-8 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs opacity-70">
                    <span className="flex items-center gap-4">
                        <Link to="/policies" className="text-[hsl(var(--brand-gold))] hover:underline font-bold">
                            الشروط والسياسات والضمان 📜
                        </Link>
                        <span>•</span>
                        <span>{t("footer.madeWith")}</span>
                    </span>
                </div>
            </div>
        </footer>
    );
};
