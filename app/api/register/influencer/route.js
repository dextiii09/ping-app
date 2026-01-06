import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { sendOTP } from '../../../lib/email';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, fullName, niche, platform, instagram, followers, engagement, bio, location } = body;

        // Validation
        if (!email || !password || !niche || (!fullName && !instagram)) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // Check if user exists
        const existingUser = await db.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Generate OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

        // Prepare Bio
        const fullBio = `${bio || ''} | ${followers || '0'} Followers | ${engagement || '0%'} Engagement`;

        // Create User & Influencer Profile
        const newUser = await db.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'INFLUENCER',
                isVerified: false,
                otp,
                otpExpires,
                tier: 'free',
                influencerProfile: {
                    create: {
                        fullName: fullName || instagram,
                        instagramHandle: instagram,
                        niche: niche || 'General',
                        followers: followers || '0',
                        bio: fullBio,
                        location: location || 'Global',
                        images: "[]"
                    }
                }
            }
        });

        // Send OTP
        await sendOTP(email, otp);

        return NextResponse.json({ success: true, email: newUser.email }, { status: 201 });

    } catch (error) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
