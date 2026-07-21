export interface BibleBook {
  name: string;
  slug: string;        // used in URL
  apiName: string;    // used in bible-api.com query
  chapters: number;
  testament: "OT" | "NT";
  category: string;
  abbr: string;
}

export const BIBLE_BOOKS: BibleBook[] = [
  // ── Old Testament ──
  { name: "Genesis",          slug: "genesis",          apiName: "genesis",           chapters: 50, testament: "OT", category: "Pentateuch",      abbr: "Gen"  },
  { name: "Exodus",           slug: "exodus",           apiName: "exodus",            chapters: 40, testament: "OT", category: "Pentateuch",      abbr: "Exo"  },
  { name: "Leviticus",        slug: "leviticus",        apiName: "leviticus",         chapters: 27, testament: "OT", category: "Pentateuch",      abbr: "Lev"  },
  { name: "Numbers",          slug: "numbers",          apiName: "numbers",           chapters: 36, testament: "OT", category: "Pentateuch",      abbr: "Num"  },
  { name: "Deuteronomy",      slug: "deuteronomy",      apiName: "deuteronomy",       chapters: 34, testament: "OT", category: "Pentateuch",      abbr: "Deu"  },
  { name: "Joshua",           slug: "joshua",           apiName: "joshua",            chapters: 24, testament: "OT", category: "Historical",      abbr: "Jos"  },
  { name: "Judges",           slug: "judges",           apiName: "judges",            chapters: 21, testament: "OT", category: "Historical",      abbr: "Jdg"  },
  { name: "Ruth",             slug: "ruth",             apiName: "ruth",              chapters: 4,  testament: "OT", category: "Historical",      abbr: "Rut"  },
  { name: "1 Samuel",         slug: "1-samuel",         apiName: "1+samuel",          chapters: 31, testament: "OT", category: "Historical",      abbr: "1Sa"  },
  { name: "2 Samuel",         slug: "2-samuel",         apiName: "2+samuel",          chapters: 24, testament: "OT", category: "Historical",      abbr: "2Sa"  },
  { name: "1 Kings",          slug: "1-kings",          apiName: "1+kings",           chapters: 22, testament: "OT", category: "Historical",      abbr: "1Ki"  },
  { name: "2 Kings",          slug: "2-kings",          apiName: "2+kings",           chapters: 25, testament: "OT", category: "Historical",      abbr: "2Ki"  },
  { name: "1 Chronicles",     slug: "1-chronicles",     apiName: "1+chronicles",      chapters: 29, testament: "OT", category: "Historical",      abbr: "1Ch"  },
  { name: "2 Chronicles",     slug: "2-chronicles",     apiName: "2+chronicles",      chapters: 36, testament: "OT", category: "Historical",      abbr: "2Ch"  },
  { name: "Ezra",             slug: "ezra",             apiName: "ezra",              chapters: 10, testament: "OT", category: "Historical",      abbr: "Ezr"  },
  { name: "Nehemiah",         slug: "nehemiah",         apiName: "nehemiah",          chapters: 13, testament: "OT", category: "Historical",      abbr: "Neh"  },
  { name: "Esther",           slug: "esther",           apiName: "esther",            chapters: 10, testament: "OT", category: "Historical",      abbr: "Est"  },
  { name: "Job",              slug: "job",              apiName: "job",               chapters: 42, testament: "OT", category: "Wisdom",          abbr: "Job"  },
  { name: "Psalms",           slug: "psalms",           apiName: "psalms",            chapters: 150,testament: "OT", category: "Wisdom",          abbr: "Psa"  },
  { name: "Proverbs",         slug: "proverbs",         apiName: "proverbs",          chapters: 31, testament: "OT", category: "Wisdom",          abbr: "Pro"  },
  { name: "Ecclesiastes",     slug: "ecclesiastes",     apiName: "ecclesiastes",      chapters: 12, testament: "OT", category: "Wisdom",          abbr: "Ecc"  },
  { name: "Song of Solomon",  slug: "song-of-solomon",  apiName: "song+of+solomon",   chapters: 8,  testament: "OT", category: "Wisdom",          abbr: "Son"  },
  { name: "Isaiah",           slug: "isaiah",           apiName: "isaiah",            chapters: 66, testament: "OT", category: "Major Prophets",  abbr: "Isa"  },
  { name: "Jeremiah",         slug: "jeremiah",         apiName: "jeremiah",          chapters: 52, testament: "OT", category: "Major Prophets",  abbr: "Jer"  },
  { name: "Lamentations",     slug: "lamentations",     apiName: "lamentations",      chapters: 5,  testament: "OT", category: "Major Prophets",  abbr: "Lam"  },
  { name: "Ezekiel",          slug: "ezekiel",          apiName: "ezekiel",           chapters: 48, testament: "OT", category: "Major Prophets",  abbr: "Eze"  },
  { name: "Daniel",           slug: "daniel",           apiName: "daniel",            chapters: 12, testament: "OT", category: "Major Prophets",  abbr: "Dan"  },
  { name: "Hosea",            slug: "hosea",            apiName: "hosea",             chapters: 14, testament: "OT", category: "Minor Prophets",  abbr: "Hos"  },
  { name: "Joel",             slug: "joel",             apiName: "joel",              chapters: 3,  testament: "OT", category: "Minor Prophets",  abbr: "Joe"  },
  { name: "Amos",             slug: "amos",             apiName: "amos",              chapters: 9,  testament: "OT", category: "Minor Prophets",  abbr: "Amo"  },
  { name: "Obadiah",          slug: "obadiah",          apiName: "obadiah",           chapters: 1,  testament: "OT", category: "Minor Prophets",  abbr: "Oba"  },
  { name: "Jonah",            slug: "jonah",            apiName: "jonah",             chapters: 4,  testament: "OT", category: "Minor Prophets",  abbr: "Jon"  },
  { name: "Micah",            slug: "micah",            apiName: "micah",             chapters: 7,  testament: "OT", category: "Minor Prophets",  abbr: "Mic"  },
  { name: "Nahum",            slug: "nahum",            apiName: "nahum",             chapters: 3,  testament: "OT", category: "Minor Prophets",  abbr: "Nah"  },
  { name: "Habakkuk",         slug: "habakkuk",         apiName: "habakkuk",          chapters: 3,  testament: "OT", category: "Minor Prophets",  abbr: "Hab"  },
  { name: "Zephaniah",        slug: "zephaniah",        apiName: "zephaniah",         chapters: 3,  testament: "OT", category: "Minor Prophets",  abbr: "Zep"  },
  { name: "Haggai",           slug: "haggai",           apiName: "haggai",            chapters: 2,  testament: "OT", category: "Minor Prophets",  abbr: "Hag"  },
  { name: "Zechariah",        slug: "zechariah",        apiName: "zechariah",         chapters: 14, testament: "OT", category: "Minor Prophets",  abbr: "Zec"  },
  { name: "Malachi",          slug: "malachi",          apiName: "malachi",           chapters: 4,  testament: "OT", category: "Minor Prophets",  abbr: "Mal"  },
  // ── Deuterocanonical (Apocrypha) ──
  { name: "Tobit",            slug: "tobit",            apiName: "tobit",             chapters: 14, testament: "OT", category: "Deuterocanonical",abbr: "Tob"  },
  { name: "Judith",           slug: "judith",           apiName: "judith",            chapters: 16, testament: "OT", category: "Deuterocanonical",abbr: "Jdt"  },
  { name: "Wisdom",           slug: "wisdom",           apiName: "wisdom",            chapters: 19, testament: "OT", category: "Deuterocanonical",abbr: "Wis"  },
  { name: "Sirach",           slug: "sirach",           apiName: "sirach",            chapters: 51, testament: "OT", category: "Deuterocanonical",abbr: "Sir"  },
  { name: "Baruch",           slug: "baruch",           apiName: "baruch",            chapters: 6,  testament: "OT", category: "Deuterocanonical",abbr: "Bar"  },
  { name: "1 Maccabees",      slug: "1-maccabees",      apiName: "1+maccabees",       chapters: 16, testament: "OT", category: "Deuterocanonical",abbr: "1Ma"  },
  { name: "2 Maccabees",      slug: "2-maccabees",      apiName: "2+maccabees",       chapters: 15, testament: "OT", category: "Deuterocanonical",abbr: "2Ma"  },
  // ── New Testament ──
  { name: "Matthew",          slug: "matthew",          apiName: "matthew",           chapters: 28, testament: "NT", category: "Gospels",         abbr: "Mat"  },
  { name: "Mark",             slug: "mark",             apiName: "mark",              chapters: 16, testament: "NT", category: "Gospels",         abbr: "Mar"  },
  { name: "Luke",             slug: "luke",             apiName: "luke",              chapters: 24, testament: "NT", category: "Gospels",         abbr: "Luk"  },
  { name: "John",             slug: "john",             apiName: "john",              chapters: 21, testament: "NT", category: "Gospels",         abbr: "Joh"  },
  { name: "Acts",             slug: "acts",             apiName: "acts",              chapters: 28, testament: "NT", category: "History",         abbr: "Act"  },
  { name: "Romans",           slug: "romans",           apiName: "romans",            chapters: 16, testament: "NT", category: "Pauline",         abbr: "Rom"  },
  { name: "1 Corinthians",    slug: "1-corinthians",    apiName: "1+corinthians",     chapters: 16, testament: "NT", category: "Pauline",         abbr: "1Co"  },
  { name: "2 Corinthians",    slug: "2-corinthians",    apiName: "2+corinthians",     chapters: 13, testament: "NT", category: "Pauline",         abbr: "2Co"  },
  { name: "Galatians",        slug: "galatians",        apiName: "galatians",         chapters: 6,  testament: "NT", category: "Pauline",         abbr: "Gal"  },
  { name: "Ephesians",        slug: "ephesians",        apiName: "ephesians",         chapters: 6,  testament: "NT", category: "Pauline",         abbr: "Eph"  },
  { name: "Philippians",      slug: "philippians",      apiName: "philippians",       chapters: 4,  testament: "NT", category: "Pauline",         abbr: "Phi"  },
  { name: "Colossians",       slug: "colossians",       apiName: "colossians",        chapters: 4,  testament: "NT", category: "Pauline",         abbr: "Col"  },
  { name: "1 Thessalonians",  slug: "1-thessalonians",  apiName: "1+thessalonians",   chapters: 5,  testament: "NT", category: "Pauline",         abbr: "1Th"  },
  { name: "2 Thessalonians",  slug: "2-thessalonians",  apiName: "2+thessalonians",   chapters: 3,  testament: "NT", category: "Pauline",         abbr: "2Th"  },
  { name: "1 Timothy",        slug: "1-timothy",        apiName: "1+timothy",         chapters: 6,  testament: "NT", category: "Pauline",         abbr: "1Ti"  },
  { name: "2 Timothy",        slug: "2-timothy",        apiName: "2+timothy",         chapters: 4,  testament: "NT", category: "Pauline",         abbr: "2Ti"  },
  { name: "Titus",            slug: "titus",            apiName: "titus",             chapters: 3,  testament: "NT", category: "Pauline",         abbr: "Tit"  },
  { name: "Philemon",         slug: "philemon",         apiName: "philemon",          chapters: 1,  testament: "NT", category: "Pauline",         abbr: "Phm"  },
  { name: "Hebrews",          slug: "hebrews",          apiName: "hebrews",           chapters: 13, testament: "NT", category: "General",         abbr: "Heb"  },
  { name: "James",            slug: "james",            apiName: "james",             chapters: 5,  testament: "NT", category: "General",         abbr: "Jas"  },
  { name: "1 Peter",          slug: "1-peter",          apiName: "1+peter",           chapters: 5,  testament: "NT", category: "General",         abbr: "1Pe"  },
  { name: "2 Peter",          slug: "2-peter",          apiName: "2+peter",           chapters: 3,  testament: "NT", category: "General",         abbr: "2Pe"  },
  { name: "1 John",           slug: "1-john",           apiName: "1+john",            chapters: 5,  testament: "NT", category: "General",         abbr: "1Jo"  },
  { name: "2 John",           slug: "2-john",           apiName: "2+john",            chapters: 1,  testament: "NT", category: "General",         abbr: "2Jo"  },
  { name: "3 John",           slug: "3-john",           apiName: "3+john",            chapters: 1,  testament: "NT", category: "General",         abbr: "3Jo"  },
  { name: "Jude",             slug: "jude",             apiName: "jude",              chapters: 1,  testament: "NT", category: "General",         abbr: "Jud"  },
  { name: "Revelation",       slug: "revelation",       apiName: "revelation",        chapters: 22, testament: "NT", category: "Apocalyptic",     abbr: "Rev"  },
];

/** Group books by category within each testament */
export function groupBooksByCategory(testament: "OT" | "NT") {
  const books = BIBLE_BOOKS.filter((b) => b.testament === testament);
  const groups: Record<string, BibleBook[]> = {};
  for (const book of books) {
    if (!groups[book.category]) groups[book.category] = [];
    groups[book.category].push(book);
  }
  return groups;
}

/** Find a book by its URL slug */
export function getBookBySlug(slug: string): BibleBook | undefined {
  return BIBLE_BOOKS.find((b) => b.slug === slug);
}

/** Find next / previous book */
export function getAdjacentBook(slug: string, dir: "prev" | "next"): BibleBook | undefined {
  const idx = BIBLE_BOOKS.findIndex((b) => b.slug === slug);
  if (idx === -1) return undefined;
  return dir === "prev" ? BIBLE_BOOKS[idx - 1] : BIBLE_BOOKS[idx + 1];
}
