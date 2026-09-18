#!/bin/bash
set -e

echo '=== Extracting project ==='
sudo mkdir -p /opt/kiosquetn
sudo chown -R ubuntu:ubuntu /opt/kiosquetn
cd /opt/kiosquetn
tar -xzf /tmp/project.tar.gz

# NGINX: no copy step any more. docker-compose mounts
# nginx/nginx.prod.conf.template into /etc/nginx/templates/ and the nginx
# image renders it with ${DOMAIN} at container start.

echo '=== Setting up environment variables ==='
# Delegated to the generator so every required placeholder is filled - the
# hand-rolled sed version here missed MINIO_ROOT_USER/PASSWORD (which
# docker-compose requires, so the stack would not start) and could be
# mangled by the "/" characters in a base64 secret.
node scripts/generate-secrets.js

echo "=== Firewall Setup ==="
# Attempt to open port 8082 with ufw, iptables, or firewall-cmd
if command -v ufw >/dev/null 2>&1; then
    sudo ufw allow 8082/tcp
elif command -v firewall-cmd >/dev/null 2>&1; then
    sudo firewall-cmd --zone=public --add-port=8082/tcp --permanent || true
    sudo firewall-cmd --reload || true
else
    sudo iptables -I INPUT -p tcp --dport 8082 -j ACCEPT || true
fi

echo '=== Launching Docker Compose ==='
docker compose up -d --build

echo '=== Cleaning up old Docker images to save space ==='
docker image prune -f

echo '=== Deployment Launched! ==='
