#!/usr/bin/env node
/**
 * Generates a production `.env` from `.env.production.example`.
 *
 * It used to carry its own hardcoded copy of the env template, which had
 * drifted badly from reality: stale database names, an old domain, RESEND_API_KEY
 * instead of BREVO_API_KEY, and none of the MINIO_* / NEXT_PUBLIC_* variables
 * docker-compose now requires. It also wrote `.env.production`, which nothing
 * reads — docker-compose reads `.env`.
 *
 * The example file is now the single source of truth: this script copies it and
 * fills in the CHANGE_ME_* placeholders with generated values.
 *
 * Usage:
 *   node scripts/generate-secrets.js [--domain example.com] [--force]
 */

const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const EXAMPLE_PATH = path.join(ROOT, '.env.production.example');
const OUTPUT_PATH = path.join(ROOT, '.env');

const args = process.argv.slice(2);
const force = args.includes('--force');
const domainIndex = args.indexOf('--domain');
const domain = domainIndex !== -1 ? args[domainIndex + 1] : null;

const randomSecret = (bytes = 48) =>
  crypto.randomBytes(bytes).toString('base64').replace(/=+$/, '');

/** Alphanumeric only — these end up inside a Postgres connection URL. */
const randomPassword = (length = 32) =>
  crypto
    .randomBytes(length * 2)
    .toString('base64')
    .replace(/[^a-zA-Z0-9]/g, '')
    .slice(0, length);

if (!fs.existsSync(EXAMPLE_PATH)) {
  console.error(`✖  Missing ${path.relative(ROOT, EXAMPLE_PATH)}`);
  process.exit(1);
}

if (fs.existsSync(OUTPUT_PATH) && !force) {
  console.error(
    `⚠️  ${path.relative(ROOT, OUTPUT_PATH)} already exists. Refusing to overwrite.\n` +
      '    Re-run with --force if you really want to regenerate every secret\n' +
      '    (this invalidates all sessions and breaks the existing database login).'
  );
  process.exit(1);
}

const secrets = {
  POSTGRES_PASSWORD: randomPassword(32),
  JWT_SECRET: randomSecret(48),
  NEXTAUTH_SECRET: randomSecret(48),
  MINIO_USER: `specpart-${crypto.randomBytes(4).toString('hex')}`,
  MINIO_PASSWORD: randomPassword(32),
};

let content = fs.readFileSync(EXAMPLE_PATH, 'utf8');

// The DB password appears both standalone and inside the connection URLs.
content = content
  .replace(/CHANGE_ME_STRONG_DB_PASSWORD/g, secrets.POSTGRES_PASSWORD)
  .replace(/^JWT_SECRET=.*$/m, `JWT_SECRET=${secrets.JWT_SECRET}`)
  .replace(/^NEXTAUTH_SECRET=.*$/m, `NEXTAUTH_SECRET=${secrets.NEXTAUTH_SECRET}`)
  .replace(/^MINIO_ROOT_USER=.*$/m, `MINIO_ROOT_USER=${secrets.MINIO_USER}`)
  .replace(
    /^MINIO_ROOT_PASSWORD=.*$/m,
    `MINIO_ROOT_PASSWORD=${secrets.MINIO_PASSWORD}`
  );

if (domain) {
  const bare = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
  content = content
    .replace(/^DOMAIN=.*$/m, `DOMAIN=${bare}`)
    .replace(/^FRONTEND_URL=.*$/m, `FRONTEND_URL=https://${bare}`)
    .replace(/^NEXTAUTH_URL=.*$/m, `NEXTAUTH_URL=https://${bare}`)
    .replace(/^NEXT_PUBLIC_SITE_URL=.*$/m, `NEXT_PUBLIC_SITE_URL=https://${bare}`);
}

fs.writeFileSync(OUTPUT_PATH, content, { mode: 0o600 });

const remaining = content
  .split('\n')
  .filter((line) => /CHANGE_ME|yourdomain\.com/.test(line))
  .map((line) => `     ${line.split('=')[0]}`);

console.log(`✔  Wrote ${path.relative(ROOT, OUTPUT_PATH)} (mode 0600)`);
console.log('   Generated: POSTGRES_PASSWORD, JWT_SECRET, NEXTAUTH_SECRET, MINIO_ROOT_*');
if (remaining.length > 0) {
  console.log('\n⚠️  Still needs a real value before deploying:');
  console.log(remaining.join('\n'));
}
console.log(
  '\n   NEXT_PUBLIC_* are inlined at build time — rebuild the frontend image\n' +
    '   after changing the domain: docker compose build frontend'
);
