import { NextResponse } from 'next/server';
import { db } from "../../../lib/db";
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ count: 0 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        const count = await db.notification.count({
            where: {
                userId: userId,
                isRead: false
            }
        });

        return NextResponse.json({ count });

    } catch (error) {
        return NextResponse.json({ count: 0 });
    }
}
