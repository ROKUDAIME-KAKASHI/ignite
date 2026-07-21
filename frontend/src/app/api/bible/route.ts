import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';
import { BIBLE_BOOKS } from '@/lib/bible-books';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const version = searchParams.get('version') || 'NRSVUE';

  if (!book || !chapter) {
    return NextResponse.json({ error: 'Missing book or chapter' }, { status: 400 });
  }

  const query = `${book} ${chapter}`;

  if (version === 'MAL') {
    try {
      const filePath = path.join(process.cwd(), 'src', 'data', 'malayalam.json');
      const data = fs.readFileSync(filePath, 'utf-8');
      const bibleJson = JSON.parse(data);

      const traditionalBooks = BIBLE_BOOKS.filter((b: any) => b.category !== "Deuterocanonical");
      const bookIndex = traditionalBooks.findIndex((b: any) => b.apiName === book);
      if (bookIndex === -1) {
        return NextResponse.json({ error: 'Book not found in Malayalam translation' }, { status: 404 });
      }
      
      const targetBook = bibleJson.Book[bookIndex];
      if (!targetBook) {
        return NextResponse.json({ error: 'Book not found in Malayalam translation' }, { status: 404 });
      }

      const chapterIndex = parseInt(chapter) - 1;
      const targetChapter = targetBook.Chapter[chapterIndex];
      if (!targetChapter) {
        return NextResponse.json({ error: 'Chapter not found' }, { status: 404 });
      }

      const verses = targetChapter.Verse.map((v: any, i: number) => ({
        book_name: traditionalBooks[bookIndex].name,
        chapter: parseInt(chapter),
        verse: i + 1,
        text: v.Verse
      }));

      return NextResponse.json({
        reference: `${traditionalBooks[bookIndex].name} ${chapter}`,
        verses,
        text: verses.map((v: any) => v.text).join(' '),
        translation_id: 'mal',
        translation_name: 'Malayalam Bible'
      });
    } catch (err: any) {
      console.error(err);
      return NextResponse.json({ error: 'Failed to load Malayalam Bible: ' + err.message }, { status: 500 });
    }
  }

  const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(query)}&version=${version}`;

  try {
    const res = await fetch(bgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch from Bible Gateway: ${res.status}`);
    }

    const html = await res.text();
    const $ = cheerio.load(html);

    // Extract the passage text
    const passageContainer = $('.passage-content');
    if (!passageContainer.length) {
      return NextResponse.json({ error: 'Passage not found' }, { status: 404 });
    }

    const verses: { book_name: string, chapter: number, verse: number, text: string }[] = [];

    // Parse the verses
    // BibleGateway structure: <span class="text John-3-16">For God so loved...</span>
    // Note: A single verse might be split across multiple spans, and some spans might have multiple verses.
    
    // We'll iterate over all text spans that have a verse number
    $('.text').each((_, el) => {
      const classList = $(el).attr('class') || '';
      
      // Find the verse class like "John-3-16"
      const match = classList.match(/([a-zA-Z0-9]+)-(\d+)-(\d+)/);
      if (match) {
        const [, b, ch, v] = match;
        
        // Remove footnotes, cross-references, verse numbers inside the text span
        $(el).find('.chapternum, .versenum, .crossreference, .footnote').remove();
        
        const rawText = $(el).text().trim();
        if (rawText) {
          const vNum = parseInt(v, 10);
          const chNum = parseInt(ch, 10);
          
          // Check if we already have this verse (some spans are split)
          const existingVerse = verses.find(x => x.verse === vNum);
          if (existingVerse) {
            existingVerse.text += ' ' + rawText;
          } else {
            verses.push({
              book_name: book,
              chapter: chNum,
              verse: vNum,
              text: rawText
            });
          }
        }
      }
    });

    return NextResponse.json({
      reference: `${book} ${chapter}`,
      translation_id: version.toLowerCase(),
      translation_name: version,
      verses: verses.sort((a, b) => a.verse - b.verse)
    });

  } catch (error: any) {
    console.error('Bible proxy error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
