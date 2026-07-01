#!/bin/bash
mv /tmp/commandes-page.tsx "/opt/kiosquetn/frontend/app/(store)/compte/commandes/page.tsx"
cd /opt/kiosquetn
docker compose up -d --build
