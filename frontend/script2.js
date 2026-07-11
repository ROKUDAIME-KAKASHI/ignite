const fs = require('fs');
const files = require('glob').sync('src/app/**/page.tsx', { cwd: 'C:/coding/ignite/frontend' });

let count = 0;
for (const f of files) {
  const fullPath = 'C:/coding/ignite/frontend/' + f;
  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // We find the exact string that was injected previously
  const target = '<div className="absolute inset-0 bg-[url(\'/header-image.png\')] bg-cover bg-center opacity-40 mix-blend-overlay" />';
  const replacement = `<div className="absolute inset-0 bg-[url('/header-image.png')] bg-cover bg-center opacity-40 mix-blend-overlay" />
        <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-28 h-28 sm:w-36 sm:h-36 z-0 pointer-events-none drop-shadow-2xl">
          <img src="/header-image.png" className="w-full h-full object-contain opacity-90" alt="Church full view" />
        </div>`;

  if (content.includes(target) && !content.includes('Church full view')) {
    content = content.replace(target, replacement);
    fs.writeFileSync(fullPath, content);
    console.log('Updated', f);
    count++;
  }
}
console.log('Updated ' + count + ' files.');
