-- Step 1: Fix any null descriptions first
UPDATE "Product" SET description = '<p>Pièce de rechange auto</p>' WHERE description IS NULL;

-- Step 2: Update products with Spécifications from staging_attributes
UPDATE "Product" p
SET description = p.description || 
    '<h3>Spécifications</h3><ul>' || 
    COALESCE(t.specs_html, '') || 
    '</ul>'
FROM (
    SELECT 
        article_id, 
        string_agg('<li><strong>' || displaytitle || ':</strong> ' || displayvalue || '</li>', '') AS specs_html
    FROM staging_attributes
    WHERE displaytitle IS NOT NULL AND displayvalue IS NOT NULL
    GROUP BY article_id
) t
WHERE p.id = 'prod-' || t.article_id
AND p.description NOT LIKE '%Spécifications%';

-- Step 3: Update products with Références d'origine from staging_oe_numbers
UPDATE "Product" p
SET description = p.description || 
    '<h3>Références d''origine</h3><ul>' || 
    COALESCE(t.oe_html, '') || 
    '</ul>'
FROM (
    SELECT 
        article_id, 
        string_agg('<li>' || oenbr || ' (Fabricant: ' || manufacturer || ')</li>', '') AS oe_html
    FROM staging_oe_numbers
    WHERE oenbr IS NOT NULL
    GROUP BY article_id
) t
WHERE p.id = 'prod-' || t.article_id
AND p.description NOT LIKE '%Références%';

-- Step 4: Update products with Vehicle Compatibility from staging_vehicle_links
UPDATE "Product" p
SET description = p.description ||
    '<h3>Compatibilité Véhicules</h3><ul>' ||
    COALESCE(t.compat_html, '') ||
    '</ul>'
FROM (
    SELECT
        article_id,
        string_agg('<li>Item: ' || item || ' (Supplier: ' || supplier || ')</li>', '') AS compat_html
    FROM staging_vehicle_links
    WHERE item IS NOT NULL
    GROUP BY article_id
) t
WHERE p.id = 'prod-' || t.article_id
AND p.description NOT LIKE '%Compatibilité%';
