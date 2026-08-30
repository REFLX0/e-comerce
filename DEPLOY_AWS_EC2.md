# 🚀 AWS EC2 Production Deployment Guide for Specpart

This guide walks you through deploying the complete Dockerized Specpart stack to an AWS EC2 instance.

---

## 1. AWS EC2 Instance Specs (Recommended)

- **Region**: Europe (Frankfurt `eu-central-1` or Stockholm `eu-north-1` for optimal latency to Tunisia/Europe)
- **AMI**: Ubuntu Server 24.04 LTS (HVM), SSD Volume Type (64-bit x86)
- **Instance Type**: `t3.large` (2 vCPU, 8 GiB RAM)
- **Storage**: 40 GiB gp3 Root Volume

---

## 2. Security Group (Firewall Rules)

Open the following inbound ports in the EC2 Security Group:

| Port | Protocol | Source | Description |
|---|---|---|---|
| **22** | TCP | `0.0.0.0/0` (or your IP) | SSH Remote Access |
| **80** | TCP | `0.0.0.0/0` | HTTP (Web / Let's Encrypt verification) |
| **443** | TCP | `0.0.0.0/0` | HTTPS (Encrypted Web Traffic) |
| **8082** | TCP | `0.0.0.0/0` | Direct Nginx port (optional) |

---

## 3. Server Setup Script (Run on new EC2 server)

```bash
# 1. Update and install prerequisites
sudo apt update && sudo apt upgrade -y
sudo apt install -y git curl ufw

# 2. Install official Docker Engine
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# 3. Install Docker Compose plugin
sudo apt install -y docker-compose-plugin

# 4. Configure Firewall (UFW)
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8082/tcp
sudo ufw --force enable
```

---

## 4. Deploying the Application

```bash
# 1. Clone repository
git clone <YOUR_GIT_REPO_URL> specpart
cd specpart

# 2. Setup production environment variables
nano backend/.env

# 3. Build and launch all services in detached background mode
docker compose up -d --build

# 4. Verify running containers
docker compose ps
```

---

## 5. Helpful Commands

- **View live backend logs**: `docker logs -f achref-backend-1`
- **View frontend logs**: `docker logs -f specpart-frontend`
- **Restart all services**: `docker compose restart`
- **Update with latest code**:
  ```bash
  git pull
  docker compose build frontend backend
  docker compose up -d --no-deps frontend backend
  ```
