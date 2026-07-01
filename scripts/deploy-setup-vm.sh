#!/bin/bash
set -e

echo '=== Extracting project ==='
sudo mkdir -p /opt/kiosquetn
sudo chown -R ubuntu:ubuntu /opt/kiosquetn
cd /opt/kiosquetn
tar -xzf /tmp/project.tar.gz

echo '=== Setting up production NGINX config ==='
cp nginx/nginx.prod.conf nginx/nginx.conf

echo '=== Setting up environment variables ==='
cp .env.production.example .env
JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n/' | head -c 48)
NEXTAUTH_SECRET=$(openssl rand -base64 48 | tr -d '\n/' | head -c 48)
DB_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 16)

sed -i "s/CHANGE_ME_GENERATE_WITH_OPENSSL/$JWT_SECRET/1" .env
sed -i "s/CHANGE_ME_GENERATE_WITH_OPENSSL/$NEXTAUTH_SECRET/1" .env
sed -i "s/CHANGE_ME_STRONG_DB_PASSWORD/$DB_PASSWORD/g" .env

echo "=== Firewall Setup ==="
# Attempt to open port 8080 with ufw, iptables, or firewall-cmd
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow 8080/tcp
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --zone=public --add-port=8080/tcp --permanent || true
    sudo firewall-cmd --reload || true
else
    sudo iptables -I INPUT -p tcp --dport 8080 -j ACCEPT || true
fi

echo '=== Launching Docker Compose ==='
docker compose up -d --build

echo '=== Cleaning up old Docker images to save space ==='
docker image prune -f

echo '=== Deployment Launched! ==='
