const axios = require('axios');
const crypto = require('crypto');

// Mock Data
const WEBHOOK_SECRET = 'whsec_test';
const USER_ID = 'ed42e9a9-44ba-4edc-9642-6a53971b6fc4'; // Real ID from DB
const TIER = 'platinum';

async function testWebhook() {
    console.log("🚀 Testing Stripe Webhook...");

    const payload = JSON.stringify({
        id: 'evt_test_webhook',
        object: 'event',
        type: 'checkout.session.completed',
        data: {
            object: {
                id: 'cs_test_session',
                object: 'checkout.session',
                metadata: {
                    userId: USER_ID,
                    tier: TIER
                }
            }
        }
    });

    // Generate Signature
    const time = Math.floor(Date.now() / 1000);
    const signature = crypto
        .createHmac('sha256', WEBHOOK_SECRET)
        .update(`${time}.${payload}`)
        .digest('hex');

    const stripeSignature = `t=${time},v1=${signature}`;

    try {
        const res = await axios.post('http://localhost:3000/api/webhooks/stripe', payload, {
            headers: {
                'Content-Type': 'application/json',
                'Stripe-Signature': stripeSignature
            }
        });

        console.log(`✅ Status: ${res.status}`);
        console.log(`Response:`, res.data);

    } catch (e) {
        if (e.response) {
            console.error(`❌ Error ${e.response.status}:`, e.response.data);
        } else {
            console.error(`❌ Network Error:`, e.message);
        }
    }
}

testWebhook();
