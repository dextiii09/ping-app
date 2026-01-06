import nodemailer from 'nodemailer';

// Create a transporter. For 'dev', we use Ethereal which catches emails.
// In prod, you'd use SendGrid/AWS SES.

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        // These are public test credentials or generated on the fly.
        // Ideally, we should generate them once or use environment variables.
        // For this demo, let's assume we use a real test account or expect the user to set .env
        // But for "continue" flow auto-mode, I'll log creds if missing.
        user: process.env.EMAIL_USER || 'ethereal_user',
        pass: process.env.EMAIL_PASS || 'ethereal_pass'
    }
});

/**
 * Sends an OTP email
 * @param {string} to - Recipient email
 * @param {string} code - The 6-digit OTP
 */
export async function sendOTP(to, code) {
    if (!process.env.EMAIL_USER) {
        console.log("---------------------------------------------------");
        console.log(`[MOCK EMAIL] To: ${to} | Subject: Verify your Ping Account | OTP: ${code}`);
        console.log("---------------------------------------------------");
        return; // Return early if no real creds, to avoid crashes
    }

    try {
        const info = await transporter.sendMail({
            from: '"Ping App" <no-reply@ping.com>',
            to: to,
            subject: "Verify your Ping Account",
            text: `Your verification code is: ${code}. It expires in 10 minutes.`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2>Welcome to Ping! 💜</h2>
                    <p>Please use the following code to verify your account:</p>
                    <h1 style="color: #8a2be2; letter-spacing: 5px;">${code}</h1>
                    <p>This code expires in 10 minutes.</p>
                </div>
            `
        });
        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email:", error);
    }
}
