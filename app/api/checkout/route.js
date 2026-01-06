import { NextResponse } from 'next/server';
import { db } from '../../lib/db';
import { jwtVerify } from 'jose';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'sk_test_mock_key', {
    apiVersion: '2023-10-16',
});

const PRICES = {
    plus: process.env.STRIPE_PRICE_PLUS || 'price_mock_plus',
    gold: process.env.STRIPE_PRICE_GOLD || 'price_mock_gold',
    platinum: process.env.STRIPE_PRICE_PLATINUM || 'price_mock_platinum'
};

export async function POST(request) {
    try {
        // 1. Verify Auth
        const token = request.cookies.get('auth_token')?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const secret = new TextEncoder().encode(process.env.JWT_SECRET || 'default-secret-key');
        const { payload } = await jwtVerify(token, secret);
        const userId = payload.userId;
        const userEmail = payload.email;

        const body = await request.json();
        const { tier } = body;

        if (!PRICES[tier]) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        // 2. Check if Stripe Key is Mock
        if (!process.env.STRIPE_SECRET_KEY) {
            console.warn("Stripe Secret Key missing. Returning mock success URL.");
            return NextResponse.json({
                success: true,
                url: `/dashboard?payment=success&tier=${tier}`
            });
        }

        // 3. Create Stripe Session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price: PRICES[tier],
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            success_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard?payment=success&tier=${tier}`,
            cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/premiums?payment=cancelled`,
            customer_email: userEmail,
            metadata: {
                userId: userId,
                tier: tier
            }
        });

        return NextResponse.json({ success: true, url: session.url });

    } catch (error) {
        console.error("Stripe Checkout Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
