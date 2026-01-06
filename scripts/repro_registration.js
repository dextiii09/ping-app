const axios = require('axios');

async function testRegistration() {
    console.log("Testing Business Registration...");
    try {
        await axios.post('http://localhost:3000/api/register/business', {
            email: `test_biz_${Date.now()}@example.com`,
            password: 'password123',
            // Missing companyName, niche, etc.
        });
    } catch (e) {
        if (e.response) {
            console.log(`Status: ${e.response.status}`);
            console.log(`Response:`, e.response.data);
        } else {
            console.error("Business Test Failed (Network):", e.message);
        }
    }

    console.log("\nTesting Influencer Registration...");
    try {
        await axios.post('http://localhost:3000/api/register/influencer', {
            email: `test_inf_${Date.now()}@example.com`,
            password: 'password123',
            // Missing fullName
            instagram: 'just_handle'
        });
    } catch (e) {
        if (e.response) {
            console.log(`Status: ${e.response.status}`);
            console.log(`Response:`, e.response.data);
        } else {
            console.error("Influencer Test Failed (Network):", e.message);
        }
    }
}

testRegistration();
