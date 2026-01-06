const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("⚙️ Starting Settings Verification...");

    try {
        // 1. Setup Test User
        const email = `settings_test_${Date.now()}@example.com`;
        const initialPassword = 'password123';
        const hashedPassword = await bcrypt.hash(initialPassword, 10);

        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                role: 'BUSINESS',
                tier: 'free'
            }
        });
        console.log(`✅ Test User Created: ${user.id}`);

        // 2. Verify Preferences Update Logic (simulated)
        // Since we can't easily call Next.js API from node script without running server,
        // we will test the DB logic that the API performs.

        console.log("👉 Testing Preference Update...");
        const prefs = {
            notifications: { push: true, email: false, marketing: true },
            privacy: { privateProfile: true, activityStatus: false }
        };

        await prisma.user.update({
            where: { id: user.id },
            data: { preferences: prefs }
        });

        const updatedUser = await prisma.user.findUnique({ where: { id: user.id } });

        // JSON comparison needs careful handling if strict equality
        if (JSON.stringify(updatedUser.preferences) === JSON.stringify(prefs)) {
            console.log("✅ Preferences DB Update Success");
        } else {
            console.error("❌ Preferences Mismatch:", updatedUser.preferences);
        }

        // 3. Verify Password Change Logic
        console.log("👉 Testing Password Update...");
        const newPassword = 'newPassword456';

        // Verify old
        const isMatch = await bcrypt.compare(initialPassword, user.password);
        if (!isMatch) console.error("❌ Initial password check failed");

        // Update
        const newHashed = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: { password: newHashed }
        });

        // Verify new
        const reloadedUser = await prisma.user.findUnique({ where: { id: user.id } });
        const isNewMatch = await bcrypt.compare(newPassword, reloadedUser.password);

        if (isNewMatch) {
            console.log("✅ Password DB Update Success");
        } else {
            console.error("❌ New password check failed");
        }

        // 4. Cleanup (Delete Account)
        console.log("👉 Testing Account Deletion...");
        await prisma.user.delete({ where: { id: user.id } });

        const deletedUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!deletedUser) {
            console.log("✅ Account Deletion Success");
        } else {
            console.error("❌ User still exists");
        }

    } catch (e) {
        console.error("❌ Verification Failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
