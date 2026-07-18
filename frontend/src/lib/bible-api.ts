export type Translation = "kjv" | "web" | "asv" | "bbe" | "nrsvue" | "mal";

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
 * Fetch a full chapter from bible-api.com
 * e.g. fetchChapter("john", 3, "kjv")
 */
export async function fetchChapter(
  apiName: string,
  chapter: number,
  translation: Translation = "nrsvue"
): Promise<BibleChapterResponse> {
  // Use our internal proxy scraper for NRSVUE and Malayalam
  if (translation === "nrsvue" || translation === "mal") {
    const versionStr = translation.toUpperCase();
    const url = `/api/bible?book=${encodeURIComponent(apiName)}&chapter=${chapter}&version=${versionStr}`;
    const res = await fetch(url, { next: { revalidate: 86400 } });
    if (!res.ok) throw new Error(`Failed to fetch ${apiName} ${chapter} (${versionStr})`);
    return res.json();
  }

  const ref = `${apiName}+${chapter}`;
  const url = `${BASE_URL}/${ref}?translation=${translation}`;
  const res = await fetch(url, { next: { revalidate: 86400 } }); // cache 24h
  if (!res.ok) throw new Error(`Failed to fetch ${ref}: ${res.status}`);
  return res.json();
}

/**
 * Fetch a single verse
 * e.g. fetchVerse("john", 3, 16, "kjv")
 */
export async function fetchVerse(
  apiName: string,
  chapter: number,
  verse: number,
  translation: Translation = "nrsvue"
): Promise<BibleChapterResponse> {
  if (translation === "nrsvue" || translation === "mal") {
    // For a single verse, we fetch the chapter and filter (because scraping a single verse works similarly)
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
  { id: "kjv", name: "KJV",  full: "King James Version" },
  { id: "web", name: "WEB",  full: "World English Bible" },
  { id: "asv", name: "ASV",  full: "American Standard Version" },
  { id: "bbe", name: "BBE",  full: "Bible in Basic English" },
  { id: "mal", name: "MAL",  full: "Malayalam Bible" },
];
