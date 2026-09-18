#!/bin/bash
set -e

echo "=== Opening Firewall Port 8082 ==="
sudo firewall-cmd --zone=public --add-port=8082/tcp --permanent || true
sudo firewall-cmd --reload || true

echo "=== Preparing Directory ==="
sudo mkdir -p /opt/specpart
sudo chown -R ubuntu:ubuntu /opt/specpart

echo "=== Cloning Repository ==="
cd /opt/specpart
if [ -d ".git" ]; then
  git pull origin main
else
  git clone https://github.com/REFLX0/e-comerce.git .
fi

# NGINX: no copy step any more. docker-compose mounts
# nginx/nginx.prod.conf.template into /etc/nginx/templates/ and the nginx
# image renders it with ${DOMAIN} at container start.

echo "=== Generating secure defaults for .env ==="
# Delegated to the generator so every required placeholder is filled - the
# hand-rolled sed version here missed MINIO_ROOT_USER/PASSWORD (which
# docker-compose requires, so the stack would not start) and could be
# mangled by the "/" characters in a base64 secret.
node scripts/generate-secrets.js

echo "=== Environment variables initialized (API Keys still need manual entry) ==="

echo "=== Pulling Docker Images & Building ==="
docker-compose up -d --build

echo "=== Cleaning up old Docker images to save space ==="
docker image prune -f

echo "=== Done! ==="
