import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password } = body;

        const user = await db.user.findUnique({
            where: { email }
        });

        if (!user) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // Create JWT
        const secret = new TextEncoder().encode(process.env.JWT_SECRET);
        const token = await new SignJWT({ userId: user.id, email: user.email, role: user.role })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('30d')
            .sign(secret);

        // Create Response & Set Cookie
        const response = NextResponse.json({
            success: true,
            role: user.role,
            name: user.email,
            tier: user.tier
        }, { status: 200 });

        response.cookies.set('auth_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax', // Relaxed for better PWA/Mobile support
            maxAge: 2592000, // 30 days
            path: '/',
        });

        return response;

    } catch (error) {
        console.error("Login Error:", error);
        return NextResponse.json({ error: "Login failed" }, { status: 500 });
    }
}
