import fs from 'fs';
import path from 'path';

function processDirectory(dir) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      processDirectory(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      const regex1 = /from\s+['"](\.\.\/)+components([^'"]*)['"]/g;
      const regex2 = /from\s+['"](\.\.\/)+lib([^'"]*)['"]/g;
      const regex3 = /from\s+['"](\.\.\/)+store([^'"]*)['"]/g;
      
      let changed = false;
      if (regex1.test(content)) {
        content = content.replace(regex1, "from '@/components$2'");
        changed = true;
      }
      if (regex2.test(content)) {
        content = content.replace(regex2, "from '@/lib$2'");
        changed = true;
      }
      if (regex3.test(content)) {
        content = content.replace(regex3, "from '@/store$2'");
        changed = true;
      }
      
      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated alias 2: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src/app'));
processDirectory(path.join(process.cwd(), 'src/components'));
