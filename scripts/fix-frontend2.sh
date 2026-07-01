#!/bin/bash
mv /tmp/page2.tsx "/opt/kiosquetn/frontend/app/(store)/compte/page.tsx"
cd /opt/kiosquetn
docker compose up -d --build
