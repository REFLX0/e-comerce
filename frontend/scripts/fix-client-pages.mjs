import fs from 'fs';
import path from 'path';

const pagesToFix = [
  'app/(store)/recherche/page.tsx',
  'app/(store)/marque/[slug]/page.tsx',
  'app/(store)/faq/page.tsx',
  'app/(store)/categorie/[slug]/page.tsx',
  'app/(store)/catalogue/page.tsx',
  'app/(auth)/auth/register/page.tsx',
  'app/(auth)/auth/mot-de-passe-oublie/page.tsx'
];

for (const relPath of pagesToFix) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`Skipping ${relPath}, not found`);
    continue;
  }
  let content = fs.readFileSync(fullPath, 'utf8');
  if (content.includes("'use client'") || content.includes('"use client"')) {
    // 1. Rename page.tsx to client-page.tsx
    const dir = path.dirname(fullPath);
    const clientPath = path.join(dir, 'client-page.tsx');
    fs.writeFileSync(clientPath, content);
    
    // 2. Determine the default export name
    const match = content.match(/export default function ([a-zA-Z0-9_]+)/);
    const componentName = match ? match[1] : 'Page';
    
    // 3. Create a new server page.tsx
    const serverContent = `import ${componentName} from './client-page';\n\nexport default function Page(props: any) {\n  return <${componentName} {...props} />;\n}\n`;
    fs.writeFileSync(fullPath, serverContent);
    console.log(`Fixed ${relPath}`);
  }
}
