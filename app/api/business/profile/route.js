import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

// Helper: Get User ID from Token
async function getUserId(request) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload.userId;
    } catch {
        return null;
    }
}

export async function POST(request) {
    try {
        const userId = await getUserId(request);
        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const body = await request.json();
        // Allow updating arbitrary fields for now, specifically verificationDocs
        const { verificationDocs, website, bio, companyName } = body;

        await db.businessProfile.update({
            where: { userId },
            data: {
                ...(verificationDocs && { verificationDocs }),
                ...(website && { website }),
                ...(companyName && { companyName }),
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Profile Update Error", error);
        return NextResponse.json({ error: "Update Failed" }, { status: 500 });
    }
}
