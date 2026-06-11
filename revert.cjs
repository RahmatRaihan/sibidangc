const fs = require('fs');
const path = require('path');

function processDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      processDir(fullPath);
    } else if (fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      
      content = content.replace(/ dark:bg-slate-800\/50/g, '');
      content = content.replace(/ dark:bg-slate-900\/80/g, '');
      content = content.replace(/ dark:bg-slate-900\/50/g, '');
      content = content.replace(/ dark:bg-slate-800/g, '');
      content = content.replace(/ dark:bg-slate-700/g, '');
      
      content = content.replace(/ dark:text-slate-100/g, '');
      content = content.replace(/ dark:text-slate-200/g, '');
      content = content.replace(/ dark:text-gray-100/g, '');
      content = content.replace(/ dark:text-gray-300/g, '');
      
      content = content.replace(/ dark:border-slate-700/g, '');

      fs.writeFileSync(fullPath, content, 'utf8');
    }
  }
}

processDir(path.join(__dirname, 'src'));
console.log('Revert done.');
