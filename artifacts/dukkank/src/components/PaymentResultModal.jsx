import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, ShieldCheck, ArrowRight } from "lucide-react";
import { apiGetPaymentOrder } from "../lib/api";
import { useCurrency } from "../contexts/CurrencyContext";
import { useCart } from "../contexts/CartContext";
import { useCustomer } from "../contexts/CustomerContext";

export function PaymentResultModal() {
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState("success"); // "success" | "declined"
    const [declineReason, setDeclineReason] = useState("");
    const [order, setOrder] = useState(null);
    const [orderId, setOrderId] = useState("");
    const [orderNumber, setOrderNumber] = useState("");
    const { format } = useCurrency();
    const { clear, items } = useCart();
    const { addOrderToHistory } = useCustomer();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const pStatus = params.get("payment");
        const oId = params.get("orderId") || "";
        const oNum = params.get("orderNumber") || "";
        const reason = params.get("reason");

        if (pStatus === "success" || pStatus === "declined") {
            setStatus(pStatus);
            setOrderId(oId);
            setOrderNumber(oNum);
            setDeclineReason(reason || "تم رفض المعاملة من البنك المعالج (يرجى التأكد من رصيد البطاقة وسريانها)");
            setOpen(true);

            if (pStatus === "success") {
                // Clear cart only on successful payment!
                clear();

                if (oId) {
                    apiGetPaymentOrder(oId)
                        .then((data) => {
                            setOrder(data);
                            addOrderToHistory({
                                id: data?.orderNumber || data?.id || oNum || oId,
                                items: (data?.items || []).map((i) => i.name || i.title || "منتج رقمي"),
                                total: format(data?.totalPrice || 0),
                                status: "مكتمل",
                            });
                        })
                        .catch(() => {
                            addOrderToHistory({
                                id: oNum || oId,
                                items: ["طلب تم تأكيده بالدفع"],
                                total: "تم الدفع",
                                status: "مكتمل",
                            });
                        });
                }
            }
        }
    }, []);

    const handleClose = () => {
        setOpen(false);
        const newUrl = window.location.pathname;
        window.history.replaceState({}, document.title, newUrl);
    };

    if (!open) return null;

    const isSuccess = status === "success";

    return (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-3xl p-6 sm:p-8 text-center space-y-5 shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                {isSuccess ? (
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
                    </div>
                ) : (
                    <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <XCircle className="w-10 h-10 stroke-[2.5]" />
                    </div>
                )}

                <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[hsl(var(--brand-ink))]">
                        {isSuccess ? "تم الدفع بنجاح! 🎉" : "تعذرت عملية الدفع ❌"}
                    </h2>
                    <p className="text-sm text-[hsl(var(--brand-ink))]/70 leading-relaxed">
                        {isSuccess
                            ? "شكراً لك! تم استلام دفعتك وتأكيد طلبك عبر بوابة الدفع بنجاح. جاري تسليم طلبك بأسرع وقت."
                            : declineReason}
                    </p>
                </div>

                {(order || orderId || orderNumber) && (
                    <div className="bg-[hsl(var(--brand-cream))]/60 rounded-2xl p-4 border border-[hsl(var(--brand-ink))]/10 text-right space-y-2 text-xs">
                        <div className="flex justify-between border-b border-[hsl(var(--brand-ink))]/10 pb-2">
                            <span className="text-[hsl(var(--brand-ink))]/60">رقم الطلب والفاتورة:</span>
                            <span className="font-mono font-bold text-[hsl(var(--brand-blue-deep))]">
                                {order?.orderNumber || orderNumber || order?.id || orderId}
                            </span>
                        </div>
                        {order?.customer?.name && (
                            <div className="flex justify-between border-b border-[hsl(var(--brand-ink))]/10 pb-2">
                                <span className="text-[hsl(var(--brand-ink))]/60">اسم العميل:</span>
                                <span className="font-bold text-[hsl(var(--brand-ink))]">{order.customer.name}</span>
                            </div>
                        )}
                        <div className="flex justify-between">
                            <span className="text-[hsl(var(--brand-ink))]/60">حالة العملية:</span>
                            <span className={`font-bold ${isSuccess ? "text-emerald-600" : "text-red-600"}`}>
                                {isSuccess ? `مدفوعة ومكتملة بنجاح ✅ ${order?.totalPrice ? `(${format(order.totalPrice)})` : ""}` : "مرفوضة من البنك"}
                            </span>
                        </div>
                    </div>
                )}

                <div className="pt-2">
                    <button
                        onClick={handleClose}
                        className={`w-full inline-flex items-center justify-center gap-2 rounded-full h-12 text-white font-bold text-sm hover:opacity-90 transition-all shadow-md ${
                            isSuccess ? "bg-[hsl(var(--brand-blue-deep))]" : "bg-[hsl(var(--brand-ink))]"
                        }`}
                    >
                        {isSuccess ? "متابعة التصفح في المتجر" : "إغلاق والمحاولة ببطاقة أخرى"}
                        <ArrowRight className="w-4 h-4 rotate-180" />
                    </button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[hsl(var(--brand-ink))]/40">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    معاملة ممارسة ومحمية بواسطة PayTabs / MEPS Jordan
                </div>
            </div>
        </div>
    );
}
