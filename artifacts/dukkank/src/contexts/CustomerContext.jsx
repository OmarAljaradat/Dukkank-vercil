import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { saveRegisteredUser } from "../lib/storage";

const CustomerContext = createContext(null);

const STORAGE_KEY = "dukkank_customer_account";
const ORDERS_KEY = "dukkank_customer_orders";
const WALLET_KEY = "dukkank_customer_wallet";
const TICKETS_KEY = "dukkank_customer_tickets";

export function CustomerProvider({ children }) {
    const [customer, setCustomer] = useState(null);
    const [orders, setOrders] = useState([]);
    const [walletBalance, setWalletBalance] = useState(0.00);
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const savedCust = localStorage.getItem(STORAGE_KEY);
            const savedOrders = localStorage.getItem(ORDERS_KEY);
            const savedWallet = localStorage.getItem(WALLET_KEY);
            const savedTickets = localStorage.getItem(TICKETS_KEY);

            if (savedCust) {
                setCustomer(JSON.parse(savedCust));
            }

            if (savedOrders) {
                setOrders(JSON.parse(savedOrders));
            } else {
                setOrders([]);
            }

            if (savedWallet !== null) {
                const parsedVal = parseFloat(savedWallet);
                const clamped = isNaN(parsedVal) ? 0.00 : Math.min(100.00, Math.max(0, parsedVal));
                setWalletBalance(clamped);
            } else {
                setWalletBalance(0.00);
            }

            if (savedTickets) {
                setTickets(JSON.parse(savedTickets));
            } else {
                setTickets([]);
            }
        } catch (e) {
            console.error("CustomerContext load error:", e);
        } finally {
            setLoading(false);
        }
    }, []);

    const login = (emailOrPhone, password) => {
        const name = emailOrPhone.split("@")[0] || "عميل دُكانك";
        const loggedCust = {
            id: `cust-${Date.now()}`,
            name: name,
            email: emailOrPhone.includes("@") ? emailOrPhone : `${emailOrPhone}@dukkank.com`,
            phone: !emailOrPhone.includes("@") ? emailOrPhone : "0790000000",
            createdAt: new Date().toISOString(),
        };

        setCustomer(loggedCust);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(loggedCust));

        // Save to CRM storage
        saveRegisteredUser({
            phone: loggedCust.phone,
            name: loggedCust.name,
            email: loggedCust.email,
            pass: password || "LoggedUser123",
            createdAt: Date.now()
        });

        // Fire & forget backend POST
        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: loggedCust.name, email: loggedCust.email, phone: loggedCust.phone, password })
        }).catch(() => null);

        toast.success("أهلاً بك مجدداً! تم تسجيل الدخول بنجاح 👋", { description: loggedCust.name });
        return loggedCust;
    };

    const signup = ({ name, email, phone, instagram, password }) => {
        const newCust = {
            id: `cust-${Date.now()}`,
            name: name || "عميل جديد",
            email: email || "",
            phone: phone || "",
            instagram: instagram || "",
            createdAt: new Date().toISOString(),
        };

        setCustomer(newCust);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newCust));

        // Save to CRM storage
        saveRegisteredUser({
            phone: newCust.phone || newCust.email || `phone-${Date.now()}`,
            name: newCust.name,
            email: newCust.email,
            instagram: newCust.instagram,
            pass: password || "CustomerPass123",
            createdAt: Date.now()
        });

        // Fire & forget backend POST
        fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newCust.name, email: newCust.email, phone: newCust.phone, instagram: newCust.instagram, password })
        }).catch(() => null);

        toast.success("تم إنشاء الحساب بنجاح! 🎉", { description: newCust.name });
        return newCust;
    };

    const logout = () => {
        setCustomer(null);
        localStorage.removeItem(STORAGE_KEY);
        toast.info("تم تسجيل الخروج");
    };

    const updateProfile = (data) => {
        if (!customer) return;
        const updated = { ...customer, ...data };
        setCustomer(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        toast.success("تم تحديث معلومات الحساب بنجاح ✨");
    };

    const addOrderToHistory = (newOrder) => {
        const orderRecord = {
            id: newOrder.id || `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
            date: new Date().toISOString().split("T")[0],
            items: newOrder.items || ["طلب جديد"],
            total: newOrder.total || "0.00$",
            status: newOrder.status || "قيد المعالجة",
            paymentMethod: newOrder.paymentMethod || "PayTabs Online Checkout",
        };

        const updatedOrders = [orderRecord, ...orders];
        setOrders(updatedOrders);
        localStorage.setItem(ORDERS_KEY, JSON.stringify(updatedOrders));
    };

    const topUpWallet = (amount) => {
        const nextBal = walletBalance + amount;
        setWalletBalance(nextBal);
        localStorage.setItem(WALLET_KEY, nextBal.toString());
        toast.success(`تم شحن محفظتك بـ $${amount} بنجاح! 💳`, { description: `الرصيد الحالي: $${nextBal.toFixed(2)}` });
    };

    const createTicket = ({ orderId, subject, category, message }) => {
        const newTicket = {
            id: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
            orderId: orderId || "عام",
            subject: subject || "طلب دعم",
            category: category || "استفسار",
            status: "قيد المعالجة 🟡",
            date: new Date().toISOString().split("T")[0],
            message: message || "",
        };
        const updated = [newTicket, ...tickets];
        setTickets(updated);
        localStorage.setItem(TICKETS_KEY, JSON.stringify(updated));
        toast.success("تم إنشاء تذكرة الصيانة بنجاح! سيتواصل معك الفريق 🛠️");
        return newTicket;
    };

    return (
        <CustomerContext.Provider
            value={{
                customer,
                orders,
                walletBalance,
                tickets,
                loading,
                login,
                signup,
                logout,
                updateProfile,
                addOrderToHistory,
                topUpWallet,
                createTicket,
            }}
        >
            {children}
        </CustomerContext.Provider>
    );
}

export function useCustomer() {
    const ctx = useContext(CustomerContext);
    if (!ctx) throw new Error("useCustomer must be used within CustomerProvider");
    return ctx;
}
