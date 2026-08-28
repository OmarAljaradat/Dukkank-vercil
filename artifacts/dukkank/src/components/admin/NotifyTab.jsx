import { useEffect, useState } from "react";
import { apiListNotifyRequests, apiDeleteNotifyRequest, apiCreateNotifyRequest, formatApiError } from "../../lib/api";
import { useStoreData } from "../../contexts/DataContext";
import { toast } from "sonner";
import {
    Bell, Trash2, Loader2, RefreshCw, Copy, Check, ExternalLink,
    MessageCircle, Sparkles, Send, Gamepad2, AlertCircle, CheckCircle2,
    Plus, Filter, UserCheck, Flame, Phone
} from "lucide-react";

const DEFAULT_WA_TEMPLATE = `{customerName}! 🎮

بشرى سارة من متجر دُكانك ⚡
اللعبة التي طلبت التنبيه عنها: *({gameName})* أصبحت متوفرة الآن في المتجر وتسليمها أوتوماتيكي فوري كحساب أصلي Primary!

🛒 اطلبها الآن قبل نفاد الكمية عبر الرابط:
{storeUrl}

فريق دُكانك في خدمتك دائماً 🌟`;

export default function NotifyTab() {
    const { games } = useStoreData();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(null);
    const [filterStatus, setFilterStatus] = useState("all"); // "all", "ready", "waiting"
    const [showManualForm, setShowManualForm] = useState(false);
    const [showTemplateEditor, setShowTemplateEditor] = useState(false);

    // WhatsApp Message Template State
    const [waTemplate, setWaTemplate] = useState(() => {
        return localStorage.getItem("dukkank_notify_wa_template") || DEFAULT_WA_TEMPLATE;
    });

    // Manual Add Form
    const [manualForm, setManualForm] = useState({
        name: "",
        contact: "",
        gameId: "",
    });

    const saveTemplate = (newTpl) => {
        setWaTemplate(newTpl);
        localStorage.setItem("dukkank_notify_wa_template", newTpl);
        toast.success("تم حفظ قالب رسالة الواتساب بنجاح 💾");
    };

    const reload = async () => {
        setLoading(true);
        try {
            const data = await apiListNotifyRequests();
            setItems(data || []);
        } catch (e) {
            toast.error(formatApiError(e));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, []);

    const onDelete = async (id) => {
        if (!window.confirm("هل أنت متأكد من حذف هذا الطلب؟")) return;
        setItems((prev) => prev.filter((i) => i.id !== id));
        try {
            await apiDeleteNotifyRequest(id);
            toast.success("تم حذف الطلب بنجاح ✅");
        } catch (e) {
            toast.error(formatApiError(e));
            reload();
        }
    };

    const handleClearAll = async () => {
        if (!window.confirm("هل أنت متأكد من مسح وتصفير كافة طلبات التنبيه والبدء من الصفر؟")) return;
        const currentItems = [...items];
        setItems([]);
        try {
            await Promise.all(currentItems.map(item => apiDeleteNotifyRequest(item.id).catch(() => null)));
            toast.success("تم تصفير كافة طلبات التنبيه بنجاح 🧹");
        } catch (e) {
            toast.error("حدث خطأ أثناء التصفير");
            reload();
        }
    };

    const copyAll = async () => {
        const text = items.map((i) => i.contact).join("\n");
        try {
            await navigator.clipboard.writeText(text);
            setCopied("all");
            toast.success("تم نسخ جميع جهات الاتصال لقائمة التنبيهات 📋");
            setTimeout(() => setCopied(null), 1500);
        } catch {}
    };

    const gameById = (id) => (games || []).find((g) => g.id === id);

    // Add manual notify request
    const handleAddManual = async (e) => {
        e.preventDefault();
        if (!manualForm.gameId || !manualForm.contact) {
            toast.error("يرجى اختيار اللعبة وإدخال رقم الهاتف أو الإيميل");
            return;
        }
        try {
            await apiCreateNotifyRequest({
                gameId: manualForm.gameId,
                name: manualForm.name || "عميل",
                contact: manualForm.contact,
            });
            toast.success("تم تسجيل طلب تنبيه العميل بنجاح 🟢");
            setManualForm({ name: "", contact: "", gameId: "" });
            setShowManualForm(false);
            reload();
        } catch (err) {
            toast.error(formatApiError(err) || "فشل تسجيل الطلب");
        }
    };

    function formatPhone(num) {
        let clean = (num || "").replace(/\D/g, "");
        if (clean.startsWith("07") && clean.length === 10) clean = "962" + clean.substring(1);
        else if (clean.startsWith("05") && clean.length === 10) clean = "966" + clean.substring(1);
        else if ((clean.startsWith("059") || clean.startsWith("056")) && clean.length === 10) clean = "970" + clean.substring(1);
        return clean;
    }

    function getWhatsAppUrl(req, gameName) {
        const rawNum = String(req?.contact || req?.phone || req?.email || "").trim();
        if (!rawNum) return null;

        let clean = rawNum.replace(/\D/g, "");
        if (clean.startsWith("07") && clean.length === 10) clean = "962" + clean.substring(1);
        else if (clean.startsWith("05") && clean.length === 10) clean = "966" + clean.substring(1);
        else if ((clean.startsWith("059") || clean.startsWith("056")) && clean.length === 10) clean = "970" + clean.substring(1);

        const phoneToUse = clean || rawNum;

        const nameText = req?.name && req.name !== "عميل دُكانك" ? `أهلاً ${req.name}` : "أهلاً بك عزيزي العميل";
        const storeUrl = "https://dukkank.com/#games";

        let message = waTemplate
            .replace(/\{customerName\}/g, nameText)
            .replace(/\{gameName\}/g, gameName || "ألعاب البلايستيشن")
            .replace(/\{storeUrl\}/g, storeUrl);

        return `https://wa.me/${phoneToUse}?text=${encodeURIComponent(message)}`;
    }

    // Filter Items
    const filteredItems = items.filter((it) => {
        const g = gameById(it.gameId);
        const isAvailable = g && g.available !== false;
        if (filterStatus === "ready") return isAvailable;
        if (filterStatus === "waiting") return !isAvailable;
        return true;
    });

    // Group by game
    const grouped = filteredItems.reduce((acc, it) => {
        if (!acc[it.gameId]) acc[it.gameId] = [];
        acc[it.gameId].push(it);
        return acc;
    }, {});

    // Analytics Math
    const readyToNotifyCount = items.filter((it) => {
        const g = gameById(it.gameId);
        return g && g.available !== false;
    }).length;

    // Top Requested Game
    const gameCounts = items.reduce((acc, it) => {
        acc[it.gameId] = (acc[it.gameId] || 0) + 1;
        return acc;
    }, {});

    let topGameId = null;
    let topGameCount = 0;
    Object.entries(gameCounts).forEach(([gid, cnt]) => {
        if (cnt > topGameCount) {
            topGameCount = cnt;
            topGameId = gid;
        }
    });
    const topGame = topGameId ? gameById(topGameId) : null;

    return (
        <div data-testid="notify-tab" className="space-y-6 text-right dir-rtl" dir="rtl">
            {/* Header Control */}
            <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <Bell className="w-6 h-6 animate-bounce" />
                    </div>
                    <div className="space-y-0.5">
                        <h2 className="text-lg font-black flex items-center gap-2">
                            <span>طلبات تنبيه توفّر المخزون ({items.length})</span>
                            <Sparkles className="w-4 h-4 text-amber-400" />
                        </h2>
                        <p className="text-xs text-slate-300 font-medium">
                            قائمة العملاء الذين سجلوا اهتمامهم بالألعاب غير المتوفرة. يمكنك التواصل معهم وإبلاغهم بنقرة واحدة فور وصول المخزون!
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                    <button
                        onClick={handleClearAll}
                        disabled={items.length === 0}
                        className="px-3.5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                        title="تصفير ومسح كافة طلبات التنبيه"
                    >
                        <Trash2 className="w-4 h-4 text-red-400" />
                        <span>تصفير الكل 🧹</span>
                    </button>

                    <button
                        onClick={() => setShowTemplateEditor(!showTemplateEditor)}
                        className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <MessageCircle className="w-4 h-4" />
                        <span>تخصيص نص الرسالة ⚙️</span>
                    </button>

                    <button
                        onClick={() => setShowManualForm(!showManualForm)}
                        className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-black flex items-center gap-1.5 shadow transition cursor-pointer"
                    >
                        <Plus className="w-4 h-4" />
                        <span>تسجيل طلب جديد ➕</span>
                    </button>

                    <button
                        onClick={copyAll}
                        disabled={items.length === 0}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
                    >
                        {copied === "all" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-400" />}
                        <span>نسخ الأرقام 📋</span>
                    </button>

                    <button
                        onClick={reload}
                        className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition cursor-pointer border border-slate-700"
                        title="تحديث البيانات"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                    </button>
                </div>
            </div>

            {/* WhatsApp Template Customizer Card */}
            {showTemplateEditor && (
                <div className="bg-slate-900 border-2 border-emerald-500/40 p-5 rounded-3xl text-white shadow-xl space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <MessageCircle className="w-5 h-5 text-emerald-400" />
                            <h3 className="font-black text-sm text-emerald-400">تخصيص نص رسالة الواتساب التلقائية للعملاء</h3>
                        </div>
                        <button type="button" onClick={() => setShowTemplateEditor(false)} className="text-slate-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* Editor Left */}
                        <div className="space-y-3">
                            <label className="block text-xs font-bold text-slate-300">نص الرسالة (يمكنك تعديل أي جزء واستخدام المتغيرات التلقائية):</label>
                            
                            {/* Insert Dynamic Variables */}
                            <div className="flex items-center gap-1.5 flex-wrap text-[11px]">
                                <span className="text-slate-400 font-bold">إضافة متغير تلقائي:</span>
                                <button
                                    type="button"
                                    onClick={() => setWaTemplate((prev) => prev + " {customerName}")}
                                    className="px-2.5 py-1 rounded-lg bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-500/30 font-mono font-bold cursor-pointer"
                                >
                                    + {`{customerName}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWaTemplate((prev) => prev + " {gameName}")}
                                    className="px-2.5 py-1 rounded-lg bg-blue-950/60 hover:bg-blue-900 text-blue-400 border border-blue-500/30 font-mono font-bold cursor-pointer"
                                >
                                    + {`{gameName}`}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setWaTemplate((prev) => prev + " {storeUrl}")}
                                    className="px-2.5 py-1 rounded-lg bg-amber-950/60 hover:bg-amber-900 text-amber-400 border border-amber-500/30 font-mono font-bold cursor-pointer"
                                >
                                    + {`{storeUrl}`}
                                </button>
                            </div>

                            <textarea
                                rows={7}
                                value={waTemplate}
                                onChange={(e) => setWaTemplate(e.target.value)}
                                className="w-full rounded-2xl border border-slate-700 bg-slate-950 p-3.5 text-xs font-medium text-slate-100 font-sans focus:border-emerald-500 focus:outline-none leading-relaxed"
                            />

                            {/* Preset Buttons */}
                            <div className="flex items-center gap-2 flex-wrap pt-1">
                                <span className="text-[11px] font-bold text-slate-400">قوالب جاهزة:</span>
                                <button
                                    type="button"
                                    onClick={() => saveTemplate(DEFAULT_WA_TEMPLATE)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold border border-slate-700 cursor-pointer"
                                >
                                    📣 القالب الرسمي
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveTemplate(`{customerName}! 🔥\n\nوصلت كمية جديدة وبعدد محدود جداً من لعبة *({gameName})*! 🎮\n\nلحّق احجز نسختك الآن وتسلم حسابك فوراً:\n{storeUrl}\n\nدُكانك - الأسرع دائماً⚡`)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-400 text-xs font-bold border border-slate-700 cursor-pointer"
                                >
                                    🔥 استعجال كمية محدودة
                                </button>
                                <button
                                    type="button"
                                    onClick={() => saveTemplate(`{customerName}! 🎁\n\nخصيصاً لك من متجر دُكانك 🌟\nاللعبة المطلوبة *({gameName})* توفرت الآن بالمتجر!\nاستخدم كود الخصم (VIP10) واحصل على خصم فوري:\n{storeUrl}\n\nتسليم فوري وضمان مدى الحياة 🛡️`)}
                                    className="px-3 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold border border-slate-700 cursor-pointer"
                                >
                                    🎁 قالب VIP خصم خاص
                                </button>
                            </div>
                        </div>

                        {/* Live Preview Right */}
                        <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col justify-between">
                            <div>
                                <div className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-2">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>معاينة فورية لكيفية وصول الرسالة للعميل بالواتساب:</span>
                                </div>
                                <div className="bg-[#0b141a] text-slate-100 rounded-2xl p-3.5 text-xs font-sans whitespace-pre-wrap border border-emerald-500/20 leading-relaxed dir-rtl shadow-inner">
                                    {waTemplate
                                        .replace(/\{customerName\}/g, "أهلاً أحمد خالد")
                                        .replace(/\{gameName\}/g, "EA Sports FC 26")
                                        .replace(/\{storeUrl\}/g, "https://dukkank.com/#games")}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-3 border-t border-slate-800 mt-3">
                                <button
                                    type="button"
                                    onClick={() => saveTemplate(waTemplate)}
                                    className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow transition cursor-pointer"
                                >
                                    حفظ وتطبيق القالب 💾
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Smart Analytics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">جاهزة للتواصل (توفّر المخزون)</div>
                        <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-0.5">
                            {readyToNotifyCount} عميل ينتظر الإشعار 🟢
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center">
                        <UserCheck className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">إجمالي طلبات الانتظار المسجلة</div>
                        <div className="text-xl font-black text-blue-600 dark:text-blue-400 mt-0.5">
                            {items.length} طلب انتظار 📊
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center">
                        <Bell className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center justify-between shadow-sm">
                    <div>
                        <div className="text-xs font-bold text-slate-500">اللعبة الأكثر طلباً واهتماماً</div>
                        <div className="text-sm font-black text-amber-500 truncate max-w-[180px] mt-0.5">
                            {topGame ? topGame.name : "لا يوجد بعد"} {topGameCount > 0 ? `(${topGameCount})` : ""}
                        </div>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-500 flex items-center justify-center">
                        <Flame className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Manual Add Form */}
            {showManualForm && (
                <form onSubmit={handleAddManual} className="rounded-3xl bg-slate-900 text-white border-2 border-blue-500/40 p-6 space-y-4 shadow-2xl animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                        <div className="flex items-center gap-2">
                            <Plus className="w-5 h-5 text-blue-400" />
                            <h3 className="font-black text-sm text-blue-300">تسجيل طلب تنبيه عميل يدوي</h3>
                        </div>
                        <button type="button" onClick={() => setShowManualForm(false)} className="text-slate-400 hover:text-white">
                            ✕
                        </button>
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">اسم العميل (اختياري)</label>
                            <input
                                type="text"
                                value={manualForm.name}
                                onChange={(e) => setManualForm({ ...manualForm, name: e.target.value })}
                                placeholder="مثال: أحمد خالد"
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">رقم الهاتف أو الإيميل *</label>
                            <input
                                type="text"
                                required
                                value={manualForm.contact}
                                onChange={(e) => setManualForm({ ...manualForm, contact: e.target.value })}
                                placeholder="مثال: 966501234567"
                                dir="ltr"
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-amber-400"
                            />
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-300 mb-1">اللعبة المطلوبة *</label>
                            <select
                                required
                                value={manualForm.gameId}
                                onChange={(e) => setManualForm({ ...manualForm, gameId: e.target.value })}
                                className="w-full h-11 rounded-xl border border-slate-700 bg-slate-800 px-3 text-xs font-bold text-white"
                            >
                                <option value="">-- اختر اللعبة --</option>
                                {(games || []).map((g) => (
                                    <option key={g.id} value={g.id}>
                                        {g.name} {g.available === false ? "(غير متوفرة 🔴)" : "(متوفرة 🟢)"}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                        <button
                            type="button"
                            onClick={() => setShowManualForm(false)}
                            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                        >
                            إلغاء
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black shadow"
                        >
                            تسجيل الطلب ✅
                        </button>
                    </div>
                </form>
            )}

            {/* Filter Tabs Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
                    <Filter className="w-4 h-4 text-blue-500" />
                    <span>تصفية الطلبات:</span>
                </div>

                <div className="flex items-center gap-1 text-xs font-bold">
                    <button
                        onClick={() => setFilterStatus("all")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "all" ? "bg-blue-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        الكل ({items.length})
                    </button>
                    <button
                        onClick={() => setFilterStatus("ready")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "ready" ? "bg-emerald-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        متوفرة وجاهزة للإشعار ({readyToNotifyCount}) 🟢
                    </button>
                    <button
                        onClick={() => setFilterStatus("waiting")}
                        className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
                            filterStatus === "waiting" ? "bg-amber-600 text-white shadow" : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                    >
                        قيد الانتظار ({items.length - readyToNotifyCount}) ⏳
                    </button>
                </div>
            </div>

            {/* Main Content */}
            {loading ? (
                <div className="flex justify-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : Object.keys(grouped).length === 0 ? (
                <div className="text-center py-16 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-8 shadow-sm">
                    <Bell className="w-12 h-12 mx-auto mb-3 text-slate-400 opacity-40" />
                    <p className="text-base font-bold text-slate-700 dark:text-slate-300">لا توجد طلبات إشعار تطابق هذا الفلتر حالياً</p>
                    <p className="text-xs text-slate-500 mt-1">عندما يقوم العميل بالنقر على "نبّهني عند التوفر"، ستظهر طلبتهم هنا فوراً.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(grouped).map(([gid, list]) => {
                        const g = gameById(gid);
                        const isAvailable = g && g.available !== false;

                        return (
                            <div
                                key={gid}
                                className={`rounded-3xl bg-white dark:bg-slate-900 border-2 overflow-hidden shadow-sm transition ${
                                    isAvailable ? "border-emerald-500/40 bg-emerald-500/[0.01]" : "border-slate-200 dark:border-slate-800"
                                }`}
                            >
                                {/* Group Header */}
                                <div className={`p-4 flex items-center justify-between gap-3 flex-wrap ${
                                    isAvailable ? "bg-emerald-500/10 border-b border-emerald-500/20" : "bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800"
                                }`}>
                                    <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <div className="w-10 h-10 rounded-xl bg-slate-900 text-white font-black flex items-center justify-center text-sm shrink-0 border border-slate-700">
                                            {list.length}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className="font-black text-sm text-slate-900 dark:text-white truncate">
                                                {g?.name || gid}
                                            </h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                                                    isAvailable
                                                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                                        : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                                }`}>
                                                    {isAvailable ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                                    <span>{isAvailable ? "متوفرة الآن بالمخزون 🟢" : "غير متوفرة بالمخزون 🔴"}</span>
                                                </span>

                                                {g && (
                                                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">
                                                        PS5: ${g.five || 0} | PS4: ${g.four || 0}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {isAvailable && (
                                        <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-black animate-pulse flex items-center gap-1.5 border border-emerald-500/30">
                                            <Flame className="w-3.5 h-3.5 text-emerald-400" />
                                            <span>الحدث جاهز للتواصل ومراسلة {list.length} عميل!</span>
                                        </div>
                                    )}
                                </div>

                                 {/* Table of Customers */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-right text-xs">
                                        <thead className="bg-slate-50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800">
                                            <tr>
                                                <th className="p-3.5">اسم العميل</th>
                                                <th className="p-3.5">رقم الهاتف / الإيميل</th>
                                                <th className="p-3.5">تاريخ الطلب</th>
                                                <th className="p-3.5 text-center">إجراء التواصل السريع</th>
                                                <th className="p-3.5 text-center w-12">حذف</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                                            {list.map((it) => {
                                                const rawContact = String(it.contact || it.phone || it.email || it.contact_info || it.customerPhone || "").trim();
                                                const displayContact = rawContact || "0775585112";
                                                const cleanDigits = displayContact.replace(/\D/g, "");
                                                const isEmail = displayContact.includes("@");

                                                const waUrl = getWhatsAppUrl({ ...it, contact: displayContact }, g?.name);

                                                return (
                                                    <tr key={it.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition">
                                                        <td className="p-3.5 font-extrabold text-slate-900 dark:text-white">
                                                            {it.name || "عميل دُكانك"}
                                                        </td>
                                                        <td className="p-3.5 font-mono font-bold text-blue-600 dark:text-blue-400" dir="ltr">
                                                            {displayContact}
                                                        </td>
                                                        <td className="p-3.5 text-slate-500 dark:text-slate-400 font-medium" dir="ltr">
                                                            {it.created_at ? new Date(it.created_at).toLocaleDateString("ar-SA") : "اليوم"}
                                                        </td>
                                                        <td className="p-3.5 text-center">
                                                            {isEmail ? (
                                                                <a
                                                                    href={`mailto:${displayContact}?subject=${encodeURIComponent(`تنبيه توفّر لعبة ${g?.name || ""}`)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition cursor-pointer shadow-sm"
                                                                >
                                                                    <Send className="w-3.5 h-3.5" />
                                                                    <span>إرسال إيميل ✉️</span>
                                                                </a>
                                                            ) : (
                                                                <a
                                                                    href={waUrl || `https://wa.me/${cleanDigits || "962775585112"}?text=${encodeURIComponent(`أهلاً عزيزي العميل! 🎮 بشرى سارة من متجر دُكانك ⚡ اللعبة أصبحت متوفرة الآن في المتجر!`)}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-sm"
                                                                >
                                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                                    <span>مراسلة عبر الواتساب 📲</span>
                                                                </a>
                                                            )}
                                                        </td>
                                                        <td className="p-3.5 text-center">
                                                            <button
                                                                onClick={() => onDelete(it.id)}
                                                                className="p-2 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-500 hover:bg-red-100 transition cursor-pointer"
                                                                title="حذف الطلب"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
