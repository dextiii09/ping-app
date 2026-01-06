import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

// GET: Fetch message history
export async function GET(request, { params }) {
    try {
        const { matchId } = params;

        // 1. Verify Auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        // 2. Fetch Messages
        // Ensure user is part of the match (security check)
        const match = await db.match.findUnique({
            where: { id: matchId },
            include: {
                messages: {
                    orderBy: { createdAt: 'asc' }
                }
            }
        });

        if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

        if (match.businessId !== userId && match.influencerId !== userId) {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        const formattedMessages = match.messages.map(msg => ({
            id: msg.id,
            text: msg.content,
            sender: msg.senderId === userId ? 'me' : 'them',
            createdAt: msg.createdAt
        }));

        return NextResponse.json({ success: true, messages: formattedMessages });

    } catch (error) {
        console.error("Get Messages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

// POST: Send a message
export async function POST(request, { params }) {
    try {
        const { matchId } = params;
        const body = await request.json();
        const { text } = body;

        if (!text) return NextResponse.json({ error: "Message empty" }, { status: 400 });

        // 1. Verify Auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        // 2. Get Match Details to find Receiver
        const match = await db.match.findUnique({ where: { id: matchId } });
        if (!match) return NextResponse.json({ error: "Match not found" }, { status: 404 });

        // Determine Receiver
        let receiverId;
        if (match.businessId === userId) {
            receiverId = match.influencerId;
        } else if (match.influencerId === userId) {
            receiverId = match.businessId;
        } else {
            return NextResponse.json({ error: "Forbidden" }, { status: 403 });
        }

        // 3. Create Message
        const newMessage = await db.message.create({
            data: {
                matchId,
                senderId: userId,
                receiverId,
                content: text
            }
        });

        // 4. Create Notification for Receiver
        await db.notification.create({
            data: {
                userId: receiverId,
                type: 'MESSAGE',
                relatedId: matchId, // Link to the match/conversation
                content: "You have a new message 💬"
            }
        });

        return NextResponse.json({
            success: true,
            message: {
                id: newMessage.id,
                text: newMessage.content,
                sender: 'me',
                createdAt: newMessage.createdAt
            }
        });

    } catch (error) {
        console.error("Send Message Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
