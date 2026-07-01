#!/bin/bash
cd /opt/kiosquetn
# Remove old frontend except for .env which we might need, actually .env is in backend or root.
# We will just extract the tarball over it.
tar -xzf /tmp/frontend-full-fix.tar.gz
docker compose up -d --build
