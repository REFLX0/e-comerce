#!/bin/bash
set -e

echo "=== Opening Firewall Port 8080 ==="
sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent || true
sudo firewall-cmd --reload || true

echo "=== Preparing Directory ==="
sudo mkdir -p /opt/kiosquetn
sudo chown -R ubuntu:ubuntu /opt/kiosquetn

echo "=== Cloning Repository ==="
cd /opt/kiosquetn
if [ -d ".git" ]; then
  git pull origin main
else
  git clone https://github.com/REFLX0/e-comerce.git .
fi

echo "=== Setting up production NGINX config ==="
cp nginx/nginx.prod.conf nginx/nginx.conf

echo "=== Generating secure defaults for .env ==="
cp .env.production.example .env
# We'll auto-generate the secrets using openssl
JWT_SECRET=$(openssl rand -base64 48)
NEXTAUTH_SECRET=$(openssl rand -base64 48)
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 16)

# Use sed to replace the placeholders in .env
sed -i "s/CHANGE_ME_GENERATE_WITH_OPENSSL/$JWT_SECRET/1" .env
sed -i "s/CHANGE_ME_GENERATE_WITH_OPENSSL/$NEXTAUTH_SECRET/1" .env
sed -i "s/CHANGE_ME_STRONG_DB_PASSWORD/$DB_PASSWORD/g" .env

echo "=== Environment variables initialized (API Keys still need manual entry) ==="

echo "=== Pulling Docker Images & Building ==="
docker-compose up -d --build

echo "=== Cleaning up old Docker images to save space ==="
docker image prune -f

echo "=== Done! ==="
