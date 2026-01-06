const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const password = await bcrypt.hash('password123', 10);

    // 1. ADMIN USER
    const adminEmail = 'admin@ping.com';
    const admin = await prisma.user.upsert({
        where: { email: adminEmail },
        update: {},
        create: {
            email: adminEmail,
            password: password,
            role: 'ADMIN',
            isVerified: true,
            tier: 'platinum'
        }
    });
    console.log(`✅ Admin User: ${adminEmail} (password123)`);

    // 2. BUSINESS USER
    const bizEmail = 'business@ping.com';
    const biz = await prisma.user.upsert({
        where: { email: bizEmail },
        update: {
            businessProfile: {
                update: {
                    verificationDocs: JSON.stringify(["https://example.com/business-license.pdf"])
                }
            }
        },
        create: {
            email: bizEmail,
            password: password,
            role: 'BUSINESS',
            isVerified: true,
            tier: 'gold',
            businessProfile: {
                create: {
                    companyName: "Ping Corp",
                    niche: "Tech",
                    location: "San Francisco, CA",
                    budget: "$50k - $100k",
                    requirements: "Looking for tech reviewers",
                    website: "https://ping.com",
                    images: "[]",
                    verificationDocs: JSON.stringify(["https://example.com/business-license.pdf"])
                }
            }
        }
    });
    console.log(`✅ Business User: ${bizEmail} (password123)`);

    // 3. INFLUENCER USER
    const infEmail = 'creator@ping.com';
    const inf = await prisma.user.upsert({
        where: { email: infEmail },
        update: {},
        create: {
            email: infEmail,
            password: password,
            role: 'INFLUENCER',
            isVerified: true,
            tier: 'plus',
            influencerProfile: {
                create: {
                    fullName: "Sarah Creator",
                    instagramHandle: "@sarah_creates",
                    niche: "Lifestyle",
                    location: "New York, NY",
                    bio: "Lifestyle and Tech vlogger.",
                    images: "[]"
                }
            }
        }
    });
    console.log(`✅ Influencer User: ${infEmail} (password123)`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
