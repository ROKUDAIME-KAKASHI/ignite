const fs = require('fs');
const path = require('path');

function processFiles(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    const fullPath = path.join(dir, file.name);
    if (file.isDirectory()) {
      processFiles(fullPath);
    } else if (fullPath.endsWith('.tsx') && !fullPath.includes('node_modules')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let changed = false;

      // Add import Image from 'next/image' if not exists and if we're going to replace something
      if (content.includes('<img ') && !content.includes('import Image from "next/image"') && !content.includes("import Image from 'next/image'")) {
         content = content.replace(/^("use client";|'use client';)?\s*/i, "$1\nimport Image from 'next/image';\n");
      }

      // Replace header-image.png specifically to avoid breaking random external avatar URLs
      if (content.includes('<img src="/header-image.png"')) {
         content = content.replace(/<img src="\/header-image\.png"/g, '<Image src="/header-image.png" width={400} height={200} priority');
         changed = true;
      }
      
      // Events page specific event photos
      if (content.includes('<img src={photo.imageUrl}')) {
         content = content.replace(/<img src={photo.imageUrl}/g, '<Image src={photo.imageUrl} width={600} height={400} unoptimized');
         changed = true;
      }
      if (content.includes('<img src={photo.uploadedBy.avatarUrl}')) {
         content = content.replace(/<img src={photo.uploadedBy.avatarUrl}/g, '<Image src={photo.uploadedBy.avatarUrl} width={64} height={64} unoptimized');
         changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Updated', fullPath);
      }
    }
  }
}

processFiles(path.join(process.cwd(), 'src/app'));
