const fs = require('fs');

const file = 'C:/coding/ignite/frontend/src/app/dashboard/page.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace </a> with </Link> globally (only doing this in dashboard/page.tsx where we know it's safe)
content = content.replace(/<\/a>/g, '</Link>');
// Replace <a  with <Link 
content = content.replace(/<a /g, '<Link ');

// Ensure Link is imported if not already
if (!content.includes('import Link from "next/link";')) {
    content = content.replace('import { ChevronRight', 'import Link from "next/link";\nimport { ChevronRight');
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed links in dashboard/page.tsx');
