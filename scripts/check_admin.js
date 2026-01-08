const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkAdmin() {
    const admin = await prisma.user.findUnique({
        where: { email: 'admin@ping.com' }
    });
    console.log(admin ? 'Admin Found: ' + admin.email : 'Admin NOT Found');
    if (admin) console.log('Role:', admin.role);
}

checkAdmin()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
