import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';

export const dynamic = 'force-dynamic';

export async function GET(request) {
    try {
        // 1. Verify Auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;
        const userRole = payload.role;

        // 2. Fetch Matches
        // We need matches where user is either businessId or influencerId
        const matches = await db.match.findMany({
            where: {
                OR: [
                    { businessId: userId },
                    { influencerId: userId }
                ]
            },
            include: {
                // Include profile data for both sides to resolve "other" user
                business: {
                    include: { businessProfile: true }
                },
                influencer: {
                    include: { influencerProfile: true }
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        // 3. Format Response
        const conversations = matches.map(match => {
            const isMeBusiness = match.businessId === userId;

            // Determine "Other" user
            const otherUser = isMeBusiness ? match.influencer : match.business;
            const otherProfile = isMeBusiness ? match.influencer.influencerProfile : match.business.businessProfile;

            // Safe image parsing
            let otherImage = null;
            try {
                const images = otherProfile?.images ? JSON.parse(otherProfile.images) : [];
                otherImage = images[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${otherProfile?.fullName || otherProfile?.companyName}`;
            } catch (e) { }

            return {
                id: match.id,
                otherUserId: otherUser.id,
                name: otherProfile?.fullName || otherProfile?.companyName || "Unknown",
                image: otherImage,
                lastMsg: match.messages[0]?.content || "No messages yet",
                lastMsgTime: match.messages[0]?.createdAt || match.createdAt,
            };
        });

        return NextResponse.json({ success: true, conversations });

    } catch (error) {
        console.error("Conversations Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
