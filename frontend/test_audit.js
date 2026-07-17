require('dotenv').config();
const { neon } = require('@neondatabase/serverless');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
    try {
        const logDbUrl = process.env.LOG_DATABASE_URL || "postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
        const sql = neon(logDbUrl);
        const logs = await sql`
            SELECT id, user_id, action, details, created_at 
            FROM audit_logs 
            ORDER BY created_at DESC 
            LIMIT 100
        `;
        
        console.log("Logs fetched:", logs.length);
        const userIds = Array.from(new Set(logs.map(log => log.user_id).filter(id => id && id !== 'anonymous')));
        console.log("User IDs:", userIds);
        
        if (userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, firstName: true, lastName: true, email: true }
            });
            console.log("Users fetched:", users.length);
        }
    } catch (e) {
        console.error("ERROR:", e);
    }
}
run();
