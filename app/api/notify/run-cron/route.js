import { NextResponse } from 'next/server';
import { db } from "../../../lib/db";
import webpush from 'web-push';

export const dynamic = 'force-dynamic';

webpush.setVapidDetails(
    'mailto:dhruv@antigravity.com',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

export async function GET(request) {
    // 1. Verify Vercel Cron Secret (Security)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}` && process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // 2. Fetch all subscriptions
        const subscriptions = await db.pushSubscription.findMany({
            include: { user: true }
        });

        console.log(`Sending daily push to ${subscriptions.length} users.`);

        // 3. Send Notifications
        const notificationPayload = JSON.stringify({
            title: 'Good Morning, Creator! ☀️',
            body: 'New brands are looking for you. Check your matches now!',
            icon: '/icons/icon-192x192.png'
        });

        const promises = subscriptions.map(sub => {
            const pushConfig = {
                endpoint: sub.endpoint,
                keys: {
                    auth: sub.auth,
                    p256dh: sub.p256dh
                }
            };
            return webpush.sendNotification(pushConfig, notificationPayload)
                .catch(err => {
                    if (err.statusCode === 410) {
                        // Expired subscription, delete it
                        return db.pushSubscription.delete({ where: { id: sub.id } });
                    }
                    console.error('Push Error:', err);
                });
        });

        await Promise.all(promises);

        return NextResponse.json({ success: true, sentTo: subscriptions.length });

    } catch (error) {
        console.error("Cron Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
