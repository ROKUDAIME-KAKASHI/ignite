export type Translation = "kjv" | "web" | "asv" | "bbe" | "nrsvue" | "mal" | "niv";

export interface BibleVerse {
  book_id: string;
  book_name: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface BibleChapterResponse {
  reference: string;
  verses: BibleVerse[];
  text: string;
  translation_id: string;
  translation_name: string;
}

const BASE_URL = "https://bible-api.com";

/**
 * Fetch a full chapter with automatic localStorage caching for 100% offline access
 */
export async function fetchChapter(
  apiName: string,
  chapter: number,
  translation: Translation = "nrsvue"
): Promise<BibleChapterResponse> {
  const cacheKey = `ignite_bible_cache_${apiName}_${chapter}_${translation}`;

  // Try fetching network response
  try {
    let resultData: BibleChapterResponse;

    if (translation === "nrsvue" || translation === "mal" || translation === "niv") {
      const versionStr = translation.toUpperCase();
      const url = `/api/bible?book=${encodeURIComponent(apiName)}&chapter=${chapter}&version=${versionStr}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) throw new Error(`Failed to fetch ${apiName} ${chapter} (${versionStr})`);
      resultData = await res.json();
    } else {
      const ref = `${apiName}+${chapter}`;
      const url = `${BASE_URL}/${ref}?translation=${translation}`;
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) throw new Error(`Failed to fetch ${ref}: ${res.status}`);
      resultData = await res.json();
    }

    // Cache locally for offline access
    if (typeof window !== "undefined" && resultData && resultData.verses) {
      try {
        localStorage.setItem(cacheKey, JSON.stringify(resultData));
      } catch (e) {
        console.warn("LocalStorage full, skipping Bible cache write:", e);
      }
    }

    return resultData;
  } catch (err) {
    // Offline or network error fallback
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }
    throw err;
  }
}

/**
 * Fetch a single verse
 */
export async function fetchVerse(
  apiName: string,
  chapter: number,
  verse: number,
  translation: Translation = "nrsvue"
): Promise<BibleChapterResponse> {
  if (translation === "nrsvue" || translation === "mal" || translation === "niv") {
    const chapData = await fetchChapter(apiName, chapter, translation);
    return {
      ...chapData,
      reference: `${apiName} ${chapter}:${verse}`,
      verses: chapData.verses.filter((v: any) => v.verse === verse)
    };
  }

  const ref = `${apiName}+${chapter}:${verse}`;
  const url = `${BASE_URL}/${ref}?translation=${translation}`;
  const res = await fetch(url, { next: { revalidate: 86400 } });
  if (!res.ok) throw new Error(`Failed to fetch ${ref}: ${res.status}`);
  return res.json();
}

export const TRANSLATIONS: { id: Translation; name: string; full: string }[] = [
  { id: "nrsvue", name: "NRSVUE", full: "New Revised Standard Version Updated Edition" },
  { id: "niv", name: "NIV", full: "New International Version" },
  { id: "kjv", name: "KJV",  full: "King James Version" },
  { id: "web", name: "WEB",  full: "World English Bible" },
  { id: "asv", name: "ASV",  full: "American Standard Version" },
  { id: "bbe", name: "BBE",  full: "Bible in Basic English" },
  { id: "mal", name: "MAL",  full: "Malayalam Bible" },
];
