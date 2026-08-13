@echo off
echo ========================================
echo  SPECPART - Full Import in One Session
echo ========================================

echo [1/7] Creating staging tables...
docker exec -i specpart-db psql -U kiosquetn -d kiosquetn < prisma\import-tecdoc-tables.sql

echo [2/7] Loading articles (1.9M rows)...
Get-Content "..\TecDoc_Export\clean_articles_tunisia_fixed.csv" | docker exec -i specpart-db psql -U kiosquetn -d kiosquetn -c "\copy staging_articles FROM STDIN WITH CSV HEADER"

echo [3/7] Loading attributes (7.4M rows)...
Get-Content "..\TecDoc_Export\clean_attributes_tunisia_fixed.csv" | docker exec -i specpart-db psql -U kiosquetn -d kiosquetn -c "\copy staging_attributes FROM STDIN WITH CSV HEADER"

echo [4/7] Loading OE numbers (8.9M rows)...
Get-Content "..\TecDoc_Export\clean_oe_numbers_tunisia_fixed.csv" | docker exec -i specpart-db psql -U kiosquetn -d kiosquetn -c "\copy staging_oe_numbers FROM STDIN WITH CSV HEADER"

echo [5/7] Loading vehicle links (4589 rows)...
Get-Content "..\TecDoc_Export\clean_vehicle_links_tunisia_fixed.csv" | docker exec -i specpart-db psql -U kiosquetn -d kiosquetn -c "\copy staging_vehicle_links FROM STDIN WITH CSV HEADER FORCE_NULL(linkages_attributes)"

echo [6/7] Inserting Tunisia-linked products with descriptions...
docker exec -i specpart-db psql -U kiosquetn -d kiosquetn < prisma\final-clean-import.sql

echo [7/7] Done!
