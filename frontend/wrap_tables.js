const fs = require('fs');
const files = [
  'C:\\coding\\ignite\\frontend\\src\\app\\priest\\dashboard\\page.tsx',
  'C:\\coding\\ignite\\frontend\\src\\app\\admin\\dashboard\\page.tsx'
];

for (const file of files) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/(<table[^>]*>)/g, '<div className="overflow-x-auto w-full">\n                    $1');
  content = content.replace(/(<\/table>)/g, '$1\n                  </div>');
  fs.writeFileSync(file, content, 'utf8');
}
