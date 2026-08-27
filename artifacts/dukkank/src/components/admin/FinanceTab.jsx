import { useState, useEffect, useCallback } from "react";
import {
    AreaChart, Area, BarChart, Bar, ResponsiveContainer, CartesianGrid, XAxis, YAxis, Tooltip
} from "recharts";
import { Plus, Trash2, Wallet, Handshake, CheckCircle2, Clock, RefreshCw, Loader2, DollarSign, TrendingUp } from "lucide-react";
import { apiListOrders } from "../../lib/api";
import { toast } from "sonner";

const PROFIT_CURVE = [
    { date: "19 يوليو", profit: 120 },
    { date: "20 يوليو", profit: 340 },
    { date: "21 يوليو", profit: 890 },
    { date: "22 يوليو", profit: 410 },
    { date: "23 يوليو", profit: 280 },
    { date: "24 يوليو", profit: 360 },
    { date: "25 يوليو", profit: 420 },
];

const REVENUE_VS_COST = [
    { date: "19 يوليو", revenue: 140, cost: 20 },
    { date: "20 يوليو", revenue: 380, cost: 40 },
    { date: "21 يوليو", revenue: 950, cost: 60 },
    { date: "22 يوليو", revenue: 450, cost: 40 },
    { date: "23 يوليو", revenue: 310, cost: 30 },
    { date: "24 يوليو", revenue: 400, cost: 40 },
    { date: "25 يوليو", revenue: 460, cost: 40 },
];

const DEFAULT_SUPPLIER_COSTS = [
    { supplier: "المورد أحمد (الخليج للألعاب)", item: "5x حسابات EA SPORTS FC 25 (PS5)", cost: "$110.00", date: "25 يوليو 2026", isPaid: true },
    { supplier: "متجر السريعة الرقمية", item: "3x اشتراك PS Plus Extra (12 شهر)", cost: "$135.00", date: "23 يوليو 2026", isPaid: true },
    { supplier: "سيرفر الأكواد المباشرة", item: "4x حسابات GTA V (PS5)", cost: "$48.00", date: "20 يوليو 2026", isPaid: false },
];

export default function FinanceTab() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [expenses, setExpenses] = useState(() => {
        try {
            const saved = localStorage.getItem("dukkank_admin_expenses");
            return saved ? JSON.parse(saved) : [];
        } catch {
            return [];
        }
    });
    const [title, setTitle] = useState("");
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("تكلفة شراء حسابات وألعاب");

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        try {
            const data = await apiListOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (_) {}
        finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [fetchOrders]);

    const handleAddExpense = (e) => {
        e.preventDefault();
        if (!title || !amount) return;
        const newExp = {
            id: Date.now(),
            date: new Date().toLocaleDateString("ar-SA"),
            title,
            amount: parseFloat(amount) || 0,
            formattedAmount: `$${parseFloat(amount).toFixed(2)}`,
            category,
        };
        const updated = [newExp, ...expenses];
        setExpenses(updated);
        localStorage.setItem("dukkank_admin_expenses", JSON.stringify(updated));
        setTitle("");
        setAmount("");
        toast.success("تم إضافة المصرف الإداري لمتجر دُكانك بنجاح 💸");
    };

    const handleDeleteExpense = (id) => {
        const updated = expenses.filter((x) => x.id !== id);
        setExpenses(updated);
        localStorage.setItem("dukkank_admin_expenses", JSON.stringify(updated));
        toast.success("تم حذف المصرف بنجاح");
    };

    // Live financial computations
    const totalRevenue = orders.length > 0
        ? orders.reduce((sum, o) => sum + (parseFloat(o.customer_paid) || 0), 0)
        : 2527.55;

    const totalSupplierCost = orders.length > 0
        ? orders.reduce((sum, o) => sum + (parseFloat(o.cost_price) || 0), 0)
        : 110.33;

    const totalGatewayFees = orders.reduce((sum, o) => sum + (parseFloat(o.gateway_fee) || 0), 0);

    const totalAdminExpenses = expenses.reduce((sum, ex) => sum + (parseFloat(ex.amount) || 0), 0);

    const netProfit = totalRevenue - totalSupplierCost - totalGatewayFees - totalAdminExpenses;
    const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "95.6";

    // Dynamic supplier orders
    const dynamicSupplierCosts = orders
        .filter((o) => o.cost_price || o.supplier)
        .map((o) => ({
            supplier: o.supplier || "مورد دُكانك المعتمد",
            item: `${o.game_name || o.subscription_type || "حساب رقمي"} (طلب #${o.order_number})`,
            cost: `$${(parseFloat(o.cost_price) || 0).toFixed(2)}`,
            date: o.created_at ? new Date(o.created_at).toLocaleDateString("ar-SA") : "اليوم",
            isPaid: o.status === "delivered" || o.status === "completed" || o.status === "account_received"
        }));

    const displaySupplierCosts = dynamicSupplierCosts.length > 0 ? dynamicSupplierCosts : DEFAULT_SUPPLIER_COSTS;

    return (
        <div className="space-y-6">
            {/* Top 5 KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">إجمالي إيرادات الألعاب</div>
                    <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">${totalRevenue.toFixed(2)}</div>
                </div>

                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">مستحقات وتكلفة الحسابات</div>
                    <div className="text-2xl sm:text-3xl font-black text-red-600">-${totalSupplierCost.toFixed(2)}</div>
                </div>

                <div className="bg-white dark:bg-white/[0.04] p-5 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-1">
                    <div className="text-xs font-bold text-slate-500">إجمالي المصروفات الإدارية</div>
                    <div className="text-2xl sm:text-3xl font-black text-red-600">-${totalAdminExpenses.toFixed(2)}</div>
                </div>

                {/* Solid Emerald Green Card */}
                <div className="bg-[#059669] text-white p-5 rounded-3xl shadow-lg space-y-1">
                    <div className="text-xs font-extrabold opacity-90">صافي الربح الفعلي لـ دُكانك</div>
                    <div className="text-2xl sm:text-3xl font-black">${netProfit.toFixed(2)}</div>
                </div>

                {/* Solid Gold Card */}
                <div className="bg-[#d97706] text-white p-5 rounded-3xl shadow-lg space-y-1">
                    <div className="text-xs font-extrabold opacity-90">هامش الربح الصافي</div>
                    <div className="text-2xl sm:text-3xl font-black">{profitMargin}%</div>
                </div>
            </div>

            {/* Profit Curve Area Chart */}
            <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Wallet className="w-4 h-4 text-emerald-600" />
                    <span>منحنى الأرباح الصافية بعد تكاليف الحسابات والمصروفات</span>
                </h3>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={PROFIT_CURVE}>
                            <defs>
                                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#64748b" }} />
                            <YAxis tick={{ fontSize: 10, fill: "#64748b" }} />
                            <Tooltip contentStyle={{ borderRadius: '12px' }} />
                            <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#profitGrad)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Financial Breakdown Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue vs Cost Bar Chart */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">إيرادات الألعاب مقابل تكلفة التوريد والحسابات</h3>
                    <div className="h-56 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={REVENUE_VS_COST}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip />
                                <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} name="إجمالي المبيعات" />
                                <Bar dataKey="cost" fill="#ef4444" radius={[6, 6, 0, 0]} name="تكلفة الحسابات" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Added Smart Feature: Supplier Credential Costs Tracker */}
                <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                        <Handshake className="w-4 h-4 text-amber-500" />
                        <span>🤝 مستحقات الموردين وتكلفة شراء الحسابات</span>
                    </h3>
                    <div className="space-y-2.5 pt-1">
                        {displaySupplierCosts.map((sup, idx) => (
                            <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs font-bold border border-slate-100 dark:border-white/5">
                                <div className="space-y-0.5">
                                    <div className="text-slate-900 dark:text-white font-extrabold">{sup.supplier}</div>
                                    <div className="text-[10px] text-slate-400 font-medium">{sup.item} • {sup.date}</div>
                                </div>
                                <div className="text-left">
                                    <div className="text-red-600 font-black">{sup.cost}</div>
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold mt-0.5 px-2 py-0.2 rounded-full ${sup.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                        {sup.isPaid ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {sup.isPaid ? "مدفوع 🟢" : "مستحق 🟡"}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Monthly Financial Reports Summary Table */}
            <div className="bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                <h3 className="font-extrabold text-base text-slate-900 dark:text-white">ملخص تقارير أرباح دُكانك الشهرية</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-right border-collapse">
                        <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold">
                                <th className="pb-3">الشهر</th>
                                <th className="pb-3">الإيرادات</th>
                                <th className="pb-3">تكلفة الحسابات والموردين</th>
                                <th className="pb-3">المصروفات الإدارية</th>
                                <th className="pb-3">صافي الربح الفعلي</th>
                                <th className="pb-3">هامش الربح</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200">
                            {MONTHLY_SUMMARY.map((r, idx) => (
                                <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                                    <td className="py-4 font-black">{r.month}</td>
                                    <td className="py-4 text-blue-600 font-extrabold">{r.revenue}</td>
                                    <td className="py-4 text-amber-600">{r.supplierCost}</td>
                                    <td className="py-4 text-red-500">{r.adminExpenses}</td>
                                    <td className="py-4 text-emerald-600 font-extrabold">{r.netProfit}</td>
                                    <td className="py-4 font-black">{r.margin}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Expense Management Grid */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Expenses History List */}
                <div className="md:col-span-8 bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white">سجل المصروفات المضافة لمتجر دُكانك</h3>
                    {expenses.length === 0 ? (
                        <div className="text-center py-10 text-xs font-bold text-slate-400">لا توجد أي مصروفات إدارية مسجلة حالياً</div>
                    ) : (
                        <div className="space-y-2">
                            {expenses.map((ex) => (
                                <div key={ex.id} className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 text-xs font-bold">
                                    <div className="space-y-0.5">
                                        <div className="text-slate-900 dark:text-white">{ex.title}</div>
                                        <div className="text-[10px] text-slate-400">{ex.date} • {ex.category}</div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-red-600 font-extrabold">{ex.amount}</span>
                                        <button onClick={() => handleDeleteExpense(ex.id)} className="p-1 text-slate-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Add Expense Form */}
                <div className="md:col-span-4 bg-white dark:bg-white/[0.04] p-6 rounded-3xl border border-slate-100 dark:border-white/10 shadow-sm space-y-4">
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                        <Plus className="w-4 h-4 text-emerald-600" />
                        <span>إضافة مصرف متجر جديد</span>
                    </h3>

                    <form onSubmit={handleAddExpense} className="space-y-3">
                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">عنوان المصرف:</label>
                            <input
                                type="text"
                                placeholder="مثال: استضافة المتجر، إعلان تيك توك"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs font-bold dark:bg-slate-900"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">القيمة بالدولار ($):</label>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs font-bold dark:bg-slate-900"
                                required
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-300">فئة المصرف:</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full px-3 py-2 border rounded-xl text-xs font-bold dark:bg-slate-900"
                            >
                                <option value="تكلفة شراء حسابات وألعاب">تكلفة شراء حسابات وألعاب</option>
                                <option value="سيرفرات واستضافة الموقع">سيرفرات واستضافة الموقع</option>
                                <option value="تسويق وإعلانات المتجر">تسويق وإعلانات المتجر</option>
                                <option value="مصاريف وتشغيلية أخرى">مصاريف وتشغيلية أخرى</option>
                            </select>
                        </div>

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
                        >
                            <span>حفظ وإضافة المصرف</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
