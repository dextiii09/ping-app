import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
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

        // 2. Aggregate Data
        // A. Swipes Received (Measure of "Reach" or "Interest")
        const swipesReceived = await db.swipe.count({
            where: {
                swipedOnId: userId,
                direction: 'right' // Only count likes? Or all views? Let's count likes as "Interest"
            }
        });

        // B. Total Profile Views (Proxy: Total swipes received left OR right)
        const totalViews = await db.swipe.count({
            where: { swipedOnId: userId }
        });

        // C. Matches
        const matchesCount = await db.match.count({
            where: {
                OR: [
                    { businessId: userId },
                    { influencerId: userId }
                ]
            }
        });

        // D. Messages Received ( Engagement )
        const messagesReceived = await db.message.count({
            where: { receiverId: userId }
        });

        // Mock Historical Data for Graph (Last 7 days)
        // In a real app, we'd query by date grouping. Here we mock it based on total.
        const history = Array.from({ length: 7 }).map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (6 - i));
            return {
                date: date.toLocaleDateString(undefined, { weekday: 'short' }),
                views: Math.floor(Math.random() * 10) + Math.floor(totalViews / 7),
                likes: Math.floor(Math.random() * 5) + Math.floor(swipesReceived / 7),
            };
        });

        return NextResponse.json({
            success: true,
            stats: {
                totalViews,
                swipesReceived, // "Likes"
                matchesCount,
                messagesReceived,
                history
            }
        });

    } catch (error) {
        console.error("Analytics API Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
