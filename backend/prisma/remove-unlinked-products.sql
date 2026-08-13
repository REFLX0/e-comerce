-- Step 1: Delete products NOT linked to any Tunisia vehicle
-- Keep only products whose article_id appears in staging_vehicle_links
DELETE FROM "Product"
WHERE id NOT IN (
    SELECT 'prod-' || article_id 
    FROM staging_vehicle_links
    WHERE article_id IS NOT NULL
)
AND id NOT IN (SELECT "productId" FROM "OrderItem");

-- Step 2: Show how many remain
SELECT COUNT(*) as remaining_products FROM "Product";
