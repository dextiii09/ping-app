import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export async function DELETE(request) {
    try {
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        // Cascade delete is usually handled by Prisma relations if configured,
        // but explicit deletion ensures cleanup.
        // For simplicity, we trust Prisma's onDelete: Cascade or just delete the user.

        await db.user.delete({
            where: { id: userId }
        });

        const response = NextResponse.json({ success: true });
        response.cookies.set('auth_token', '', { maxAge: 0, path: '/' }); // Logout
        return response;

    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
