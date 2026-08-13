-- FAST approach: TRUNCATE everything and re-insert only the 4129 linked products WITH full descriptions

-- Step 1: Preserve ordered products (hide them, don't delete)
CREATE TEMP TABLE protected_products AS
SELECT id FROM "Product" WHERE id IN (SELECT "productId" FROM "OrderItem");

-- Step 2: Remove all product-related data for non-ordered products
DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT id FROM protected_products);
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT id FROM protected_products);
DELETE FROM "Review" WHERE "productId" NOT IN (SELECT id FROM protected_products);
DELETE FROM "WishlistItem" WHERE "productId" NOT IN (SELECT id FROM protected_products);

-- Step 3: Delete all products except ordered ones
DELETE FROM "Product" WHERE id NOT IN (SELECT id FROM protected_products);

-- Step 4: Now insert only the 4129 vehicle-linked products WITH full descriptions in one shot
INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
SELECT 
    'prod-' || a.article_id,
    a.datasupplierarticlenumber,
    COALESCE(a.normalizeddescription, 'Pièce Auto'),
    'prod-' || a.article_id || '-' || a.datasupplierarticlenumber,
    '<p>Pièce de rechange auto.</p>'
    || COALESCE((
        SELECT '<h3>Spécifications</h3><ul>' || string_agg('<li><strong>' || displaytitle || ':</strong> ' || displayvalue || '</li>', '') || '</ul>'
        FROM staging_attributes sa
        WHERE sa.article_id = a.article_id AND sa.displaytitle IS NOT NULL
    ), '')
    || COALESCE((
        SELECT '<h3>Références d''origine</h3><ul>' || string_agg('<li>' || oenbr || CASE WHEN manufacturer IS NOT NULL AND manufacturer != '' THEN ' — ' || manufacturer ELSE '' END || '</li>', '') || '</ul>'
        FROM staging_oe_numbers oe
        WHERE oe.article_id = a.article_id AND oe.oenbr IS NOT NULL
    ), '')
    || COALESCE((
        SELECT '<h3>Compatibilité Véhicules</h3><ul>' || string_agg('<li>' || CASE WHEN linkages_attributes IS NOT NULL AND linkages_attributes != '' THEN replace(replace(linkages_attributes, '##', ' | '), '$$', ': ') ELSE 'Véhicule compatible' END || '</li>', '') || '</ul>'
        FROM staging_vehicle_links vl
        WHERE vl.article_id = a.article_id
    ), ''),
    false,
    true,
    'brand-' || a.supplier,
    'cat-tecdoc-123',
    NOW()
FROM staging_articles a
WHERE a.article_id IN (SELECT DISTINCT article_id FROM staging_vehicle_links)
AND a.datasupplierarticlenumber IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

-- Final report
SELECT COUNT(*) as total_products FROM "Product";
SELECT id, "nameFr", sku, LEFT(description, 200) as description_preview FROM "Product" WHERE id NOT IN (SELECT id FROM protected_products) LIMIT 5;
