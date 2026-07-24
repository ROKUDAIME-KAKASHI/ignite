const cheerio = require('cheerio');

async function test() {
  const version = 'NRSVUE';
  const query = 'Genesis 1';
  const bgUrl = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(query)}&version=${version}`;
  console.log('Fetching', bgUrl);
  try {
    const res = await fetch(bgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    console.log('Status:', res.status);
    if (!res.ok) {
      throw new Error(`Failed to fetch from Bible Gateway: ${res.status}`);
    }
    const html = await res.text();
    const $ = cheerio.load(html);
    const passageContainer = $('.passage-content');
    console.log('Passage container length:', passageContainer.length);
    if (!passageContainer.length) {
      console.log('Could not find passage container');
      // console.log(html.slice(0, 1000));
    } else {
      let count = 0;
      $('.text').each((_, el) => {
        count++;
      });
      console.log('Found texts:', count);
    }
  } catch (err) {
    console.error(err);
  }
}
test();
