#!/usr/bin/env pwsh
# Run this after `docker compose up --build` finishes
# Usage: .\scripts\apply-local-images.ps1

Write-Host "=== Step 1: Restarting nginx to pick up the new volume mount ===" -ForegroundColor Cyan
docker compose up -d --no-build --no-deps nginx
if ($LASTEXITCODE -ne 0) { Write-Error "nginx restart failed"; exit 1 }

Write-Host "`n=== Step 2: Running DB URL migration ===" -ForegroundColor Cyan
Get-Content backend\prisma\migrate-images-to-local.sql | docker exec -i specpart-db psql -U specpart -d specpart
if ($LASTEXITCODE -ne 0) { Write-Error "SQL migration failed"; exit 1 }

Write-Host "`n=== Done! Images are now served from /product-images/ ===" -ForegroundColor Green
Write-Host "Test a sample image: http://localhost:8082/product-images/" -ForegroundColor Yellow
