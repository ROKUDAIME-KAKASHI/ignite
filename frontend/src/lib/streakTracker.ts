export interface StreakData {
  streak: number;
  lastActiveDate: string; // YYYY-MM-DD
  history: Record<string, boolean>; // YYYY-MM-DD -> true
}

const STORAGE_KEY = "ignite_streak_tracker";

export function getLocalStreak(): StreakData {
  if (typeof window === "undefined") {
    return { streak: 1, lastActiveDate: "", history: {} };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { streak: 1, lastActiveDate: "", history: {} };
    return JSON.parse(raw);
  } catch {
    return { streak: 1, lastActiveDate: "", history: {} };
  }
}

export function recordDailyActivity(): { streak: number; updated: boolean } {
  if (typeof window === "undefined") return { streak: 1, updated: false };

  const todayStr = new Date().toISOString().split("T")[0];
  const data = getLocalStreak();

  if (data.lastActiveDate === todayStr) {
    return { streak: data.streak || 1, updated: false };
  }

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];

  let newStreak = 1;
  if (data.lastActiveDate === yesterdayStr) {
    newStreak = (data.streak || 0) + 1;
  }

  const updatedData: StreakData = {
    streak: newStreak,
    lastActiveDate: todayStr,
    history: { ...data.history, [todayStr]: true },
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedData));
  } catch (e) {
    console.error("Failed to save streak:", e);
  }

  return { streak: newStreak, updated: true };
}
