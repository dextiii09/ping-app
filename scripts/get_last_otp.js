const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const user = await prisma.user.findFirst({
        orderBy: { createdAt: 'desc' }
    });
    if (user) {
        console.log(`OTP:${user.otp}`);
    } else {
        console.log("No user found");
    }
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
