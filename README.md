# Ignite 🕊️

> A beautiful, gamified progressive web application designed exclusively for the Jacobite Orthodox Youth Movement.

Ignite's core mission is to accompany young believers in their daily spiritual journey, bringing ancient traditions and scripture into the modern digital world through an engaging, aesthetic, and fully functional platform. 

For the complete feature breakdown, system architecture, and user guide, please read the **[Ignite Complete Handbook](./HANDBOOK.md)**.

## ✨ Key Features Overview

- **Gamified Spiritual Journey:** Users earn Grace Points (XP) and level up across a 10-award tiered system by completing spiritual missions, reading the Bible, taking quizzes, and scanning QR codes at parish events.
- **Dynamic Leaderboard:** A live, community-driven leaderboard that ranks youth globally and locally by parish.
- **Prayer Wall & Moderation:** A dedicated, community space for prayer requests (anonymous or public), fully moderated by the Admin console.
- **Biblical Journeys & Scripture Reader:** Interactive course maps (nodes) to learn Orthodoxy and read chapters of the Bible directly within the app.
- **In-App AI Spiritual Guide:** Powered by Google Gemini, "Abba" answers theological questions and provides daily guidance.
- **Multiplayer Fellowship Games:** Real-time synced Chess and Ludo built directly into the app for community bonding.
- **PWA Ready:** Installable directly from the browser to mobile home screens for a native app experience.

## 🛠️ Technology Stack

- **Frontend:** Next.js 14 (App Router), React, TypeScript
- **Styling:** Tailwind CSS, Framer Motion, `shadcn/ui`
- **Backend:** Next.js Server Actions & API Routes (Serverless)
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** Custom JWT / Cookie-based sessions
- **Real-time Engine:** Supabase Channels
- **Deployment:** Vercel

## 🚀 Getting Started Locally

### 1. Prerequisites
Ensure you have Node.js (v18+) and npm installed. You will also need a PostgreSQL database (e.g., Neon, Supabase, or local).

### 2. Install Dependencies
```bash
npm install
# Or run from inside the frontend directory:
cd frontend && npm install
```

### 3. Environment Variables
Create a `.env` file in the `frontend/` directory (or root if running globally) and configure the following variables:
```env
# Postgres connection string
DATABASE_URL="postgresql://user:password@host:port/ignite"

# JWT encryption secret for sessions
JWT_SECRET="your-secure-random-string"

# Admin credentials
ADMIN_EMAIL="adminofignite@gmail.com"
ADMIN_PASS="adminofignite123"

# Google GenAI for "Abba" Bot & Mission Validation
GEMINI_API_KEY="AIzaSy..."

# Supabase Realtime (for Multiplayer Games)
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
```

### 4. Setup Database
Sync the Prisma schema with your database and generate the client.
```bash
cd frontend
npx prisma db push
npx prisma generate
```

### 5. Start Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## 🛡️ Admin Dashboard

To access the secure admin dashboard to moderate prayers, create events, and generate QR codes:
1. Navigate to `http://localhost:3000/admin`
2. **Email:** `adminofignite@gmail.com`
3. **Password:** `adminofignite123`

---
*Soli Deo Gloria*