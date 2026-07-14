const fs = require('fs');
const path = require('path');
function walk(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    const p = path.join(dir, f);
    if (fs.statSync(p).isDirectory()) walk(p, callback);
    else callback(p);
  });
}

const errors = [];
walk('./src', (p) => {
  if (!p.endsWith('.tsx') && !p.endsWith('.ts')) return;
  const content = fs.readFileSync(p, 'utf-8');
  const isClient = content.includes('"use client"') || content.includes("'use client'");
  
  if (isClient && /export\s+default\s+async\s+function/.test(content)) {
    errors.push(p + ': Async Client Component detected');
  }

  if (!isClient && (content.includes('useState(') || content.includes('useEffect(') || content.includes('useRouter('))) {
    errors.push(p + ': Uses hooks but missing "use client"');
  }
  
  // Look for potentially buggy overlays
  if (content.includes('z-[9999]') || content.includes('z-50') || content.includes('z-index')) {
    // just to note them
  }
});
console.log('Errors found:', errors.length ? errors : 'None');
