# Ignite — System Overview & Architecture

This document provides a comprehensive technical breakdown of **Ignite**, a modern, gamified Progressive Web App (PWA) built for the Jacobite Orthodox Youth Movement. 

---

## 🏗️ Architecture & Tech Stack

**Ignite** is a full-stack, serverless application built on a highly scalable, modern React architecture.

### Core Technologies
*   **Framework:** Next.js 14 (App Router) — Server-Side Rendering (SSR), Server Actions, and React Server Components.
*   **Language:** TypeScript — Strictly typed for end-to-end type safety.
*   **Database:** PostgreSQL (Relational DB) managed via Prisma ORM.
*   **Styling:** Tailwind CSS integrated with `shadcn/ui` and raw CSS for custom utility classes.
*   **Animations:** Framer Motion (for fluid micro-interactions, drag gestures, and layout animations).
*   **Deployment:** Vercel (Edge network, Serverless functions).

### Integrations
*   **Authentication:** Custom credential-based JWT implementation (via `jose` & `bcryptjs`) using `HttpOnly` cookies.
*   **Artificial Intelligence:** Google GenAI (`@google/genai`) Gemini API used for the "Abba" spiritual chatbot and Smart Mission Validation.
*   **PWA Setup:** Configured with `next-pwa` (or standard Next.js manifest metadata) for offline caching and "Add to Home Screen" installability.
*   **Notifications:** Firebase Cloud Messaging (FCM) implementation via service workers for web push notifications.
*   **Scanner:** `@yudiel/react-qr-scanner` for real-time camera processing.

---

## 🌟 Feature Breakdown

### 1. Gamified Spiritual Ecosystem (Grace Points & Leveling)
The core loop of the application encourages daily engagement through Gamification:
*   **Grace Points (XP):** Earned by reading scripture, completing quizzes, finishing journeys, and scanning event QR codes.
*   **Dynamic Leveling:** A complex formula calculates levels based on XP thresholds, awarding users with distinct titles (e.g., *Seeker*, *Disciple*).
*   **XP Logs:** A dedicated `XPLog` table tracks every single transaction of points to prevent abuse and provide a history for the user profile.

### 2. Decentralized Missions & Smart AI Validation
Users can complete daily decentralized missions (like attending Mass or acts of mercy).
*   **Text Reflection:** Users submit a short text explanation of how they completed the mission.
*   **Gemini Validation:** The reflection is securely sent to the Gemini AI API, which acts as a "Smart Validator". It evaluates the text for relevance and effort. Gibberish (e.g., "asdf") is rejected with a polite reason, while genuine reflections are approved instantly, awarding points.

### 3. Centralized Event QR Codes
*   Admins create events in the dashboard, which automatically generates a secure, unique QR Code.
*   Youth leaders can display this code on a screen or print it.
*   Youth use the built-in **In-App Scanner** to scan the code, write a short sermon note/takeaway, and earn massive Grace Points for physical attendance.

### 4. Interactive "Journeys" (Syllabus/Course Maps)
*   Modeled after modern language-learning apps (like Duolingo).
*   Users follow a winding SVG path of interconnected "nodes" (lessons).
*   Modules teach Orthodoxy, Bible history, and theology through interactive readings and quizzes.

### 5. "Abba" — AI Spiritual Guide
*   An AI Chatbot powered by Google Gemini, instructed via system prompts to act as a warm, Orthodox Christian spiritual companion.
*   Users can ask theological questions, seek advice, or request daily prayers.
*   Administrators can seed "Chat Suggestions" directly into the database to guide users toward popular questions.

### 6. PWA & Native-App Feel
*   **Persistent Login:** The app detects active sessions immediately, bypassing the login screen for returning users.
*   **Mobile Header Navigation:** Intercepts hardware back-buttons on Android to prevent accidental app exits by managing initial `history.pushState` and provides on-screen back navigation.
*   **Bottom Navigation Bar:** Custom floating (or docked) bottom bar for mobile screens, utilizing `pb-safe` to avoid overlapping content.
*   **Dark Mode:** Integrated smoothly with `next-themes`, toggleable from the user's Profile settings.

---

## 🔐 Admin Console (`/admin/dashboard`)

The Admin Dashboard is a secured sub-application protected by a separate session cookie token (`admin_session`), entirely segregated from standard user authentication.

### Capabilities:
*   **System Overview:** View live metrics (total users, points earned, prayers submitted, quizzes taken).
*   **Prayer Moderation:** The community prayer wall is fully visible to admins. They can delete inappropriate prayers instantly.
*   **Notices (Announcements):** Broadcast text updates that appear directly in the users' Notifications tab.
*   **Event & QR Management:** Create new parish events and access a dedicated "QR Codes" tab to display scannable codes for any upcoming event.
*   **Parish Registry:** Register new "Churches" and generate 6-digit `inviteCodes` that youth can use to link their accounts to a specific parish for localized leaderboards.
*   **Content Management:** Seed new "Quotes of the Day" and manage the pre-filled questions for the AI Chat bot.

---

## 🗄️ Database Schema & Prisma Strategy

The database uses highly relational mapping to ensure referential integrity. 

*   **`User`**: Core profile data, stats, and relations to `Church`, `Attendance`, and `XPLog`.
*   **`Church`**: Groups users for localized leaderboards.
*   **`Event` & `Attendance`**: Tracks physical check-ins.
*   **`Journey`, `JourneyModule`, `JourneyNode`**: Highly nested models for building the syllabus paths.
*   **`Quiz`, `Question`, `Answer`**: Standardized testing models.
*   **`PrayerRequest`**: Community forum data.
*   **`Quote`, `ChatSuggestion`**: Dynamic content controlled by admins.

## 🚀 Environment Requirements

To run this system, the following environment variables are required in `.env`:

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
```

