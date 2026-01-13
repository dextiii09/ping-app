// Using native fetch (Node 18+)

const BASE_URL = 'http://localhost:3000';
let AUTH_TOKEN = '';
let USER_ID = '';
let OTHER_USER_ID = ''; // We need another user to match with. 
// For simplicity, we might just test the endpoints for response codes rather than full logic if we can't easily seed 2 users.
// Actually, I'll register User A.

async function runTest() {
    console.log("🚀 Starting Full System Verification...");

    // 1. REGISTER
    const email = `test_${Date.now()}@example.com`;
    const password = 'password123';
    console.log(`\n1. Testing Registration (${email})...`);

    try {
        const regRes = await fetch(`${BASE_URL}/api/register/business`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email, password, companyName: "Test Corp", niche: "Tech"
            })
        });
        const regData = await regRes.json();
        if (regRes.status === 201 && regData.success) {
            console.log("✅ Registration Passed");
        } else {
            console.error("❌ Registration Failed", regData);
            return;
        }

        // 2. LOGIN
        console.log(`\n2. Testing Login...`);
        const loginRes = await fetch(`${BASE_URL}/api/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json(); // Usually returns user info

        // Extract cookie manually or assume the server set it?
        // Node fetch doesn't persist cookies automatically. We need to grab 'set-cookie'.
        const cookies = loginRes.headers.get('set-cookie');
        if (loginRes.status === 200 && cookies) {
            console.log("✅ Login Passed");
            AUTH_TOKEN = cookies; // We need to send this back
        } else {
            console.error("❌ Login Failed", loginData);
            return;
        }

        // Helper headers
        const headers = {
            'Cookie': AUTH_TOKEN,
            'Content-Type': 'application/json'
        };

        // 3. ANALYTICS (Check if we can fetch)
        console.log(`\n3. Testing Analytics API...`);
        const anaRes = await fetch(`${BASE_URL}/api/analytics`, { headers });
        const anaData = await anaRes.json();
        if (anaRes.status === 200 && anaData.success) {
            console.log("✅ Analytics API Verified");
        } else {
            console.error("❌ Analytics Failed", anaData);
        }

        // 4. NOTIFICATIONS COUNT
        console.log(`\n4. Testing Notifications API...`);
        const notifRes = await fetch(`${BASE_URL}/api/notify/count`, { headers });
        const notifData = await notifRes.json();
        if (notifRes.status === 200 && typeof notifData.count === 'number') {
            console.log("✅ Notifications API Verified");
        } else {
            console.error("❌ Notifications Failed", notifData);
        }

        // 5. MATCHING CANDIDATES
        console.log(`\n5. Testing Matching Candidates API...`);
        const matchRes = await fetch(`${BASE_URL}/api/match/candidates`, { headers });
        const matchData = await matchRes.json();
        if (matchRes.status === 200 && Array.isArray(matchData.candidates)) {
            console.log("✅ Matching Candidates API Verified");
            if (matchData.candidates.length > 0) {
                OTHER_USER_ID = matchData.candidates[0].id; // Grab one to swipe
            }
        } else {
            console.error("❌ Candidates Failed", matchData);
        }

        // 6. SWIPE
        if (OTHER_USER_ID) {
            console.log(`\n6. Testing Swipe API (Right Swipe on ${OTHER_USER_ID})...`);
            const swipeRes = await fetch(`${BASE_URL}/api/match/swipe`, {
                method: 'POST',
                headers,
                body: JSON.stringify({ targetUserId: OTHER_USER_ID, direction: 'right' })
            });
            const swipeData = await swipeRes.json();
            if (swipeRes.status === 200 && swipeData.success) {
                console.log("✅ Swipe API Verified");
            } else {
                console.error("❌ Swipe Failed", swipeData);
            }
        } else {
            console.log("⚠️ Skipping Swipe Test (No candidates found)");
        }

        // 7. STRIPE CHECKOUT
        console.log(`\n7. Testing Stripe Checkout API...`);
        const stripeRes = await fetch(`${BASE_URL}/api/checkout`, {
            method: 'POST',
            headers,
            body: JSON.stringify({ tier: 'gold' })
        });
        const stripeData = await stripeRes.json();
        if (stripeRes.status === 200 && stripeData.success && stripeData.url) {
            console.log("✅ Stripe Checkout API Verified");
        } else {
            console.error("❌ Stripe Failed", stripeData);
        }

        console.log("\n✨ Verification Complete!");

    } catch (e) {
        console.error("Test Script Error:", e);
    }
}

runTest();
