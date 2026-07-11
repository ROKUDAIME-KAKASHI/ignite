export type Translation = "kjv" | "web" | "asv" | "bbe" | "nrsvue";

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
];
