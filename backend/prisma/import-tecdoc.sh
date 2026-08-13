#!/bin/bash
set -e

echo "Setting up staging tables in specpart database..."
docker exec -i specpart-db psql -U kiosquetn -d specpart < ./prisma/import-tecdoc-tables.sql

echo "Importing clean_articles_tunisia.csv..."
docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_articles FROM STDIN WITH CSV HEADER" < ../TecDoc_Export/clean_articles_tunisia.csv

echo "Importing clean_attributes_tunisia.csv..."
docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_attributes FROM STDIN WITH CSV HEADER" < ../TecDoc_Export/clean_attributes_tunisia.csv

echo "Importing clean_oe_numbers_tunisia.csv..."
docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_oe_numbers FROM STDIN WITH CSV HEADER" < ../TecDoc_Export/clean_oe_numbers_tunisia.csv

echo "Importing clean_vehicle_links_tunisia.csv..."
docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_vehicle_links FROM STDIN WITH CSV HEADER" < ../TecDoc_Export/clean_vehicle_links_tunisia.csv

echo "Data loaded into staging tables."
