import { awardXP } from "@/app/actions/gamification";

export interface QueuedAction {
  id: string;
  type: "AWARD_XP";
  payload: {
    amount: number;
    reason: string;
  };
  timestamp: number;
}

const STORAGE_KEY = "ignite_offline_actions_queue";

export function queueOfflineXP(amount: number, reason: string) {
  if (typeof window === "undefined") return;

  try {
    const existing = getQueuedActions();
    const newAction: QueuedAction = {
      id: Math.random().toString(36).substring(2, 9),
      type: "AWARD_XP",
      payload: { amount, reason },
      timestamp: Date.now(),
    };

    existing.push(newAction);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
  } catch (e) {
    console.error("Failed to queue offline XP action:", e);
  }
}

export function getQueuedActions(): QueuedAction[] {
  if (typeof window === "undefined") return [];
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export async function processOfflineQueue(): Promise<{ syncedCount: number; totalXP: number }> {
  if (typeof window === "undefined" || !navigator.onLine) {
    return { syncedCount: 0, totalXP: 0 };
  }

  const queue = getQueuedActions();
  if (queue.length === 0) return { syncedCount: 0, totalXP: 0 };

  let syncedCount = 0;
  let totalXP = 0;
  const remainingQueue: QueuedAction[] = [];

  for (const action of queue) {
    if (action.type === "AWARD_XP") {
      try {
        const res = await awardXP(action.payload.amount, action.payload.reason);
        if (res?.success) {
          syncedCount++;
          totalXP += action.payload.amount;
        } else {
          remainingQueue.push(action);
        }
      } catch {
        remainingQueue.push(action);
      }
    }
  }

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(remainingQueue));
  } catch (e) {
    console.error("Failed to update offline queue:", e);
  }

  return { syncedCount, totalXP };
}
