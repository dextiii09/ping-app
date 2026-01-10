const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    console.log('🔄 Resetting demo users...');

    // 1. Password
    const password = await bcrypt.hash('password123', 10);

    // 2. Define Users
    const demoUsers = [
        {
            email: 'admin@ping.com',
            name: 'System Admin',
            role: 'ADMIN',
            isVerified: true
        },
        {
            email: 'business@ping.com',
            name: 'Demo Business Inc',
            role: 'BUSINESS',
            isVerified: true,
            // Profile Data
            niche: 'Tech & SaaS',
            location: 'New York, USA',
            budget: '$1k - $5k',
            requirements: 'Looking for tech reviewers'
        },
        {
            email: 'influencer@ping.com',
            name: 'Demo Creator',
            role: 'INFLUENCER',
            isVerified: true,
            // Profile Data
            instagramHandle: '@demo_creator',
            niche: 'Lifestyle',
            location: 'Los Angeles, USA',
            bio: 'Lifestyle and travel content creator.'
        }
    ];

    for (const u of demoUsers) {
        try {
            // Upsert User
            const user = await prisma.user.upsert({
                where: { email: u.email },
                update: {
                    password: password,
                    role: u.role,
                    isVerified: u.isVerified,
                    name: u.name // Ensure name is synced
                },
                create: {
                    email: u.email,
                    name: u.name,
                    password: password,
                    role: u.role,
                    isVerified: u.isVerified
                }
            });
            console.log(`✅ User ${user.email} ready.`);

            // Upsert Profile based on role
            if (u.role === 'BUSINESS') {
                await prisma.businessProfile.upsert({
                    where: { userId: user.id },
                    update: {}, // Keep existing data if present
                    create: {
                        userId: user.id,
                        companyName: u.name,
                        niche: u.niche,
                        location: u.location,
                        budget: u.budget,
                        requirements: u.requirements,
                        website: 'https://ping.com'
                    }
                });
                console.log(`   - Business Profile OK`);
            } else if (u.role === 'INFLUENCER') {
                await prisma.influencerProfile.upsert({
                    where: { userId: user.id },
                    update: {},
                    create: {
                        userId: user.id,
                        fullName: u.name,
                        instagramHandle: u.instagramHandle,
                        niche: u.niche,
                        location: u.location,
                        bio: u.bio,
                        followers: '10k',
                        engagement: '5.2%'
                    }
                });
                console.log(`   - Influencer Profile OK`);
            }
        } catch (err) {
            console.error(`❌ Error processing ${u.email}:`, err.message);
        }
    }
}

main()
    .catch(e => {
        console.error('Fatal Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
