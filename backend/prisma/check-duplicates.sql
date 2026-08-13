-- Check duplicates by SKU
SELECT sku, COUNT(*) as cnt
FROM "Product"
GROUP BY sku
HAVING COUNT(*) > 1
ORDER BY cnt DESC
LIMIT 20;

-- Check duplicates by name
SELECT "nameFr", COUNT(*) as cnt
FROM "Product"
GROUP BY "nameFr"
HAVING COUNT(*) > 1
ORDER BY cnt DESC
LIMIT 20;
