// ══════════════════════════════════════════════════════════════════════════════
// ── OrderDukkank v1.0 — Resend Email & WhatsApp Marketing Hub + Template Creator ─
// ══════════════════════════════════════════════════════════════════════════════
import React, { useState, useEffect, useCallback } from "react";
import { useStoreData } from "../../contexts/DataContext";
import {
  apiUpdatePromo, apiListSubscribers, apiDeleteSubscriber,
  apiListOrders, apiSendEmailResend, formatApiError
} from "../../lib/api";
import { toast } from "sonner";
import { lsGet, lsSet } from "../../lib/storage";
import {
  Megaphone, Mail, Send, Zap, Sparkles, Key, CheckCircle2, AlertCircle,
  Copy, RefreshCw, Trash2, Search, Users, Settings, Smartphone, Tag, Eye, EyeOff,
  Loader2, DollarSign, Share2, TicketPercent, Layers, Gift, Clock, Flame, ShieldCheck,
  Heart, User, Phone, Plus, X, Edit3, Save
} from "lucide-react";

// Default Built-in Email Presets
const DEFAULT_EMAIL_PRESETS = [
  {
    id: "welcome",
    title: "🎁 هدية الترحيب بالعميل الجديد",
    subject: "🎁 أهلاً بك في دُكانك! هديتك الترحيبية الخصم 10% بانتظارك",
    code: "WELCOME10",
    discount: 10,
    maxUses: 100,
    body: `أهلاً بك يا بطل في عائلة دُكانك للألعاب والاشتراكات الرقمية! 🎮\n\nكهدية ترحيبية خاصة، استخدم الكود {Code} عند إتمام طلبك للحصول على خصم فوري {Discount}% على كافة الألعاب والاشتراكات.\n\nتسوّق الآن واستمتع بالضمان الذهبي والتسليم الفوري.`
  },
  {
    id: "flash",
    title: "⚡ عروض الفلاش وتخفيض الويكند (20%)",
    subject: "⚡ عرض ويكند حصري! خصم 20% لفترة محدودة جداً",
    code: "WEEKEND20",
    discount: 20,
    maxUses: 50,
    body: `🔥 عرض الفلاش السريع من متجر دُكانك!\n\nاستخدم الكود الخاص {Code} واحصل على خصم {Discount}% على كافة ألعاب البلايستيشن واشتراكات بلس!\n\n⚠️ تذكير: الكود متاح لأول {MaxUses} مستخدم فقط! تسوّق الآن قبل نفاذ العدد.`
  },
  {
    id: "psplus",
    title: "👑 تذكير تجديد بلايستيشن بلس",
    subject: "👑 لا تدع متعتك تتوقف! جدّد اشتراك بلايستيشن بلس بخصم خاص",
    code: "PLUS15",
    discount: 15,
    maxUses: 30,
    body: `مرحباً بك يا غالي 🌟\n\nجدّد اشتراك PlayStation Plus الخاص بك (إكسترا أو فاخر) بأسعار توفيرية مع ضمان كامل طوال فترة الاشتراك.\n\nاستخدم كود التخفيض {Code} للحصول على خصم {Discount}% عند التجديد!`
  },
  {
    id: "newgame",
    title: "🎮 إطلاق وتوفر لعبة جديدة",
    subject: "🎮 لعبة جديدة وصلت المتجر! اطلب نسختك الآن بخصم حصري",
    code: "GAME15",
    discount: 15,
    maxUses: 40,
    body: `خبر عاجل لجميع الجيمرز! 🚀\n\nأحدث إصدارات الألعاب أصبحت متوفرة الآن في متجر دُكانك كحسابات أصلية ومضمونة تسليم فوري.\n\nاحصل على نسختك اليوم واستخدم كود الخصم {Code} خصم {Discount}%!`
  }
];

// Default Built-in WhatsApp Presets
const DEFAULT_WA_PRESETS = [
  {
    id: "cart_rec",
    title: "🛒 استرجاع سلة متروكة",
    badge: "تذكير سلة",
    code: "CART5",
    discount: 5,
    message: "السلام عليكم {CustomerName} 👋\nلاحظنا أنك تركت ألعاب في سلتك بمتجر دُكانك 🎮\nارجع الحين واستخدم كود الخصم الفوري *{Code}* للحصول على خصم 5% وتسليم فوري لحسابك الأصلي!\n\nرابط استكمال الطلب: https://dukkank.com"
  },
  {
    id: "vip_renew",
    title: "👑 تجديد بلايستيشن بلس VIP",
    badge: "تجديد اشتراك",
    code: "RENEW10",
    discount: 10,
    message: "مرحباً {CustomerName} 🌟\nاشتراك PlayStation Plus الخاص بك ينتهي قريباً!\nجدّد الآن كحساب أصلي مضمون مع ضمان ذهبي طوال فترة اللعب واستخدم كود: *{Code}*\n\nرابط التجديد المباشر: https://dukkank.com"
  },
  {
    id: "game_release",
    title: "🚀 إطلاق وتوفر لعبة جديدة",
    badge: "جديد المتجر",
    code: "LAUNCH15",
    discount: 15,
    message: "🔥 خبر عاجل لعشاق الألعاب يا {CustomerName}!\n\nأحدث إصدارات الألعاب أصبحت متوفرة الآن للطلب المباشر بمتجر دُكانك 🎮\nتسليم فوري مع ضمان ذهبي مدى الحياة.\n\nاستخدم كود الخصم: *{Code}*\nاطلب نسختك الآن: https://dukkank.com"
  },
  {
    id: "winback",
    title: "💔 استعادة عميل خامل",
    badge: "عرض خاص",
    code: "BACK15",
    discount: 15,
    message: "أهلاً {CustomerName} 👋\nوحشتنا بمتجر دُكانك 🎮!\nحبينا نهديك عرض خاص بمناسبة رجوعك:\n\n💰 خصم خاص *15%* بكود: *{Code}*\n\nتسوّق أحدث الألعاب الآن: https://dukkank.com"
  }
];

export default function MarketingTab({ onChanged }) {
  const { promo, setPromo } = useStoreData();
  const [activeTab, setActiveTab] = useState("email"); // 'email' | 'whatsapp' | 'promo' | 'settings'

  const toggleCampaign = async (key, name) => {
    const currentVal = promo?.[key]?.enabled !== false;
    const nextVal = !currentVal;
    const newPromo = {
      ...promo,
      [key]: { ...(promo?.[key] || {}), enabled: nextVal }
    };
    setPromo(newPromo);
    try {
      await apiUpdatePromo(newPromo);
      toast.success(nextVal ? `تم تفعيل ${name} بالمتجر بنجاح 🟢` : `تم تعطيل ${name} من المتجر بنجاح 🔴`);
      onChanged?.();
    } catch {
      toast.info(nextVal ? `تم تفعيل ${name} محلياً` : `تم تعطيل ${name} محلياً`);
    }
  };

  // Presets State (Editable & Custom Creatable)
  const [emailPresets, setEmailPresets] = useState(() => lsGet("dukkank_custom_email_templates", DEFAULT_EMAIL_PRESETS));
  const [waPresets, setWaPresets] = useState(() => lsGet("dukkank_custom_wa_templates", DEFAULT_WA_PRESETS));

  // Modal / Creator State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [templateType, setTemplateType] = useState("email"); // 'email' | 'wa'
  const [newTitle, setNewTitle] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [newCode, setNewCode] = useState("");
  const [newDiscount, setNewDiscount] = useState(15);
  const [newMaxUses, setNewMaxUses] = useState(50);
  const [newContent, setNewContent] = useState("");

  // Resend Settings State
  const [resendApiKey, setResendApiKey] = useState(() => lsGet("dukkank_resend_key", ""));
  const [senderEmail, setSenderEmail] = useState(() => lsGet("dukkank_resend_sender", "onboarding@resend.dev"));
  const [showKey, setShowKey] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testingResend, setTestingResend] = useState(false);

  // Email Campaign Composer State
  const [emailSubject, setEmailSubject] = useState("🎁 هدية خاصة من متجر دُكانك — كود خصم 10% أصلية!");
  const [emailAudience, setEmailAudience] = useState("all");
  const [customEmail, setCustomEmail] = useState("");
  const [emailPromoCode, setEmailPromoCode] = useState("DUKKANK10");
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxUses, setMaxUses] = useState(50);
  const [enableAutoCoupon, setEnableAutoCoupon] = useState(true);
  const [emailBody, setEmailBody] = useState(
    `أهلاً بك يا بطل 🎮\n\nيسرنا في متجر دُكانك أن نقدم لك عرضاً استثنائياً على أحدث إصدارات الألعاب واشتراكات PlayStation Plus!\n\nاستخدم الكود الخاص بك {Code} عند إتمام الطلب للحصول على الخصم الفوري {Discount}% المتاح لأول {MaxUses} مستخدم مع ضمان ذهبي شامل وتسليم فوري.`
  );
  const [sendingEmail, setSendingEmail] = useState(false);

  // Subscribers List State
  const [subscribers, setSubscribers] = useState([]);
  const [loadingSubscribers, setLoadingSubscribers] = useState(true);
  const [subscriberSearch, setSubscriberSearch] = useState("");

  // Orders/Customers State for WhatsApp Broadcast Targets
  const [orders, setOrders] = useState([]);
  const [waSearch, setWaSearch] = useState("");

  // WhatsApp State
  const [waMessage, setWaMessage] = useState(
    "السلام عليكم {CustomerName} 👋\nعرض فلاش خاص من متجر *دُكانك* 🎮\nاستخدم كود الخصم: *{Code}* واحصل على تسليم فوري لحسابك الأصلي!\nرابط الشراء: https://dukkank.com"
  );
  const [waCustomerName, setWaCustomerName] = useState("أحمد");
  const [waCustomerPhone, setWaCustomerPhone] = useState("");
  const [waPromoCode, setWaPromoCode] = useState("DUKKANK10");

  // Save Template Lists to localStorage
  const saveEmailPresets = (newList) => {
    setEmailPresets(newList);
    lsSet("dukkank_custom_email_templates", newList);
  };
  const saveWaPresets = (newList) => {
    setWaPresets(newList);
    lsSet("dukkank_custom_wa_templates", newList);
  };

  // Add Custom Template
  const handleSaveCustomTemplate = (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("يرجى ملء اسم القالب ونصه على الأقل");
      return;
    }

    if (templateType === "email") {
      const item = {
        id: "tpl_email_" + Date.now(),
        title: newTitle.trim(),
        subject: newSubject.trim() || newTitle.trim(),
        code: (newCode.trim() || "SPECIAL").toUpperCase(),
        discount: Number(newDiscount) || 10,
        maxUses: Number(newMaxUses) || 50,
        body: newContent.trim()
      };
      const updated = [item, ...emailPresets];
      saveEmailPresets(updated);
      toast.success("تم إنشاء وحفظ قالب الإيميل الخاص بك بنجاح 🎉!");
    } else {
      const item = {
        id: "tpl_wa_" + Date.now(),
        title: newTitle.trim(),
        badge: "قالب مخصص",
        code: (newCode.trim() || "SPECIAL").toUpperCase(),
        discount: Number(newDiscount) || 10,
        message: newContent.trim()
      };
      const updated = [item, ...waPresets];
      saveWaPresets(updated);
      toast.success("تم إنشاء وحفظ قالب الواتساب الخاص بك بنجاح 🎉!");
    }

    // Reset & close modal
    setNewTitle("");
    setNewSubject("");
    setNewCode("");
    setNewDiscount(15);
    setNewMaxUses(50);
    setNewContent("");
    setShowCreateModal(false);
  };

  // Delete Custom Template
  const handleDeleteTemplate = (id, type) => {
    if (type === "email") {
      const updated = emailPresets.filter(p => p.id !== id);
      saveEmailPresets(updated);
      toast.success("تم حذف القالب");
    } else {
      const updated = waPresets.filter(p => p.id !== id);
      saveWaPresets(updated);
      toast.success("تم حذف القالب");
    }
  };

  // Apply Email Preset
  const applyEmailPreset = (preset) => {
    setEmailSubject(preset.subject);
    setEmailPromoCode(preset.code);
    setDiscountPercent(preset.discount);
    setMaxUses(preset.maxUses || 50);
    setEmailBody(preset.body);
    toast.success(`تم تطبيق قالب البريد (${preset.title}) 📋!`);
  };

  // Apply WhatsApp Preset
  const applyWaPreset = (preset) => {
    setWaMessage(preset.message);
    setWaPromoCode(preset.code);
    toast.success(`تم تطبيق قالب الواتساب (${preset.title}) 📲!`);
  };

  // Save Resend Settings
  const saveResendSettings = () => {
    lsSet("dukkank_resend_key", resendApiKey);
    lsSet("dukkank_resend_sender", senderEmail);
    toast.success("تم حفظ إعدادات Resend API بنجاح ✅");
  };

  // Fetch Subscribers & Orders
  const fetchData = useCallback(async () => {
    setLoadingSubscribers(true);
    try {
      const [subsList, ordersList] = await Promise.all([
        apiListSubscribers().catch(() => []),
        apiListOrders().catch(() => []),
      ]);
      setSubscribers(Array.isArray(subsList) ? subsList : []);
      setOrders(Array.isArray(ordersList) ? ordersList : []);
    } catch (e) {
      setSubscribers([
        { id: 1, email: "ahmed.customer@gmail.com", created_at: new Date().toISOString() },
        { id: 2, email: "gamer.pro.jordan@yahoo.com", created_at: new Date(Date.now() - 86400000).toISOString() },
      ]);
    } finally {
      setLoadingSubscribers(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle Resend Email Dispatch
  const handleSendResendEmail = async (targetEmailsOverride = null) => {
    let targetList = [];

    if (targetEmailsOverride) {
      targetList = Array.isArray(targetEmailsOverride) ? targetEmailsOverride : [targetEmailsOverride];
    } else if (emailAudience === "custom") {
      if (!customEmail.trim()) {
        toast.error("يرجى كتابة البريد الإلكتروني المستهدف");
        return;
      }
      targetList = [customEmail.trim()];
    } else if (emailAudience === "subscribers") {
      targetList = subscribers.map((s) => s.email).filter(Boolean);
      if (targetList.length === 0) {
        toast.error("لا يوجد مشتركين في القائمة للإرسال لهم");
        return;
      }
    } else {
      const subEmails = subscribers.map((s) => s.email).filter(Boolean);
      targetList = subEmails.length > 0 ? subEmails : ["customer.demo@dukkank.com"];
    }

    setSendingEmail(true);
    try {
      const finalBody = emailBody
        .replace(/\{Code\}/g, emailPromoCode || "DUKKANK10")
        .replace(/\{Discount\}/g, String(discountPercent || 10))
        .replace(/\{MaxUses\}/g, String(maxUses || 50));

      const payload = {
        resendApiKey,
        from: senderEmail,
        to: targetList,
        subject: emailSubject,
        bodyText: finalBody,
        autoCoupon: enableAutoCoupon
          ? {
              code: emailPromoCode,
              discountPercent: discountPercent,
              maxUses: maxUses,
            }
          : null,
      };

      const res = await apiSendEmailResend(payload);

      if (res.ok) {
        let desc = "";
        if (res.couponCreated) {
          desc += `🎟️ ${res.couponCreated}`;
        }
        toast.success(`🚀 ${res.message}`, { description: desc || undefined });
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setSendingEmail(false);
    }
  };

  // Test Resend Connection
  const handleTestResend = async () => {
    if (!testEmail.trim()) {
      toast.error("أدخل بريدك الإلكتروني لإرسال رسالة تجريبية");
      return;
    }
    setTestingResend(true);
    try {
      const res = await apiSendEmailResend({
        resendApiKey,
        from: senderEmail,
        to: testEmail.trim(),
        subject: "⚡ تجربة اتصال Resend API — متجر دُكانك",
        bodyText: "تهانينا! اتصال Resend API يعمل بنجاح ويمكنك الآن إرسال الحملات التسويقية لجميع الزبائن بضغطة زر واحدة 🚀",
      });

      if (res.ok) {
        toast.success(`✅ نجحت تجربة الإرسال بنجاح إلى (${testEmail})!`);
      }
    } catch (err) {
      toast.error(formatApiError(err));
    } finally {
      setTestingResend(false);
    }
  };

  // Launch WhatsApp Web Dispatch for a specific customer
  const launchWhatsAppWebForCustomer = (phone, name) => {
    if (!phone) {
      toast.error("لا يوجد رقم هاتف مسجل لهذا الزبون");
      return;
    }
    const cleanMsg = waMessage
      .replace(/\{CustomerName\}/g, name || "العميل")
      .replace(/\{Code\}/g, waPromoCode || "DUKKANK10");
    const encoded = encodeURIComponent(cleanMsg);
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, "_blank");
    toast.success(`تم فتح واتساب وتخصيص الرسالة لـ (${name || phone}) 📲`);
  };

  // Launch WhatsApp Web for direct test phone
  const launchWhatsAppWeb = () => {
    if (!waCustomerPhone.trim()) {
      toast.error("أدخل رقم هاتف العميل بالرمز الدولي");
      return;
    }
    launchWhatsAppWebForCustomer(waCustomerPhone, waCustomerName);
  };

  const filteredSubscribers = subscribers.filter((s) =>
    s.email && s.email.toLowerCase().includes(subscriberSearch.toLowerCase())
  );

  // Extract unique customer list from orders
  const uniqueCustomersMap = new Map();
  orders.forEach((o) => {
    const phone = o.customer_phone || o.contact_whatsapp;
    if (phone && !uniqueCustomersMap.has(phone)) {
      uniqueCustomersMap.set(phone, {
        name: o.customer_name || "زبون دُكانك",
        phone: phone,
        lastOrder: o.game_name || o.subscription_type || o.product_type,
        date: o.created_at
      });
    }
  });
  const customerList = Array.from(uniqueCustomersMap.values()).filter((c) =>
    c.name.toLowerCase().includes(waSearch.toLowerCase()) || c.phone.includes(waSearch)
  );

  return (
    <div className="space-y-6 text-right dir-rtl" dir="rtl">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl border border-white/10 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Megaphone className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-black flex items-center gap-2">
              <span>مركز الحملات التسويقية ومنشئ القوالب المخصصة</span>
              <Sparkles className="w-5 h-5 text-amber-400" />
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              أنشئ قوالبك الخاصة أو اختر من القوالب الجاهزة وأرسل حملاتك عبر Resend والواتساب بنقرة واحدة
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setTemplateType(activeTab === "whatsapp" ? "wa" : "email");
              setShowCreateModal(true);
            }}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>إنشاء قالب مخصص جديد 🎨</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2 overflow-x-auto">
        {[
          { key: "email", label: "📧 إرسال البريد الإلكتروني (Resend)", icon: Mail },
          { key: "whatsapp", label: "📱 حملات الواتساب والإرسال المباشر", icon: Smartphone },
          { key: "promo", label: "🎟️ بنر الخصم والتخفيضات", icon: Tag },
          { key: "settings", label: "⚙️ إعدادات المفاتيح و Resend", icon: Settings },
        ].map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-xs font-black transition-all shrink-0 cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25"
                  : "bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 1: RESEND EMAIL MARKETING ──────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "email" && (
        <div className="space-y-6">
          {/* Preset & Custom Template Selector Bar */}
          <div className="bg-slate-900/90 text-white p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> قوالب البريد المتاحة ({emailPresets.length}):
              </span>
              <button
                type="button"
                onClick={() => { setTemplateType("email"); setShowCreateModal(true); }}
                className="text-[11px] text-amber-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> صمّم قالب إيميل جديد خاص بك
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {emailPresets.map((p) => (
                <div key={p.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => applyEmailPreset(p)}
                    className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-right flex flex-col justify-between space-y-2 transition cursor-pointer group-hover:border-amber-400/50"
                  >
                    <div className="text-xs font-black text-white group-hover:text-amber-400 transition truncate pl-5">{p.title}</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-amber-400 font-bold">{p.code}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">خصم {p.discount}%</span>
                    </div>
                  </button>

                  {/* Delete button if custom */}
                  {p.id.startsWith("tpl_") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(p.id, "email")}
                      className="absolute top-2 left-2 p-1 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="حذف القالب"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Email Composer Form (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-4 h-4 text-blue-500" />
                  <span>محرر البريد وإنشاء الكوبون الآلي (Resend Email Dispatcher)</span>
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان البريد الإلكتروني (Subject Line) *</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="مثال: 🎁 خصم خاص لعشاق الألعاب اليوم!"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الجمهور المستهدف (Target Audience)</label>
                    <select
                      value={emailAudience}
                      onChange={(e) => setEmailAudience(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white"
                    >
                      <option value="all">🌐 جميع المشتركين المسجلين في المتجر</option>
                      <option value="subscribers">📧 قائمة النشرة البريدية فقط</option>
                      <option value="custom">🎯 إيميل مخصص معين</option>
                    </select>
                  </div>

                  {emailAudience === "custom" ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">البريد الإلكتروني المستهدف</label>
                      <input
                        type="email"
                        value={customEmail}
                        onChange={(e) => setCustomEmail(e.target.value)}
                        placeholder="customer@example.com"
                        dir="ltr"
                        className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono text-slate-900 dark:text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">معدل الحجم التقديري</label>
                      <div className="h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center">
                        سيتم الإرسال لـ {subscribers.length} زبون ومُشترك 🚀
                      </div>
                    </div>
                  )}
                </div>

                {/* Auto Coupon Creation Section */}
                <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-black text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <TicketPercent className="w-4 h-4" /> تفعيل وإنشاء كود خصم تلقائي للمتجر مع الحملة
                    </label>
                    <input
                      type="checkbox"
                      checked={enableAutoCoupon}
                      onChange={(e) => setEnableAutoCoupon(e.target.checked)}
                      className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                    />
                  </div>

                  {enableAutoCoupon && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div>
                        <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">رمز الكود (Code)</label>
                        <input
                          type="text"
                          value={emailPromoCode}
                          onChange={(e) => setEmailPromoCode(e.target.value.toUpperCase())}
                          placeholder="OFF20"
                          className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-black font-mono text-amber-600 dir-ltr text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">نسبة الخصم %</label>
                        <input
                          type="number"
                          min="1"
                          max="99"
                          value={discountPercent}
                          onChange={(e) => setDiscountPercent(parseInt(e.target.value) || 0)}
                          placeholder="20%"
                          className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-black text-emerald-600 dir-ltr text-right"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">حد الاستخدام الأقصى 🎯</label>
                        <input
                          type="number"
                          min="1"
                          value={maxUses}
                          onChange={(e) => setMaxUses(parseInt(e.target.value) || 0)}
                          placeholder="50"
                          className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-black text-blue-600 dir-ltr text-right"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">محتوى نص البريد الإلكتروني</label>
                  <textarea
                    rows={6}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-medium leading-relaxed text-slate-900 dark:text-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 font-bold">
                  المُرسل: <span className="font-mono text-slate-600 dark:text-slate-300 dir-ltr inline-block">{senderEmail}</span>
                </span>

                <button
                  type="button"
                  disabled={sendingEmail || !emailSubject.trim()}
                  onClick={() => handleSendResendEmail()}
                  className="px-6 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>إرسال وتفعيل الكود عبر Resend API 🚀</span>
                </button>
              </div>
            </div>

            {/* Email Preview & Live Subscriber List (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Live Email Preview Card */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-4 shadow-md">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <span className="text-xs font-black text-amber-400 flex items-center gap-1.5">
                    <Eye className="w-4 h-4" /> معاينة الرسالة كما تصل للصندوق
                  </span>
                  <span className="text-[10px] bg-slate-800 px-2.5 py-1 rounded-full text-slate-400 font-mono dir-ltr">
                    Resend Live
                  </span>
                </div>

                <div className="bg-white text-slate-900 p-5 rounded-2xl space-y-3 font-sans shadow-inner">
                  <div className="border-b border-slate-100 pb-2">
                    <div className="text-[10px] text-slate-400 font-bold">الموضوع:</div>
                    <div className="text-sm font-black text-slate-900 mt-0.5">{emailSubject || "بدون عنوان"}</div>
                  </div>

                  <div className="text-xs text-slate-700 whitespace-pre-wrap leading-relaxed min-h-[100px]">
                    {emailBody
                      .replace(/\{Code\}/g, emailPromoCode || "DUKKANK10")
                      .replace(/\{Discount\}/g, String(discountPercent || 10))
                      .replace(/\{MaxUses\}/g, String(maxUses || 50))}
                  </div>

                  {enableAutoCoupon && emailPromoCode && (
                    <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-center space-y-1">
                      <div className="text-[10px] text-amber-800 font-bold">كود الخصم المفعل تلقائياً للمستلم:</div>
                      <div className="text-lg font-black text-amber-600 font-mono">{emailPromoCode}</div>
                      <div className="text-[10px] text-emerald-600 font-bold">خصم {discountPercent}% • حد الاستخدام: {maxUses} زبون فقط 🎯</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Subscribers List */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-blue-500" />
                    <span>قائمة المشتركين ({subscribers.length})</span>
                  </h3>
                  <button
                    onClick={fetchData}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 transition"
                    title="تحديث القائمة"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loadingSubscribers ? "animate-spin" : ""}`} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={subscriberSearch}
                    onChange={(e) => setSubscriberSearch(e.target.value)}
                    placeholder="ابحث بإيميل المشترك..."
                    className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {filteredSubscribers.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold">لا يوجد مشتركين في القائمة</div>
                  ) : (
                    filteredSubscribers.map((sub) => (
                      <div
                        key={sub.id}
                        className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 text-xs"
                      >
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 dir-ltr text-left truncate max-w-[180px]">
                          {sub.email}
                        </span>

                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleSendResendEmail(sub.email)}
                            className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold hover:bg-blue-500/20 text-[10px]"
                            title="إرسال تجريبي لهذا البريد"
                          >
                            إرسال 🚀
                          </button>
                          <button
                            onClick={async () => {
                              try {
                                await apiDeleteSubscriber(sub.id);
                                setSubscribers(subscribers.filter((s) => s.id !== sub.id));
                                toast.success("تم حذف المشترك");
                              } catch (e) {
                                toast.error(formatApiError(e));
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-500 rounded-md"
                            title="حذف"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 2: WHATSAPP CAMPAIGNS ────────────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "whatsapp" && (
        <div className="space-y-6">
          {/* Preset WhatsApp Templates Bar */}
          <div className="bg-slate-900/90 text-white p-4 rounded-3xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-emerald-400 flex items-center gap-1.5">
                <Layers className="w-4 h-4" /> قوالب الواتساب المتاحة ({waPresets.length}):
              </span>
              <button
                type="button"
                onClick={() => { setTemplateType("wa"); setShowCreateModal(true); }}
                className="text-[11px] text-emerald-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> صمّم قالب واتساب جديد خاص بك
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {waPresets.map((p) => (
                <div key={p.id} className="relative group">
                  <button
                    type="button"
                    onClick={() => applyWaPreset(p)}
                    className="w-full p-3 rounded-2xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 text-right flex flex-col justify-between space-y-2 transition cursor-pointer group-hover:border-emerald-400/50"
                  >
                    <div className="text-xs font-black text-white group-hover:text-emerald-400 transition truncate pl-5">{p.title}</div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-mono text-emerald-400 font-bold">{p.code}</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">{p.badge}</span>
                    </div>
                  </button>

                  {p.id.startsWith("tpl_") && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTemplate(p.id, "wa")}
                      className="absolute top-2 left-2 p-1 rounded-md bg-red-500/20 hover:bg-red-500/40 text-red-400 opacity-0 group-hover:opacity-100 transition"
                      title="حذف القالب"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* WhatsApp Composer & Direct Test Input (7 Cols) */}
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-5 shadow-sm">
              <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-emerald-500" />
                  <span>محيط رسائل وحملات الواتساب</span>
                </h3>
                <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2.5 py-1 rounded-full">
                  WhatsApp Direct 📲
                </span>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم العميل (التجريبي / المستهدف)</label>
                    <input
                      type="text"
                      value={waCustomerName}
                      onChange={(e) => setWaCustomerName(e.target.value)}
                      placeholder="مثال: أحمد"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">كود الخصم المرتبط</label>
                    <input
                      type="text"
                      value={waPromoCode}
                      onChange={(e) => setWaPromoCode(e.target.value.toUpperCase())}
                      placeholder="DUKKANK10"
                      className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono font-bold text-amber-500 dir-ltr text-right"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رقم هاتف تجريبي مباشر (بالرمز الدولي)</label>
                  <input
                    type="text"
                    value={waCustomerPhone}
                    onChange={(e) => setWaCustomerPhone(e.target.value)}
                    placeholder="مثال: 962775585112"
                    dir="ltr"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص رسالة الواتساب التسويقية</label>
                  <textarea
                    rows={6}
                    value={waMessage}
                    onChange={(e) => setWaMessage(e.target.value)}
                    className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-medium leading-relaxed text-slate-900 dark:text-white focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => { navigator.clipboard.writeText(waMessage); toast.success("تم نسخ نص الرسالة 📋"); }}
                  className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5"
                >
                  <Copy className="w-4 h-4" />
                  <span>نسخ النص فقط</span>
                </button>

                <button
                  type="button"
                  onClick={launchWhatsAppWeb}
                  className="px-6 h-11 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-lg shadow-emerald-500/20 transition flex items-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>إرسال تجريبي عبر الواتساب 📲</span>
                </button>
              </div>
            </div>

            {/* Target Customer Segment Broadcast List (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* WhatsApp Live Preview Card */}
              <div className="bg-slate-900 text-white p-5 rounded-3xl border border-slate-800 space-y-3 shadow-md">
                <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 border-b border-slate-800 pb-2">
                  <Smartphone className="w-4 h-4" /> شكل الرسالة في الواتساب
                </div>
                <div className="bg-[#0b141a] p-4 rounded-2xl border border-emerald-500/20 text-emerald-100 text-xs font-sans whitespace-pre-wrap leading-relaxed dir-rtl text-right">
                  {waMessage
                    .replace(/\{CustomerName\}/g, waCustomerName || "العميل")
                    .replace(/\{Code\}/g, waPromoCode || "DUKKANK10")}
                </div>
              </div>

              {/* Customer Phone Numbers Broadcast List */}
              <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-500" />
                    <span>سجل زبائن المتجر للإرسال المباشر ({customerList.length})</span>
                  </h3>
                </div>

                <div className="relative">
                  <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={waSearch}
                    onChange={(e) => setWaSearch(e.target.value)}
                    placeholder="ابحث باسم الزبون أو رقم الهاتف..."
                    className="w-full h-9 pr-9 pl-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-medium focus:outline-none"
                  />
                </div>

                <div className="max-h-60 overflow-y-auto space-y-2.5 pr-1">
                  {customerList.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs font-bold">لا يوجد زبائن مسجلين بحسابات سابقة حتى الآن</div>
                  ) : (
                    customerList.map((cust, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/50 dark:border-white/5 text-xs"
                      >
                        <div className="space-y-0.5 min-w-0 pr-2">
                          <div className="font-bold text-slate-900 dark:text-white truncate">{cust.name}</div>
                          <div className="font-mono text-[11px] text-slate-500 dir-ltr text-right">{cust.phone}</div>
                        </div>

                        <button
                          type="button"
                          onClick={() => launchWhatsAppWebForCustomer(cust.phone, cust.name)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-sm transition shrink-0 flex items-center gap-1 cursor-pointer"
                        >
                          <span>إرسال 📲</span>
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 3: MULTI-CAMPAIGN STORE CONTROL HUB ────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "promo" && (
        <div className="space-y-6">
          {/* Header Bar */}
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl">
            <div>
              <h3 className="text-xl font-black flex items-center gap-2">
                <span>مركز إدارة وتخصيص جميع حملات وعروض الموقع المباشرة</span>
                <Flame className="w-5 h-5 text-amber-400" />
              </h3>
              <p className="text-xs text-slate-300 font-medium mt-1">
                تشغيل أو إيقاف وتعديل كافة أنواع البنرات والخصومات والشبابيك المنبثقة بالمتجر بنقرة زر واحدة ⚡
              </p>
            </div>

            <button
              type="button"
              onClick={async () => {
                try {
                  await apiUpdatePromo(promo);
                  toast.success("تم حفظ إعدادات جميع الحملات بنجاح 💾✅");
                  onChanged?.();
                } catch (e) {
                  toast.error(formatApiError(e));
                }
              }}
              className="px-7 h-12 rounded-2xl bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/25 transition cursor-pointer flex items-center gap-2 shrink-0"
            >
              <Save className="w-4 h-4" />
              <span>حفظ جميع الحملات 💾</span>
            </button>
          </div>

          {/* Grid of 4 Campaign Control Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* 1️⃣ Header Promo Strip Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
                      <Tag className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">1. شريط التخفيضات العلوي بالموقع</h4>
                      <span className="text-[11px] text-slate-400 font-bold">Top Header Banner</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaign("headerBanner", "شريط التخفيضات العلوي")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      promo?.headerBanner?.enabled
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${promo?.headerBanner?.enabled ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{promo?.headerBanner?.enabled ? "مفعّل بالموقع 🟢" : "معطل 🙈"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص بنر العرض الرئيسي</label>
                    <input
                      type="text"
                      value={promo?.headerBanner?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPromo(p => ({ ...p, headerBanner: { ...(p?.headerBanner || {}), title: val } }));
                      }}
                      placeholder="🔥 خصم 15% بمناسبة عطلة نهاية الأسبوع!"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">كود الخصم المرتبط</label>
                      <input
                        type="text"
                        value={promo?.headerBanner?.code || ""}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPromo(p => ({ ...p, headerBanner: { ...(p?.headerBanner || {}), code: val } }));
                        }}
                        placeholder="DUKKANK15"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono font-black text-amber-500 dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نص الزر</label>
                      <input
                        type="text"
                        value={promo?.headerBanner?.buttonText || "تسوّق الآن"}
                        onChange={(e) => {
                          const val = e.target.value;
                          setPromo(p => ({ ...p, headerBanner: { ...(p?.headerBanner || {}), buttonText: val } }));
                        }}
                        placeholder="تسوّق الآن"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-center text-xs font-bold text-amber-700 dark:text-amber-300">
                معاينة الشريط: {promo?.headerBanner?.title || "عنوان العرض"} • كود: {promo?.headerBanner?.code || "CODE"}
              </div>
            </div>

            {/* 2️⃣ Flash Sale Countdown Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                      <Flame className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">2. بنر عروض الفلاش والعداد المباشر</h4>
                      <span className="text-[11px] text-slate-400 font-bold">Flash Sale & Countdown Clock</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaign("flashSale", "بنر عروض الفلاش")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      promo?.flashSale?.enabled
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${promo?.flashSale?.enabled ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{promo?.flashSale?.enabled ? "مفعّل بالموقع 🟢" : "معطل 🙈"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان بنر الفلاش الرئيسي</label>
                    <input
                      type="text"
                      value={promo?.flashSale?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPromo(p => ({ ...p, flashSale: { ...(p?.flashSale || {}), title: val } }));
                      }}
                      placeholder="⚡ عروض الفلاش السريعة — تنتهي قريباً!"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الكود والمرتبط</label>
                      <input
                        type="text"
                        value={promo?.flashSale?.code || ""}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPromo(p => ({ ...p, flashSale: { ...(p?.flashSale || {}), code: val } }));
                        }}
                        placeholder="FLASH20"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono font-black text-rose-500 dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">نسبة الخصم %</label>
                      <input
                        type="number"
                        min="1"
                        max="99"
                        value={promo?.flashSale?.discount || 20}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setPromo(p => ({ ...p, flashSale: { ...(p?.flashSale || {}), discount: val } }));
                        }}
                        placeholder="20"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-emerald-600 dir-ltr text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-center text-xs font-bold text-rose-700 dark:text-rose-300">
                {promo?.flashSale?.enabled ? "بنر الفلاش مفعّل مع عداد تنازلي حاد بالصفحة الرئيسية ⚡" : "بنر الفلاش معطل حالياً ولا يظهر للزوار ⚪"}
              </div>
            </div>

            {/* 3️⃣ Interactive Visitor Offer Popup Modal */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">3. النافذة المنبثقة التفاعلية للزائر</h4>
                      <span className="text-[11px] text-slate-400 font-bold">Visitor Offer Popup Modal</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaign("popupModal", "النافذة المنبثقة التفاعلية")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      promo?.popupModal?.enabled
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${promo?.popupModal?.enabled ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{promo?.popupModal?.enabled ? "مفعّلة بالموقع 🟢" : "معطلة 🙈"}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان النافذة</label>
                    <input
                      type="text"
                      value={promo?.popupModal?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPromo(p => ({ ...p, popupModal: { ...(p?.popupModal || {}), title: val } }));
                      }}
                      placeholder="🎁 هدية خاصة لزيارتك الأولى!"
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">الكود المعروض</label>
                      <input
                        type="text"
                        value={promo?.popupModal?.code || ""}
                        onChange={(e) => {
                          const val = e.target.value.toUpperCase();
                          setPromo(p => ({ ...p, popupModal: { ...(p?.popupModal || {}), code: val } }));
                        }}
                        placeholder="WELCOME10"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono font-black text-purple-500 dir-ltr text-right"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-1">تأخير الظهور (بالثواني)</label>
                      <input
                        type="number"
                        min="1"
                        value={promo?.popupModal?.delaySeconds || 3}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setPromo(p => ({ ...p, popupModal: { ...(p?.popupModal || {}), delaySeconds: val } }));
                        }}
                        placeholder="3"
                        className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold dir-ltr text-right"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-center text-xs font-bold text-purple-700 dark:text-purple-300">
                {promo?.popupModal?.enabled ? `تظهر النافذة للزائر بعد ${promo?.popupModal?.delaySeconds || 3} ثوانٍ كهدية ترحيبية 🎁` : "النافذة المنبثقة معطلة حالياً ⚪"}
              </div>
            </div>

            {/* 4️⃣ Live Social Proof Sales Toast */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">4. إشعارات المبيعات والتنبيهات المباشرة</h4>
                      <span className="text-[11px] text-slate-400 font-bold">Live Social Proof Sales Toast</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaign("socialProof", "إشعارات المبيعات المباشرة")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      promo?.socialProof?.enabled !== false
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${promo?.socialProof?.enabled !== false ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{promo?.socialProof?.enabled !== false ? "مفعّل بالموقع 🟢" : "معطل 🙈"}</span>
                  </button>
                </div>

                <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 space-y-2">
                  <div className="text-xs font-bold text-blue-900 dark:text-blue-200">
                    تظهر هذه الإشعارات في أسفل شاشة المتجر وتعرض عمليات الشراء الأخيرة للعملاء لزيادة ثقة الزبائن ومعدل التحويل (Conversion Rate)!
                  </div>
                </div>
              </div>

              {/* Preview */}
              <div className="mt-4 p-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-center text-xs font-bold text-blue-700 dark:text-blue-300">
                {promo?.socialProof?.enabled !== false ? "إشعارات المبيعات الحية مفعّلة بالزاوية السفلية 🚀" : "إشعارات المبيعات معطلة حالياً ⚪"}
              </div>
            </div>

            {/* 5️⃣ Apple Pay & Safari Browser Notice Banner */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-4 shadow-sm flex flex-col justify-between md:col-span-2">
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black text-sm shadow-md">
                      
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">5. بنر تنبيه دفع Apple Pay ومتصفح Safari</h4>
                      <span className="text-[11px] text-slate-400 font-bold">Apple Pay & Safari Browser Notice Banner</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => toggleCampaign("applePayNotice", "بنر تنبيه Apple Pay")}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black transition flex items-center gap-1.5 cursor-pointer ${
                      promo?.applePayNotice?.enabled !== false
                        ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                        : "bg-slate-200 dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700"
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${promo?.applePayNotice?.enabled !== false ? "bg-emerald-500 animate-ping" : "bg-slate-400"}`} />
                    <span>{promo?.applePayNotice?.enabled !== false ? "مفعّل بالموقع 🟢" : "معطل 🙈"}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان التنبيه</label>
                    <input
                      type="text"
                      value={promo?.applePayNotice?.title || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPromo(p => ({ ...p, applePayNotice: { ...(p?.applePayNotice || {}), title: val } }));
                      }}
                      placeholder="تنبيه الدفع السريع عبر Apple Pay "
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص التنبيه والتوجيه للعميل</label>
                    <input
                      type="text"
                      value={promo?.applePayNotice?.subtitle || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setPromo(p => ({ ...p, applePayNotice: { ...(p?.applePayNotice || {}), subtitle: val } }));
                      }}
                      placeholder="للدفع المباشر السلس عبر Apple Pay، يرجى فتح المتجر في متصفح Safari..."
                      className="w-full h-10 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-2 p-3 rounded-2xl bg-slate-900 text-white text-center text-xs font-bold flex items-center justify-between">
                <span>حالة البنر في صفحة السلة والدفع: {promo?.applePayNotice?.enabled !== false ? "ظاهر للزبائن 🟢" : "مخفي تماماً 🙈"}</span>
                <span className="text-[10px] text-amber-400 font-mono"> Apple Pay Connected</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── TAB 4: RESEND SETTINGS & API KEYS ──────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === "settings" && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-white/10 space-y-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-4">
              <div>
                <h3 className="font-black text-base text-slate-900 dark:text-white flex items-center gap-2">
                  <Settings className="w-5 h-5 text-purple-500" />
                  <span>إعدادات مفتاح Resend API وربط البريد الإلكتروني</span>
                </h3>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  قم بإدخال مفتاح الربط من حسابك على <a href="https://resend.com" target="_blank" rel="noreferrer" className="text-purple-500 hover:underline font-mono">resend.com</a> لتمكين الإرسال الحقيقي
                </p>
              </div>

              <div className={`px-4 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 ${
                resendApiKey ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-amber-500/10 border-amber-500/30 text-amber-600 dark:text-amber-400"
              }`}>
                <span className={`w-2.5 h-2.5 rounded-full ${resendApiKey ? "bg-emerald-500 animate-ping" : "bg-amber-500"}`} />
                <span>{resendApiKey ? "الاتصال مفعّل (Live Mode)" : "وضع العرض والمعاينة (Demo Mode)"}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  Resend API Key (مفتاح الربط الخاص بك)
                </label>
                <div className="relative">
                  <input
                    type={showKey ? "text" : "password"}
                    value={resendApiKey}
                    onChange={(e) => setResendApiKey(e.target.value)}
                    placeholder="re_123456789_abcdef..."
                    dir="ltr"
                    className="w-full h-12 pr-4 pl-12 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono text-slate-900 dark:text-white focus:border-purple-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKey(!showKey)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    البريد الإلكتروني للمُرسل (Sender Domain / Email)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setSenderEmail("متجر دُكانك <noreply@dukkank.store>")}
                      className="text-[10px] bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 font-bold px-2 py-0.5 rounded-md cursor-pointer transition"
                    >
                      استخدام noreply@dukkank.store
                    </button>
                    <button
                      type="button"
                      onClick={() => setSenderEmail("متجر دُكانك <support@dukkank.store>")}
                      className="text-[10px] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold px-2 py-0.5 rounded-md cursor-pointer transition"
                    >
                      استخدام support@dukkank.store
                    </button>
                  </div>
                </div>
                <input
                  type="text"
                  value={senderEmail}
                  onChange={(e) => setSenderEmail(e.target.value)}
                  placeholder="متجر دُكانك <noreply@dukkank.store>"
                  dir="ltr"
                  className="w-full h-12 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-mono text-slate-900 dark:text-white focus:border-purple-500"
                />
                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1.5 flex items-center gap-1">
                  <span>✅ بما أن دومين متجرك <code className="font-mono bg-emerald-500/10 px-1 py-0.5 rounded">dukkank.store</code> موثق ونشط في Resend، استخدم دائماً: <code className="font-mono underline">noreply@dukkank.store</code> للإرسال لجميع العملاء دون أي قيود!</span>
                </p>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={saveResendSettings}
                  className="px-7 h-12 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs shadow-lg shadow-purple-500/20 transition cursor-pointer flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ المفاتيح والإعدادات 💾</span>
                </button>
              </div>
            </div>

            {/* Test Connection Box */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 space-y-3 pt-4">
              <div className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>اختبر اتصال المفتاح وإرسال بريد تجريبي الآن:</span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="بريدك الإلكتروني لاستلام رسالة التجربة..."
                  dir="ltr"
                  className="flex-1 h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-black/20 text-xs font-mono"
                />
                <button
                  type="button"
                  disabled={testingResend}
                  onClick={handleTestResend}
                  className="px-6 h-11 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-black text-xs transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {testingResend ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>إرسال بريد تجريبي 🚀</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL: CREATE CUSTOM TEMPLATE ───────────────────────────────────── */}
      {/* ══════════════════════════════════════════════════════════════════════ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-white/10 p-6 sm:p-8 max-w-xl w-full space-y-5 shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-base text-slate-900 dark:text-white">
                    إنشاء وتصميم قالب تسويقي مخصص
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">أضف القالب واحفظه في مكتبتك الخاصة لتكرار استخدامه بنقرة واحدة</p>
                </div>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCustomTemplate} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع الحملة</label>
                  <select
                    value={templateType}
                    onChange={(e) => setTemplateType(e.target.value)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold"
                  >
                    <option value="email">📧 قالب بريد إلكتروني (Resend)</option>
                    <option value="wa">📱 قالب رسالة واتساب</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">اسم القالب (توصيفي)</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="مثال: 🔥 عروض الجمعة البيضاء 30%"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {templateType === "email" && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الموضوع (Subject Line)</label>
                  <input
                    type="text"
                    value={newSubject}
                    onChange={(e) => setNewSubject(e.target.value)}
                    placeholder="مثال: 🎉 مفاجأة الجمعة البيضاء! خصم 30% بانتظارك"
                    className="w-full h-11 px-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-bold text-slate-900 dark:text-white"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20">
                <div>
                  <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">كود الخصم المرتبط</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                    placeholder="BLACK30"
                    className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-mono font-black text-amber-600 dir-ltr text-right"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">نسبة الخصم %</label>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={newDiscount}
                    onChange={(e) => setNewDiscount(parseInt(e.target.value) || 0)}
                    placeholder="30"
                    className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-black text-emerald-600 dir-ltr text-right"
                  />
                </div>

                {templateType === "email" && (
                  <div>
                    <label className="block text-[11px] font-bold text-amber-800 dark:text-amber-300 mb-1">حد الاستخدام الأقصى</label>
                    <input
                      type="number"
                      min="1"
                      value={newMaxUses}
                      onChange={(e) => setNewMaxUses(parseInt(e.target.value) || 0)}
                      placeholder="100"
                      className="w-full h-10 px-3 rounded-xl border border-amber-500/30 bg-white dark:bg-black/40 text-xs font-black text-blue-600 dir-ltr text-right"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نص محتوى الرسالة / البريد</label>
                <textarea
                  rows={5}
                  required
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="أدخل النص هنا وتستطيع استخدام {Code} و {Discount} و {CustomerName}..."
                  className="w-full p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-black/20 text-xs font-medium leading-relaxed"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 h-11 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs"
                >
                  إلغاء
                </button>

                <button
                  type="submit"
                  className="px-6 h-11 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>حفظ القالب في المكتبة 💾</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
