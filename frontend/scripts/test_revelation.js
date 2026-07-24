const cheerio = require('cheerio');

async function test() {
  const version = 'NRSVUE';
  const query = 'revelation 1';
  const book = 'revelation';
  const chapter = 1;
  const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(query)}&version=${version}`;
  try {
    const res = await fetch(bgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const passageContainer = $('.passage-content');
    const verses = [];
    $('.text').each((_, el) => {
      const classList = $(el).attr('class') || '';
      const match = classList.match(/([a-zA-Z0-9]+)-(\d+)-(\d+)/);
      if (match) {
        const [, b, ch, v] = match;
        $(el).find('.chapternum, .versenum, .crossreference, .footnote').remove();
        const rawText = $(el).text().trim();
        if (rawText) {
          const vNum = parseInt(v, 10);
          const chNum = parseInt(ch, 10);
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
    console.log("Revelation 1 verses count:", verses.length);
    console.log(verses.slice(0, 3));
  } catch (err) {
    console.error(err);
  }
}
test();
