-- Fix base descriptions first
UPDATE "Product" SET description = '<p>Pièce de rechange auto</p>' WHERE description IS NULL OR description = '';

-- Add Spécifications from staging_attributes
WITH specs AS (
    SELECT 
        article_id,
        '<h3>Spécifications</h3><ul>' ||
        string_agg('<li><strong>' || COALESCE(displaytitle, '') || ':</strong> ' || COALESCE(displayvalue, '') || '</li>', '') ||
        '</ul>' AS specs_block
    FROM staging_attributes
    WHERE displaytitle IS NOT NULL AND displayvalue IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p
SET description = p.description || s.specs_block
FROM specs s
WHERE p.id = 'prod-' || s.article_id;

-- Add Références d'origine from staging_oe_numbers
WITH oe AS (
    SELECT
        article_id,
        '<h3>Références d''origine</h3><ul>' ||
        string_agg('<li>' || oenbr || CASE WHEN manufacturer IS NOT NULL AND manufacturer != '' THEN ' — ' || manufacturer ELSE '' END || '</li>', '') ||
        '</ul>' AS oe_block
    FROM staging_oe_numbers
    WHERE oenbr IS NOT NULL AND oenbr != ''
    GROUP BY article_id
)
UPDATE "Product" p
SET description = p.description || o.oe_block
FROM oe o
WHERE p.id = 'prod-' || o.article_id;

-- Add Compatibilité Véhicules from staging_vehicle_links
WITH compat AS (
    SELECT
        article_id,
        '<h3>Compatibilité Véhicules</h3><ul>' ||
        string_agg('<li>' ||
            CASE WHEN linkages_attributes IS NOT NULL AND linkages_attributes != '' 
                 THEN linkages_attributes 
                 ELSE 'Véhicule compatible' END
        || '</li>', '') ||
        '</ul>' AS compat_block
    FROM staging_vehicle_links
    WHERE article_id IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p
SET description = p.description || c.compat_block
FROM compat c
WHERE p.id = 'prod-' || c.article_id;

-- Final count
SELECT COUNT(*) as total_products, COUNT(CASE WHEN description LIKE '%Spécifications%' THEN 1 END) as with_specs, COUNT(CASE WHEN description LIKE '%Compatibilité%' THEN 1 END) as with_compat FROM "Product";
