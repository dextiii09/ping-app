import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export async function GET(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        const user = await db.user.findUnique({
            where: { id: userId },
            select: { preferences: true }
        });

        return NextResponse.json({ preferences: user?.preferences || {} });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function PUT(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        const body = await request.json();
        const { preferences } = body;

        await db.user.update({
            where: { id: userId },
            data: { preferences }
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
