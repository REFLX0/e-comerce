-- Insert default category
INSERT INTO "Category" (id, "nameFr", slug) 
VALUES ('cat-tecdoc-123', 'Pièces Auto', 'pieces-auto')
ON CONFLICT (slug) DO NOTHING;

-- Insert Brands based on Supplier IDs
INSERT INTO "Brand" (id, name, slug)
SELECT DISTINCT 'brand-' || supplier, 'Supplier ' || supplier, 'supplier-' || supplier
FROM staging_articles
WHERE supplier IS NOT NULL
ON CONFLICT (slug) DO NOTHING;

-- Insert Products
INSERT INTO "Product" (id, sku, "nameFr", slug, description, "isFeatured", "isPublished", "brandId", "categoryId")
SELECT 
    'prod-' || article_id, 
    datasupplierarticlenumber, 
    COALESCE(normalizeddescription, 'Pièce Auto'), 
    'prod-' || article_id || '-' || datasupplierarticlenumber, 
    '<p>Pièce de rechange auto</p>', 
    false, 
    true, 
    'brand-' || supplier, 
    'cat-tecdoc-123'
FROM staging_articles
WHERE article_id IS NOT NULL AND datasupplierarticlenumber IS NOT NULL
ON CONFLICT (sku) DO NOTHING;

-- Create temporary table to aggregate attributes (Spécifications)
CREATE TEMP TABLE temp_attributes AS
SELECT 
    article_id, 
    string_agg('<li><strong>' || displaytitle || ':</strong> ' || displayvalue || '</li>', '') AS specs_html
FROM staging_attributes
WHERE displaytitle IS NOT NULL
GROUP BY article_id;

-- Update products with specifications
UPDATE "Product" p
SET description = COALESCE(description, '') || '<h3>Spécifications</h3><ul>' || COALESCE(t.specs_html, '') || '</ul>'
FROM temp_attributes t
WHERE p.id = 'prod-' || t.article_id;

-- Create temporary table to aggregate OE Numbers (Références d'origine)
CREATE TEMP TABLE temp_oe_numbers AS
SELECT 
    article_id, 
    string_agg('<li>' || oenbr || ' (Mfr: ' || manufacturer || ')</li>', '') AS oe_html
FROM staging_oe_numbers
WHERE oenbr IS NOT NULL
GROUP BY article_id;

-- Update products with OE Numbers
UPDATE "Product" p
SET description = COALESCE(description, '') || '<h3>Références d''origine</h3><ul>' || COALESCE(t.oe_html, '') || '</ul>'
FROM temp_oe_numbers t
WHERE p.id = 'prod-' || t.article_id;

-- Drop staging tables
DROP TABLE staging_articles;
DROP TABLE staging_attributes;
DROP TABLE staging_oe_numbers;
DROP TABLE staging_vehicle_links;
