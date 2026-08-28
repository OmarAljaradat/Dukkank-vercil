import { Link } from "react-router-dom";
import { ShoppingBag, ShieldCheck, Instagram, RotateCw, ArrowRight, Zap, QrCode, Camera, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

export default function AccountOrdersTab({ orders, addToCart, setCartOpen }) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-extrabold text-[hsl(var(--brand-ink))] flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-[hsl(var(--brand-blue-deep))]" />
                    <span>طلباتي والتفعيل</span>
                </h2>
                <span className="text-xs text-[hsl(var(--brand-ink))]/50 font-bold">
                    {orders.length} طلب
                </span>
            </div>

            {orders.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-[hsl(var(--brand-ink))]/10 space-y-3 shadow-sm">
                    <ShoppingBag className="w-12 h-12 text-[hsl(var(--brand-ink))]/20 mx-auto" />
                    <p className="font-extrabold text-base">لا توجد طلبات سابقة</p>
                    <p className="text-xs text-[hsl(var(--brand-ink))]/50">تصفح المتجر واشترِ ألعابك بسهولة وسرعة!</p>
                    <Link to="/games" className="inline-block px-6 py-2.5 bg-[hsl(var(--brand-blue-deep))] text-white rounded-xl text-xs font-bold mt-2 hover:bg-[hsl(var(--brand-ink))] transition-colors">
                        تصفح الألعاب الآن 🎮
                    </Link>
                </div>
            ) : (
                <div className="space-y-5">
                    {orders.map((ord, idx) => (
                        <div
                            key={ord.id || idx}
                            className="bg-white rounded-3xl border border-[hsl(var(--brand-ink))]/10 p-6 shadow-sm hover:shadow-md transition-shadow space-y-5"
                        >
                            {/* Top Bar: Order ID, Status & Price */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[hsl(var(--brand-ink))]/10">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2.5 flex-wrap">
                                        <span className="font-black text-lg text-[hsl(var(--brand-blue-deep))]">
                                            رقم الطلب: {ord.id}
                                        </span>
                                        <span className="px-3 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black flex items-center gap-1 border border-emerald-500/20">
                                            <ShieldCheck className="w-3.5 h-3.5" /> {ord.status || "مكتمل"}
                                        </span>
                                    </div>
                                    <div className="text-xs text-[hsl(var(--brand-ink))]/50 font-semibold">
                                        تاريخ الشراء: {ord.date} • طريقة الدفع: {ord.paymentMethod || "PayTabs Online"}
                                    </div>
                                </div>
                                <div className="text-2xl font-black text-[hsl(var(--brand-red))]">
                                    {ord.total}
                                </div>
                            </div>

                            {/* Order Items */}
                            <div className="space-y-2">
                                <div className="text-xs font-extrabold text-[hsl(var(--brand-ink))]/70">المنتجات في هذا الطلب:</div>
                                {(ord.items || []).map((item, i) => (
                                    <div key={i} className="flex items-center justify-between gap-3 p-3.5 bg-[hsl(var(--brand-cream))]/60 rounded-2xl border border-[hsl(var(--brand-ink))]/5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--brand-blue-deep))] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-sm">
                                                🎮
                                            </div>
                                            <div className="font-extrabold text-sm text-[hsl(var(--brand-ink))]">{item}</div>
                                        </div>
                                        <button
                                            onClick={() => {
                                                addToCart({ key: `reorder-${i}-${Date.now()}`, title: item, subtitle: "إعادة شراء", price: 20 });
                                                setCartOpen(true);
                                                toast.success("تمت الإضافة للسلة! 🛒");
                                            }}
                                            className="px-3.5 h-8.5 rounded-xl bg-[hsl(var(--brand-blue-deep))]/10 hover:bg-[hsl(var(--brand-blue-deep))] text-[hsl(var(--brand-blue-deep))] hover:text-white text-xs font-extrabold flex items-center gap-1.5 transition-all shrink-0"
                                        >
                                            <RotateCw className="w-3.5 h-3.5" />
                                            <span>إعادة شراء</span>
                                        </button>
                                    </div>
                                ))}
                            </div>

                            {/* Ultra-Clear QR Activation Process & WhatsApp Direct Link */}
                            <div className="bg-gradient-to-br from-emerald-950 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-500/30 space-y-5 relative overflow-hidden">
                                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-white/10 pb-3">
                                    <div className="flex items-center gap-2 text-emerald-400 font-extrabold text-sm">
                                        <Zap className="w-4.5 h-4.5 text-yellow-400 fill-yellow-400 animate-pulse" />
                                        <span>طريقة التفعيل الفوري (خلال دقائق ⚡)</span>
                                    </div>
                                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-3 py-1 rounded-full font-black">
                                        تفعيل QR آمن 100%
                                    </span>
                                </div>

                                {/* Simple 3-Step Explanation */}
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/15 space-y-1.5">
                                        <div className="flex items-center gap-2 font-black text-xs text-[hsl(var(--brand-gold))]">
                                            <span className="w-5 h-5 rounded-full bg-[hsl(var(--brand-gold))] text-[#3a2400] text-[11px] flex items-center justify-center font-black">1</span>
                                            <span>افتح جهاز السوني</span>
                                        </div>
                                        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                                            اختر <b>"إضافة مستخدم جديد"</b> ثم اختر <b>"تسجيل الدخول بواسطة التطبيق"</b>.
                                        </p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/15 space-y-1.5">
                                        <div className="flex items-center gap-2 font-black text-xs text-[hsl(var(--brand-gold))]">
                                            <span className="w-5 h-5 rounded-full bg-[hsl(var(--brand-gold))] text-[#3a2400] text-[11px] flex items-center justify-center font-black">2</span>
                                            <span>صوّر رمز الـ QR</span>
                                        </div>
                                        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                                            التقط صورة بكاميرا جوالك لرمز الـ QR الظاهر على شاشة التلفزيون.
                                        </p>
                                    </div>

                                    <div className="bg-white/10 backdrop-blur p-3.5 rounded-xl border border-white/15 space-y-1.5">
                                        <div className="flex items-center gap-2 font-black text-xs text-[hsl(var(--brand-gold))]">
                                            <span className="w-5 h-5 rounded-full bg-[hsl(var(--brand-gold))] text-[#3a2400] text-[11px] flex items-center justify-center font-black">3</span>
                                            <span>أرسل الصورة لإنستجرام</span>
                                        </div>
                                        <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                                            أرسل الصورة لخاص حسابنا على إنستجرام ونسجل الدخول في جهازك فوراً وتلعب مباشرة! 🎮
                                        </p>
                                    </div>
                                </div>

                                {/* Direct Instagram DM Action Button */}
                                <a
                                    href="https://ig.me/m/dukkank15"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full h-12 rounded-xl bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 hover:opacity-95 text-white font-black text-sm flex items-center justify-center gap-2 shadow-xl hover:shadow-2xl transition-all cursor-pointer"
                                >
                                    <Instagram className="w-5 h-5" />
                                    <span>إرسال صورة الـ QR والتفعيل عبر خاص الإنستجرام الآن 📸✨</span>
                                    <ArrowRight className="w-4 h-4 rotate-180" />
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
