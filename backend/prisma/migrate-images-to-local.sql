-- ============================================================
-- Migrate ProductImage URLs from autopart.tn → local /product-images/
--
-- Local files are named: {article_id}_{original_filename}
-- Product IDs in DB are: prod-{article_id}
-- Remote URLs are:        https://autopart.tn/pieces/{cat}/{filename}
--
-- This script builds: /product-images/{article_id}_{basename(url)}
-- ============================================================

BEGIN;

-- Preview before (optional sanity check)
SELECT COUNT(*) AS total_images FROM "ProductImage";
SELECT COUNT(*) AS already_local FROM "ProductImage" WHERE url LIKE '/product-images/%';
SELECT COUNT(*) AS remote_autopart FROM "ProductImage" WHERE url LIKE '%autopart.tn%';

-- The update:
-- 1. Use the product SKU, which is also the prefix used by downloaded files.
-- 2. Extract the basename from the URL (last segment after /)
-- 3. Build new local path: /product-images/{article_id}_{basename}
UPDATE "ProductImage"
SET url = '/product-images/' 
          || p.sku
          || '_' 
          || SUBSTRING(url FROM '[^/]+$')
FROM "Product" p
WHERE p.id = "ProductImage"."productId"
  AND p.sku IS NOT NULL
  AND p.sku <> ''
  AND (url LIKE '%autopart.tn%' OR url LIKE 'http%');

-- Also update ProductVariant imageUrl if any point to external images
UPDATE "ProductVariant"
SET "imageUrl" = '/product-images/' 
                 || p.sku
                 || '_' 
                 || SUBSTRING("imageUrl" FROM '[^/]+$')
FROM "Product" p
WHERE p.id = "ProductVariant"."productId"
  AND p.sku IS NOT NULL
  AND p.sku <> ''
  AND "imageUrl" IS NOT NULL
  AND ("imageUrl" LIKE '%autopart.tn%' OR "imageUrl" LIKE 'http%');

-- Report
SELECT COUNT(*) AS now_local FROM "ProductImage" WHERE url LIKE '/product-images/%';
SELECT COUNT(*) AS still_remote FROM "ProductImage" WHERE url LIKE 'http%';

-- Sample check
SELECT p.sku, pi.url
FROM "ProductImage" pi
JOIN "Product" p ON p.id = pi."productId"
LIMIT 10;

COMMIT;
