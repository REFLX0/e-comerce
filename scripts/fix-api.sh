#!/bin/bash
cd /opt/kiosquetn/frontend/lib/api
tar -xzf /tmp/api-fix.tar.gz
cd /opt/kiosquetn
docker compose up -d --build
