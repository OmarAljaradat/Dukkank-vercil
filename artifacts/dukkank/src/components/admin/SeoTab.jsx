import { useState, useEffect } from "react";
import { getSeo, setSeo } from "../../lib/storage";
import { toast } from "sonner";
import { Search, Image as ImageIcon, Globe, Info, CheckCircle, AlertTriangle, Hash, FileText, Twitter, MessageCircle } from "lucide-react";

export default function SeoTab() {
  const [seoData, setSeoData] = useState({
    title: "",
    description: "",
    keywords: "",
    ogImage: ""
  });
  
  const [score, setScore] = useState(0);
  const [tips, setTips] = useState([]);

  useEffect(() => {
    const data = getSeo();
    if (data) {
      setSeoData({
        title: data.title || "",
        description: data.description || "",
        keywords: data.keywords || "",
        ogImage: data.ogImage || ""
      });
    }
  }, []);

  useEffect(() => {
    calculateScore(seoData);
  }, [seoData]);

  const calculateScore = (data) => {
    let s = 0;
    const newTips = [];

    // Title checks
    if (data.title.length > 0) {
      if (data.title.length >= 50 && data.title.length <= 60) {
        s += 30;
      } else {
        s += 15;
        newTips.push("طول العنوان يجب أن يكون بين 50 و 60 حرفاً للحصول على أفضل نتيجة.");
      }
    } else {
      newTips.push("يرجى إضافة عنوان للصفحة.");
    }

    // Description checks
    if (data.description.length > 0) {
      if (data.description.length >= 120 && data.description.length <= 160) {
        s += 30;
      } else {
        s += 15;
        newTips.push("الوصف يجب أن يكون بين 120 و 160 حرفاً لتجنب اقتطاعه في نتائج البحث.");
      }
    } else {
      newTips.push("يرجى إضافة وصف للصفحة.");
    }

    // Keywords
    if (data.keywords.length > 0) {
      const kwCount = data.keywords.split(",").filter(k => k.trim()).length;
      if (kwCount >= 3 && kwCount <= 10) {
        s += 20;
      } else {
        s += 10;
        newTips.push("استخدم بين 3 و 10 كلمات مفتاحية معبرة.");
      }
    } else {
      newTips.push("يرجى إضافة كلمات مفتاحية.");
    }

    // OG Image
    if (data.ogImage.length > 0) {
      s += 20;
    } else {
      newTips.push("إضافة صورة بارزة (OG Image) يحسن من شكل الرابط عند مشاركته على وسائل التواصل.");
    }

    if (s === 100) {
      newTips.push("أداء تحسين محركات البحث ممتاز!");
    }

    setScore(s);
    setTips(newTips);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSeoData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    setSeo(seoData);
    window.dispatchEvent(new CustomEvent("dukkank-seo-change", { detail: seoData }));
    toast.success("تم حفظ إعدادات SEO وتطبيقها على كافة وسوم الموقع بنجاح! 🚀");
  };

  const getScoreColor = () => {
    if (score < 50) return "text-[hsl(var(--brand-red))]";
    if (score < 75) return "text-yellow-500";
    return "text-green-500";
  };

  const getScoreBg = () => {
    if (score < 50) return "bg-[hsl(var(--brand-red))]/10";
    if (score < 75) return "bg-yellow-500/10";
    return "bg-green-500/10";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
            <Search className="w-6 h-6 text-[hsl(var(--brand-blue-deep))]" />
            إعدادات محركات البحث (SEO)
          </h2>
          <p className="text-[hsl(var(--brand-ink))]/70 mt-1">
            إدارة كيفية ظهور متجرك في نتائج بحث جوجل ومنصات التواصل الاجتماعي
          </p>
        </div>
        <button
          onClick={handleSave}
          className="rounded-full px-8 h-12 bg-[hsl(var(--brand-blue-deep))] text-white text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          حفظ التغييرات
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Form & Score */}
        <div className="lg:col-span-1 space-y-6">
          
          {/* Score Card */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated text-center">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-4">نقاط تحسين محركات البحث</h3>
            <div className="relative inline-flex items-center justify-center w-32 h-32 rounded-full mb-4">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-current text-gray-200 dark:text-gray-800" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${getScoreColor()}`} strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - score} strokeLinecap="round" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-black ${getScoreColor()}`}>{score}</span>
                <span className="text-xs text-[hsl(var(--brand-ink))]/50">/ 100</span>
              </div>
            </div>
            
            <div className="text-right">
              <h4 className="text-sm font-bold text-[hsl(var(--brand-ink))] flex items-center gap-1.5 mb-2">
                <Info className="w-4 h-4" />
                نصائح للتحسين:
              </h4>
              <ul className="space-y-2 text-sm text-[hsl(var(--brand-ink))]/70">
                {tips.slice(0, 4).map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 bg-gray-50 dark:bg-white/5 p-2 rounded-xl">
                    {score === 100 ? <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />}
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Form */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated space-y-5">
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70">عنوان الصفحة (Title Tag)</label>
                <span className={`text-xs font-bold ${seoData.title.length > 60 || seoData.title.length < 50 ? "text-amber-500" : "text-green-500"}`}>
                  {seoData.title.length} حرف
                </span>
              </div>
              <input
                type="text"
                name="title"
                value={seoData.title}
                onChange={handleChange}
                placeholder="مثال: دُكانك | متجر لبيع اشتراكات بلايستيشن"
                className="w-full px-4 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))]"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70">الوصف (Meta Description)</label>
                <span className={`text-xs font-bold ${seoData.description.length > 160 || seoData.description.length < 120 ? "text-amber-500" : "text-green-500"}`}>
                  {seoData.description.length} حرف
                </span>
              </div>
              <textarea
                name="description"
                value={seoData.description}
                onChange={handleChange}
                rows={3}
                placeholder="اكتب وصفاً جذاباً يشرح ما يقدمه متجرك..."
                className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))] resize-none"
              />
            </div>

            <div>
              <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5">الكلمات المفتاحية</label>
              <div className="relative">
                <Hash className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="keywords"
                  value={seoData.keywords}
                  onChange={handleChange}
                  placeholder="بلايستيشن، العاب، بلس، (مفصولة بفاصلة)"
                  className="w-full pr-10 pl-4 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))]"
                />
              </div>
              {seoData.keywords && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {seoData.keywords.split(",").filter(k => k.trim()).map((kw, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-[hsl(var(--brand-blue))]/10 text-[hsl(var(--brand-blue-deep))]">
                      {kw.trim()}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label className="text-sm font-bold text-[hsl(var(--brand-ink))]/70 block mb-1.5">رابط صورة المشاركة (OG Image)</label>
              <div className="relative">
                <ImageIcon className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  name="ogImage"
                  value={seoData.ogImage}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full pr-10 pl-4 h-12 rounded-xl bg-gray-50 dark:bg-white/5 border-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-ink))]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Previews */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Google Preview */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5 text-gray-400" />
              معاينة نتائج بحث جوجل
            </h3>
            
            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5" dir="rtl">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center overflow-hidden">
                  <span className="text-xs font-bold text-gray-500">D</span>
                </div>
                <div>
                  <div className="text-sm text-[#202124] dark:text-gray-300">دُكانك - Dukkank</div>
                  <div className="text-xs text-[#4d5156] dark:text-gray-400">https://dukkank.com</div>
                </div>
              </div>
              <a href="#" className="text-xl text-[#1a0dab] dark:text-[#8ab4f8] hover:underline mb-1 block truncate">
                {seoData.title || "عنوان الصفحة (مثال: دُكانك | متجر لبيع اشتراكات بلايستيشن)"}
              </a>
              <p className="text-sm text-[#4d5156] dark:text-[#bdc1c6] line-clamp-2 leading-relaxed">
                {seoData.description || "الوصف يظهر هنا. اكتب وصفاً جذاباً يشرح ما يقدمه متجرك، ويشجع المستخدمين على النقر لزيارة الموقع. يجب أن يكون بين 120 و 160 حرفاً."}
              </p>
            </div>
          </div>

          {/* Social Media Preview */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <Twitter className="w-5 h-5 text-blue-400" />
              معاينة تويتر وواتساب (Social Cards)
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* WhatsApp Style */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-[#e5ddd5] dark:bg-[#0b141a] p-4 flex items-center justify-center relative">
                 <div className="bg-white dark:bg-[#202c33] rounded-xl shadow-sm w-full max-w-sm overflow-hidden flex flex-col">
                    <div className="h-40 bg-gray-200 dark:bg-gray-700 relative overflow-hidden flex items-center justify-center">
                      {seoData.ogImage ? (
                        <img src={seoData.ogImage} alt="OG" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-400" />
                      )}
                    </div>
                    <div className="p-3 bg-gray-50 dark:bg-[#202c33] border-t border-gray-100 dark:border-gray-700/50">
                      <h4 className="font-bold text-[#111b21] dark:text-[#e9edef] text-sm truncate">{seoData.title || "دُكانك | متجر لبيع اشتراكات بلايستيشن"}</h4>
                      <p className="text-xs text-[#667781] dark:text-[#8696a0] mt-1 line-clamp-1">{seoData.description || "وصف متجرك يظهر هنا بشكل مختصر ومفيد للمستخدم."}</p>
                      <span className="text-[10px] text-[#667781] dark:text-[#8696a0] mt-1 block">dukkank.com</span>
                    </div>
                 </div>
              </div>

              {/* Twitter Style */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden bg-white dark:bg-black p-4 flex items-center justify-center">
                 <div className="border border-gray-300 dark:border-gray-800 rounded-2xl overflow-hidden w-full max-w-sm flex flex-col cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <div className="h-40 bg-gray-200 dark:bg-gray-800 relative overflow-hidden flex items-center justify-center">
                      {seoData.ogImage ? (
                        <img src={seoData.ogImage} alt="OG" className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="w-10 h-10 text-gray-500" />
                      )}
                    </div>
                    <div className="p-3">
                      <span className="text-[13px] text-gray-500 block mb-0.5">dukkank.com</span>
                      <h4 className="font-bold text-gray-900 dark:text-white text-sm line-clamp-1">{seoData.title || "دُكانك | متجر لبيع اشتراكات بلايستيشن"}</h4>
                      <p className="text-[13px] text-gray-500 mt-1 line-clamp-2">{seoData.description || "وصف متجرك يظهر هنا بشكل مختصر ومفيد للمستخدم. اجعله جذاباً لزيادة النقرات."}</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>

          {/* robots.txt viewer */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-gray-400" />
              محتوى ملف robots.txt
            </h3>
            <div className="bg-gray-900 text-green-400 font-mono text-sm p-4 rounded-2xl overflow-x-auto" dir="ltr">
<pre>
{`User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /_next/

Sitemap: https://dukkank.com/sitemap.xml`}
</pre>
            </div>
            <p className="text-xs text-[hsl(var(--brand-ink))]/60 mt-3">
              هذا الملف يخبر محركات البحث بالصفحات المسموح والممنوع فهرستها. حالياً الإعدادات قياسية ومناسبة.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
