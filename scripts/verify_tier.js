const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.user.findUnique({
            where: { id: 'ed42e9a9-44ba-4edc-9642-6a53971b6fc4' }
        });
        console.log('User Tier:', user.tier);
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
