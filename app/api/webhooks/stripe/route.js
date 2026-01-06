import { NextResponse } from 'next/server';
import { db } from '@/app/lib/db';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    apiVersion: '2023-10-16',
});

// This is necessary to verify the signature properly in Next.js App Router
// We read the text body directly
export async function POST(request) {
    console.log("🔔 Webhook received");
    try {
        const body = await request.text();
        console.log("📝 Body read, length:", body.length);

        const sig = request.headers.get('stripe-signature');
        console.log("🔑 Signature:", sig);

        let event;

        try {
            if (process.env.STRIPE_SECRET_KEY) {
                // Real verification if keys are present
                const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test';
                event = stripe.webhooks.constructEvent(body, sig, endpointSecret);
            } else {
                // Mock for testing without real keys
                console.log("⚠️ Using Mock Verification");
                event = JSON.parse(body);
            }
        } catch (err) {
            console.error(`Webhook Signature/Parse Error: ${err.message}`);
            return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
        }

        console.log("✅ Event Type:", event.type);

        // Handle the event
        switch (event.type) {
            case 'checkout.session.completed':
                const session = event.data.object;
                const { userId, tier } = session.metadata || {};
                console.log("📦 Metadata:", { userId, tier });

                if (userId && tier) {
                    console.log(`💰 Payment success! Upgrading user ${userId} to ${tier}`);

                    try {
                        const updated = await db.user.update({
                            where: { id: userId },
                            data: { tier: tier }
                        });
                        console.log("💾 Database Updated:", updated.tier);
                    } catch (dbErr) {
                        console.error("Database Update Failed:", dbErr);
                        return NextResponse.json({ error: "Database Update Failed" }, { status: 500 });
                    }
                } else {
                    console.log("⚠️ Missing metadata");
                }
                break;
            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        return NextResponse.json({ received: true });

    } catch (globalErr) {
        console.error("Global Webhook Error:", globalErr);
        return NextResponse.json({ error: "Internal Server Error", details: globalErr.message }, { status: 500 });
    }
}
