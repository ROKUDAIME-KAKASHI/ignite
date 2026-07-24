const cheerio = require('cheerio');
async function test() {
  const html = await fetch('https://www.biblegateway.com/passage/?search=1+John+1&version=NRSVUE').then(r=>r.text());
  const $ = cheerio.load(html);
  $('.text').each((i, el) => console.log($(el).attr('class')));
}
test();
