-- =============================================
-- ALL-IN-ONE: Create staging + Insert products
-- Run AFTER CSVs are loaded via \copy
-- =============================================

-- Check staging tables exist
SELECT 'staging_articles' as tbl, COUNT(*) FROM staging_articles
UNION ALL SELECT 'staging_vehicle_links', COUNT(*) FROM staging_vehicle_links;

-- Step 1: Clean existing products (keep ordered ones)
CREATE TEMP TABLE IF NOT EXISTS protected_ids AS
SELECT DISTINCT "productId" as id FROM "OrderItem";

DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "Review" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "WishlistItem" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "Product" WHERE id NOT IN (SELECT id FROM protected_ids);

SELECT 'After delete', COUNT(*) FROM "Product";

-- Step 2: Insert linked products
INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
SELECT 
    'prod-' || a.article_id,
    a.datasupplierarticlenumber,
    COALESCE(a.normalizeddescription, 'Pièce Auto'),
    'prod-' || a.article_id || '-' || lower(replace(COALESCE(a.datasupplierarticlenumber,'x'), ' ', '-')),
    '<p>Pièce de rechange auto.</p>',
    false, true,
    'brand-' || a.supplier,
    'cat-tecdoc-123',
    NOW()
FROM staging_articles a
WHERE a.article_id::bigint IN (SELECT DISTINCT article_id::bigint FROM staging_vehicle_links WHERE article_id IS NOT NULL)
  AND a.datasupplierarticlenumber IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

SELECT 'After insert', COUNT(*) FROM "Product";

-- Step 3: Add Spécifications
WITH specs AS (
    SELECT article_id,
        '<h3>Spécifications</h3><ul>' ||
        string_agg('<li><strong>' || COALESCE(displaytitle,'') || ':</strong> ' || COALESCE(displayvalue,'') || '</li>', '') ||
        '</ul>' AS block
    FROM staging_attributes
    WHERE displaytitle IS NOT NULL AND displayvalue IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p SET description = p.description || s.block
FROM specs s WHERE p.id = 'prod-' || s.article_id;

SELECT 'With specs', COUNT(*) FROM "Product" WHERE description LIKE '%Spécifications%';

-- Step 4: Add Références d'origine
WITH oe AS (
    SELECT article_id,
        '<h3>Références d''origine</h3><ul>' ||
        string_agg('<li>' || oenbr || CASE WHEN manufacturer IS NOT NULL AND manufacturer != '' THEN ' — ' || manufacturer ELSE '' END || '</li>', '') ||
        '</ul>' AS block
    FROM staging_oe_numbers
    WHERE oenbr IS NOT NULL AND oenbr != ''
    GROUP BY article_id
)
UPDATE "Product" p SET description = p.description || o.block
FROM oe o WHERE p.id = 'prod-' || o.article_id;

SELECT 'With OE refs', COUNT(*) FROM "Product" WHERE description LIKE '%Références%';

-- Step 5: Add Compatibilité Véhicules
WITH compat AS (
    SELECT article_id,
        '<h3>Compatibilité Véhicules</h3><ul>' ||
        string_agg('<li>' || replace(replace(COALESCE(NULLIF(linkages_attributes,''), 'Véhicule compatible'), '##', ' | '), '$$', ': ') || '</li>', '') ||
        '</ul>' AS block
    FROM staging_vehicle_links WHERE article_id IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p SET description = p.description || c.block
FROM compat c WHERE p.id = 'prod-' || c.article_id;

-- Final report
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN description LIKE '%Spécifications%' THEN 1 END) as with_specs,
    COUNT(CASE WHEN description LIKE '%Références%' THEN 1 END) as with_oe_refs,
    COUNT(CASE WHEN description LIKE '%Compatibilité%' THEN 1 END) as with_compat
FROM "Product";
