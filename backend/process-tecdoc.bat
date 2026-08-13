@echo off
echo Merging staging data into Postgres...
docker exec -i specpart-db psql -U kiosquetn -d kiosquetn < prisma\import-tecdoc-process.sql
echo Processing complete!
