export interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    from?: string;
    apiKey?: string;
}

export async function sendEmail({ to, subject, html, from, apiKey }: SendEmailOptions) {
    const recipients = Array.isArray(to) ? to : [to];
    const key = (apiKey || process.env.RESEND_API_KEY || "").trim();
    const sender = from || process.env.RESEND_FROM_EMAIL || "متجر دُكانك <onboarding@resend.dev>";

    if (!key) {
        return { success: false, error: "مفتاح Resend API غير محدد. يرجى إدخاله في الإعدادات أو لوحة التحكم." };
    }

    try {
        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                from: sender,
                to: recipients,
                subject,
                html,
            }),
        });

        const data = await res.json();
        if (!res.ok) {
            console.error("[Resend API Error]:", data);
            const errDetail = data?.message || data?.error || JSON.stringify(data);
            return { success: false, error: errDetail };
        }

        console.log("[Resend Email Sent Successfully]:", data);
        return { success: true, data };
    } catch (error: any) {
        console.error("[Resend Exception]:", error);
        return { success: false, error: error?.message || error };
    }
}

/**
 * Send Order Receipt Email HTML Template
 */
export async function sendOrderReceiptEmail(toEmail: string, orderDetails: { orderId: string; customerName: string; total: string; items: string[] }) {
    const html = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f7f6f0; padding: 40px 20px; color: #1e293b;">
            <div style="max-w: 600px; margin: 0 auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1b365d, #0f172a); padding: 30px; text-align: center; color: #ffffff;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 800;">🎮 متجر دُكانك — فاتورة الطلب</h1>
                    <p style="margin-top: 8px; font-size: 14px; opacity: 0.85;">شكراً لثقتك بنا! تم استلام طلبك وتفعيله بنجاح ⚡</p>
                </div>

                <!-- Body -->
                <div style="padding: 30px;">
                    <p style="font-size: 16px; font-weight: 700; margin-bottom: 20px;">أهلاً ${orderDetails.customerName || "عميلنا العزيز"}،</p>
                    <p style="font-size: 14px; color: #475569; line-height: 1.6;">تم تأكيد وتوثيق طلبك في متجر دُكانك وإليك تفاصيل التفعيل والفاتورة الرقمية:</p>

                    <!-- Order Card -->
                    <div style="background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 14px; padding: 20px; margin: 20px 0;">
                        <div style="display: flex; justify-content: space-between; font-size: 13px; font-weight: 800; border-bottom: 1px solid #e2e8f0; pb: 10px; mb: 10px;">
                            <span style="color: #1b365d;">رقم الطلب: ${orderDetails.orderId}</span>
                        </div>
                        <ul style="padding-right: 20px; margin: 15px 0; font-size: 14px; font-weight: 700; color: #334155;">
                            ${orderDetails.items.map(item => `<li style="margin-bottom: 6px;">${item}</li>`).join("")}
                        </ul>
                        <div style="border-top: 1px solid #e2e8f0; pt: 10px; font-size: 16px; font-weight: 900; color: #dc2626; text-align: left;">
                            المبلغ الإجمالي: ${orderDetails.total}
                        </div>
                    </div>

                    <div style="background: #eff6ff; border-right: 4px solid #2563eb; padding: 12px 16px; border-radius: 8px; font-size: 13px; color: #1e40af; margin-top: 20px;">
                        💡 يمكنك الوصول إلى كود التفعيل ومكتبتك الرقمية دائماً عبر لوحة تحكم حسابك في المتجر.
                    </div>
                </div>

                <!-- Footer -->
                <div style="background: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    فريق دعم متجر دُكانك • جميع الحقوق محفوظة © ${new Date().getFullYear()}
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: toEmail,
        subject: `فاتورة وتأكيد الطلب #${orderDetails.orderId} — متجر دُكانك 🎮`,
        html,
    });
}

/**
 * Send 4-Digit OTP Verification Email HTML Template
 */
export async function sendOtpEmail(toEmail: string, otpCode: string) {
    const html = `
        <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f7f6f0; padding: 40px 20px; color: #1e293b;">
            <div style="max-w: 500px; margin: 0 auto; background: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.08); border: 1px solid #e2e8f0; text-align: center;">
                
                <!-- Header -->
                <div style="background: linear-gradient(135deg, #1b365d, #0f172a); padding: 30px; color: #ffffff;">
                    <div style="font-size: 36px; margin-bottom: 10px;">🔐</div>
                    <h1 style="margin: 0; font-size: 22px; font-weight: 800;">رمز التحقق — متجر دُكانك</h1>
                    <p style="margin-top: 6px; font-size: 13px; opacity: 0.85;">كود تأكيد تسجيل الدخول الخاص بحسابك</p>
                </div>

                <!-- OTP Code Display -->
                <div style="padding: 35px 25px;">
                    <p style="font-size: 14px; color: #475569; margin-bottom: 25px;">استخدم كود التفعيل المكون من 4 أرقام لإكمال العملية:</p>

                    <!-- 4-Digit OTP Box -->
                    <div style="display: inline-block; background: #f1f5f9; border: 2px dashed #1b365d; border-radius: 16px; padding: 16px 32px; letter-spacing: 14px; font-size: 36px; font-weight: 900; color: #1b365d; margin-bottom: 25px;">
                        ${otpCode}
                    </div>

                    <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                        ينتهي صلاحية هذا الكود خلال 10 دقائق.<br/>إذا لم تقم بطلب هذا الكود، يرجى تجاهل هذه الرسالة.
                    </p>
                </div>

                <!-- Footer -->
                <div style="background: #f8fafc; padding: 18px; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
                    فريق أمان متجر دُكانك 🛡️ • جميع الحقوق محفوظة © ${new Date().getFullYear()}
                </div>
            </div>
        </div>
    `;

    return sendEmail({
        to: toEmail,
        subject: `🔐 رمز التحقق الخاص بك: ${otpCode} — متجر دُكانك`,
        html,
    });
}
