require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const allUsers = await prisma.user.findMany({ select: { id: true } });
        console.log("Users:", allUsers.length);
        if (allUsers.length > 0) {
            const res = await prisma.notification.createMany({
                data: allUsers.map(u => ({
                    userId: u.id,
                    title: "Test",
                    message: "Test",
                    link: "/notifications"
                }))
            });
            console.log("Created notifications:", res);
        }
    } catch(e) {
        console.error("ERROR:", e);
    }
}
run();
