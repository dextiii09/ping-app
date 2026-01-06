import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';

export async function GET(request) {
    try {
        // 1. Verify Auth & Get User ID
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;
        const userRole = payload.role;

        // 2. Determine Target Role (Opposite of current user)
        const targetRole = userRole === 'BUSINESS' ? 'INFLUENCER' : 'BUSINESS';

        // 3. Get IDs of users already swiped on
        const swipedIds = await db.swipe.findMany({
            where: { swiperId: userId },
            select: { swipedOnId: true }
        });
        const excludedIds = swipedIds.map(s => s.swipedOnId);
        excludedIds.push(userId); // Exclude self (just in case)

        // 4. Fetch Candidates
        const candidates = await db.user.findMany({
            where: {
                role: targetRole,
                id: { notIn: excludedIds },
                // Optional: valid profile check
                OR: [
                    { businessProfile: { isNot: null } },
                    { influencerProfile: { isNot: null } }
                ]
            },
            include: {
                businessProfile: true,
                influencerProfile: true
            },
            take: 20 // Limit batch size
        });

        // 5. Format Data for Frontend
        const formattedCandidates = candidates.map(user => {
            const profile = user.businessProfile || user.influencerProfile;
            let images = [];
            try {
                images = profile.images ? JSON.parse(profile.images) : [];
            } catch (e) { images = []; }

            // Fallback image if none
            if (images.length === 0) {
                images = [`https://api.dicebear.com/7.x/initials/svg?seed=${profile.companyName || profile.fullName}`];
            }

            return {
                id: user.id,
                name: profile.companyName || profile.fullName,
                age: user.role === 'BUSINESS' ? (profile.companySize || 'Business') : 'Creator', // Map 'age' to something relevant
                niche: profile.niche,
                location: profile.location,
                bio: profile.bio || profile.requirements || "No bio available",
                image: images[0],
                images: images,
                verified: user.isVerified,
                job: user.role === 'BUSINESS' ? profile.niche : "Influencer",
                interests: [profile.niche, "Marketing", "Growth"], // Mock interests for now
                matchPercentage: Math.floor(Math.random() * 30) + 70,
                role: user.role
            };
        });

        return NextResponse.json({ success: true, candidates: formattedCandidates });

    } catch (error) {
        console.error("Matching Candidates Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
