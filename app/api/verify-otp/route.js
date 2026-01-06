import { NextResponse } from 'next/server';
import { db } from '../../lib/db';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        // 1. Fetch User
        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // 2. Check OTP
        // Ensure OTP exists, matches, and is not expired
        if (!user.otp || user.otp !== otp) {
            return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
        }

        if (user.otpExpires && new Date() > new Date(user.otpExpires)) {
            return NextResponse.json({ error: "OTP Expired" }, { status: 400 });
        }

        // 3. Verify User (Email Confirmed)
        // NOTE: We do NOT set isVerified: true here. That is for Admin approval only.
        await db.user.update({
            where: { email }, // using email is fine since unique
            data: {
                otp: null,
                otpExpires: null
            }
        });

        // 4. Create Token (Optional: Auto-login after verify?)
        // For now, let frontend handle redirect to login or dashboard.

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("OTP Error:", error);
        return NextResponse.json({ error: "Verification failed" }, { status: 500 });
    }
}
