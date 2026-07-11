import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const book = searchParams.get('book');
  const chapter = searchParams.get('chapter');
  const version = searchParams.get('version') || 'NRSVUE';

  if (!book || !chapter) {
    return NextResponse.json({ error: 'Missing book or chapter' }, { status: 400 });
  }

  const query = `${book} ${chapter}`;
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
