const fs = require('fs');
const path = require('path');

const stampSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
  <g transform="rotate(-6 150 100)" opacity="0.88">
    <ellipse cx="150" cy="100" rx="135" ry="85" fill="none" stroke="#1d4ed8" stroke-width="4" stroke-dasharray="8 2" />
    <ellipse cx="150" cy="100" rx="127" ry="77" fill="none" stroke="#1d4ed8" stroke-width="2" />
    <ellipse cx="150" cy="100" rx="95" ry="55" fill="none" stroke="#1d4ed8" stroke-width="1.5" />
    <path id="curveTop" fill="none" d="M 35,100 A 115,65 0 0,1 265,100" />
    <text font-family="Arial, Helvetica, sans-serif" font-size="14" font-weight="900" fill="#1d4ed8" letter-spacing="3">
      <textPath href="#curveTop" startOffset="50%" text-anchor="middle">
        ★ STE SPECPART SARL ★
      </textPath>
    </text>
    <path id="curveBottom" fill="none" d="M 45,100 A 105,58 0 0,0 255,100" />
    <text font-family="Arial, Helvetica, sans-serif" font-size="11" font-weight="bold" fill="#1d4ed8" letter-spacing="2">
      <textPath href="#curveBottom" startOffset="50%" text-anchor="middle">
        MF: 1823940/A/P/000 • TUNIS
      </textPath>
    </text>
    <text x="150" y="88" font-family="Arial, Helvetica, sans-serif" font-size="12" font-weight="bold" fill="#1d4ed8" text-anchor="middle" letter-spacing="1">
      DIRECTION
    </text>
    <path d="M 90,115 Q 120,90 140,115 T 180,105 Q 210,125 220,95" fill="none" stroke="#1e40af" stroke-width="2.5" stroke-linecap="round" />
    <path d="M 125,120 Q 150,135 175,110" fill="none" stroke="#1e40af" stroke-width="1.8" stroke-linecap="round" />
  </g>
</svg>`;

const frontendPublic = path.join(process.cwd(), 'frontend', 'public');
const backendUploads = path.join(process.cwd(), 'backend', 'uploads');

if (!fs.existsSync(frontendPublic)) fs.mkdirSync(frontendPublic, { recursive: true });
if (!fs.existsSync(backendUploads)) fs.mkdirSync(backendUploads, { recursive: true });

fs.writeFileSync(path.join(frontendPublic, 'taba3.svg'), stampSvg);
fs.writeFileSync(path.join(backendUploads, 'taba3.svg'), stampSvg);
console.log('Successfully created taba3.svg');
