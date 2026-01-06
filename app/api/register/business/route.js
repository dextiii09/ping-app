import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { sendOTP } from '../../../lib/email';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, companyName, niche, location, budget, requirements } = body;

        // Validation
        if (!email || !password || !companyName || !niche) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP and expiration
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

        // Create User
        const user = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                role: "BUSINESS",
                isVerified: false,
                tier: "free",
                otp, // Save OTP
                otpExpires // Save OTP expiration
            }
        });

        // Create Profile
        await db.businessProfile.create({
            data: {
                userId: user.id,
                companyName,
                niche,
                location: location || "Global",
                budget: budget || "Not Disclosed",
                requirements: requirements || "Generic",
                images: "[]", // Default empty JSON array
                website: "",
                logo: ""
            }
        });

        // Send OTP to user's email
        await sendOTP(email, otp);

        return NextResponse.json({ success: true, email: user.email }, { status: 201 });
    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
