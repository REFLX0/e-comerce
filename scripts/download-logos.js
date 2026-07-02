const fs = require('fs');
const https = require('https');
const path = require('path');

const brands = [
  { slug: 'yacco', domain: 'yacco.com' },
  { slug: 'shell', domain: 'shell.com' },
  { slug: 'total', domain: 'totalenergies.com' }, // backend says slug 'totalenergies' but the image is 'total.png'
  { slug: 'castrol', domain: 'castrol.com' },
  { slug: 'liquimoly', domain: 'liqui-moly.com' },
  { slug: 'motul', domain: 'motul.com' },
  { slug: 'bosch', domain: 'bosch.com' },
  { slug: 'purflux', domain: 'purflux.com' },
  { slug: 'wynns', domain: 'wynns.eu' },
];

const downloadDir = path.join(__dirname, 'frontend', 'public', 'img', 'b');

if (!fs.existsSync(downloadDir)){
    fs.mkdirSync(downloadDir, { recursive: true });
}

brands.forEach(brand => {
  const url = `https://logo.clearbit.com/${brand.domain}?size=400`;
  const filePath = path.join(downloadDir, `${brand.slug}.png`);
  
  console.log(`Downloading ${brand.slug} from ${url}...`);
  
  https.get(url, (res) => {
    if (res.statusCode === 200) {
      const file = fs.createWriteStream(filePath);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded ${brand.slug}.png successfully.`);
      });
    } else if (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307 || res.statusCode === 308) {
      https.get(res.headers.location, (redirectRes) => {
        if (redirectRes.statusCode === 200) {
          const file = fs.createWriteStream(filePath);
          redirectRes.pipe(file);
          file.on('finish', () => {
            file.close();
            console.log(`Downloaded ${brand.slug}.png successfully (after redirect).`);
          });
        } else {
           console.log(`Failed to download ${brand.slug}.png. Status: ${redirectRes.statusCode}`);
        }
      });
    } else {
      console.log(`Failed to download ${brand.slug}.png. Status: ${res.statusCode}`);
    }
  }).on('error', (err) => {
    console.log(`Error downloading ${brand.slug}: ${err.message}`);
  });
});
