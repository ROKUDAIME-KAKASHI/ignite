const cheerio = require('cheerio');

async function test(query) {
  const version = 'NRSVUE';
  const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(query)}&version=${version}`;
  try {
    const res = await fetch(bgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const html = await res.text();
    const $ = cheerio.load(html);
    const verses = [];
    $('.text').each((_, el) => {
      const classList = $(el).attr('class') || '';
      const match = classList.match(/([a-zA-Z0-9]+)-(\d+)-(\d+)/);
      if (match) {
        verses.push(match[3]);
      }
    });
    console.log(`${query} verses count:`, verses.length);
  } catch (err) {
    console.error(err);
  }
}
test('3 John 1');
test('Jude 1');
test('Philemon 1');
