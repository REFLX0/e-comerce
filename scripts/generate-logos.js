const fs = require('fs');
const path = require('path');

const brands = [
  { name: 'Yacco', slug: 'yacco', color: '#1E3A8A' },
  { name: 'Shell', slug: 'shell', color: '#DC2626' },
  { name: 'Total', slug: 'total', color: '#047857' },
  { name: 'Castrol', slug: 'castrol', color: '#15803D' },
  { name: 'Liqui Moly', slug: 'liqui-moly', color: '#1D4ED8' },
  { name: 'Motul', slug: 'motul', color: '#B91C1C' },
  { name: 'Bosch', slug: 'bosch', color: '#BE185D' },
  { name: 'Purflux', slug: 'purflux', color: '#4338CA' },
  { name: 'Wynn\'s', slug: 'wynns', color: '#7E22CE' }
];

const dir = path.join(__dirname, 'frontend', 'public', 'img', 'b');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

brands.forEach(b => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 120" width="400" height="120">
    <rect width="400" height="120" rx="20" fill="${b.color}" fill-opacity="0.1" />
    <text x="200" y="60" font-family="sans-serif" font-size="42" font-weight="bold" fill="${b.color}" text-anchor="middle" dominant-baseline="middle">
      ${b.name}
    </text>
  </svg>`;
  fs.writeFileSync(path.join(dir, `${b.slug}.svg`), svg);
  console.log(`Created ${b.slug}.svg`);
});
