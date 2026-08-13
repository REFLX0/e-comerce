-- STEP 2A: Add Spécifications using a JOIN (fast, no subquery per row)
WITH specs AS (
    SELECT 
        article_id,
        '<h3>Spécifications</h3><ul>' ||
        string_agg('<li><strong>' || COALESCE(displaytitle,'') || ':</strong> ' || COALESCE(displayvalue,'') || '</li>', '') ||
        '</ul>' AS specs_block
    FROM staging_attributes
    WHERE displaytitle IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p
SET description = p.description || s.specs_block
FROM specs s
WHERE p.id = 'prod-' || s.article_id;

-- STEP 2B: Add Références d'origine
WITH oe AS (
    SELECT
        article_id,
        '<h3>Références d''origine</h3><ul>' ||
        string_agg('<li>' || oenbr || CASE WHEN manufacturer IS NOT NULL AND manufacturer != '' THEN ' — ' || manufacturer ELSE '' END || '</li>', '') ||
        '</ul>' AS oe_block
    FROM staging_oe_numbers
    WHERE oenbr IS NOT NULL
    GROUP BY article_id
)
UPDATE "Product" p
SET description = p.description || o.oe_block
FROM oe o
WHERE p.id = 'prod-' || o.article_id;

-- STEP 2C: Add Compatibilité Véhicules
WITH compat AS (
    SELECT
        article_id,
        '<h3>Compatibilité Véhicules</h3><ul>' ||
        string_agg('<li>' || 
            CASE WHEN linkages_attributes IS NOT NULL AND linkages_attributes != '' 
                 THEN replace(replace(linkages_attributes, '##', ' | '), '$$', ': ')
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

-- Final check
SELECT COUNT(*) as total, COUNT(CASE WHEN description LIKE '%Spécifications%' THEN 1 END) as with_specs, COUNT(CASE WHEN description LIKE '%Compatibilité%' THEN 1 END) as with_compat FROM "Product";
