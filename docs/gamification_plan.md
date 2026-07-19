/# Gamification Awards System Plan

To create a deeply engaging and rewarding experience for the youth, we will implement a robust 10-award system. Each award will have 8 distinct tiers (levels), encouraging long-term engagement across an entire year (such as attending all 52 Sundays).

## 1. The 10 Awards & Their 8 Levels

Here are the proposed 10 awards and their progression criteria:

1. **Faithful Steward (Sunday Attendance)**
   *Theme: Attending Sunday Qurbana consistently.*
   * **Levels (Sundays Attended):** 1, 4, 10, 20, 30, 40, 50, 52 (A full year of Sundays)
2. **Scripture Scholar (Bible Reading)**
   *Theme: Reading chapters of the Holy Bible.*
   * **Levels (Chapters Read):** 1, 10, 50, 100, 250, 500, 800, 1189 (The entire Bible)
3. **Prayer Warrior (Prayer Ministry)**
   *Theme: Submitting prayers and praying for others in the community.*
   * **Levels (Prayers Logged):** 1, 5, 20, 50, 100, 200, 365, 500
4. **Missionary Heart (Daily Missions)**
   *Theme: Completing daily spiritual missions.*
   * **Levels (Missions Completed):** 1, 5, 10, 25, 50, 100, 200, 365
5. **Wisdom Seeker (Bible Quizzes)**
   *Theme: Passing Bible and Orthodox Trivia quizzes.*
   * **Levels (Quizzes Passed):** 1, 5, 10, 25, 50, 100, 150, 200
6. **Vessel of Grace (Total Grace Points)**
   *Theme: Earning overall Grace Points (XP).*
   * **Levels (XP Earned):** 100, 500, 1000, 5000, 10000, 25000, 50000, 100000
7. **Unbroken Devotion (Daily Streak)**
   *Theme: Consecutive days logging into the app to read the daily journey.*
   * **Levels (Day Streak):** 3, 7, 14, 30, 60, 100, 200, 365
8. **Digital Disciple (Fellowship Games)**
   *Theme: Playing Chess or Ludo with church friends.*
   * **Levels (Games Played):** 1, 5, 10, 25, 50, 100, 250, 500
9. **Voice of the Faithful (Community Chat)**
   *Theme: Encouraging others in the Global Fellowship chat.*
   * **Levels (Messages Sent):** 1, 10, 50, 100, 250, 500, 1000, 2000
10. **The Liturgical Pilgrim (Seasonal Journeys)**
    *Theme: Participating during different Syriac Orthodox Liturgical Seasons.*
    * **Levels (Seasons Experienced):** 1, 2, 3, 4, 5, 6, 7, 8 (A full liturgical cycle)

---

## 2. Technical Implementation Steps

### Step A: Database Schema Update
Currently, achievements aren't rigorously tracked by tiers in the database. We will:
- Parse the `XPLog` and existing tables (like `Attendance`, `DailyJourney`) on the fly, or
- Create a new `UserAward` model in `schema.prisma` that stores the user's progress for each of the 10 awards (e.g., `awardId`, `currentLevel`, `progressValue`). Given we have `XPLog` and other models, calculating them on the fly is safer and ensures data integrity without heavy migrations.

### Step B: The Server Action (`actions/gamification.ts`)
We will create a robust function `getUserAwards(userId)` that calculates the user's current progress out of the 8 levels for all 10 categories by counting records in the database.

### Step C: UI - Profile Page Revamp (`profile/page.tsx`)
We will design a beautiful **"Medals Showcase"** section.
- **Visuals:** 10 beautifully designed badges (using lucide icons and gradients).
- **Levels:** Each badge will have 8 "stars" or a circular progress bar around it showing which level they are on.
- **Unearned State:** Awards that are at Level 0 will be heavily greyed out/desaturated, with a lock icon or "0/8" indicator, so the youth know exactly what to work towards.

Does this plan perfectly align with your vision? Click **Proceed** to authorize the implementation.
