import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function POST(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        const { subscription } = await request.json();

        // Save subscription
        await db.pushSubscription.create({
            data: {
                userId: userId,
                endpoint: subscription.endpoint,
                p256dh: subscription.keys.p256dh,
                auth: subscription.keys.auth
            }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Subscription Error:", error);
        return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
    }
}
