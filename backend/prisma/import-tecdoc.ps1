Write-Host "Setting up staging tables in specpart database..."
Get-Content -Path .\prisma\import-tecdoc-tables.sql -Raw | docker exec -i specpart-db psql -U kiosquetn -d specpart

Write-Host "Importing clean_articles_tunisia.csv..."
Get-Content -Path ..\TecDoc_Export\clean_articles_tunisia.csv -Raw | docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_articles FROM STDIN WITH CSV HEADER"

Write-Host "Importing clean_attributes_tunisia.csv..."
Get-Content -Path ..\TecDoc_Export\clean_attributes_tunisia.csv -Raw | docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_attributes FROM STDIN WITH CSV HEADER"

Write-Host "Importing clean_oe_numbers_tunisia.csv..."
Get-Content -Path ..\TecDoc_Export\clean_oe_numbers_tunisia.csv -Raw | docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_oe_numbers FROM STDIN WITH CSV HEADER"

Write-Host "Importing clean_vehicle_links_tunisia.csv..."
Get-Content -Path ..\TecDoc_Export\clean_vehicle_links_tunisia.csv -Raw | docker exec -i specpart-db psql -U kiosquetn -d specpart -c "\copy staging_vehicle_links FROM STDIN WITH CSV HEADER"

Write-Host "Data loaded into staging tables."
