const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const BASE_URL = 'http://localhost:3000/api';
const EMAIL = `test_otp_${Date.now()}@example.com`;
const PASSWORD = 'password123';

async function main() {
    // Dynamic import for node-fetch (ESM) - REMOVED, using global fetch
    // const { default: fetch } = await import('node-fetch');

    console.log(`🚀 Starting OTP Flow Test for ${EMAIL}`);

    // 1. Register
    console.log('1. Registering...');
    const regRes = await fetch(`${BASE_URL}/register/business`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            email: EMAIL,
            password: PASSWORD,
            companyName: "Test Corp",
            niche: "Tech"
        })
    });

    if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
    console.log('✅ Registered.');

    // 2. Get OTP from DB
    const user = await prisma.user.findUnique({ where: { email: EMAIL } });
    if (!user) throw new Error("User not found in DB");
    console.log(`🔑 OTP Found in DB: ${user.otp}`);

    // 3. Verify OTP
    console.log('3. Verifying OTP...');
    const verifyRes = await fetch(`${BASE_URL}/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, otp: user.otp })
    });

    if (!verifyRes.ok) throw new Error(`Verification API failed: ${await verifyRes.text()}`);
    console.log('✅ OTP Verified via API.');

    // 4. Check DB State
    const updatedUser = await prisma.user.findUnique({ where: { email: EMAIL } });

    // CHECK 1: OTP should be null
    if (updatedUser.otp !== null) throw new Error("❌ OTP was not cleared!");
    else console.log("✅ OTP cleared.");

    // CHECK 2: isVerified should be FALSE (This is the key requirement)
    if (updatedUser.isVerified === true) throw new Error("❌ isVerified is TRUE! It should be FALSE.");
    else console.log("✅ isVerified is FALSE (Correct).");

    // 5. Attempt Login
    console.log('5. Attempting Login...');
    const loginRes = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: EMAIL, password: PASSWORD })
    });

    if (!loginRes.ok) throw new Error(`Login failed: ${await loginRes.text()}`);
    const loginData = await loginRes.json();
    if (loginData.success) console.log("✅ Login Successful.");
    else throw new Error("Login API returned success: false");

    console.log("\n🎉 TEST TASSED: User registered, verified OTP, stuck to isVerified:false, and logged in.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
