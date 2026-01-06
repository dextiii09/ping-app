const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1. Get or Create Business
    let business = await prisma.user.findFirst({ where: { role: 'BUSINESS' } });
    if (!business) {
        console.log("Creating Business...");
        business = await prisma.user.create({
            data: {
                email: `biz_msg_${Date.now()}@test.com`,
                password: 'password123',
                role: 'BUSINESS',
                businessProfile: {
                    create: {
                        companyName: "Chatty Corp",
                        niche: "Tech",
                        location: "NY",
                        budget: "5000",
                        requirements: "Talkative influencers"
                    }
                }
            }
        });
    }

    // 2. Get or Create Influencer
    let influencer = await prisma.user.findFirst({ where: { role: 'INFLUENCER' } });
    if (!influencer) {
        console.log("Creating Influencer...");
        influencer = await prisma.user.create({
            data: {
                email: `inf_msg_${Date.now()}@test.com`,
                password: 'password123',
                role: 'INFLUENCER',
                influencerProfile: {
                    create: {
                        fullName: "Chatty Cathy",
                        niche: "Tech",
                        location: "NY"
                    }
                }
            }
        });
    }

    // 3. Create Match
    console.log("Creating Match...");
    const match = await prisma.match.create({
        data: {
            businessId: business.id,
            influencerId: influencer.id
        }
    });

    // 4. Create Messages
    console.log("Creating Messages...");
    await prisma.message.create({
        data: {
            matchId: match.id,
            senderId: business.id,
            receiverId: influencer.id,
            content: "Hey, let's collab!"
        }
    });
    await prisma.message.create({
        data: {
            matchId: match.id,
            senderId: influencer.id,
            receiverId: business.id,
            content: "Sure, what's the budget?"
        }
    });
    await prisma.message.create({
        data: {
            matchId: match.id,
            senderId: business.id,
            receiverId: influencer.id,
            content: "$5000 for a post."
        }
    });

    console.log(`seeded messages for ${business.email}`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
