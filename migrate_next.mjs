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
      let changed = false;

      // Add 'use client' if it uses hooks
      if (content.match(/useState|useEffect|useRef|useRouter|usePathname|useAuthStore|useThemeStore/) && !content.includes('"use client"')) {
        content = '"use client";\n' + content;
        changed = true;
      }

      if (content.includes('react-router-dom')) {
        content = content.replace(/import\s+{([^}]+)}\s+from\s+['"]react-router-dom['"];?/g, (match, imports) => {
          let newImports = '';
          if (imports.includes('Link')) {
            newImports += `import Link from 'next/link';\n`;
          }
          const navImports = [];
          if (imports.includes('useNavigate')) navImports.push('useRouter');
          if (imports.includes('useLocation')) navImports.push('usePathname');
          if (imports.includes('useParams')) navImports.push('useParams');
          
          if (navImports.length > 0) {
            newImports += `import { ${navImports.join(', ')} } from 'next/navigation';\n`;
          }
          return newImports.trim();
        });
        changed = true;
      }

      if (content.includes('useNavigate')) {
        content = content.replace(/useNavigate/g, 'useRouter');
        content = content.replace(/const\s+navigate\s*=\s*useRouter\(\)/g, 'const router = useRouter()');
        content = content.replace(/navigate\(/g, 'router.push(');
        changed = true;
      }

      if (content.includes('useLocation')) {
        content = content.replace(/useLocation/g, 'usePathname');
        content = content.replace(/const\s+location\s*=\s*usePathname\(\)/g, 'const pathname = usePathname()');
        content = content.replace(/location\.pathname/g, 'pathname');
        changed = true;
      }

      if (content.includes('<Link to=')) {
        content = content.replace(/<Link\s+to=/g, '<Link href=');
        changed = true;
      }

      if (changed) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`Updated: ${fullPath}`);
      }
    }
  }
}

processDirectory(path.join(process.cwd(), 'src/app'));
processDirectory(path.join(process.cwd(), 'src/components'));
