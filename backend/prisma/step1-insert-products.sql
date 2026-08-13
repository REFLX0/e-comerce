-- STEP 1: Fast insert of all 4129 linked products (no subqueries)
INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId", "createdAt")
SELECT 
    'prod-' || a.article_id,
    a.datasupplierarticlenumber,
    COALESCE(a.normalizeddescription, 'Pièce Auto'),
    'prod-' || a.article_id || '-' || a.datasupplierarticlenumber,
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

SELECT COUNT(*) as products_inserted FROM "Product";
