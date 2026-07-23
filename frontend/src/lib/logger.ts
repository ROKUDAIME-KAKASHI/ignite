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
    const logDbUrl = process.env.LOG_DATABASE_URL;
    if (!logDbUrl) {
      console.warn("LOG_DATABASE_URL not set. Skipping audit log.");
      return;
    }

    const sql = neon(logDbUrl);
    await sql`
      INSERT INTO audit_logs (user_id, action, details)
      VALUES (${userId || 'anonymous'}, ${action}, ${JSON.stringify(details)}::jsonb)
    `;
  } catch (error) {
    console.error("Failed to write to audit log DB:", error);
  }
}
