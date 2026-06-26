const fs = require('fs');
const path = require('path');
const glob = require('glob');

const files = glob.sync('C:/coding/ignite/frontend/src/**/*.{tsx,ts}');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;
  
  // Quick fix for useEffect in bible reader
  if (file.includes('bible') && file.includes('[bookSlug]') && file.includes('page.tsx')) {
    if (content.includes('useEffect(() => { load(); }, [load]);')) {
      content = content.replace('useEffect(() => { load(); }, [load]);', 'useEffect(() => { void load(); }, [load]);');
      changed = true;
    }
  }

  // Replace literal quotes inside JSX text blocks. 
  // We use regex to find quotes that are likely in JSX text (between > and <)
  // This is a naive regex but works well for most static JSX text
  const jsxTextRegex = />([^<]*?)"([^<]*?)</g;
  while (jsxTextRegex.test(content)) {
    content = content.replace(/>([^<]*?)"([^<]*?)</g, '>$1&quot;$2<');
    changed = true;
  }
  
  // Fix specific unused imports
  if (content.includes('BookOpen, Clock')) {
    content = content.replace('BookOpen, Clock', 'ChevronRight');
    changed = true;
  }
  if (content.includes('ChevronRight } from "lucide-react";') && file.includes('prayer')) {
    content = content.replace(', ChevronRight } from "lucide-react";', '} from "lucide-react";');
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Fixed', file);
  }
});
