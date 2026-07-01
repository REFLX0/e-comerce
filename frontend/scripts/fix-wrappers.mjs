import fs from 'fs';
import path from 'path';

const pagesToFix = [
  'app/(store)/recherche/page.tsx',
  'app/(store)/marque/[slug]/page.tsx',
  'app/(store)/categorie/[slug]/page.tsx',
  'app/(store)/catalogue/page.tsx',
  'app/(auth)/auth/register/page.tsx',
  'app/(auth)/auth/mot-de-passe-oublie/page.tsx'
];

for (const relPath of pagesToFix) {
  const fullPath = path.resolve(relPath);
  if (!fs.existsSync(fullPath)) continue;
  
  let content = fs.readFileSync(fullPath, 'utf8');
  
  // If it's a wrapper, it contains `{...props}`
  if (content.includes('{...props}')) {
    // Replace `export default function Page(props: any) { return <Comp {...props} />; }`
    // With `export default function Page({ params, searchParams }: any) { return <Comp params={params} searchParams={searchParams} />; }`
    
    content = content.replace(/function Page\(props: any\)\s*\{\s*return <([A-Za-z0-9_]+) \{\.\.\.props\} \/>;\s*\}/, 
      "function Page({ params, searchParams }: any) { return <$1 params={params} searchParams={searchParams} />; }");
      
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed wrapper ${relPath}`);
  }
}
