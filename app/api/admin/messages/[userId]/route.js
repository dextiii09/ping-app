import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        const { userId } = params;

        // 1. Verify Auth & Admin Role
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);

        if (payload.role !== 'ADMIN') {
            return NextResponse.json({ error: "Forbidden: Admin access only" }, { status: 403 });
        }

        // 2. Fetch User's matches with full message history
        const matches = await db.match.findMany({
            where: {
                OR: [
                    { businessId: userId },
                    { influencerId: userId }
                ]
            },
            include: {
                business: {
                    include: { businessProfile: true }
                },
                influencer: {
                    include: { influencerProfile: true }
                },
                messages: {
                    orderBy: { createdAt: 'asc' } // Oldest first for reading flow
                }
            }
        });

        // 3. Format Reponse
        const conversations = matches.map(match => {
            const isTargetBusiness = match.businessId === userId;
            const otherUser = isTargetBusiness ? match.influencer : match.business;
            const otherProfile = isTargetBusiness ? match.influencer.influencerProfile : match.business.businessProfile;

            return {
                id: match.id,
                partnerName: otherProfile?.fullName || otherProfile?.companyName || "Unknown",
                partnerId: otherUser.id,
                messages: match.messages.map(msg => ({
                    id: msg.id,
                    senderId: msg.senderId,
                    content: msg.content,
                    createdAt: msg.createdAt,
                    isFromTarget: msg.senderId === userId
                }))
            };
        });

        return NextResponse.json({ success: true, conversations });

    } catch (error) {
        console.error("Admin Messages Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
