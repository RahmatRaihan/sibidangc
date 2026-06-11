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
      
      // Replace relative imports to src directories with alias
      // Matches import ... from '../../components/...' or '../lib/...' etc.
      // Replaces with import ... from '@/components/...'
      const regex = /from\s+['"](?:\.\.\/)+((?:components|lib|store|hooks|router|assets)\/[^'"]+)['"]/g;
      
      if (regex.test(content)) {
        content = content.replace(regex, "from '@/$1'");
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated alias: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src/app'));
processDirectory(path.join(process.cwd(), 'src/components'));
