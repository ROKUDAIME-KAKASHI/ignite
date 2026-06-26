# 🔥 Ignite — Jacobite Orthodox Youth Movement Platform

![Ignite Banner](https://img.shields.io/badge/Status-Active-success.svg)
![Next.js](https://img.shields.io/badge/Next.js-15.0-black?logo=next.js)
![Prisma](https://img.shields.io/badge/Prisma-ORM-blue?logo=prisma)
![Firebase](https://img.shields.io/badge/Firebase-Auth-yellow?logo=firebase)
![Neon](https://img.shields.io/badge/Neon-PostgreSQL-00E599?logo=postgresql)

**Ignite** is a premium, full-stack web application built specifically for the **Jacobite Orthodox Youth Movement**. Designed to combat the fast-paced distractions of the modern world, Ignite serves as a daily spiritual companion—helping youth reclaim their time for God through scripture, prayer, gamified learning, and community engagement.

---

## 🌟 Key Features

### 1. 📖 Daily Spiritual Journey
- **Daily Bible Verses & Reflections**: A curated daily verse, reflection, and prayer seamlessly loaded onto the user's dashboard.
- **Full Bible Reader**: A beautifully formatted, distraction-free interface to read chapters from the Bible.

### 2. 🙏 Interactive Prayer Wall
- **Community Intercession**: Users can post prayer requests (publicly or anonymously).
- **"Pray For This" Animation**: A real-time counter that visually acknowledges when community members offer prayers for a specific request.

### 3. 🎮 Gamification & Learning (Quizzes)
- **Grace Points (XP)**: Users earn XP by interacting with the app (e.g., taking quizzes, reading chapters).
- **Orthodox Faith Quizzes**: Multiple-choice and true/false quizzes designed to test and educate youth on Scripture and Orthodox Holy Mysteries (Sacraments).
- **Global Leaderboard**: An animated 3D podium showcasing the top 3 users, alongside a live global feed of all members ranked by their Grace Points.

### 4. 🛡️ Admin Dashboard
- **Secure Access**: Locked strictly to authorized administrators (e.g., `admin@ignite.com`).
- **Live Analytics**: A 2x2 grid displaying 24h trends for Total Users, Prayers Offered, Quizzes Taken, and Chapters Read.
- **System Monitoring**: Live status alerts and a feed of the most recent user registrations.

### 5. 🔔 Push Notifications (FCM)
- Built-in Firebase Cloud Messaging Service Worker infrastructure.
- A polished UI for users to toggle notification preferences (e.g., "Daily Verse", "Prayer Wall Alerts").

---

## 🏗️ Architecture & Tech Stack

Ignite has been streamlined into a **Unified Serverless Architecture** (Option B) for effortless deployment on platforms like Vercel.

* **Frontend**: Next.js 15 (App Router), React 19, Tailwind CSS, Framer Motion (for premium 3D and micro-animations).
* **Database**: Neon (Serverless Cloud PostgreSQL).
* **ORM**: Prisma (Integrated directly into Next.js Server Components and API Routes).
* **Authentication**: Google Firebase Auth (Email/Password).

---

## 🚀 Deployment (Vercel)

Deploying Ignite to the world is incredibly simple.

1. **Import to Vercel**: Connect this GitHub repository to your Vercel account.
2. **Set Root Directory**: Ensure the Root Directory is set to `frontend`.
3. **Set Environment Variables**: Paste the following variables into your Vercel project settings:

```env
# Database (Neon)
DATABASE_URL="postgresql
# Firebase Auth Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

4. **Deploy**: Vercel will automatically run `npm run build`, which triggers `prisma generate` and compiles the Next.js application.

---

## 💻 Local Development

To run Ignite locally on your machine:

1. Clone the repository and navigate to the frontend folder:
   ```bash
   git clone https://github.com/ROKUDAIME-KAKASHI/ignite.git
   cd ignite/frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up your `.env.local` file with the variables listed above.
4. Sync your database schema (if making changes):
   ```bash
   npx prisma db push
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000` in your browser.

---

## 🔐 Setting up the Admin

Because authentication is handled securely by Firebase, setting up the admin account takes 10 seconds:
1. Go to your deployed application (or localhost) and navigate to the Login page.
2. Click **Register**.
3. Register an account using the email: **`admin@ignite.com`** (and your chosen password).
4. The system is hardcoded to instantly recognize this email and unlock the `/admin` dashboard.

*(To change the authorized admin email, edit `frontend/src/app/admin/page.tsx` before pushing to GitHub).*
