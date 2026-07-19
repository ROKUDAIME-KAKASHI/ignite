const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('C:/coding/ignite/frontend/src');
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('transition-all')) {
    // Replace all transition-all with transition
    let newContent = content.replace(/transition-all/g, 'transition');
    
    // For progress bars and similar elements that animate width/height, 
    // let's replace them back or use transition-[width]/transition-[height]
    // Actually, in Tailwind v4, we can use `transition-[width]` or just `transition-all` again
    // Let's find lines with `style={{ width:` and make sure they use transition-[width] instead of transition-all
    const lines = newContent.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('style={{ width:')) {
            lines[i] = lines[i].replace(/transition/g, 'transition-[width]');
        }
    }
    newContent = lines.join('\n');

    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
    console.log('Updated', file);
  }
});

console.log(`Replaced transition-all in ${changedCount} files.`);
