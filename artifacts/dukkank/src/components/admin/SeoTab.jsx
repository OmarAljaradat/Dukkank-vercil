import { useState, useEffect } from "react";
import { getSeo, setSeo as setLocalSeo } from "../../lib/storage";
import { apiGetSeo, apiSaveSeo } from "../../lib/api";
import { useStoreData } from "../../contexts/DataContext";
import { toast } from "sonner";
import {
  Search, Image as ImageIcon, Globe, Info,
  Hash, FileText, Twitter, Link2, ShieldCheck, Languages, MapPin, Loader2, Zap
} from "lucide-react";

const FALLBACK_SEO = {
  title: "دُكانك | متجر الاشتراكات والألعاب الرقمية",
  description: "اشتراكات PlayStation Plus وألعاب رقمية أصلية بأفضل الأسعار، مع تسليم فوري ودعم مباشر على واتساب.",
  keywords: "بلايستيشن بلاس, ألعاب رقمية, اشتراكات PS4 PS5, دُكانك",
  ogImage: "",
  siteName: "دُكانك - Dukkank",
  siteNameEn: "Dukkank",
  lang: "ar",
  locale: "ar_JO",
  canonical: "https://dukkank.com",
  googleVerification: "",
  robotsCustom: "",
};

export default function SeoTab() {
  const { setSeo: setContextSeo } = useStoreData();
  const [seoData, setSeoData] = useState(FALLBACK_SEO);
  const [score, setScore] = useState(0);
  const [tips, setTips] = useState([]);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState("basic");

  useEffect(() => {
    apiGetSeo()
      .then((data) => {
        if (data && typeof data === "object") setSeoData({ ...FALLBACK_SEO, ...data });
      })
      .catch(() => {
        const data = getSeo();
        if (data) setSeoData({ ...FALLBACK_SEO, ...data });
      });
  }, []);

  useEffect(() => {
    calculateScore(seoData);
  }, [seoData]);

  const calculateScore = (data) => {
    let s = 0;
    const newTips = [];
    if (data.title.length >= 50 && data.title.length <= 60) { s += 25; }
    else if (data.title.length > 0) { s += 12; newTips.push({ icon: "warning", text: `طول العنوان ${data.title.length} حرف. الأمثل بين 50 و 60.` }); }
    else { newTips.push({ icon: "error", text: "يرجى إضافة عنوان للصفحة." }); }

    if (data.description.length >= 120 && data.description.length <= 160) { s += 25; }
    else if (data.description.length > 0) { s += 12; newTips.push({ icon: "warning", text: `طول الوصف ${data.description.length} حرف. الأمثل بين 120 و 160.` }); }
    else { newTips.push({ icon: "error", text: "يرجى إضافة وصف للصفحة." }); }

    if (data.keywords.length > 0) {
      const kwCount = data.keywords.split(",").filter((k) => k.trim()).length;
      if (kwCount >= 3 && kwCount <= 10) { s += 15; }
      else { s += 7; newTips.push({ icon: "warning", text: `لديك ${kwCount} كلمات مفتاحية. الأمثل بين 3 و 10.` }); }
    } else { newTips.push({ icon: "error", text: "يرجى إضافة كلمات مفتاحية." }); }

    if (data.ogImage.length > 0) { s += 15; }
    else { newTips.push({ icon: "info", text: "إضافة صورة OG يحسن مظهر الموقع عند مشاركته." }); }

    if (data.canonical && data.canonical.startsWith("https://")) { s += 10; }
    else { newTips.push({ icon: "info", text: "أضف رابط Canonical بـ HTTPS لتجنب محتوى مكرر." }); }

    if (data.siteName && data.siteName.length > 3) { s += 5; }
    else { newTips.push({ icon: "info", text: "أضف اسم الموقع." }); }

    if (data.googleVerification && data.googleVerification.length > 5) { s += 5; }
    else { newTips.push({ icon: "info", text: "ربط Google Search Console يحسن فهرسة الموقع." }); }

    if (s === 100) newTips.unshift({ icon: "trophy", text: "ممتاز! إعدادات SEO مكتملة بنسبة 100%!" });
    setScore(s);
    setTips(newTips);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeoData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await apiSaveSeo(seoData);
      setLocalSeo(seoData);
      if (setContextSeo) setContextSeo(seoData);
      window.dispatchEvent(new CustomEvent("dukkank-seo-change", { detail: seoData }));
      toast.success("تم حفظ إعدادات SEO في قاعدة البيانات! جميع الزوار سيستفيدون الآن.");
    } catch {
      toast.error("حدث خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const getScoreColor = () => score < 50 ? "text-red-500" : score < 75 ? "text-yellow-500" : "text-green-500";
  const getScoreStroke = () => score < 50 ? "stroke-red-500" : score < 75 ? "stroke-yellow-500" : "stroke-green-500";
  const scoreBg = score >= 100 ? "bg-green-50 dark:bg-green-900/10" : score >= 75 ? "bg-yellow-50 dark:bg-yellow-900/10" : "bg-red-50 dark:bg-red-900/10";

  const tipIcon = (type) => {
    if (type === "trophy") return "🏆";
    if (type === "warning") return "⚠️";
    if (type === "error") return "❌";
    return "ℹ️";
  };

  const tabs = [
    { id: "basic", label: "الأساسيات", Icon: Search },
    { id: "social", label: "التواصل", Icon: Twitter },
    { id: "advanced", label: "متقدم", Icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
            <Search className="w-6 h-6 text-[hsl(var(--brand-blue-deep))]" />
            إعدادات محركات البحث (SEO)
          </h2>
          <p className="text-[hsl(var(--brand-ink))]/70 mt-1">
            تُحفظ في قاعدة البيانات وتظهر لجميع الزوار على كل الأجهزة
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-full px-8 h-12 bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
          {saving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-5">
          {/* Score */}
          <div className={`border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated text-center ${scoreBg}`}>
            <h3 className="text-base font-bold text-[hsl(var(--brand-ink))] mb-3">نقاط تحسين محركات البحث</h3>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-700" strokeWidth="3.5" />
                <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${getScoreStroke()} transition-all duration-700`}
                  strokeWidth="3.5" strokeDasharray="100.53"
                  strokeDashoffset={100.53 - (100.53 * score / 100)} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${getScoreColor()}`}>{score}</span>
                <span className="text-xs text-[hsl(var(--brand-ink))]/50">/ 100</span>
              </div>
            </div>
            <div className="text-right space-y-1.5">
              <h4 className="text-xs font-bold text-[hsl(var(--brand-ink))]/70 flex items-center gap-1.5 mb-2">
                <Info className="w-3.5 h-3.5" /> نصائح للتحسين:
              </h4>
              {tips.slice(0, 6).map((tip, idx) => (
                <div key={idx} className="flex items-start gap-1.5 bg-white/60 dark:bg-white/5 p-2 rounded-xl">
                  <span className="text-sm shrink-0">{tipIcon(tip.icon)}</span>
                  <span className="text-xs text-[hsl(var(--brand-ink))]/75 leading-relaxed">{tip.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-2xl p-1.5 flex gap-1">
            {tabs.map(({ id, label, Icon }) => (
              <button key={id} onClick={() => setActiveSection(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-xl text-xs font-bold transition-all ${activeSection === id ? "bg-[hsl(var(--brand-blue-deep))] text-white shadow" : "text-[hsl(var(--brand-ink))]/60 hover:bg-gray-100 dark:hover:bg-white/5"}`}>
                <Icon className="w-3.5 h-3.5" />{label}
              </button>
            ))}
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-5 card-elevated space-y-4">
            {activeSection === "basic" && (
              <>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70">عنوان الصفحة (Title Tag)</label>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${seoData.title.length >= 50 && seoData.title.length <= 60 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{seoData.title.length} / 60</span>
                  </div>
                  <input type="text" name="title" value={seoData.title} onChange={handleChange}
                    placeholder="دُكانك | متجر لبيع اشتراكات بلايستيشن"
                    className="w-full px-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm" />
                  <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${seoData.title.length >= 50 && seoData.title.length <= 60 ? "bg-green-500" : seoData.title.length > 60 ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, (seoData.title.length / 60) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70">الوصف (Meta Description)</label>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${seoData.description.length >= 120 && seoData.description.length <= 160 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>{seoData.description.length} / 160</span>
                  </div>
                  <textarea name="description" value={seoData.description} onChange={handleChange} rows={3}
                    placeholder="اكتب وصفاً جذاباً (120-160 حرف)..."
                    className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] resize-none text-sm" />
                  <div className="h-1.5 bg-gray-200 rounded-full mt-2 overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${seoData.description.length >= 120 && seoData.description.length <= 160 ? "bg-green-500" : seoData.description.length > 160 ? "bg-red-500" : "bg-amber-500"}`}
                      style={{ width: `${Math.min(100, (seoData.description.length / 160) * 100)}%` }} />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5">الكلمات المفتاحية</label>
                  <div className="relative">
                    <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="keywords" value={seoData.keywords} onChange={handleChange}
                      placeholder="بلايستيشن، ألعاب، بلس (مفصولة بفاصلة)"
                      className="w-full pr-9 pl-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm" />
                  </div>
                  {seoData.keywords && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {seoData.keywords.split(",").filter((k) => k.trim()).map((kw, i) => (
                        <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--brand-blue))]/10 text-[hsl(var(--brand-blue-deep))]">#{kw.trim()}</span>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}

            {activeSection === "social" && (
              <>
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5">اسم الموقع</label>
                  <input type="text" name="siteName" value={seoData.siteName} onChange={handleChange}
                    placeholder="دُكانك - Dukkank"
                    className="w-full px-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm" />
                </div>
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5">رابط صورة المشاركة (OG Image)</label>
                  <div className="relative">
                    <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" name="ogImage" value={seoData.ogImage} onChange={handleChange}
                      placeholder="https://dukkank.com/og-image.jpg"
                      className="w-full pr-9 pl-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm" />
                  </div>
                  {seoData.ogImage && (
                    <img src={seoData.ogImage} alt="OG Preview" className="mt-2 rounded-xl h-20 object-cover w-full" onError={(e) => e.currentTarget.classList.add("hidden")} />
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5"><Languages className="inline w-3.5 h-3.5 ml-1" />اللغة</label>
                    <select name="lang" value={seoData.lang} onChange={handleChange}
                      className="w-full px-3 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border-none text-sm text-[hsl(var(--brand-ink))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]">
                      <option value="ar">العربية</option>
                      <option value="en">English</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5"><MapPin className="inline w-3.5 h-3.5 ml-1" />المنطقة</label>
                    <select name="locale" value={seoData.locale} onChange={handleChange}
                      className="w-full px-3 h-10 rounded-xl bg-gray-50 dark:bg-white/5 border-none text-sm text-[hsl(var(--brand-ink))] focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]">
                      <option value="ar_JO">الأردن</option>
                      <option value="ar_SA">السعودية</option>
                      <option value="ar_AE">الإمارات</option>
                      <option value="ar_KW">الكويت</option>
                      <option value="ar_QA">قطر</option>
                      <option value="ar_EG">مصر</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {activeSection === "advanced" && (
              <>
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5"><Link2 className="inline w-4 h-4 ml-1" />رابط Canonical</label>
                  <input type="text" name="canonical" value={seoData.canonical} onChange={handleChange}
                    placeholder="https://dukkank.com"
                    className="w-full px-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm" />
                  <p className="text-xs text-[hsl(var(--brand-ink))]/50 mt-1">يمنع جوجل من فهرسة صفحات مكررة</p>
                </div>
                <div>
                  <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5"><ShieldCheck className="inline w-4 h-4 ml-1" />كود تفعيل Google Search Console</label>
                  <input type="text" name="googleVerification" value={seoData.googleVerification} onChange={handleChange}
                    placeholder="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    className="w-full px-4 h-11 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] text-sm font-mono" />
                  <p className="text-xs text-[hsl(var(--brand-ink))]/50 mt-1">ستجده في لوحة Google Search Console عند ربط الموقع</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="lg:col-span-2 space-y-6">
          {/* Google Preview */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-base font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-blue-500" />معاينة نتائج بحث جوجل
            </h3>
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5" dir="rtl">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 bg-[hsl(var(--brand-blue-deep))] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-white">د</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-[#202124] dark:text-gray-200">{seoData.siteName || "دُكانك - Dukkank"}</div>
                  <div className="text-xs text-[#4d5156] dark:text-gray-400">{seoData.canonical || "https://dukkank.com"}</div>
                </div>
              </div>
              <a href="#" className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mb-1.5 block leading-snug">
                {seoData.title || "عنوان الصفحة يظهر هنا..."}
              </a>
              <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                {seoData.description || "الوصف يظهر هنا. اكتب وصفاً جذاباً يشرح ما يقدمه متجرك..."}
              </p>
            </div>
          </div>

          {/* Social Preview */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-base font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-400" />معاينة التواصل الاجتماعي
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <p className="text-xs text-[hsl(var(--brand-ink))]/50 mb-2 font-medium text-center">واتساب</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-[#e5ddd5] dark:bg-[#0b141a] p-3 flex items-center justify-center">
                  <div className="bg-white dark:bg-[#202c33] rounded-xl shadow-sm w-full max-w-xs overflow-hidden">
                    <div className="h-32 bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
                      {seoData.ogImage ? <img src={seoData.ogImage} alt="OG" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-400" />}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-[#202c33] border-t border-gray-100 dark:border-gray-700/50">
                      <h4 className="font-bold text-[#111b21] dark:text-[#e9edef] text-sm truncate">{seoData.title || "دُكانك | متجر لبيع اشتراكات بلايستيشن"}</h4>
                      <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-0.5 line-clamp-1">{seoData.description || "وصف متجرك"}</p>
                      <span className="text-[10px] text-[#667781] uppercase">{(seoData.canonical || "dukkank.com").replace("https://", "")}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-xs text-[hsl(var(--brand-ink))]/50 mb-2 font-medium text-center">تويتر / X</p>
                <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-black p-3 flex items-center justify-center">
                  <div className="border border-gray-300 dark:border-gray-800 rounded-2xl overflow-hidden w-full max-w-xs">
                    <div className="h-32 bg-gray-200 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                      {seoData.ogImage ? <img src={seoData.ogImage} alt="OG" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-500" />}
                    </div>
                    <div className="p-3">
                      <span className="text-[11px] text-gray-500 block mb-0.5 uppercase">{(seoData.canonical || "dukkank.com").replace("https://", "")}</span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{seoData.title || "دُكانك"}</h4>
                      <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{seoData.description || "وصف متجرك"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* robots.txt */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-base font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />محتوى ملف robots.txt (تلقائي)
            </h3>
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-2xl overflow-x-auto" dir="ltr">
              <pre>{`User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /admin/*\nDisallow: /api/*\n\nSitemap: ${seoData.canonical || "https://dukkank.com"}/sitemap.xml`}</pre>
            </div>
            <p className="text-xs text-[hsl(var(--brand-ink))]/60 mt-3">يُولَّد تلقائياً ويتحدث بناءً على رابط الـ Canonical.</p>
          </div>

          {/* Sitemap link */}
          <div className="bg-[hsl(var(--brand-blue-deep))]/5 border border-[hsl(var(--brand-blue-deep))]/20 rounded-2xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
              <div>
                <p className="text-sm font-bold text-[hsl(var(--brand-ink))]">خريطة الموقع (Sitemap)</p>
                <p className="text-xs text-[hsl(var(--brand-ink))]/60">تُولَّد تلقائياً وتشمل جميع صفحات المتجر</p>
              </div>
            </div>
            <a href={`${seoData.canonical || "https://dukkank.com"}/sitemap.xml`} target="_blank" rel="noopener noreferrer"
              className="text-xs text-[hsl(var(--brand-blue-deep))] font-bold hover:underline flex items-center gap-1">
              فتح <Link2 className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
