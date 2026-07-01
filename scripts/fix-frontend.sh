#!/bin/bash
mv /tmp/page.tsx "/opt/kiosquetn/frontend/app/(store)/compte/commandes/[id]/page.tsx"
cd /opt/kiosquetn
docker compose up -d --build
