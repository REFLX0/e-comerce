const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const generateSecret = (length = 32) => crypto.randomBytes(length).toString('hex');
const generateStrongPassword = (length = 24) => crypto.randomBytes(length).toString('base64').replace(/[^a-zA-Z0-9]/g, '').slice(0, length);

const envTemplate = `# ═══════════════════════════════════════════════════════════════════
# specpart — Production Environment Variables
# ═══════════════════════════════════════════════════════════════════

# ── Application ───────────────────────────────────────────────────
NODE_ENV=production
# Update these to your actual production domains:
DOMAIN=specpart.tn
FRONTEND_URL=https://specpart.tn

# ── Database ──────────────────────────────────────────────────────
POSTGRES_USER=kiosquetn_prod
POSTGRES_PASSWORD={{POSTGRES_PASSWORD}}
POSTGRES_DB=kiosquetn_prod
DATABASE_URL=postgresql://kiosquetn_prod:{{POSTGRES_PASSWORD}}@db:5432/kiosquetn_prod?schema=public

# ── Authentication ────────────────────────────────────────────────
JWT_SECRET={{JWT_SECRET}}
NEXTAUTH_URL=https://specpart.tn
NEXTAUTH_SECRET={{NEXTAUTH_SECRET}}

# ── Cloudinary (image uploads) ────────────────────────────────────
# Replace with your real Cloudinary credentials
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ── Resend (transactional email) ──────────────────────────────────
RESEND_API_KEY=your_resend_api_key

# ── Redis ─────────────────────────────────────────────────────────
REDIS_HOST=redis
REDIS_PORT=6379

# ── Domain Configuration (For Certbot) ─────────────────────────────
CERTBOT_DOMAIN=specpart.tn
CERTBOT_EMAIL=admin@specpart.tn
`;

const envContent = envTemplate
  .replace(/{{POSTGRES_PASSWORD}}/g, generateStrongPassword(24))
  .replace('{{JWT_SECRET}}', generateSecret(32))
  .replace('{{NEXTAUTH_SECRET}}', generateSecret(32));

const envFilePath = path.join(__dirname, '..', '.env.production');

if (fs.existsSync(envFilePath)) {
  console.log('⚠️  .env.production already exists. Skipping generation to avoid overwriting.');
} else {
  fs.writeFileSync(envFilePath, envContent);
  console.log('✅ Generated .env.production with secure cryptographic secrets.');
  console.log('Please open .env.production and update the DOMAIN, Cloudinary, and Resend keys before deploying.');
}
