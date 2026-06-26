# Church Youth Movement Platform (PWA)

Welcome to the **Church Youth Movement Platform**, a comprehensive, scalable, and modern Progressive Web Application (PWA) designed to encourage spiritual growth, participation, and community building through daily activities, events, learning, and gamification.

---

## 🎯 Core Principles
*   **Spiritual Formation First:** Gamification and features are designed to encourage daily habits and spiritual growth, not unhealthy competition.
*   **Modern & Accessible:** A clean, responsive interface tailored for all devices (Mobile-first PWA).
*   **Robust Architecture:** Built using modern software engineering best practices with a clean separation of concerns.

---

## 🛠 Technology Stack

**Frontend**
*   **Framework:** Next.js 16 (App Router)
*   **Language:** TypeScript
*   **Styling:** Tailwind CSS, shadcn/ui, Framer Motion (Page Transitions)
*   **State & Auth:** React Context, Firebase Authentication
*   **PWA:** `@ducanh2912/next-pwa` (Offline support, caching, manifest)

**Backend**
*   **Framework:** NestJS (Node.js)
*   **Language:** TypeScript
*   **Database:** SQLite (Local Dev) / PostgreSQL (Production ready)
*   **ORM:** Prisma ORM
*   **Security:** Firebase Admin SDK (JWT Validation)

---

## 👥 User Roles

1.  **Member**
    *   Read daily Bible verses, reflections, and prayers.
    *   Complete daily/weekly/seasonal missions and quizzes.
    *   Join events and submit prayer requests.
    *   Earn XP, badges, and track spiritual streaks.
2.  **Leader**
    *   All Member features.
    *   Create reflections, quizzes, and events.
    *   Publish announcements and track group attendance.
3.  **Administrator**
    *   All Leader features.
    *   Manage churches, ministries, and user roles.
    *   Platform-wide analytics and content moderation.

---

## 📱 Core Modules & Ideas

### 1. Dashboard & Daily Journey
Every day at 10:00 AM, users receive a push notification that "Today's journey is ready." The journey consists of a Verse, Reflection, Prayer, Mission, and Quiz. Completing these awards daily XP.

### 2. Bible Module
A built-in scripture reader supporting Old/New Testaments, reading plans, bookmarks, highlights, and history tracking.

### 3. Quizzes & Missions
*   **Quizzes:** Daily, weekly, or topic-based quizzes with various question types (MCQ, True/False) to test theological and historical knowledge.
*   **Missions:** Actionable tasks (e.g., "Attend Mass", "Acts of Charity", "Volunteer") that reward XP upon completion.

### 4. Events & Community
*   **Events:** View upcoming gatherings, register for events, and use QR codes for check-ins.
*   **Community:** Small groups, polls, volunteer boards, and mentorship programs to keep the youth connected.

### 5. Prayer Wall
A dedicated space where users can submit prayer requests (anonymously if preferred). Other users can "pray" for these requests, showing solidarity through prayer counters.

### 6. Gamification System
Users earn XP for their daily spiritual habits. As they progress, they unlock:
*   **Levels & Titles** (e.g., "Disciple")
*   **Badges & Achievements** (e.g., "Gospel Reader")
*   **Streaks** to encourage daily app usage.

### 7. Future AI Integrations
*   Bible Study Assistant
*   Reflection & Quiz Generators
*   Personalized Journey Recommendations

---

## 🚀 Getting Started (Local Development)

### Prerequisites
*   Node.js (v20+)
*   npm
*   A Firebase Project (for Auth & Push Notifications)

### 1. Start the Backend (NestJS + Prisma)
```bash
cd backend
npm install

# The database is configured for SQLite locally.
# Run migrations and seed the database:
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts

# Start the development server (runs on http://localhost:3001)
npm run start:dev
```

### 2. Start the Frontend (Next.js PWA)
```bash
cd frontend
npm install

# Start the Next.js development server with Webpack enabled (runs on http://localhost:3000)
npm run dev
```

### 3. Configure Firebase (Mandatory for Auth)
1. Go to the [Firebase Console](https://console.firebase.google.com/) and create a project.
2. Enable **Email/Password** Authentication.
3. Update `frontend/.env.local` with your public Firebase keys.
4. Generate a Service Account JSON for your backend and set it to the `GOOGLE_APPLICATION_CREDENTIALS` environment variable.

---

*Built with intention and purpose to foster a connected, active, and faithful community.*
