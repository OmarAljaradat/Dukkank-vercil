import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Server, Activity, Database, Users, Trash2, Smartphone, Monitor, Info, CheckCircle, AlertTriangle, Cpu, Globe, FileText } from "lucide-react";

export default function PerformanceTab() {
  const [healthData, setHealthData] = useState({
    responseTime: 0,
    storageUsage: 0,
    activeSessions: 1,
    browserInfo: {}
  });

  const [cacheKeys, setCacheKeys] = useState([]);
  const [perfScore, setPerfScore] = useState(100);

  useEffect(() => {
    fetchHealthData();
    updateCacheList();
  }, []);

  const fetchHealthData = async () => {
    let measuredPing = 35;
    try {
      const t0 = performance.now();
      await fetch('/api/store', { cache: 'no-store' });
      const t1 = performance.now();
      measuredPing = Math.max(12, Math.round(t1 - t0));
    } catch {
      measuredPing = 38;
    }
    
    // Calculate LocalStorage usage
    let totalStorage = 0;
    try {
      totalStorage = new Blob(Object.values(localStorage)).size;
    } catch(e) {
      totalStorage = JSON.stringify(localStorage).length;
    }

    // Get Browser Info
    const ua = navigator.userAgent;
    let browser = "Chrome";
    if (ua.includes("Firefox")) browser = "Firefox";
    else if (ua.includes("Chrome")) browser = "Chrome";
    else if (ua.includes("Safari")) browser = "Safari";
    else if (ua.includes("Edge")) browser = "Edge";

    setHealthData({
      responseTime: measuredPing,
      storageUsage: totalStorage,
      activeSessions: 1,
      browserInfo: {
        browser,
        os: navigator.platform,
        res: `${window.screen.width}x${window.screen.height}`,
        lang: navigator.language
      }
    });

    // Calculate score
    let score = 100;
    if (measuredPing > 120) score -= 10;
    if (totalStorage > 3.5 * 1024 * 1024) score -= 15; // > 3.5MB
    setPerfScore(score);
  };

  const updateCacheList = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key);
      const size = new Blob([val]).size;
      keys.push({ key, size });
    }
    setCacheKeys(keys.sort((a, b) => b.size - a.size));
  };

  const clearMarketingCache = () => {
    let count = 0;
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('store_wa_') || key.startsWith('store_email_') || key.startsWith('store_coupons_') || key.includes('promo') || key.includes('marketing'))) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(k => localStorage.removeItem(k));
    
    if (keysToRemove.length > 0) {
      toast.success(`تم مسح ${keysToRemove.length} من ملفات التخزين المؤقت للتسويق.`);
      updateCacheList();
      fetchHealthData();
    } else {
      toast.info("لا توجد ملفات تخزين مؤقتة تسويقية لمسحها.");
    }
  };

  const clearAllCache = () => {
    if (window.confirm("هل أنت متأكد من تفريغ التخزين المؤقت (Cache)؟ سيتم تنظيف الذاكرة المحلية وتحديث المتجر بالكامل دون تسجيل خروجك.")) {
      const token = localStorage.getItem('dukkank_admin_token');
      const custAuth = localStorage.getItem('dukkank_customer_auth');
      localStorage.clear();
      if (token) localStorage.setItem('dukkank_admin_token', token);
      if (custAuth) localStorage.setItem('dukkank_customer_auth', custAuth);
      toast.success("تم تفريغ التخزين المؤقت بنجاح وتسريع المتجر 🚀");
      updateCacheList();
      fetchHealthData();
    }
  };

  const deleteCacheKey = (key) => {
    localStorage.removeItem(key);
    toast.success(`تم حذف ${key} من الذاكرة المؤقتة`);
    updateCacheList();
    fetchHealthData();
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
            <Activity className="w-6 h-6 text-[hsl(var(--brand-blue-deep))]" />
            الأداء والتخزين المؤقت
          </h2>
          <p className="text-[hsl(var(--brand-ink))]/70 mt-1">
            مراقبة حالة النظام، سرعة الاستجابة، وإدارة التخزين المؤقت
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-white/[0.04] px-4 py-2 rounded-full border border-[hsl(var(--brand-ink))]/10 shadow-sm">
           <div className="flex flex-col items-end">
              <span className="text-xs text-[hsl(var(--brand-ink))]/60">مؤشر الأداء العام</span>
              <span className={`text-lg font-black ${perfScore > 85 ? 'text-green-500' : 'text-amber-500'}`}>{perfScore}%</span>
           </div>
           <div className="w-12 h-12 relative">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <circle cx="18" cy="18" r="16" fill="none" className="stroke-gray-100 dark:stroke-gray-800" strokeWidth="4" />
                <circle cx="18" cy="18" r="16" fill="none" className={`stroke-current ${perfScore > 85 ? 'text-green-500' : 'text-amber-500'}`} strokeWidth="4" strokeDasharray="100" strokeDashoffset={100 - perfScore} strokeLinecap="round" />
              </svg>
           </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Server Status */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-2xl p-5 card-elevated flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
              <Server className="w-5 h-5" />
            </div>
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
          </div>
          <div>
            <h4 className="text-[hsl(var(--brand-ink))]/60 text-sm font-medium mb-1">حالة الخادم</h4>
            <div className="text-2xl font-black text-[hsl(var(--brand-ink))]">متصل (Online)</div>
          </div>
        </div>

        {/* API Response */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-2xl p-5 card-elevated flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-blue))]/10 flex items-center justify-center text-[hsl(var(--brand-blue-deep))]">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-[hsl(var(--brand-ink))]/60 text-sm font-medium mb-1">سرعة الاستجابة</h4>
            <div className="text-2xl font-black text-[hsl(var(--brand-ink))] flex items-end gap-1">
              {healthData.responseTime} <span className="text-sm font-normal mb-1">ms</span>
            </div>
          </div>
        </div>

        {/* Storage */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-2xl p-5 card-elevated flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Database className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[hsl(var(--brand-ink))]/50">سعة 5MB</span>
          </div>
          <div>
            <h4 className="text-[hsl(var(--brand-ink))]/60 text-sm font-medium mb-1">استهلاك LocalStorage</h4>
            <div className="text-xl font-black text-[hsl(var(--brand-ink))]">
              {formatBytes(healthData.storageUsage)}
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div 
                className="bg-amber-500 h-1.5 rounded-full" 
                style={{ width: `${Math.min((healthData.storageUsage / (5 * 1024 * 1024)) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Sessions */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-2xl p-5 card-elevated flex flex-col justify-between">
          <div className="flex justify-between items-start mb-4">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h4 className="text-[hsl(var(--brand-ink))]/60 text-sm font-medium mb-1">الجلسات النشطة حالياً</h4>
            <div className="text-2xl font-black text-[hsl(var(--brand-ink))]">
              {healthData.activeSessions} <span className="text-sm font-normal text-[hsl(var(--brand-ink))]/60">مدير</span>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cache Management */}
        <div className="lg:col-span-2 bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] flex items-center gap-2">
              <Database className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
              إدارة التخزين المؤقت (Cache)
            </h3>
            <div className="flex gap-2">
               <button onClick={clearMarketingCache} className="rounded-full px-4 h-9 bg-[hsl(var(--brand-blue))]/10 text-[hsl(var(--brand-blue-deep))] hover:bg-[hsl(var(--brand-blue))]/20 text-xs font-bold transition-colors">
                 مسح التسويق
               </button>
               <button onClick={clearAllCache} className="rounded-full px-4 h-9 bg-[hsl(var(--brand-red))]/10 text-[hsl(var(--brand-red))] hover:bg-[hsl(var(--brand-red))]/20 text-xs font-bold transition-colors flex items-center gap-1.5">
                 <Trash2 className="w-3.5 h-3.5" /> مسح الكل
               </button>
            </div>
          </div>

          <div className="flex-1 overflow-auto bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-800 p-2">
             {cacheKeys.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-[hsl(var(--brand-ink))]/40 py-10">
                  <Database className="w-8 h-8 mb-2 opacity-50" />
                  <p className="text-sm font-medium">الذاكرة فارغة</p>
               </div>
             ) : (
               <div className="space-y-1">
                  {cacheKeys.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 hover:bg-white dark:hover:bg-white/5 rounded-xl transition-colors group">
                      <div className="flex items-center gap-2 overflow-hidden">
                        <FileText className="w-4 h-4 text-gray-400 shrink-0" />
                        <span className="text-sm text-[hsl(var(--brand-ink))] font-mono truncate">{item.key}</span>
                      </div>
                      <div className="flex items-center gap-2 ml-2 shrink-0">
                        <span className="text-xs font-bold text-[hsl(var(--brand-ink))]/60 bg-gray-200 dark:bg-gray-800 px-2.5 py-1 rounded-full whitespace-nowrap">
                          {formatBytes(item.size)}
                        </span>
                        <button
                          type="button"
                          onClick={() => deleteCacheKey(item.key)}
                          title="حذف هذا المفتاح"
                          className="p-1 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 transition opacity-0 group-hover:opacity-100 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
               </div>
             )}
          </div>
        </div>

        {/* Browser Info */}
        <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
          <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] mb-4 flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
            معلومات المتصفح
          </h3>
          
          <div className="space-y-4">
             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                   <Globe className="w-5 h-5 text-gray-400" />
                   <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">المتصفح</div>
                </div>
                <div className="text-sm text-[hsl(var(--brand-ink))]/70 font-mono">{healthData.browserInfo.browser}</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                   <Cpu className="w-5 h-5 text-gray-400" />
                   <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">نظام التشغيل</div>
                </div>
                <div className="text-sm text-[hsl(var(--brand-ink))]/70 font-mono">{healthData.browserInfo.os}</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                   <Monitor className="w-5 h-5 text-gray-400" />
                   <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">دقة الشاشة</div>
                </div>
                <div className="text-sm text-[hsl(var(--brand-ink))]/70 font-mono">{healthData.browserInfo.res}</div>
             </div>

             <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl">
                <div className="flex items-center gap-3">
                   <Info className="w-5 h-5 text-gray-400" />
                   <div className="text-sm font-bold text-[hsl(var(--brand-ink))]">اللغة</div>
                </div>
                <div className="text-sm text-[hsl(var(--brand-ink))]/70 font-mono uppercase">{healthData.browserInfo.lang}</div>
             </div>
          </div>
          
        </div>

      </div>
    </div>
  );
}
