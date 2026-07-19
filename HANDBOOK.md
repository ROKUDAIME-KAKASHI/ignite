# Ignite: Complete System & User Handbook

Welcome to the definitive guide for **Ignite** — a fully-featured, gamified progressive web application designed for the Jacobite Orthodox Youth Movement. This handbook serves as a single source of truth for users navigating the platform, administrators managing it, and developers understanding its underlying systems.

---

## Table of Contents
1. [User Handbook: Your Spiritual Journey](#1-user-handbook-your-spiritual-journey)
2. [Gamification & Awards System](#2-gamification--awards-system)
3. [Multiplayer Fellowship Games](#3-multiplayer-fellowship-games)
4. [System Architecture & Overview](#4-system-architecture--overview)
5. [Database Schema & Prisma Strategy](#5-database-schema--prisma-strategy)
6. [Administrator Console Guide](#6-administrator-console-guide)

---

## 1. User Handbook: Your Spiritual Journey

At the heart of Ignite is a rewarding progression system. As you participate in your faith journey—both inside the app and out in the real world—you earn **Grace Points (XP)**.

### Features & Tools

*   **The Dashboard:** Your home base. Here you will find your current Level, Grace Points, and daily streak. The dashboard also highlights Announcements from your parish and Upcoming Events.
*   **QR Code Event Check-ins:** Attend a church event, youth group, or special mission, tap the **Scan** button in the app, and point your camera at the QR code. You'll be asked to leave a brief, thoughtful reflection on the event to earn your Grace Points.
*   **Biblical Journeys:** Think of this as an interactive map for your faith. Enroll in courses that guide you through scripture, church history, and theology. Complete nodes along the path (reading a passage or taking a quick quiz) to earn Stars and massive Grace Points.
*   **The Prayer Wall:** A safe, supportive space for our community. Share what's on your heart (publicly or anonymously) and pray for others' requests to let them know they are being lifted up.
*   **Abba (AI Spiritual Guide):** An AI Chatbot powered by Google Gemini, instructed to act as a warm, Orthodox Christian spiritual companion. Submit theological questions and get thoughtful, biblically-based answers directly in the app.
*   **The Leaderboard:** A little friendly competition! See how your Grace Points stack up against the global Ignite community, or work together with your local church to climb the parish leaderboards.

### Installing the App (PWA)
Ignite is built to be installed directly from your browser without needing the App Store.
1. Open the Ignite website on your mobile phone (Safari for iPhone, Chrome for Android).
2. Tap on the **Profile** icon in the bottom navigation bar.
3. Scroll down and tap **"Install App"**.
4. Follow the prompt to add it to your Home Screen.

---

## 2. Gamification & Awards System

To create a deeply engaging and rewarding experience, Ignite implements a robust 10-award system. Each award features 8 distinct tiers (levels), encouraging long-term engagement across an entire year.

1. **Faithful Steward (Sunday Attendance):** Attending Sunday Qurbana consistently.
2. **Scripture Scholar (Bible Reading):** Reading chapters of the Holy Bible.
3. **Prayer Warrior (Prayer Ministry):** Submitting prayers and praying for others in the community.
4. **Missionary Heart (Daily Missions):** Completing daily decentralized spiritual missions.
5. **Wisdom Seeker (Bible Quizzes):** Passing Bible and Orthodox Trivia quizzes.
6. **Vessel of Grace (Total Grace Points):** Earning overall Grace Points (XP).
7. **Unbroken Devotion (Daily Streak):** Consecutive days logging into the app to read the daily journey.
8. **Digital Disciple (Fellowship Games):** Playing Chess or Ludo with church friends.
9. **Voice of the Faithful (Community Chat):** Encouraging others in the Global Fellowship chat.
10. **The Liturgical Pilgrim (Seasonal Journeys):** Participating during different Syriac Orthodox Liturgical Seasons.

Users can view their beautifully designed **"Medals Showcase"** on their Profile page, visually tracking their spiritual milestones over time.

---

## 3. Multiplayer Fellowship Games

Ignite isn't just about individual progression; it's about building a digital community. The platform includes fully synchronized, real-time multiplayer games directly within the app.

*   **Chess:** Engage in real-time, 1v1 chess matches with other youth members. Uses WebSockets/Supabase Channels for instant move synchronization.
*   **Ludo:** A classic 4-player board game. Host a room, invite friends via a shortcode, or play alongside smart AI bots. The game features automated dice rolls, token capturing, and AI bot drivers that take over seamlessly if a human player disconnects.

---

## 4. System Architecture & Overview

**Ignite** is a full-stack, serverless progressive web application built on a highly scalable, modern React architecture.

### Core Technologies
*   **Framework:** Next.js 14 (App Router) — Server-Side Rendering (SSR), Server Actions, and React Server Components.
*   **Language:** TypeScript — Strictly typed for end-to-end type safety.
*   **Database:** PostgreSQL (Relational DB) managed via Prisma ORM.
*   **Styling:** Tailwind CSS integrated with `shadcn/ui` and raw CSS for custom utility classes.
*   **Animations:** Framer Motion (for fluid micro-interactions, drag gestures, and layout animations).
*   **Real-time:** Supabase Channels for multiplayer game synchronization.
*   **Deployment:** Vercel (Edge network, Serverless functions).

### Key Technical Integrations
*   **Authentication:** Custom credential-based JWT implementation (via `jose` & `bcryptjs`) using `HttpOnly` cookies.
*   **Artificial Intelligence:** Google GenAI (`@google/genai`) Gemini API used for the "Abba" spiritual chatbot and Smart Mission Validation (evaluating text for relevance and effort).
*   **PWA Setup:** Configured with `next-pwa` for offline caching and "Add to Home Screen" installability.
*   **Scanner:** `@yudiel/react-qr-scanner` for real-time camera processing.

---

## 5. Database Schema & Prisma Strategy

The PostgreSQL database uses a highly relational mapping to ensure referential integrity, managed via Prisma.

*   **`User`**: Handles authentication (hashed passwords), profile info, and gamification stats (`xp`, `level`, `streak`).
*   **`Church`**: Groups users for localized leaderboards.
*   **`Event` & `Attendance`**: Tracks physical check-ins.
*   **`Journey`, `JourneyModule`, `JourneyNode`**: Highly nested models for building the syllabus paths.
*   **`Quiz`, `Question`, `Answer` & `QuizAttempt`**: Standardized testing models for daily quizzes and faith tests.
*   **`PrayerRequest`**: Tracks community prayer requests with an `isApproved` flag for admin moderation.
*   **`Mission` & `XPLog`**: Tracks available missions and provides a transparent log of every time a user earns Grace Points to prevent abuse.
*   **`Quote`, `ChatSuggestion`**: Dynamic content controlled by admins.

---

## 6. Administrator Console Guide (`/admin`)

The Admin Dashboard is a secured sub-application protected by a separate session cookie token (`admin_session`), entirely segregated from standard user authentication.

### Capabilities:
*   **System Overview:** View live metrics (total users, points earned, prayers submitted, quizzes taken).
*   **Prayer Moderation:** The community prayer wall is fully visible to admins. They can approve pending requests or delete inappropriate ones instantly.
*   **Notices (Announcements):** Broadcast text updates that appear directly in the users' Notifications tab.
*   **Event & QR Management:** Create new parish events and access a dedicated "QR Codes" tab to display scannable codes for any upcoming event.
*   **Parish Registry:** Register new "Churches" and generate 6-digit `inviteCodes` that youth can use to link their accounts to a specific parish.
*   **Content Management:** Seed new "Quotes of the Day" and manage the pre-filled questions for the AI Chat bot.
