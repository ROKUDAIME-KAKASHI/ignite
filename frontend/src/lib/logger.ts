import { neon } from '@neondatabase/serverless';

/**
 * Logs an action to the separate Neon Audit DB.
 * This runs over an HTTP connection, so it's incredibly fast and won't consume connection pool limits.
 * 
 * @param userId - The ID of the user performing the action (or null for anonymous actions)
 * @param action - A string describing the action (e.g., "COMPLETED_QUIZ", "SENT_CHAT_MESSAGE")
 * @param details - Any additional JSON data to store alongside the log
 */
export async function logAudit(userId: string | null | undefined, action: string, details: any = {}) {
  try {
    const logDbUrl = process.env.LOG_DATABASE_URL || "postgresql://neondb_owner:npg_xgK6coQO2IzA@ep-calm-brook-at0zflui-pooler.c-9.us-east-1.aws.neon.tech/neondb?sslmode=require";
    if (!logDbUrl) {
      console.warn("LOG_DATABASE_URL not set. Skipping audit log.");
      return;
    }

    const sql = neon(logDbUrl);
    
    // Add a fast timeout so it doesn't block the server action if the DB is unreachable
    const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Audit log timeout")), 1500));
    
    await Promise.race([
      sql`
        INSERT INTO audit_logs (user_id, action, details)
        VALUES (${userId || 'anonymous'}, ${action}, ${JSON.stringify(details)}::jsonb)
      `,
      timeout
    ]);
  } catch (error) {
    console.error("Failed to write to audit log DB:", error);
  }
}
