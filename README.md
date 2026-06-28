# Ignite — Jacobite Orthodox Youth Movement Platform

Ignite is a beautiful, gamified web application designed exclusively for the Jacobite Orthodox Youth Movement. Its core mission is to accompany young believers in their daily spiritual journey, bringing ancient traditions and scripture into the modern digital world through an engaging, aesthetic, and fully functional platform.

## 🌟 Key Features

*   **Gamified Spiritual Journey:** Users earn **Grace Points (XP)** and level up by completing spiritual missions (like Lectio Divina or Acts of Charity), reading the Bible, taking quizzes, and scanning QR codes at real-life parish events.
*   **Dynamic Leaderboard:** A live, community-driven leaderboard ranks youth by their Grace Points to foster healthy, spiritual motivation.
*   **Prayer Wall (Moderated):** A dedicated space where youth can submit prayer requests (anonymously if they wish). Requests are held in a pending state until an Admin approves them, after which they appear on the public feed for the community to pray over.
*   **Scripture Reader:** A built-in Bible reader that allows youth to read chapters directly within the app.
*   **Parish Events & QR Check-ins:** Admins can create events and generate custom QR codes. Youth use the app's built-in QR scanner to check-in to events and earn large amounts of XP.
*   **Spiritual Guides:** Accessible guides including an Examination of Conscience for Confession preparation and common Orthodox prayers.
*   **Dedicated Admin Portal:** A completely secure, separate portal (`/admin`) for youth leaders to track total signups, moderate the prayer wall, and generate event QR codes.

## 🛠️ Technology Stack

*   **Frontend:** Next.js 14 (App Router), React, TypeScript
*   **Styling:** Tailwind CSS, Framer Motion (for fluid micro-animations), Lucide React (icons), `shadcn/ui` components.
*   **Backend & API:** Next.js Server Actions (fully integrated serverless architecture)
*   **Database:** PostgreSQL
*   **ORM:** Prisma
*   **Authentication:** Custom JWT / Cookie-based session management, securely integrated with Prisma.
*   **Deployment:** Vercel

## 🗄️ Database Schema Overview

The Postgres database is structured using Prisma with the following core models:

*   **User**: Handles authentication (hashed passwords), profile info, and gamification stats (`xp`, `level`, `streak`).
*   **Event & Attendance**: Tracks parish events and which users have checked in/RSVP'd.
*   **PrayerRequest**: Tracks community prayer requests with an `isApproved` flag for admin moderation.
*   **Mission & XPLog**: Tracks available missions and provides a transparent log of every time a user earns Grace Points and the reason why.
*   **Quiz, Question, Answer & QuizAttempt**: Supports the daily quizzes and tests of faith, logging scores and attempts.

## 🚀 Running Locally

1.  **Install dependencies:**
    ```bash
    npm install
    # or inside the frontend directory:
    cd frontend && npm install
    ```

2.  **Setup Database:**
    Ensure your `.env` file contains your standard `DATABASE_URL` pointing to your Postgres instance, as well as a `JWT_SECRET`.
    ```bash
    npx prisma generate
    npx prisma db push
    ```

3.  **Start Development Server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:3000`.

## 🛡️ Admin Access

To access the secure admin dashboard:
1. Navigate to `http://localhost:3000/admin`
2. **Email:** `adminofignite@gmail.com`
3. **Password:** `adminofignite123`

---
*Soli Deo Gloria*