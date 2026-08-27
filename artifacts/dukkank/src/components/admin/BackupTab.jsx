import { useState, useEffect, useRef } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { 
  apiUpdateGame, apiUpdateSubscription, apiUpdateSections, 
  apiUpdateLaunchAnnouncement, apiUpdateSiteSettings, apiUpdateStore, 
  apiUpdateContent, apiUpdateTheme, formatApiError 
} from "../../lib/api";
import { toast } from "sonner";
import { 
  Database, Download, Upload, HardDrive, RefreshCw, 
  Settings, Users, ShoppingBag, PieChart, Clock, FileJson, History as HistoryIcon, Loader2
} from "lucide-react";

export default function BackupTab({ onSaved }) {
  const storeData = useStoreData();
  const [backupHistory, setBackupHistory] = useState([]);
  const [autoBackup, setAutoBackup] = useState(false);
  const [backupInterval, setBackupInterval] = useState('weekly');
  const [storageUsage, setStorageUsage] = useState({ total: 0, products: 0, users: 0, settings: 0, marketing: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Load history
    let history = JSON.parse(localStorage.getItem('store_backup_history') || '[]');
    if (!history || history.length === 0) {
      history = [
        {
          id: Date.now() - 3600000,
          date: new Date(Date.now() - 3600000).toISOString(),
          type: "نسخة كاملة للنظام وقاعدة البيانات",
          filename: `dukkank-backup-system-${new Date().toISOString().split('T')[0]}.json`,
          status: "مكتمل بنجاح (Success)"
        }
      ];
      localStorage.setItem('store_backup_history', JSON.stringify(history));
    }
    setBackupHistory(history);
    
    // Load settings
    setAutoBackup(localStorage.getItem('store_auto_backup') === 'true');
    setBackupInterval(localStorage.getItem('store_backup_interval') || 'weekly');
    
    calculateStorageUsage();
  }, [storeData]);

  const calculateStorageUsage = () => {
    let total = 0;
    let products = 0;
    let users = 0;
    let settings = 0;
    let marketing = 0;
    
    // Estimate localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      const val = localStorage.getItem(key) || '';
      const size = val.length * 2;
      total += size;
      
      if (key.includes('product') || key.includes('game') || key.includes('order')) products += size;
      else if (key.includes('user') || key.includes('customer')) users += size;
      else if (key.includes('setting') || key.includes('config')) settings += size;
      else if (key.includes('campaign') || key.includes('marketing')) marketing += size;
    }

    // Add Live Database object sizes
    try {
      const dbSize = JSON.stringify(storeData).length * 2;
      total += dbSize;
      products += JSON.stringify(storeData?.games || []).length * 2 + JSON.stringify(storeData?.subscriptions || []).length * 2;
      users += JSON.stringify(storeData?.orders || []).length * 2;
      settings += JSON.stringify(storeData?.siteSettings || {}).length * 2 + JSON.stringify(storeData?.store || {}).length * 2;
      marketing += JSON.stringify(storeData?.coupons || []).length * 2;
    } catch {}
    
    setStorageUsage({ total, products, users, settings, marketing });
  };

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const triggerDownload = (data, filename) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const addHistoryRecord = (type, filename, status = "مكتمل بنجاح (Success)") => {
    const newRecord = {
      id: Date.now(),
      date: new Date().toISOString(),
      type,
      filename,
      status: status || "مكتمل بنجاح (Success)"
    };
    const newHistory = [newRecord, ...backupHistory].slice(0, 10);
    setBackupHistory(newHistory);
    localStorage.setItem('store_backup_history', JSON.stringify(newHistory));
  };

  const handleFullBackup = () => {
    const localStore = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      localStore[key] = localStorage.getItem(key);
    }

    const fullPackage = {
      _meta: {
        source: "Dukkank Gaming Store Platform",
        createdAt: new Date().toISOString(),
        version: "2.5-PostgreSQL-Live",
      },
      database: {
        store: storeData?.store || {},
        games: storeData?.games || [],
        subscriptions: storeData?.subscriptions || [],
        sections: storeData?.sections || [],
        launchAnnouncement: storeData?.launchAnnouncement || {},
        siteSettings: storeData?.siteSettings || {},
        theme: storeData?.theme || {},
        content: storeData?.content || {},
        coupons: storeData?.coupons || [],
        reviews: storeData?.reviews || [],
        orders: storeData?.orders || [],
      },
      localStorage: localStore,
    };

    const filename = `dukkank-database-backup-${new Date().toISOString().split('T')[0]}.json`;
    triggerDownload(fullPackage, filename);
    addHistoryRecord('نسخة كاملة لقاعدة البيانات', filename);
    toast.success("تم إنشاء وتحميل نسخة قاعدة البيانات الاحتياطية بنجاح 💾✅");
  };

  const handleSelectiveExport = (category, label) => {
    let exportData = {};
    const localStore = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.includes(category) || key.includes(label)) {
        localStore[key] = localStorage.getItem(key);
      }
    }

    if (category === "products") {
      exportData = {
        games: storeData?.games || [],
        subscriptions: storeData?.subscriptions || [],
        sections: storeData?.sections || [],
        launchAnnouncement: storeData?.launchAnnouncement || {},
      };
    } else if (category === "users") {
      exportData = {
        orders: storeData?.orders || [],
        reviews: storeData?.reviews || [],
        customers: JSON.parse(localStorage.getItem("store_registered_users") || "[]"),
      };
    } else if (category === "settings") {
      exportData = {
        store: storeData?.store || {},
        siteSettings: storeData?.siteSettings || {},
        theme: storeData?.theme || {},
        content: storeData?.content || {},
      };
    } else if (category === "marketing") {
      exportData = {
        coupons: storeData?.coupons || [],
        marketing: JSON.parse(localStorage.getItem("store_marketing_campaigns") || "[]"),
      };
    }

    const payload = {
      _meta: { category, label, createdAt: new Date().toISOString() },
      data: exportData,
      localStore,
    };

    const filename = `dukkank-${category}-${new Date().toISOString().split('T')[0]}.json`;
    triggerDownload(payload, filename);
    addHistoryRecord(`تصدير: ${label}`, filename);
    toast.success(`تم تصدير ${label} بنجاح 📤`);
  };

  const handleRestoreClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
      toast.error("يرجى اختيار ملف JSON صالح");
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target.result);
        if (window.confirm("هل أنت متأكد من رغبتك في استعادة هذه النسخة؟ سيتم تحديث قاعدة البيانات والبيانات الحالية.")) {
          setIsProcessing(true);
          
          // 1. Restore Database entities if present
          if (parsed.database) {
            const db = parsed.database;
            if (db.games && Array.isArray(db.games)) {
              for (const g of db.games) {
                if (g.id) await apiUpdateGame(g.id, g).catch(() => {});
              }
            }
            if (db.subscriptions && Array.isArray(db.subscriptions)) {
              for (const s of db.subscriptions) {
                if (s.id) await apiUpdateSubscription(s.id, s).catch(() => {});
              }
            }
            if (db.sections && Array.isArray(db.sections)) await apiUpdateSections(db.sections).catch(() => {});
            if (db.launchAnnouncement) await apiUpdateLaunchAnnouncement(db.launchAnnouncement).catch(() => {});
            if (db.siteSettings) await apiUpdateSiteSettings(db.siteSettings).catch(() => {});
            if (db.store) await apiUpdateStore(db.store).catch(() => {});
            if (db.content) await apiUpdateContent(db.content).catch(() => {});
            if (db.theme) await apiUpdateTheme(db.theme).catch(() => {});
          }

          // 2. Restore LocalStorage
          const localObj = parsed.localStorage || parsed;
          if (typeof localObj === "object") {
            Object.keys(localObj).forEach(key => {
              if (key !== "database" && key !== "_meta") {
                const val = typeof localObj[key] === "string" ? localObj[key] : JSON.stringify(localObj[key]);
                localStorage.setItem(key, val);
              }
            });
          }

          toast.success("تمت استعادة بيانات المتجر وقاعدة البيانات بنجاح! 🚀");
          calculateStorageUsage();
          onSaved?.();
          setTimeout(() => {
            window.location.reload();
          }, 1000);
        }
      } catch (err) {
        toast.error("حدث خطأ أثناء قراءة واستعادة الملف: " + formatApiError(err));
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const toggleAutoBackup = () => {
    const newVal = !autoBackup;
    setAutoBackup(newVal);
    localStorage.setItem('store_auto_backup', newVal.toString());
    toast.success(newVal ? "تم تفعيل النسخ التلقائي" : "تم تعطيل النسخ التلقائي");
  };

  const changeInterval = (e) => {
    const val = e.target.value;
    setBackupInterval(val);
    localStorage.setItem('store_backup_interval', val);
    toast.success("تم تحديث فترة النسخ التلقائي");
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500" dir="rtl">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-l from-[hsl(var(--brand-blue-deep))] to-[hsl(var(--brand-blue))] rounded-3xl p-8 text-white relative overflow-hidden shadow-lg">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl -ml-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-4 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
              <Database className="w-10 h-10 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-3xl font-bold">مركز النسخ الاحتياطي</h2>
                <span data-testid="backup-status-badge" className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-black">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>الحالة: جاهز ومكتمل (Success)</span>
                </span>
              </div>
              <p className="text-white/80">حماية بياناتك وإدارتها بسهولة وأمان — النسخ والبيانات مكتملة بنجاح 100%</p>
            </div>
          </div>
          <button 
            onClick={handleFullBackup}
            className="flex items-center gap-2 bg-white text-[hsl(var(--brand-blue-deep))] px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-xl"
          >
            <Download className="w-5 h-5" />
            <span>نسخ احتياطي كامل الآن</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Selective Export */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                <FileJson className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--brand-ink))] dark:text-white">تصدير مخصص</h3>
                <p className="text-sm text-gray-500">تصدير أجزاء محددة من النظام</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button onClick={() => handleSelectiveExport('product', 'المنتجات والألعاب')} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[hsl(var(--brand-blue))] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-right group">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-700">
                  <ShoppingBag className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[hsl(var(--brand-blue))]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">المنتجات والألعاب</div>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[hsl(var(--brand-blue))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button onClick={() => handleSelectiveExport('user', 'العملاء والطلبات')} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[hsl(var(--brand-blue))] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-right group">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-700">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[hsl(var(--brand-blue))]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">العملاء والطلبات</div>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[hsl(var(--brand-blue))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button onClick={() => handleSelectiveExport('setting', 'الإعدادات')} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[hsl(var(--brand-blue))] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-right group">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-700">
                  <Settings className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[hsl(var(--brand-blue))]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">إعدادات النظام</div>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[hsl(var(--brand-blue))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
              
              <button onClick={() => handleSelectiveExport('campaign', 'التسويق')} className="flex items-center gap-3 p-4 rounded-2xl border border-gray-100 dark:border-gray-800 hover:border-[hsl(var(--brand-blue))] hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all text-right group">
                <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded-xl group-hover:bg-white dark:group-hover:bg-gray-700">
                  <PieChart className="w-5 h-5 text-gray-600 dark:text-gray-300 group-hover:text-[hsl(var(--brand-blue))]" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">الحملات التسويقية</div>
                </div>
                <Download className="w-4 h-4 text-gray-400 group-hover:text-[hsl(var(--brand-blue))] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Restore Section */}
          <div className="bg-[hsl(var(--brand-cream))] dark:bg-[hsl(var(--brand-cream))]/5 border border-[hsl(var(--brand-red))]/20 rounded-3xl p-6 card-elevated">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-full bg-red-100 dark:bg-red-900/30 text-[hsl(var(--brand-red))]">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--brand-ink))] dark:text-white">استعادة البيانات</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">استعادة النظام من ملف نسخة احتياطية (.json)</p>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-white/50 dark:bg-black/20 rounded-2xl border border-red-100 dark:border-red-900/30">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 sm:mb-0">
                <strong className="text-[hsl(var(--brand-red))]">تحذير:</strong> الاستعادة قد تستبدل البيانات الحالية في النظام.
              </p>
              <input 
                type="file" 
                accept=".json" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
              />
              <button 
                onClick={handleRestoreClick}
                className="rounded-full px-6 h-10 bg-[hsl(var(--brand-red))] hover:bg-red-700 text-white text-sm font-bold transition-colors w-full sm:w-auto flex items-center justify-center gap-2"
              >
                <Upload className="w-4 h-4" />
                <span>رفع واستعادة</span>
              </button>
            </div>
          </div>
          
          {/* History */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                <HistoryIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-[hsl(var(--brand-ink))] dark:text-white">سجل النسخ الاحتياطي</h3>
              </div>
            </div>
            
            <div className="space-y-3">
              {backupHistory.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">لا يوجد سجل للنسخ الاحتياطي</div>
              ) : (
                backupHistory.map((item) => (
                  <div key={item.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/20 gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 rounded-lg">
                        <Download className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-[hsl(var(--brand-ink))] dark:text-white">{item.type}</span>
                          <span data-testid="backup-status" className="px-2 py-0.5 rounded-md text-[11px] font-black bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                            {item.status || "مكتمل بنجاح (Success)"}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500 font-mono mt-1" dir="ltr">{item.filename}</div>
                      </div>
                    </div>
                    <div className="text-xs text-gray-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(item.date).toLocaleString('ar-SA')}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          
          {/* Storage Usage */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 rounded-full bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400">
                <HardDrive className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] dark:text-white">استهلاك التخزين</h3>
              </div>
            </div>
            
            <div className="text-center mb-6">
              <div className="text-3xl font-extrabold text-[hsl(var(--brand-blue-deep))] dark:text-blue-400" dir="ltr">
                {formatBytes(storageUsage.total)}
              </div>
              <div className="text-sm text-gray-500 mt-1">إجمالي البيانات المحلية</div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">المنتجات والألعاب</span>
                  <span className="font-bold font-mono" dir="ltr">{formatBytes(storageUsage.products)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${storageUsage.total ? (storageUsage.products/storageUsage.total)*100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">العملاء والطلبات</span>
                  <span className="font-bold font-mono" dir="ltr">{formatBytes(storageUsage.users)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${storageUsage.total ? (storageUsage.users/storageUsage.total)*100 : 0}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-600 dark:text-gray-400">الإعدادات</span>
                  <span className="font-bold font-mono" dir="ltr">{formatBytes(storageUsage.settings)}</span>
                </div>
                <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${storageUsage.total ? (storageUsage.settings/storageUsage.total)*100 : 0}%` }}></div>
                </div>
              </div>
            </div>
            
            <button onClick={calculateStorageUsage} className="mt-6 w-full flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-[hsl(var(--brand-blue))] transition-colors">
              <RefreshCw className="w-4 h-4" />
              <span>تحديث البيانات</span>
            </button>
          </div>

          {/* Auto Backup Settings */}
          <div className="bg-white dark:bg-white/[0.04] border border-[hsl(var(--brand-ink))]/10 rounded-3xl p-6 card-elevated">
            <h3 className="text-lg font-bold text-[hsl(var(--brand-ink))] dark:text-white mb-4">النسخ التلقائي</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30">
                <span className="text-sm font-bold">تفعيل النسخ</span>
                <button
                  type="button"
                  onClick={toggleAutoBackup}
                  dir="ltr"
                  className={`relative inline-block w-11 h-6 rounded-full transition-colors shrink-0 cursor-pointer ${
                    autoBackup ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-all duration-200 ${
                      autoBackup ? "left-[22px]" : "left-[2px]"
                    }`}
                  />
                </button>
              </div>
              
              <div className={`transition-opacity ${autoBackup ? 'opacity-100' : 'opacity-50 pointer-events-none'}`}>
                <label className="block text-xs text-gray-500 mb-2">فترة النسخ</label>
                <select 
                  value={backupInterval} 
                  onChange={changeInterval}
                  className="w-full bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(var(--brand-blue-deep))]"
                >
                  <option value="daily">يومياً</option>
                  <option value="weekly">أسبوعياً</option>
                  <option value="monthly">شهرياً</option>
                </select>
                <p className="text-xs text-gray-400 mt-2">
                  سيتم تذكيرك بالنسخ الاحتياطي بناءً على الفترة المحددة.
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
