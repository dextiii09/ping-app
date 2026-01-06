import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';

export async function POST(request) {
    try {
        // 1. Verify Auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        const body = await request.json();
        const { swipedOnId, direction } = body;

        if (!swipedOnId || !direction) {
            return NextResponse.json({ error: "Missing data" }, { status: 400 });
        }

        // 2. Record the Swipe
        // Upsert ensures we don't crash if they swipe again (though UI should prevent it)
        await db.swipe.upsert({
            where: {
                swiperId_swipedOnId: {
                    swiperId: userId,
                    swipedOnId: swipedOnId
                }
            },
            update: { direction },
            create: {
                swiperId: userId,
                swipedOnId: swipedOnId,
                direction
            }
        });

        // 3. Check for Match (Only if swiped Right)
        let isMatch = false;
        let matchData = null;

        if (direction === 'right') {
            const otherSwipe = await db.swipe.findUnique({
                where: {
                    swiperId_swipedOnId: {
                        swiperId: swipedOnId,
                        swipedOnId: userId
                    }
                }
            });

            if (otherSwipe && otherSwipe.direction === 'right') {
                isMatch = true;

                // Create Match Record
                // Determine who is who (Business vs Influencer)
                // We need to fetch roles to be precise, or just try/catch unique constraint
                const user = await db.user.findUnique({ where: { id: userId } });
                const otherUser = await db.user.findUnique({ where: { id: swipedOnId } });

                const businessId = user.role === 'BUSINESS' ? userId : swipedOnId;
                const influencerId = user.role === 'INFLUENCER' ? userId : swipedOnId;

                // Create the Match
                const newMatch = await db.match.create({
                    data: {
                        businessId,
                        influencerId
                    }
                });

                // Create Notifications for both users
                await db.notification.createMany({
                    data: [
                        {
                            userId: businessId,
                            type: 'MATCH',
                            relatedId: newMatch.id,
                            content: "You have a new match! 🎉"
                        },
                        {
                            userId: influencerId,
                            type: 'MATCH',
                            relatedId: newMatch.id,
                            content: "You have a new match! 🎉"
                        }
                    ]
                });

                // Get profile data for the return payload (to show "It's a Match!" modal)
                const otherProfile = user.role === 'BUSINESS'
                    ? await db.influencerProfile.findUnique({ where: { userId: swipedOnId } })
                    : await db.businessProfile.findUnique({ where: { userId: swipedOnId } });

                let otherImage = null;
                try {
                    const images = otherProfile.images ? JSON.parse(otherProfile.images) : [];
                    otherImage = images[0] || `https://api.dicebear.com/7.x/initials/svg?seed=${otherProfile.fullName || otherProfile.companyName}`;
                } catch (e) { }

                matchData = {
                    id: newMatch.id,
                    name: otherProfile.fullName || otherProfile.companyName,
                    image: otherImage
                };
            }
        }

        return NextResponse.json({ success: true, isMatch, matchData });

    } catch (error) {
        console.error("Swipe Error:", error);
        // Handle unique constraint if match already exists (race condition)
        if (error.code === 'P2002') {
            return NextResponse.json({ success: true, isMatch: true, message: "Already matched" });
        }
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
