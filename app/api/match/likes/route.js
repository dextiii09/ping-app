import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;

        // Fetch swipes where the current user was swiped RIGHT on
        const likes = await db.swipe.findMany({
            where: {
                swipedOnId: userId,
                direction: 'right' // Confirmed lowercase
            },
            include: {
                swiper: {
                    include: {
                        businessProfile: true,
                        influencerProfile: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        const formattedLikes = likes.map(like => {
            const swiper = like.swiper;
            const isBusiness = swiper.role === 'BUSINESS';
            const profile = isBusiness ? swiper.businessProfile : swiper.influencerProfile;

            let image = null;
            if (profile?.images) {
                try {
                    const parsed = JSON.parse(profile.images);
                    image = parsed[0];
                } catch (e) { }
            }
            if (!image) {
                image = isBusiness ? profile?.logo : null;
            }
            if (!image) {
                // Fallback avatar
                image = `https://api.dicebear.com/7.x/initials/svg?seed=${swiper.name}`;
            }

            return {
                id: swiper.id,
                name: isBusiness ? profile?.companyName : profile?.fullName || swiper.name,
                type: isBusiness ? 'Brand' : 'Creator',
                image: image,
                time: new Date(like.createdAt).toLocaleDateString(), // simplified
                verified: swiper.isVerified,
                role: swiper.role
            };
        });

        return NextResponse.json({ likes: formattedLikes });

    } catch (error) {
        console.error("Fetch Likes Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
