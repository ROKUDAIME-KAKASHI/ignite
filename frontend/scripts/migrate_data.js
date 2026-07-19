const { Client } = require('pg');

const cockroachUrl = "postgresql://jinto:GaHQko4Kw8HcHwuJnckvRw@blitz-pegasus-18559.jxf.gcp-asia-south1.cockroachlabs.cloud:26257/defaultdb?sslmode=verify-full";
const neonUrl = "postgresql://neondb_owner:npg_iIoWcP9yg7VB@ep-fragrant-heart-adhfyuuq-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require&pgbouncer=true&connect_timeout=30&pool_timeout=30";

const tables = [
  'Church',
  'Group',
  'User',
  'UserGroup',
  'PrayerCategory',
  'Badge',
  'Mission',
  'Quiz',
  'Question',
  'Answer',
  'DailyJourney',
  'Event',
  'EventGalleryPhoto',
  'Attendance',
  'PrayerRequest',
  'UserBadge',
  'XPLog',
  'QuizAttempt',
  'Announcement',
  'SaintOfTheDay',
  'ReadingPlan',
  'FeaturedVerse',
  'JourneyCourse',
  'JourneyNode',
  'UserJourneyNode',
  'Guide',
  'Appointment',
  'PushSubscription',
  'Notification',
  'MentorshipQuestion',
  'PendingValidation',
  'ChessGame',
  'ChatMessage',
  'BibleBookmark',
  'KnowledgeDocument',
  'PasswordResetToken',
  'Quote',
  'ChatSuggestion'
];

async function migrateData() {
  const crClient = new Client({ connectionString: cockroachUrl });
  const neonClient = new Client({ connectionString: neonUrl });

  try {
    await crClient.connect();
    await neonClient.connect();
    console.log("Connected to both databases.");

    // Clean up existing data in reverse order to respect FKs (if any exist)
    for (const table of [...tables].reverse()) {
      try {
        await crClient.query(`DELETE FROM "${table}"`);
        console.log(`Cleared table ${table}`);
      } catch (err) {
        console.log(`Skipping clear for ${table} (maybe doesn't exist)`);
      }
    }

    for (const table of tables) {
      console.log(`Migrating ${table}...`);
      const { rows } = await neonClient.query(`SELECT * FROM "${table}"`);
      
      if (rows.length === 0) {
        console.log(`0 rows in ${table}. Skipping.`);
        continue;
      }

      console.log(`Found ${rows.length} rows in ${table}. Inserting...`);
      
      const columns = Object.keys(rows[0]);
      
      // Build parameterized query
      for (const row of rows) {
        const values = columns.map(c => row[c]);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        const colNames = columns.map(c => `"${c}"`).join(', ');
        
        try {
          await crClient.query(`INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`, values);
        } catch (err) {
          console.error(`Failed to insert into ${table}:`, err.message);
          // Stop on first failure to avoid cascaded FK errors
          throw err;
        }
      }
      
      console.log(`Migrated ${table} successfully!`);
    }

    console.log("Migration Complete!");

  } catch (e) {
    console.error("Migration Error:", e);
  } finally {
    await crClient.end();
    await neonClient.end();
  }
}

migrateData();
