import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Verify Auth & Admin Role
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
        }

        // 2. Fetch Users (Influencers & Businesses)
        const users = await db.user.findMany({
            include: {
                businessProfile: true,
                influencerProfile: true
            },
            orderBy: { createdAt: 'desc' },
            take: 50 // Limit for safety
        });

        // 3. Format
        const formattedUsers = users.map(u => ({
            id: u.id,
            email: u.email,
            role: u.role,
            isVerified: u.isVerified,
            name: u.businessProfile?.companyName || u.influencerProfile?.fullName || "Unfinished Profile",
            verificationDocs: u.businessProfile?.verificationDocs || null,
            joined: u.createdAt,
            // New: Pass full profile data
            profile: u.businessProfile || u.influencerProfile || {}
        }));

        return NextResponse.json({ success: true, users: formattedUsers });

    } catch (error) {
        console.error("Admin Users Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        // Toggle Verification
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const body = await request.json();
        const { userId, isVerified } = body;

        await db.user.update({
            where: { id: userId },
            data: { isVerified }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        // console.error(error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
