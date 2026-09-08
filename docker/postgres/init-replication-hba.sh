#!/bin/sh
# Runs once, only on first initialization of an empty primary data dir
# (docker-entrypoint-initdb.d convention). Postgres's auto-generated
# pg_hba.conf entry ("host all all all ...") does NOT cover the special
# "replication" pseudo-database, so without this the db-replica service
# can never complete its pg_basebackup and crash-loops forever.
set -e

echo "host    replication     ${POSTGRES_USER}      0.0.0.0/0               scram-sha-256" >> "$PGDATA/pg_hba.conf"
