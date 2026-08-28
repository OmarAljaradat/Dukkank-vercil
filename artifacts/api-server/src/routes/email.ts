import { Router } from "express";
import { sendEmail, sendOrderReceiptEmail, sendOtpEmail } from "../lib/email.js";

const router = Router();

// POST /api/send-otp - 4-digit OTP email endpoint
router.post("/send-otp", async (req, res) => {
    try {
        const { to, otpCode } = req.body;
        if (!to || !otpCode) {
            return res.status(400).json({ error: "Missing email or otpCode" });
        }
        const result = await sendOtpEmail(to, otpCode);
        return res.json(result);
    } catch (error: any) {
        console.error("Route send-otp error:", error);
        return res.status(500).json({ error: error.message || "Failed to send OTP" });
    }
});

// POST /api/send-email - Custom email endpoint
router.post("/send-email", async (req, res) => {
    try {
        const { to, subject, html, orderDetails, from, apiKey } = req.body;

        if (orderDetails && to) {
            const result = await sendOrderReceiptEmail(to, orderDetails);
            return res.json(result);
        }

        if (!to || !subject || !html) {
            return res.status(400).json({ error: "Missing required fields (to, subject, html)" });
        }

        const result = await sendEmail({ to, subject, html, from, apiKey });
        return res.json(result);
    } catch (error: any) {
        console.error("Route send-email error:", error);
        return res.status(500).json({ error: error.message || "Failed to send email" });
    }
});

// POST /api/admin/marketing/send-email & POST /api/marketing/send-email
const marketingSendHandler = async (req: any, res: any) => {
    try {
        const { resendApiKey, from, to, subject, bodyText, autoCoupon } = req.body || {};

        if (!to || (Array.isArray(to) && to.length === 0)) {
            return res.status(400).json({ error: "لم يتم تحديد أي بريد إلكتروني مستهدف" });
        }

        const recipients = Array.isArray(to) ? to : [to];
        const formattedHtml = `
            <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #0f172a; padding: 40px 20px; color: #ffffff;">
                <div style="max-width: 600px; margin: 0 auto; background: #1e293b; border-radius: 24px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 20px 40px rgba(0,0,0,0.5);">
                    <div style="background: linear-gradient(135deg, #1e40af, #3b82f6); padding: 32px 24px; text-align: center;">
                        <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #ffffff; letter-spacing: -0.5px;">🎮 متجر دُكانك — عرض خاص</h1>
                        <p style="margin: 8px 0 0; font-size: 14px; color: #dbeafe;">${subject || "خصم حصري ومميز لك"}</p>
                    </div>
                    <div style="padding: 32px 24px;">
                        <div style="font-size: 15px; line-height: 1.8; color: #cbd5e1; white-space: pre-wrap; margin-bottom: 24px;">
                            ${bodyText || ""}
                        </div>
                        ${autoCoupon?.code ? `
                            <div style="background: rgba(245, 158, 11, 0.15); border: 2px dashed #f59e0b; border-radius: 16px; padding: 20px; text-align: center; margin: 24px 0;">
                                <span style="font-size: 12px; color: #fbbf24; font-weight: 700; display: block; margin-bottom: 6px;">كود الخصم الحصري:</span>
                                <span style="font-size: 26px; font-weight: 900; color: #f59e0b; font-family: monospace; letter-spacing: 2px;">${autoCoupon.code}</span>
                                <span style="font-size: 12px; color: #34d399; font-weight: 700; display: block; margin-top: 6px;">خصم ${autoCoupon.discountPercent}% • متاح لأول ${autoCoupon.maxUses} استخدام ⚡</span>
                            </div>
                        ` : ''}
                        <div style="text-align: center; margin-top: 32px;">
                            <a href="https://dukkank.store" style="display: inline-block; background: #3b82f6; color: #ffffff; font-size: 14px; font-weight: 800; text-decoration: none; padding: 14px 32px; border-radius: 9999px; box-shadow: 0 4px 14px rgba(59, 130, 246, 0.4);">
                                تسوّق الآن من المتجر 🚀
                            </a>
                        </div>
                    </div>
                    <div style="background: #0f172a; padding: 20px; text-align: center; border-top: 1px solid rgba(255,255,255,0.05); font-size: 11px; color: #64748b;">
                        © دُكانك — متجر الألعاب والاشتراكات الرقمية المعتمد.
                    </div>
                </div>
            </div>
        `;

        const result = await sendEmail({
            to: recipients,
            subject: subject || "رسالة خاصة من متجر دُكانك 🎮",
            html: formattedHtml,
            from: from || "متجر دُكانك <onboarding@resend.dev>",
            apiKey: resendApiKey,
        });

        if (!result.success) {
            console.error("[Marketing Resend Failed]:", result.error);
            return res.status(400).json({
                ok: false,
                error: typeof result.error === "string" ? result.error : JSON.stringify(result.error)
            });
        }

        return res.json({
            ok: true,
            success: true,
            message: `تم إرسال البريد الإلكتروني بنجاح لـ ${recipients.length} مستلم!`,
            couponCreated: autoCoupon?.code ? `تم تفعيل الكود (${autoCoupon.code}) بخصم ${autoCoupon.discountPercent}%` : null,
        });
    } catch (error: any) {
        console.error("Route marketing send-email error:", error);
        return res.status(500).json({ ok: false, error: error.message || "حدث خطأ أثناء الإرسال" });
    }
};

router.post("/admin/marketing/send-email", marketingSendHandler);
router.post("/marketing/send-email", marketingSendHandler);

export default router;
