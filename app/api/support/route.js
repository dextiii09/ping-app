import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

async function getAuth(request) {
    const token = request.cookies.get('auth_token')?.value;
    if (!token) return null;
    try {
        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        return payload;
    } catch (e) {
        return null;
    }
}

// GET: Admin fetches all tickets
export async function GET(request) {
    try {
        const user = await getAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const tickets = await db.supportTicket.findMany({
            include: { user: { select: { email: true } } },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST: User creates a ticket
export async function POST(request) {
    try {
        const user = await getAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { subject, message } = await request.json();
        if (!subject || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

        const ticket = await db.supportTicket.create({
            data: {
                userId: user.userId,
                subject,
                message
            }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// PUT: Admin updates status
export async function PUT(request) {
    try {
        const user = await getAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const { id, status } = await request.json();
        const updated = await db.supportTicket.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, ticket: updated });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
