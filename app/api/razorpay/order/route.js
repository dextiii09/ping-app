import Razorpay from 'razorpay';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_mock_key',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'mock_secret'
});

const PRICES = {
    plus: 499,
    gold: 999,
    platinum: 1999
};

export async function POST(request) {
    try {
        const body = await request.json();
        const { tier } = body;

        if (!PRICES[tier]) {
            return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
        }

        const amount = PRICES[tier] * 100; // Amount in paise

        const options = {
            amount: amount,
            currency: "INR",
            receipt: "receipt_" + Math.random().toString(36).substring(7),
        };

        const order = await razorpay.orders.create(options);
        return NextResponse.json({ success: true, order });

    } catch (error) {
        console.error("Razorpay Order Error:", error);
        return NextResponse.json({ error: "Error creating order" }, { status: 500 });
    }
}
