import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

export async function PUT(request) {
    try {
        // 1. Auth Check
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token.value, secret);
        const userId = payload.userId;

        // 2. Parse Body
        const body = await request.json();
        const { about, jobTitle, company, college, gradYear, lookingFor, interests, instagram, youtube, tiktok, twitter, linkedin, images, smartPhotos } = body;

        // 3. Update User & Profile
        // We need to determine if it's an influencer or business.
        // For now, assuming Influencer based on the frontend fields.
        // Ideally we check payload.role or fetch user first.

        const user = await db.user.findUnique({
            where: { id: userId },
            include: { influencerProfile: true, businessProfile: true }
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Prepare Image JSON string if provided
        const imagesJson = images ? JSON.stringify(images) : undefined;

        if (user.role === 'INFLUENCER') {
            // Construct bio from about + professional info for now, or just use 'bio' field if schema matched perfectly.
            // Schema has: fullName, instagramHandle, niche, location, bio, followers, engagement, images.
            // Frontend has: about, jobTitle, company... 
            // We'll map 'about' to 'bio'.
            // We might need to store the extra fields in a JSON column or schema update.
            // The schema has 'images' string.

            await db.influencerProfile.update({
                where: { userId: userId },
                data: {
                    bio: about,
                    images: imagesJson, // This updates the photos
                    instagramHandle: instagram,
                    // We don't have columns for jobTitle, company etc yet in schema?
                    // Let's check schema again. Schema has: fullName, instagramHandle, niche, location, bio, followers, engagement, images.
                    // It does NOT have jobTitle, company, etc. 
                    // The user might lose this data if we don't save it.
                    // The User model has 'preferences' Json? Maybe store there?
                    // Or maybe we should just focus on IMAGES for now as requested.
                }
            });
        } else if (user.role === 'BUSINESS') {
            await db.businessProfile.update({
                where: { userId: userId },
                data: {
                    images: imagesJson,
                    // requirements? description?
                }
            });
        }

        // Also update User preferences for flags like smartPhotos
        if (smartPhotos !== undefined) {
            // Merge with existing preferences
            const currentPrefs = user.preferences || {};
            await db.user.update({
                where: { id: userId },
                data: {
                    preferences: { ...currentPrefs, smartPhotos }
                }
            });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error("Profile Update Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token');

        if (!token) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token.value, secret);
        const userId = payload.userId;

        const user = await db.user.findUnique({
            where: { id: userId },
            include: { influencerProfile: true, businessProfile: true }
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        let profileData = {};
        if (user.role === 'INFLUENCER' && user.influencerProfile) {
            profileData = {
                about: user.influencerProfile.bio,
                instagram: user.influencerProfile.instagramHandle,
                images: user.influencerProfile.images ? JSON.parse(user.influencerProfile.images) : [],
                // Map other fields...
            };
        } else if (user.role === 'BUSINESS' && user.businessProfile) {
            profileData = {
                // ...
                images: user.businessProfile.images ? JSON.parse(user.businessProfile.images) : [],
            };
        }

        return NextResponse.json({
            profile: profileData,
            smartPhotos: user.preferences?.smartPhotos || false
        });

    } catch (error) {
        console.error("Profile Fetch Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
