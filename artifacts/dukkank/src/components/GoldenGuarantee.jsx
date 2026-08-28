import { Shield, Zap, Headphones, RefreshCw } from "lucide-react";
import { useStoreData } from "../contexts/DataContext";

const ICONS = { shield: Shield, zap: Zap, headphones: Headphones, refresh: RefreshCw };

export function GoldenGuarantee() {
  const { content } = useStoreData();
  const c = content?.goldenGuarantee || {};

  const items = [
    {
      icon: c.item1Icon || "shield",
      title: c.item1Title || "حسابات أصلية مضمونة",
      desc: c.item1Desc || "كل منتجاتنا أصلية ١٠٠٪ من مصادر موثوقة.",
    },
    {
      icon: c.item2Icon || "zap",
      title: c.item2Title || "تسليم فوري بدون انتظار",
      desc: c.item2Desc || "طلبك يوصلك خلال دقائق من تأكيد الدفع.",
    },
    {
      icon: c.item3Icon || "headphones",
      title: c.item3Title || "دعم ٢٤/٧ على إنستجرام",
      desc: c.item3Desc || "فريقنا موجود دائماً لأي استفسار أو مشكلة.",
    },
    {
      icon: c.item4Icon || "refresh",
      title: c.item4Title || "ضمان حل المشاكل",
      desc: c.item4Desc || "في حال أي إشكال، نضمن حل المشكلة فوراً.",
    },
  ];

  return (
    <section
      id="golden-guarantee"
      data-testid="golden-guarantee-section"
      className="relative overflow-hidden py-14 sm:py-20"
      style={{
        background: "linear-gradient(135deg, hsl(43 80% 12%) 0%, hsl(38 70% 8%) 50%, hsl(28 65% 10%) 100%)",
      }}
    >
      {/* Gold shimmer overlay */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            "repeating-linear-gradient(45deg, hsl(43 100% 55% / 0.3) 0, hsl(43 100% 55% / 0.3) 2px, transparent 2px, transparent 20px)",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] mb-4 text-amber-400">
            <span className="text-lg">🏅</span>
            {c.eyebrow || "الضمان الذهبي"}
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight">
            {c.title || "نضمن لك ١٠٠٪"}
          </h2>
          {c.description && (
            <p className="mt-3 text-base sm:text-lg text-white/70 max-w-lg mx-auto leading-relaxed">
              {c.description}
            </p>
          )}
        </div>

        {/* Items grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {items.map((item, idx) => {
            const Icon = ICONS[item.icon] || Shield;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-amber-400/20 bg-white/5 backdrop-blur-sm p-6 flex flex-col items-center text-center hover:bg-white/10 hover:border-amber-400/40 transition-all duration-300 group"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center mb-4 shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-7 h-7 text-[hsl(43_80%_12%)]" />
                </div>
                <h3 className="text-base font-bold text-white mb-2">{item.title}</h3>
                <p className="text-sm text-white/65 leading-relaxed">{item.desc}</p>
              </div>
            );
          })}
        </div>

        {/* Bottom badge */}
        <div className="mt-10 sm:mt-14 flex justify-center">
          <div className="inline-flex items-center gap-2.5 rounded-full bg-amber-400/15 border border-amber-400/30 px-6 py-3 text-sm font-semibold text-amber-300">
            <Shield className="w-4 h-4 text-amber-400" />
            {c.badgeText || "ضمانك معنا على كل طلب — بدون استثناء"}
          </div>
        </div>
      </div>
    </section>
  );
}
