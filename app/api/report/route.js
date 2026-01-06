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

// GET: Admin fetches all reports
export async function GET(request) {
    try {
        const user = await getAuth(request);
        if (!user || user.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const reports = await db.report.findMany({
            include: {
                reporter: { select: { email: true } },
                target: { select: { email: true } }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, reports });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}

// POST: User creates a report
export async function POST(request) {
    try {
        const user = await getAuth(request);
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const { targetId, type, reason, contextId } = await request.json();
        // type: "PROFILE" or "CHAT"

        const report = await db.report.create({
            data: {
                reporterId: user.userId,
                targetId,
                type,
                reason,
                contextId
            }
        });

        return NextResponse.json({ success: true, report });
    } catch (error) {
        console.error("Report Error", error);
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
        const updated = await db.report.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, report: updated });
    } catch (error) {
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}
