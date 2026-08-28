import React, { useState, useMemo, useEffect } from "react";
import { useStoreData } from "../../contexts/DataContext";
import { toast } from "sonner";
import { lsGet, lsSet, getRegisteredUsers, updateUserPassword, getCustomerWallets, getCustomerWalletBalance, updateCustomerWalletBalance, getCustomerWalletLogs } from "../../lib/storage";
import {
    Users, Search, Crown, Sparkles, MessageCircle, ShoppingBag,
    DollarSign, Filter, Gift, ArrowUpRight, ShieldCheck, Mail, UserCheck,
    Download, Plus, Edit, FileText, Check, Clock, Phone, AlertCircle,
    Send, ShieldAlert, Heart, Frown, Smile, Megaphone, CheckCircle2, Copy,
    Tag, History, User, Layers, RefreshCw, X, ChevronLeft, Calendar,
    Eye, EyeOff, Key, Lock, Wallet, PlusCircle, MinusCircle, Coins
} from "lucide-react";

function getCountryFromPhone(phone) {
    const clean = (phone || "").replace(/[^0-9]/g, "");
    if (clean.startsWith("966") || clean.startsWith("05")) return { flag: "🇸🇦", name: "السعودية" };
    if (clean.startsWith("965")) return { flag: "🇰🇼", name: "الكويت" };
    if (clean.startsWith("971")) return { flag: "🇦🇪", name: "الإمارات" };
    if (clean.startsWith("974")) return { flag: "🇶🇦", name: "قطر" };
    if (clean.startsWith("968")) return { flag: "🇴🇲", name: "عمان" };
    if (clean.startsWith("973")) return { flag: "🇧🇭", name: "البحرين" };
    if (clean.startsWith("962")) return { flag: "🇯🇴", name: "الأردن" };
    if (clean.startsWith("964")) return { flag: "🇮🇶", name: "العراق" };
    if (clean.startsWith("961")) return { flag: "🇱🇧", name: "لبنان" };
    if (clean.startsWith("963")) return { flag: "🇸🇾", name: "سوريا" };
    if (clean.startsWith("967")) return { flag: "🇾🇪", name: "اليمن" };
    if (clean.startsWith("20"))  return { flag: "🇪🇬", name: "مصر" };
    if (clean.startsWith("212")) return { flag: "🇲🇦", name: "المغرب" };
    if (clean.startsWith("213")) return { flag: "🇩🇿", name: "الجزائر" };
    if (clean.startsWith("216")) return { flag: "🇹🇳", name: "تونس" };
    if (clean.startsWith("218")) return { flag: "🇱🇾", name: "ليبيا" };
    if (clean.startsWith("970") || clean.startsWith("972")) return { flag: "🇵🇸", name: "فلسطين" };
    return { flag: "🌐", name: "دولي" };
}

export default function CustomerCrmTab() {
    const { orders } = useStoreData();
    const [search, setSearch] = useState("");
    const [tierFilter, setTierFilter] = useState("all");

    // Local Storage Persisted State
    const [customerNotes, setCustomerNotes] = useState(() => lsGet("crm_customer_notes", {}));
    const [customerFlags, setCustomerFlags] = useState(() => lsGet("crm_customer_flags", {}));
    const [customerTagsState, setCustomerTagsState] = useState(() => lsGet("crm_customer_tags", {}));
    const [manualCustomers, setManualCustomers] = useState(() => lsGet("crm_manual_customers", []));

    // Modal & Drawer State
    const [selectedCustomer, setSelectedCustomer] = useState(null);
    const [drawerTab, setDrawerTab] = useState("profile"); // 'profile' | 'orders' | 'notes'
    const [activeNoteText, setActiveNoteText] = useState("");
    const [activeTrustScore, setActiveTrustScore] = useState("high");
    const [activeTags, setActiveTags] = useState([]);
    const [newTagInput, setNewTagInput] = useState("");

    // Password management state in drawer
    const [showPassword, setShowPassword] = useState(false);
    const [newPassInput, setNewPassInput] = useState("");

    const [showAddModal, setShowAddModal] = useState(false);
    const [showBroadcastModal, setShowBroadcastModal] = useState(false);
    
    // Broadcast Campaign Form
    const [broadcastTarget, setBroadcastTarget] = useState("vip");
    const [broadcastMsg, setBroadcastMsg] = useState("أهلاً بك يا غالي 🎮❤️! يسعدنا تقديم كود خصم حصري 15% لطلبك القادم بمتجر دُكانك: VIP15 🎁");

    // New Customer Form State
    const [newCustForm, setNewCustForm] = useState({
        name: "",
        phone: "",
        email: "",
        city: "",
        recentGame: "",
        totalSpent: 50,
        pass: "",
    });

    // Wallet Balance State
    const [walletsState, setWalletsState] = useState(() => getCustomerWallets());
    const [walletAmountInput, setWalletAmountInput] = useState("");
    const [walletReasonInput, setWalletReasonInput] = useState("");
    const [walletActionType, setWalletActionType] = useState("charge"); // "charge" | "deduct"

    const handleWalletTransaction = (phone) => {
        const num = parseFloat(walletAmountInput);
        if (isNaN(num) || num <= 0) {
            toast.error("يرجى إدخال مبلغ صحيح للمحفظة");
            return;
        }
        const delta = walletActionType === "charge" ? num : -num;
        const newBal = updateCustomerWalletBalance(
            phone,
            delta,
            walletReasonInput.trim() || (walletActionType === "charge" ? "شحن رصيد بواسطة الأدمن 🎁" : "خصم رصيد بواسطة الأدمن")
        );
        setWalletsState(getCustomerWallets());
        setWalletAmountInput("");
        setWalletReasonInput("");
        toast.success(`تم ${walletActionType === "charge" ? "شحن" : "خصم"} المحفظة بنجاح! الرصيد الجديد: $${newBal.toFixed(2)} 💳✨`);
    };

    useEffect(() => { lsSet("crm_customer_notes", customerNotes); }, [customerNotes]);
    useEffect(() => { lsSet("crm_customer_flags", customerFlags); }, [customerFlags]);
    useEffect(() => { lsSet("crm_customer_tags", customerTagsState); }, [customerTagsState]);
    useEffect(() => { lsSet("crm_manual_customers", manualCustomers); }, [manualCustomers]);

    // Aggregate Master Customer List (Registered Site Users + Manual + Store Real Orders)
    const customers = useMemo(() => {
        const map = new Map();

        // 1. Site Registered Users (Automatic Sync)
        const siteUsers = getRegisteredUsers();
        (siteUsers || []).forEach((u) => {
            if (!u.phone) return;
            map.set(u.phone, {
                phone: u.phone,
                name: u.name || "زبون مسجل",
                email: u.email || "",
                city: "السعودية",
                ordersCount: 0,
                totalSpent: 0,
                lastOrderDate: u.createdAt || Date.now(),
                recentGame: "حساب جديد",
                notes: "مسجل تلقائياً بالموقع",
                trustScore: "high",
                tags: ["مسجل_بالموقع"],
                pass: u.pass || "Dk123456#",
                ordersList: [],
            });
        });

        // 2. Manual added customers
        (manualCustomers || []).forEach((c) => {
            if (c && c.phone) map.set(c.phone, { ...c });
        });

        // 3. Real Store Orders Aggregation
        (orders || []).forEach((o) => {
            const rawPhone = o.contact_whatsapp || o.customer_phone || o.customerPhone || o.phone || "";
            if (!rawPhone || rawPhone === "غير محدد") return;
            const phone = rawPhone.trim();
            const name = o.customer_name || o.customerName || o.name || "عميل دُكانك";
            const email = o.customer_email || o.customerEmail || o.email || "";
            const total = Number(o.customer_paid || o.total || o.totalAmount || 0);
            const itemName = o.game_name || o.subscription_type || o.product_type || o.items?.[0]?.title || "طلب رقمي";
            const orderDate = o.created_at || o.createdAt || Date.now();
            const orderId = o.order_number || o.id || `ORD-${Math.floor(1000 + Math.random() * 9000)}`;

            if (!map.has(phone)) {
                map.set(phone, {
                    phone,
                    name,
                    email,
                    city: "السعودية",
                    ordersCount: 1,
                    totalSpent: total,
                    lastOrderDate: orderDate,
                    recentGame: itemName,
                    notes: "",
                    trustScore: "high",
                    tags: ["مشتري_مباشر"],
                    pass: "Dk123456#",
                    ordersList: [
                        { id: orderId, date: new Date(orderDate).toLocaleDateString('ar-EG'), item: itemName, price: total, status: o.status === "completed" || o.status === "delivered" ? "تم التسليم" : "قيد التنفيذ" }
                    ]
                });
            } else {
                const existing = map.get(phone);
                existing.ordersCount += 1;
                existing.totalSpent += total;
                if (!existing.email && email) existing.email = email;
                if (existing.name === "زبون مسجل" && name !== "عميل دُكانك") existing.name = name;
                if (!existing.ordersList) existing.ordersList = [];
                existing.ordersList.push({
                    id: orderId,
                    date: new Date(orderDate).toLocaleDateString('ar-EG'),
                    item: itemName,
                    price: total,
                    status: o.status === "completed" || o.status === "delivered" ? "تم التسليم" : "قيد التنفيذ"
                });
            }
        });

        // Compute Tiers (4 Levels) & Apply Saved Local Adjustments
        return Array.from(map.values()).map((c) => {
            let tier = "bronze";
            let tierLabel = "🥉 برونزي";
            let tierBadgeClass = "bg-slate-500/10 text-slate-600 border-slate-500/20";
            let discountBonus = "0%";

            if (c.totalSpent >= 500) {
                tier = "diamond";
                tierLabel = "👑 ماسي Diamond VIP";
                tierBadgeClass = "bg-purple-500/15 text-purple-600 border-purple-500/30 font-black";
                discountBonus = "15% خصم تلقائي";
            } else if (c.totalSpent >= 250 || c.ordersCount >= 5) {
                tier = "gold";
                tierLabel = "🥇 ذهبي Gold VIP";
                tierBadgeClass = "bg-amber-500/15 text-amber-600 border-amber-500/30 font-extrabold";
                discountBonus = "10% خصم تلقائي";
            } else if (c.totalSpent >= 100 || c.ordersCount >= 2) {
                tier = "silver";
                tierLabel = "🥈 فضي Silver Gamer";
                tierBadgeClass = "bg-blue-500/15 text-blue-600 border-blue-500/30 font-bold";
                discountBonus = "5% خصم تلقائي";
            }

            const savedNote = customerNotes[c.phone] !== undefined ? customerNotes[c.phone] : (c.notes || "");
            const savedFlag = customerFlags[c.phone] || c.trustScore || "high";
            const savedTags = customerTagsState[c.phone] || c.tags || ["عميل_مباشر"];
            const walletBalance = walletsState[c.phone] !== undefined ? Number(walletsState[c.phone]) : 0;

            return {
                ...c,
                tier,
                tierLabel,
                tierBadgeClass,
                discountBonus,
                notes: savedNote,
                trustScore: savedFlag,
                tags: savedTags,
                walletBalance,
            };
        });
    }, [orders, manualCustomers, customerNotes, customerFlags, customerTagsState, walletsState]);

    // Multi-Criteria Filtering
    const filteredCustomers = useMemo(() => {
        return customers.filter((c) => {
            const query = search.toLowerCase().trim();
            const matchesSearch =
                c.name.toLowerCase().includes(query) ||
                c.phone.includes(query) ||
                c.email.toLowerCase().includes(query) ||
                (c.recentGame && c.recentGame.toLowerCase().includes(query)) ||
                c.tags.some(t => t.toLowerCase().includes(query));

            let matchesTier = true;
            if (tierFilter === "inactive") {
                const daysDiff = (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24);
                matchesTier = daysDiff >= 20;
            } else if (tierFilter === "flagged") {
                matchesTier = c.trustScore === "flagged";
            } else if (tierFilter !== "all") {
                matchesTier = c.tier === tierFilter;
            }

            return matchesSearch && matchesTier;
        });
    }, [customers, search, tierFilter]);

    // Pagination Logic (10 per page)
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    useEffect(() => {
        setCurrentPage(1);
    }, [search, tierFilter, itemsPerPage]);

    const totalPages = Math.max(1, Math.ceil(filteredCustomers.length / itemsPerPage));
    const paginatedCustomers = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredCustomers.slice(start, start + itemsPerPage);
    }, [filteredCustomers, currentPage, itemsPerPage]);

    // KPI Metrics
    const totalCustomers = customers.length;
    const vipCount = customers.filter((c) => c.tier === "diamond" || c.tier === "gold").length;
    const totalRevenue = customers.reduce((acc, c) => acc + c.totalSpent, 0);
    const avgSpent = totalCustomers > 0 ? Math.round(totalRevenue / totalCustomers) : 0;
    const inactiveCount = customers.filter((c) => (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24) >= 20).length;
    const flaggedCount = customers.filter((c) => c.trustScore === "flagged").length;

    // Quick WhatsApp Sender
    const openWhatsApp = (customer, customMsg = "") => {
        const cleanPhone = customer.phone.replace(/[^0-9]/g, "");
        const defaultMsg = `أهلاً بك أخي ${customer.name} 🎮❤️\nنشكرك على ثقتك بمتجر دُكانك! يسعدنا تقديم كود خصم خاص بمستوى ولاء (${customer.tierLabel}): VIP10 🎁`;
        const text = encodeURIComponent(customMsg || defaultMsg);
        window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
        toast.success(`جاري فتح الواتساب لمراسلة ${customer.name} 📱`);
    };

    // Save Customer Drawer Profile Edits
    const handleSaveCustomerDrawer = () => {
        if (!selectedCustomer) return;
        const p = selectedCustomer.phone;
        setCustomerNotes((prev) => ({ ...prev, [p]: activeNoteText }));
        setCustomerFlags((prev) => ({ ...prev, [p]: activeTrustScore }));
        setCustomerTagsState((prev) => ({ ...prev, [p]: activeTags }));

        setSelectedCustomer((prev) => prev ? { ...prev, notes: activeNoteText, trustScore: activeTrustScore, tags: activeTags } : null);
        toast.success("تم حفظ بروفايل وملاحظات العميل بنجاح 📝✅");
    };

    const handleAddTag = () => {
        if (!newTagInput.trim()) return;
        const formatted = newTagInput.trim().replace(/\s+/g, "_");
        if (!activeTags.includes(formatted)) {
            setActiveTags([...activeTags, formatted]);
        }
        setNewTagInput("");
    };

    const handleRemoveTag = (tagToRemove) => {
        setActiveTags(activeTags.filter(t => t !== tagToRemove));
    };

    // Add Manual Customer
    const handleAddManualCustomer = (e) => {
        e.preventDefault();
        if (!newCustForm.name.trim() || !newCustForm.phone.trim()) {
            toast.error("اسم العميل ورقم الهاتف مطلوبان");
            return;
        }

        const newC = {
            phone: newCustForm.phone.trim(),
            name: newCustForm.name.trim(),
            email: newCustForm.email.trim(),
            city: newCustForm.city.trim() || "السعودية",
            ordersCount: 1,
            totalSpent: Number(newCustForm.totalSpent) || 50,
            lastOrderDate: Date.now(),
            recentGame: newCustForm.recentGame.trim() || "لعبة رقمية",
            notes: "تمت إضافته يدوياً من الأدمن",
            trustScore: "high",
            tags: ["يدوي"],
            ordersList: [
                { id: `ORD-MAN-${Math.floor(100 + Math.random() * 900)}`, date: new Date().toLocaleDateString('ar-EG'), item: newCustForm.recentGame || "طلب رقمي", price: Number(newCustForm.totalSpent) || 50, status: "مكتمل" }
            ]
        };

        setManualCustomers((prev) => [newC, ...prev]);
        setShowAddModal(false);
        setNewCustForm({ name: "", phone: "", email: "", city: "", recentGame: "", totalSpent: 50 });
        toast.success(`تم إضافة العميل ${newC.name} لقاعدة البيانات ✨`);
    };

    // Bulk WhatsApp Broadcast Trigger
    const triggerBroadcast = () => {
        let targets = customers;
        if (broadcastTarget === "vip") {
            targets = customers.filter((c) => c.tier === "diamond" || c.tier === "gold");
        } else if (broadcastTarget === "inactive") {
            targets = customers.filter((c) => (Date.now() - new Date(c.lastOrderDate).getTime()) / (1000 * 3600 * 24) >= 20);
        }

        if (targets.length === 0) {
            toast.error("لا يوجد عملاء يطابقون هذه الفئة المستهدفة");
            return;
        }

        openWhatsApp(targets[0], broadcastMsg);
        toast.success(`تم إطلاق حملة الواتساب لـ ${targets.length} عميل مستهدف! 📢🚀`);
        setShowBroadcastModal(false);
    };

    // Full UTF-8 Arabic Supported CSV Export
    const exportToCSV = () => {
        const headers = ["الاسم", "رقم الهاتف", "البريد الإلكتروني", "المدينة", "مستوى الولاء", "إجمالي الإنفاق ($)", "عدد الطلبات", "تقييم الأمان", "الوسوم"];
        const rows = customers.map((c) => [
            `"${c.name}"`,
            `"${c.phone}"`,
            `"${c.email}"`,
            `"${c.city || ''}"`,
            `"${c.tierLabel}"`,
            c.totalSpent,
            c.ordersCount,
            `"${c.trustScore}"`,
            `"${(c.tags || []).join(';')}"`,
        ]);
        const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `dukkank_crm_customers_${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("تم تصدير ملف العملاء الشامل (CSV) بنجاح 📊");
    };

    // Copy All Phone Numbers for TikTok / Meta Custom Audiences
    const copyAllPhones = () => {
        const phones = customers.map((c) => c.phone).join("\n");
        navigator.clipboard.writeText(phones);
        toast.success("تم نسخ كافة أرقام العملاء للحملات الإعلانية! 📱📋");
    };

    return (
        <div data-testid="customer-crm-tab" className="space-y-6">
            {/* Header Title Card */}
            <div className="rounded-3xl bg-slate-900 text-white border border-slate-800 p-6 shadow-xl space-y-4">
                <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                            <Users className="w-6 h-6 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-lg font-black flex items-center gap-2">
                                <span>مركز إدارة العملاء المتكامل والـ VIP (Master Customer CRM)</span>
                            </h2>
                            <p className="text-xs text-slate-300 font-medium mt-0.5">
                                إدارة شاملة لملفات العملاء، سجل الطلبات، تصنيف مستويات الولاء، الملاحظات السرية، والمراسلة بالواتساب!
                            </p>
                        </div>
                    </div>

                    {/* Header Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 flex-wrap">
                        <button
                            onClick={() => setShowBroadcastModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 text-xs font-black transition shadow shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Megaphone className="w-4 h-4" />
                            <span>حملة واتساب جماعية 📢</span>
                        </button>

                        <button
                            onClick={exportToCSV}
                            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition border border-slate-700 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Download className="w-4 h-4 text-blue-400" />
                            <span>تصدير Excel/CSV</span>
                        </button>

                        <button
                            onClick={copyAllPhones}
                            className="px-4 py-2.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/30 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                            <Copy className="w-4 h-4 text-purple-400" />
                            <span>نسخ الأرقام للإعلانات 📱</span>
                        </button>

                        <button
                            onClick={() => setShowAddModal(true)}
                            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs transition shadow shadow-blue-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                            <Plus className="w-4 h-4" />
                            <span>إضافة عميل يدوياً</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">إجمالي قاعدة العملاء</span>
                        <Users className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 dark:text-white">{totalCustomers}</div>
                    <div className="text-[11px] text-slate-400 font-medium">عميل مسجل في قاعدة المتجر</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">عملاء VIP (الماسي والذهبي)</span>
                        <Crown className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-amber-500">{vipCount}</div>
                    <div className="text-[11px] text-slate-400 font-medium">كبار المشترين ($250+)</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">متوسط القيمة الشرائية (LTV)</span>
                        <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-emerald-600">${avgSpent}</div>
                    <div className="text-[11px] text-slate-400 font-medium">معدل الدخل من كل عميل</div>
                </div>

                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-sm space-y-2">
                    <div className="flex items-center justify-between text-slate-400">
                        <span className="text-xs font-bold">إعادة التنشيط والأمان</span>
                        <Clock className="w-4 h-4 text-purple-500" />
                    </div>
                    <div className="text-2xl font-black text-purple-600">{inactiveCount} غائبين</div>
                    <div className="text-[11px] text-slate-400 font-medium">{flaggedCount} محظورين أو مشتبه بهم</div>
                </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3" />
                    <input
                        type="text"
                        placeholder="ابحث بالاسم، الهاتف، الإيميل، اللعبة، أو الوسم..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 pr-9 pl-4 py-2 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                    />
                </div>

                {/* Tier Filter Buttons */}
                <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-hide">
                    {[
                        { id: "all", label: "الكل" },
                        { id: "diamond", label: "👑 الماسي Diamond" },
                        { id: "gold", label: "🥇 الذهبي Gold VIP" },
                        { id: "silver", label: "🥈 الفضي Silver" },
                        { id: "bronze", label: "🥉 البرونزي Bronze" },
                        { id: "inactive", label: "💤 الغائبين (+20 يوم)" },
                        { id: "flagged", label: "🔴 المحظورين" },
                    ].map((f) => (
                        <button
                            key={f.id}
                            onClick={() => setTierFilter(f.id)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
                                tierFilter === f.id
                                    ? "bg-blue-600 text-white shadow"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                            }`}
                        >
                            {f.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Customers Master Table */}
            <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-xs table-fixed">
                        <thead className="bg-slate-50/80 dark:bg-slate-950/80 text-slate-400 font-bold border-b border-slate-100 dark:border-slate-800 uppercase tracking-wider text-[10px]">
                            <tr>
                                <th className="py-3 px-3 text-right w-[24%]">اسم العميل</th>
                                <th className="py-3 px-2 text-center w-[17%]">رقم الهاتف</th>
                                <th className="py-3 px-2 text-center w-[16%]">إجمالي المشتريات</th>
                                <th className="py-3 px-2 text-center w-[17%]">مستوى الولاء</th>
                                <th className="py-3 px-2 text-center w-[11%]">حالة الأمان</th>
                                <th className="py-3 px-3 text-center w-[15%]">الإجراءات</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                            {paginatedCustomers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-14 px-4 text-center">
                                        <div className="flex flex-col items-center justify-center max-w-md mx-auto space-y-3">
                                            <div className="w-14 h-14 rounded-3xl bg-blue-500/10 text-blue-500 flex items-center justify-center shadow-inner">
                                                <Users className="w-7 h-7" />
                                            </div>
                                            <h4 className="text-base font-black text-slate-900 dark:text-white">
                                                قاعدة بيانات العملاء نظيفة وجاهزة 👥
                                            </h4>
                                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                                لم يتم تسجيل أي عملاء بعد. ستظهر بيانات العملاء والطلبات الحقيقية هنا تلقائياً فور قيام الزوار بإنشاء حسابات أو إتمام عمليات شراء في المتجر.
                                            </p>
                                            <button
                                                type="button"
                                                onClick={() => setShowAddModal(true)}
                                                className="mt-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition flex items-center gap-2 shadow cursor-pointer"
                                            >
                                                <Plus className="w-4 h-4" />
                                                <span>إضافة عميل يدوياً</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                paginatedCustomers.map((c, idx) => (
                                    <tr
                                        key={idx}
                                        onClick={() => {
                                            setSelectedCustomer(c);
                                            setDrawerTab("profile");
                                            setActiveNoteText(c.notes || "");
                                            setActiveTrustScore(c.trustScore || "high");
                                            setActiveTags(c.tags || []);
                                        }}
                                        className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                                    >
                                        {/* 1. Customer Avatar & Name */}
                                        <td className="py-3 px-3 text-right">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/20 text-blue-600 dark:text-blue-400 font-black flex items-center justify-center text-xs shrink-0 border border-blue-500/20 group-hover:scale-105 transition-transform">
                                                    {c.name.slice(0, 1)}
                                                </div>
                                                <div className="font-black text-slate-900 dark:text-white text-xs group-hover:text-blue-600 transition-colors flex items-center gap-1.5 truncate">
                                                    <span className="truncate">{c.name}</span>
                                                    {c.notes && (
                                                        <span title={c.notes} className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0"></span>
                                                    )}
                                                </div>
                                            </div>
                                        </td>

                                        {/* 2. Phone Number with Country Flag & Name */}
                                        <td className="py-3 px-2 text-center">
                                            {(() => {
                                                const country = getCountryFromPhone(c.phone);
                                                return (
                                                    <div className="flex flex-col items-center justify-center space-y-0.5">
                                                        <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px] font-bold">
                                                            <span>{country.flag}</span>
                                                            <span>{country.name}</span>
                                                        </span>
                                                        <span className="text-slate-600 dark:text-slate-300 font-mono font-bold text-[11px] dir-ltr">
                                                            {c.phone}
                                                        </span>
                                                    </div>
                                                );
                                            })()}
                                        </td>

                                        {/* 3. Total Spent, Orders Count & Wallet Balance */}
                                        <td className="py-3 px-2 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-0.5">
                                                <span className="font-black text-emerald-600 text-xs dir-ltr">
                                                    ${c.totalSpent}
                                                </span>
                                                <span className="text-[10px] font-bold text-slate-400">
                                                    {c.ordersCount} طلبات 📦
                                                </span>
                                                {c.walletBalance > 0 && (
                                                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 font-extrabold text-[9px] border border-purple-500/20" title="رصيد المحفظة المتاح للعميل">
                                                        <span>💳</span>
                                                        <span>${c.walletBalance.toFixed(2)}</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 4. Sleek Single-Line Tier Badge */}
                                        <td className="py-3 px-2 text-center">
                                            <div className="flex justify-center">
                                                <span className={`inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-xl text-[11px] font-black border ${c.tierBadgeClass}`}>
                                                    <span>{c.tierLabel}</span>
                                                </span>
                                            </div>
                                        </td>

                                        {/* 5. Minimal Security Trust Flag */}
                                        <td className="py-3 px-2 text-center">
                                            <div className="flex justify-center">
                                                {c.trustScore === "flagged" ? (
                                                    <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-xl bg-red-500/10 text-red-600 font-bold text-[10px] border border-red-500/20">
                                                        <ShieldAlert className="w-3 h-3" />
                                                        <span>محظور</span>
                                                    </span>
                                                ) : c.trustScore === "medium" ? (
                                                    <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-xl bg-amber-500/10 text-amber-600 font-bold text-[10px] border border-amber-500/20">
                                                        <AlertCircle className="w-3 h-3" />
                                                        <span>متابعة</span>
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center justify-center gap-1 px-2 py-0.5 rounded-xl bg-emerald-500/10 text-emerald-600 font-bold text-[10px] border border-emerald-500/20">
                                                        <CheckCircle2 className="w-3 h-3" />
                                                        <span>موثوق</span>
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 6. Clean Sleek Actions */}
                                        <td className="py-3 px-3 text-center" onClick={(e) => e.stopPropagation()}>
                                            <div className="flex items-center justify-center gap-1.5">
                                                <button
                                                    onClick={() => openWhatsApp(c)}
                                                    className="w-8 h-8 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 flex items-center justify-center transition border border-emerald-500/20 cursor-pointer shrink-0"
                                                    title="مراسلة سريعة عبر الواتساب"
                                                >
                                                    <MessageCircle className="w-3.5 h-3.5" />
                                                </button>

                                                <button
                                                    onClick={() => {
                                                        setSelectedCustomer(c);
                                                        setDrawerTab("profile");
                                                        setActiveNoteText(c.notes || "");
                                                        setActiveTrustScore(c.trustScore || "high");
                                                        setActiveTags(c.tags || []);
                                                    }}
                                                    className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition cursor-pointer flex items-center gap-1 shadow-sm shadow-blue-600/20 shrink-0"
                                                >
                                                    <User className="w-3 h-3" />
                                                    <span>البروفايل</span>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Table Pagination Bar */}
                <div className="bg-slate-50/80 dark:bg-slate-950/80 px-6 py-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>عرض الصفحة <strong className="text-slate-900 dark:text-white">{currentPage}</strong> من <strong className="text-slate-900 dark:text-white">{totalPages}</strong> (إجمالي <strong className="text-blue-600">{filteredCustomers.length}</strong> عميل)</span>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                            <span className="text-[11px] text-slate-400">في الصفحة:</span>
                            <select
                                value={itemsPerPage}
                                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-2 py-1 text-xs font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer"
                            >
                                <option value={10}>10</option>
                                <option value={20}>20</option>
                                <option value={50}>50</option>
                                <option value={100}>100</option>
                            </select>
                        </div>

                        {/* Page Navigation Buttons */}
                        <div className="flex items-center gap-1">
                            <button
                                disabled={currentPage === 1}
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-slate-700 dark:text-slate-200 font-black"
                            >
                                ◀ السابق
                            </button>

                            {/* Dynamic Page Number Buttons */}
                            <div className="flex items-center gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1)
                                    .filter(p => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                                    .map((p, idx, arr) => (
                                        <React.Fragment key={p}>
                                            {idx > 0 && arr[idx - 1] !== p - 1 && <span className="px-1 text-slate-400">...</span>}
                                            <button
                                                onClick={() => setCurrentPage(p)}
                                                className={`w-7 h-7 rounded-xl font-black text-xs transition cursor-pointer ${
                                                    currentPage === p
                                                        ? "bg-blue-600 text-white shadow"
                                                        : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100"
                                                }`}
                                            >
                                                {p}
                                            </button>
                                        </React.Fragment>
                                    ))}
                            </div>

                            <button
                                disabled={currentPage === totalPages}
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer text-slate-700 dark:text-slate-200 font-black"
                            >
                                التالي ▶
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Master Customer Multi-Tab Drawer / Modal */}
            {selectedCustomer && (
                <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Drawer Header */}
                        <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400 font-black flex items-center justify-center text-lg shrink-0">
                                    {selectedCustomer.name.slice(0, 1)}
                                </div>
                                <div>
                                    <h3 className="font-extrabold text-base text-white flex items-center gap-2">
                                        <span>{selectedCustomer.name}</span>
                                        <span className={`text-[10px] px-2.5 py-0.5 rounded-full border ${selectedCustomer.tierBadgeClass}`}>
                                            {selectedCustomer.tierLabel}
                                        </span>
                                    </h3>
                                    <div className="flex items-center gap-3 text-xs text-slate-400 mt-1 font-mono">
                                        <span>{selectedCustomer.phone}</span>
                                        <span>•</span>
                                        <span>{selectedCustomer.email || "لا يوجد بريد الإلكتروني"}</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedCustomer(null)}
                                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white font-bold flex items-center justify-center transition"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Drawer Navigation Tabs */}
                        <div className="bg-slate-100 dark:bg-slate-950 px-6 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
                            <button
                                onClick={() => setDrawerTab("profile")}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                    drawerTab === "profile" ? "bg-blue-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                }`}
                            >
                                <User className="w-4 h-4" />
                                <span>البروفايل والواتساب</span>
                            </button>

                            <button
                                onClick={() => setDrawerTab("orders")}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                    drawerTab === "orders" ? "bg-blue-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                <span>سجل المشتريات ({selectedCustomer.ordersList?.length || selectedCustomer.ordersCount})</span>
                            </button>

                            <button
                                onClick={() => setDrawerTab("notes")}
                                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition cursor-pointer flex items-center gap-1.5 ${
                                    drawerTab === "notes" ? "bg-blue-600 text-white shadow" : "text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                                }`}
                            >
                                <FileText className="w-4 h-4" />
                                <span>الملاحظات والوسوم</span>
                            </button>
                        </div>

                        {/* Drawer Tab Content Area */}
                        <div className="p-6 overflow-y-auto space-y-6 flex-1">
                            {/* Tab 1: Profile & Quick WhatsApp Actions */}
                            {drawerTab === "profile" && (
                                <div className="space-y-6">
                                    {/* Stats Cards */}
                                    <div className="grid grid-cols-3 gap-3 text-center">
                                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <div className="text-[11px] text-slate-400 font-bold">عدد الطلبات</div>
                                            <div className="text-base font-black text-slate-900 dark:text-white mt-0.5">{selectedCustomer.ordersCount} طلبات</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <div className="text-[11px] text-slate-400 font-bold">إجمالي الإنفاق</div>
                                            <div className="text-base font-black text-emerald-600 mt-0.5">${selectedCustomer.totalSpent}</div>
                                        </div>
                                        <div className="bg-slate-50 dark:bg-slate-950 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            <div className="text-[11px] text-slate-400 font-bold">خصم المستوى</div>
                                            <div className="text-xs font-black text-amber-500 mt-1">{selectedCustomer.discountBonus}</div>
                                        </div>
                                    </div>

                                    {/* 💳 Customer Wallet Control Engine */}
                                    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-500/10 via-purple-600/5 to-indigo-500/10 border border-purple-500/20 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center font-black">
                                                    <Wallet className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                        <span>محفظة العميل والرصيد المتاح</span>
                                                    </h4>
                                                    <p className="text-[10px] text-slate-400 font-bold">يُمكن للزبون الشراء بالرصيد المتاح في المتجر</p>
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <span className="text-[10px] text-slate-400 font-bold block">الرصيد الحالي:</span>
                                                <span className="text-xl font-black text-purple-600 dark:text-purple-400 dir-ltr block">
                                                    ${(selectedCustomer.walletBalance || 0).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Action Type Selector */}
                                        <div className="flex items-center gap-2 bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-purple-500/20">
                                            <button
                                                type="button"
                                                onClick={() => setWalletActionType("charge")}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                                    walletActionType === "charge"
                                                        ? "bg-emerald-600 text-white shadow"
                                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                                }`}
                                            >
                                                <PlusCircle className="w-3.5 h-3.5" />
                                                <span>شحن رصيد (+)</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setWalletActionType("deduct")}
                                                className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                                                    walletActionType === "deduct"
                                                        ? "bg-red-600 text-white shadow"
                                                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100"
                                                }`}
                                            >
                                                <MinusCircle className="w-3.5 h-3.5" />
                                                <span>خصم رصيد (-)</span>
                                            </button>
                                        </div>

                                        {/* Fast Preset Buttons */}
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-slate-400 font-bold shrink-0">مبالغ سريعة:</span>
                                            {[5, 10, 25, 50, 100].map((amt) => (
                                                <button
                                                    key={amt}
                                                    type="button"
                                                    onClick={() => setWalletAmountInput(String(amt))}
                                                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-black text-purple-600 hover:bg-purple-50 transition cursor-pointer"
                                                >
                                                    +${amt}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Amount & Reason Input Form */}
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="relative">
                                                <span className="absolute left-3 top-2 text-xs font-mono font-bold text-slate-400">$</span>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    placeholder="المبلغ (مثال: 15)..."
                                                    value={walletAmountInput}
                                                    onChange={(e) => setWalletAmountInput(e.target.value)}
                                                    className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 pr-3 pl-7 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                                                />
                                            </div>

                                            <input
                                                type="text"
                                                placeholder="السبب (هدية / تعويض)..."
                                                value={walletReasonInput}
                                                onChange={(e) => setWalletReasonInput(e.target.value)}
                                                className="w-full rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-bold focus:outline-none focus:border-purple-500"
                                            />

                                            <button
                                                type="button"
                                                onClick={() => {
                                                    handleWalletTransaction(selectedCustomer.phone);
                                                    const newBal = getCustomerWalletBalance(selectedCustomer.phone);
                                                    setSelectedCustomer({ ...selectedCustomer, walletBalance: newBal });
                                                }}
                                                className={`w-full py-1.5 rounded-xl text-white font-black text-xs transition cursor-pointer flex items-center justify-center gap-1.5 shadow ${
                                                    walletActionType === "charge" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"
                                                }`}
                                            >
                                                <Coins className="w-3.5 h-3.5" />
                                                <span>تأكيد {walletActionType === "charge" ? "الشحن" : "الخصم"}</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Quick WhatsApp Presets */}
                                    <div className="space-y-3">
                                        <label className="block text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <MessageCircle className="w-4 h-4 text-emerald-500" />
                                            <span>خيارات إرسال واتساب السريعة للعميل:</span>
                                        </label>

                                        <div className="grid sm:grid-cols-2 gap-2.5">
                                            <button
                                                onClick={() => openWhatsApp(selectedCustomer, `أهلاً بك أخي ${selectedCustomer.name} 🎮❤️\nيسعدنا تقديم كوبون خصم خاص كعميل مميز بمستوى (${selectedCustomer.tierLabel}): VIP15 🎁`)}
                                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-right transition cursor-pointer space-y-1"
                                            >
                                                <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span>🎁 إرسال كود خصم VIP (15%)</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400">إرسال كود خصم خاص لمستواه بالواتساب</div>
                                            </button>

                                            <button
                                                onClick={() => openWhatsApp(selectedCustomer, `أهلاً بك أخي ${selectedCustomer.name} 🎮❤️\nنود التأكد من استلامك لحساب ${selectedCustomer.recentGame} وأن جميع الخدمات تعمل لديك بكفاءة تامة؟`)}
                                                className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 hover:border-emerald-500 text-right transition cursor-pointer space-y-1"
                                            >
                                                <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
                                                    <span>📦 متابعة حالة التسليم</span>
                                                </div>
                                                <div className="text-[10px] text-slate-400">الاستفسار عن رضاه عن الطلب الأخير</div>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Tab 2: Complete Purchase History */}
                            {drawerTab === "orders" && (
                                <div className="space-y-4">
                                    <h4 className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                        <History className="w-4 h-4 text-blue-500" />
                                        <span>قائمة طلبات ومشتريات العميل كاملة:</span>
                                    </h4>

                                    <div className="space-y-2.5">
                                        {(selectedCustomer.ordersList || []).map((ord, oidx) => (
                                            <div key={oidx} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                                                <div className="space-y-0.5">
                                                    <div className="font-extrabold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                                                        <span>{ord.item}</span>
                                                        <span className="text-[10px] font-mono font-bold text-slate-400">({ord.id})</span>
                                                    </div>
                                                    <div className="text-[10px] text-slate-400">{ord.date}</div>
                                                </div>
                                                <div className="text-left">
                                                    <div className="font-black text-emerald-600 text-sm">${ord.price}</div>
                                                    <div className="text-[10px] font-bold text-blue-500">{ord.status}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tab 3: Admin Private Notes, Security & Password */}
                            {drawerTab === "notes" && (
                                <div className="space-y-5">
                                    {/* Login Credentials & Password Management Card */}
                                    <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 space-y-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-xs font-black text-amber-700 dark:text-amber-400">
                                                <Key className="w-4 h-4 text-amber-500" />
                                                <span>بيانات تسجيل الدخول وكلمة المرور الحالية:</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-800 dark:text-amber-300 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                                            >
                                                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                                                <span>{showPassword ? "إخفاء 👁️" : "إظهار كلمة المرور 👁️"}</span>
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-xl border border-amber-500/20 text-xs">
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold block">اسم الدخول / الهاتف:</span>
                                                <span className="font-mono font-bold text-slate-900 dark:text-white dir-ltr block text-right">{selectedCustomer.phone}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] text-slate-400 font-bold block">كلمة المرور المسجلة:</span>
                                                <span className="font-mono font-black text-amber-600 dark:text-amber-400 block dir-ltr text-right">
                                                    {showPassword ? (selectedCustomer.pass || "Dk123456#") : "••••••••••••"}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Reset Password Input & Button */}
                                        <div className="flex items-center gap-2 pt-1">
                                            <input
                                                type="text"
                                                placeholder="اكتب كلمة مرور جديدة هنا..."
                                                value={newPassInput}
                                                onChange={(e) => setNewPassInput(e.target.value)}
                                                className="flex-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-3 py-1.5 text-xs font-mono font-bold focus:outline-none focus:border-amber-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (!newPassInput.trim()) {
                                                        toast.error("يرجى إدخال كلمة المرور الجديدة أولاً");
                                                        return;
                                                    }
                                                    updateUserPassword(selectedCustomer.phone, newPassInput.trim());
                                                    setSelectedCustomer({ ...selectedCustomer, pass: newPassInput.trim() });
                                                    setNewPassInput("");
                                                    setShowPassword(true);
                                                    toast.success("تم تحديث وتغيير كلمة مرور العميل بنجاح! 🔑✨");
                                                }}
                                                className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs transition cursor-pointer shadow flex items-center gap-1 shrink-0"
                                            >
                                                <Key className="w-3.5 h-3.5" />
                                                <span>حفظ كلمة المرور الجديدة</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Risk Security Selector */}
                                    <div className="space-y-1.5">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">تقييم أمان العميل وموثوقيته:</label>
                                        <div className="grid grid-cols-3 gap-2">
                                            <button
                                                type="button"
                                                onClick={() => setActiveTrustScore("high")}
                                                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                                    activeTrustScore === "high"
                                                        ? "bg-emerald-600 text-white shadow"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                                }`}
                                            >
                                                <CheckCircle2 className="w-3.5 h-3.5" />
                                                <span>موثوق 100%</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setActiveTrustScore("medium")}
                                                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                                    activeTrustScore === "medium"
                                                        ? "bg-amber-600 text-white shadow"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                                }`}
                                            >
                                                <AlertCircle className="w-3.5 h-3.5" />
                                                <span>يحتاج متابعة</span>
                                            </button>

                                            <button
                                                type="button"
                                                onClick={() => setActiveTrustScore("flagged")}
                                                className={`p-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                                                    activeTrustScore === "flagged"
                                                        ? "bg-red-600 text-white shadow"
                                                        : "bg-slate-100 dark:bg-slate-800 text-slate-600"
                                                }`}
                                            >
                                                <ShieldAlert className="w-3.5 h-3.5" />
                                                <span>محظور / خطر</span>
                                            </button>
                                        </div>
                                    </div>

                                    {/* Customer Tags Manager */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">وسوم وتصنيفات العميل الخاصة:</label>
                                        <div className="flex items-center gap-1.5 flex-wrap bg-slate-50 dark:bg-slate-950 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                                            {activeTags.map((t, tid) => (
                                                <span key={tid} className="inline-flex items-center gap-1 text-xs font-extrabold px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 border border-blue-500/20">
                                                    <span>#{t}</span>
                                                    <button type="button" onClick={() => handleRemoveTag(t)} className="text-red-500 hover:text-red-700">✕</button>
                                                </span>
                                            ))}

                                            <div className="flex items-center gap-1 shrink-0">
                                                <input
                                                    type="text"
                                                    placeholder="إضافة وسم..."
                                                    value={newTagInput}
                                                    onChange={(e) => setNewTagInput(e.target.value)}
                                                    onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAddTag(); } }}
                                                    className="w-24 px-2 py-1 text-xs font-bold rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none"
                                                />
                                                <button type="button" onClick={handleAddTag} className="px-2.5 py-1 rounded-xl bg-blue-600 text-white text-xs font-black">+</button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Private Admin Notes */}
                                    <div className="space-y-2">
                                        <label className="block text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                                            <FileText className="w-4 h-4 text-blue-500" />
                                            <span>ملاحظات الإدارة الخاصة عن العميل:</span>
                                        </label>
                                        <textarea
                                            rows={4}
                                            placeholder="اكتب أي ملاحظات خاصة لا تظهر للعميل (مثلاً: يفضل الشراء عبر بطاقات مدى، يطلب حسابات سعودية، زبون خلوق جداً)..."
                                            value={activeNoteText}
                                            onChange={(e) => setActiveNoteText(e.target.value)}
                                            className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Drawer Footer Actions */}
                        <div className="bg-slate-100 dark:bg-slate-950 p-4 px-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                            <button
                                onClick={() => openWhatsApp(selectedCustomer)}
                                className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>مراسلة واتساب</span>
                            </button>

                            <button
                                onClick={handleSaveCustomerDrawer}
                                className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center gap-1.5 shadow"
                            >
                                <Check className="w-4 h-4" />
                                <span>حفظ وتحديث البروفايل 📝</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Mass WhatsApp Broadcast Campaign Modal */}
            {showBroadcastModal && (
                <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Megaphone className="w-5 h-5 text-emerald-500" />
                                <span>حملة إعادة الاستهداف بالواتساب 📢</span>
                            </h3>
                            <button onClick={() => setShowBroadcastModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                        </div>

                        <div className="space-y-4 text-xs font-bold">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 mb-1">الفئة المستهدفة بالنشر:</label>
                                <select
                                    value={broadcastTarget}
                                    onChange={(e) => setBroadcastTarget(e.target.value)}
                                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                                >
                                    <option value="vip">👑 كبار عملاء ה-VIP فقط (Diamond & Gold)</option>
                                    <option value="inactive">💤 العملاء الغائبين (+20 يوم لإعادة التنشيط)</option>
                                    <option value="all">👥 كافة عملاء المتجر بالكامل</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 mb-1">نص الرسالة الترويجية للواتساب:</label>
                                <textarea
                                    rows={4}
                                    value={broadcastMsg}
                                    onChange={(e) => setBroadcastMsg(e.target.value)}
                                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold leading-relaxed"
                                />
                            </div>

                            <div className="pt-3 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowBroadcastModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">إلغاء</button>
                                <button type="button" onClick={triggerBroadcast} className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black shadow">إطلاق الحملة بالواتساب 🚀</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Manual Customer Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 bg-black/65 backdrop-blur-sm flex items-center justify-center p-4 dir-rtl">
                    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                            <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                                <Plus className="w-5 h-5 text-blue-500" />
                                <span>إضافة عميل جديد يدوياً</span>
                            </h3>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600 font-bold text-sm">✕</button>
                        </div>

                        <form onSubmit={handleAddManualCustomer} className="space-y-3.5 text-xs font-bold">
                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم العميل الثلاثي:</label>
                                <input
                                    type="text"
                                    placeholder="مثال: تركي الكثيري"
                                    value={newCustForm.name}
                                    onChange={(e) => setNewCustForm({ ...newCustForm, name: e.target.value })}
                                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                                />
                            </div>

                            <div>
                                <label className="block text-slate-700 dark:text-slate-300 mb-1">رقم الهاتف (مع فتح الخط):</label>
                                <input
                                    type="text"
                                    placeholder="966500000000"
                                    value={newCustForm.phone}
                                    onChange={(e) => setNewCustForm({ ...newCustForm, phone: e.target.value })}
                                    className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold dir-ltr text-right"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 mb-1">اسم اللعبة/الاشتراك:</label>
                                    <input
                                        type="text"
                                        placeholder="مثال: PS Plus Extra"
                                        value={newCustForm.recentGame}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, recentGame: e.target.value })}
                                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-700 dark:text-slate-300 mb-1">قيمة المشتريات ($):</label>
                                    <input
                                        type="number"
                                        value={newCustForm.totalSpent}
                                        onChange={(e) => setNewCustForm({ ...newCustForm, totalSpent: e.target.value })}
                                        className="w-full rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-3 text-xs font-bold"
                                    />
                                </div>
                            </div>

                            <div className="pt-3 flex justify-end gap-2">
                                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold">إلغاء</button>
                                <button type="submit" className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black">حفظ العميل ✨</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
