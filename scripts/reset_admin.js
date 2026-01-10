const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    const email = 'admin@ping.com';
    const password = 'password123';

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upsert Admin User
    const user = await prisma.user.upsert({
        where: { email },
        update: {
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true
        },
        create: {
            email,
            password: hashedPassword,
            role: 'ADMIN',
            isVerified: true,
            tier: 'platinum'
        }
    });

    console.log(`Reset password for ${user.email} to '${password}'`);
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect());
