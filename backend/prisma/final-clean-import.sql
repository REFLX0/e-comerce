-- ============================================
-- FINAL CLEAN IMPORT - Tunisia vehicles only
-- ============================================

-- Step 1: Save protected (ordered) product IDs
CREATE TEMP TABLE protected_ids AS
SELECT DISTINCT "productId" as id FROM "OrderItem";

-- Step 2: Remove dependent records for unprotected products
DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "Review" WHERE "productId" NOT IN (SELECT id FROM protected_ids);
DELETE FROM "WishlistItem" WHERE "productId" NOT IN (SELECT id FROM protected_ids);

-- Step 3: Delete all non-protected products
DELETE FROM "Product" WHERE id NOT IN (SELECT id FROM protected_ids);

-- Step 4: Insert only Tunisia vehicle-linked products WITH full descriptions
INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
SELECT 
    'prod-' || a.article_id,
    a.datasupplierarticlenumber,
    COALESCE(a.normalizeddescription, 'Pièce Auto'),
    'prod-' || a.article_id || '-' || lower(replace(a.datasupplierarticlenumber, ' ', '-')),
    '<p>Pièce de rechange auto.</p>',
    false,
    true,
    'brand-' || a.supplier,
    'cat-tecdoc-123',
    NOW()
FROM staging_articles a
WHERE a.article_id IN (SELECT DISTINCT article_id FROM staging_vehicle_links)
  AND a.datasupplierarticlenumber IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

SELECT COUNT(*) as products_after_insert FROM "Product";

-- Step 5: Add Spécifications
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

SELECT COUNT(*) as with_specs FROM "Product" WHERE description LIKE '%Spécifications%';

-- Step 6: Add Références d'origine
WITH oe AS (
    SELECT article_id,
        '<h3>Références d''origine</h3><ul>' ||
        string_agg('<li>' || oenbr || CASE WHEN manufacturer != '' THEN ' — ' || manufacturer ELSE '' END || '</li>', '') ||
        '</ul>' AS block
    FROM staging_oe_numbers
    WHERE oenbr IS NOT NULL AND oenbr != ''
    GROUP BY article_id
)
UPDATE "Product" p SET description = p.description || o.block
FROM oe o WHERE p.id = 'prod-' || o.article_id;

SELECT COUNT(*) as with_oe FROM "Product" WHERE description LIKE '%Références%';

-- Step 7: Add Compatibilité Véhicules
WITH compat AS (
    SELECT article_id,
        '<h3>Compatibilité Véhicules</h3><ul>' ||
        string_agg('<li>' || 
            replace(replace(COALESCE(NULLIF(linkages_attributes,''), 'Véhicule compatible'), '##', ' | '), '$$', ': ')
        || '</li>', '') ||
        '</ul>' AS block
    FROM staging_vehicle_links
    WHERE article_id IS NOT NULL
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
