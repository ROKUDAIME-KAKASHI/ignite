const fs = require('fs');
const files = require('glob').sync('src/app/**/page.tsx', { cwd: 'C:/coding/ignite/frontend' });
files.forEach(f => {
  const content = fs.readFileSync('C:/coding/ignite/frontend/' + f, 'utf8');
  const match = content.match(/<div className="relative overflow-hidden px-5 pt-8 pb-[^"]+"[^>]*>[\s\S]*?<div className="relative z-10">/);
  if (match) {
    console.log(f);
  }
});
