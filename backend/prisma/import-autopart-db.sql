\set ON_ERROR_STOP on

BEGIN;

CREATE TEMP TABLE stg_autopart_products (
  product_id text,
  url text,
  name text,
  brand text,
  sku text,
  mpn text,
  gtin13 text,
  price text,
  price_currency text,
  availability text,
  condition text,
  shipping_cost text,
  image_url text,
  category_name text,
  subcategory_slug text,
  subcategory_id text,
  subcategory_name text,
  description text
) ON COMMIT DROP;

CREATE TEMP TABLE stg_autopart_specs (
  product_id text,
  spec_label text,
  spec_value text
) ON COMMIT DROP;

CREATE TEMP TABLE stg_autopart_compat (
  product_id text,
  brand text,
  model text,
  detail text
) ON COMMIT DROP;

CREATE TEMP TABLE stg_autopart_oem (
  product_id text,
  brand text,
  reference text
) ON COMMIT DROP;

CREATE TEMP TABLE stg_autopart_images (
  product_id text,
  image_url text
) ON COMMIT DROP;

COPY stg_autopart_products
FROM '/tmp/autopart_db/products.csv'
WITH (FORMAT csv, HEADER false, QUOTE E'\x01');

COPY stg_autopart_specs
FROM '/tmp/autopart_db/technical_specs.csv'
WITH (FORMAT csv, HEADER false, QUOTE E'\x01');

COPY stg_autopart_compat
FROM '/tmp/autopart_db/compatible_vehicles.csv'
WITH (FORMAT csv, HEADER false, QUOTE E'\x01');

COPY stg_autopart_oem
FROM '/tmp/autopart_db/oem_references.csv'
WITH (FORMAT csv, HEADER false, QUOTE E'\x01');

COPY stg_autopart_images
FROM '/tmp/autopart_db/image_urls.csv'
WITH (FORMAT csv, HEADER false, QUOTE E'\x01');

CREATE FUNCTION pg_temp.autopart_slug(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT COALESCE(
    NULLIF(
      regexp_replace(
        regexp_replace(lower(trim(COALESCE(value, ''))), '[^[:alnum:]]+', '-', 'g'),
        '(^-|-$)',
        '',
        'g'
      ),
      ''
    ),
    'item'
  )
$$;

CREATE FUNCTION pg_temp.autopart_html(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT replace(
    replace(
      replace(
        replace(
          replace(COALESCE(value, ''), '&', '&amp;'),
          '<',
          '&lt;'
        ),
        '>',
        '&gt;'
      ),
      '"',
      '&quot;'
    ),
    '''',
    '&#39;'
  )
$$;

CREATE TEMP TABLE stg_autopart_product_clean AS
SELECT DISTINCT ON (trim(product_id))
  trim(product_id) AS source_id,
  NULLIF(trim(url), '') AS url,
  COALESCE(NULLIF(trim(name), ''), 'Pièce Auto ' || trim(product_id)) AS name,
  COALESCE(NULLIF(trim(brand), ''), 'Autopart') AS brand,
  NULLIF(trim(sku), '') AS source_sku,
  NULLIF(trim(mpn), '') AS mpn,
  NULLIF(trim(gtin13), '') AS gtin13,
  CASE
    WHEN trim(price) ~ '^[0-9]+([.][0-9]+)?$' THEN trim(price)::numeric
    ELSE 0
  END AS price,
  COALESCE(NULLIF(trim(price_currency), ''), 'TND') AS price_currency,
  COALESCE(NULLIF(trim(availability), ''), 'Non renseigné') AS availability,
  CASE
    WHEN trim(shipping_cost) ~ '^[0-9]+([.][0-9]+)?$' THEN trim(shipping_cost)::numeric
    ELSE NULL
  END AS shipping_cost,
  CASE
    WHEN trim(image_url) ~* '^(https?://|/)' THEN trim(image_url)
    ELSE NULL
  END AS image_url,
  COALESCE(
    NULLIF(trim(category_name), ''),
    NULLIF(initcap(replace(trim(subcategory_slug), '-', ' ')), ''),
    'Pièces Auto'
  ) AS category_label,
  NULLIF(trim(subcategory_slug), '') AS subcategory_slug,
  NULLIF(trim(subcategory_id), '') AS subcategory_id,
  NULLIF(trim(subcategory_name), '') AS subcategory_name,
  NULLIF(trim(description), '') AS source_description
FROM stg_autopart_products
WHERE NULLIF(trim(product_id), '') IS NOT NULL
ORDER BY trim(product_id), name;

CREATE INDEX ON stg_autopart_product_clean (source_id);
CREATE INDEX ON stg_autopart_product_clean (brand);
CREATE INDEX ON stg_autopart_product_clean (category_label);
CREATE INDEX ON stg_autopart_specs (product_id);
CREATE INDEX ON stg_autopart_compat (product_id);
CREATE INDEX ON stg_autopart_oem (product_id);
CREATE INDEX ON stg_autopart_images (product_id);

INSERT INTO "Brand" (id, name, slug, "logoUrl")
SELECT DISTINCT
  'ap-brand-' || substring(md5(brand), 1, 20) AS id,
  brand AS name,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM "Brand" b
      WHERE b.slug = pg_temp.autopart_slug(stg_autopart_product_clean.brand)
        AND b.name <> stg_autopart_product_clean.brand
    )
    THEN pg_temp.autopart_slug(brand) || '-' || substring(md5(brand), 1, 6)
    ELSE pg_temp.autopart_slug(brand)
  END AS slug,
  NULL AS "logoUrl"
FROM stg_autopart_product_clean
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name;

WITH category_rows AS (
  SELECT DISTINCT category_label
  FROM stg_autopart_product_clean
),
numbered_categories AS (
  SELECT
    category_label,
    row_number() OVER (ORDER BY category_label) AS rn,
    COALESCE((SELECT max("sortOrder") FROM "Category"), 0) AS current_max_order
  FROM category_rows
)
INSERT INTO "Category" (id, "nameFr", slug, "imageUrl", "sortOrder", "parentId")
SELECT
  'ap-cat-' || substring(md5(category_label), 1, 20) AS id,
  category_label AS "nameFr",
  CASE
    WHEN EXISTS (
      SELECT 1 FROM "Category" c
      WHERE c.slug = pg_temp.autopart_slug(numbered_categories.category_label)
        AND c."nameFr" <> numbered_categories.category_label
    )
    THEN pg_temp.autopart_slug(category_label) || '-' || substring(md5(category_label), 1, 6)
    ELSE pg_temp.autopart_slug(category_label)
  END AS slug,
  NULL AS "imageUrl",
  current_max_order + rn AS "sortOrder",
  NULL AS "parentId"
FROM numbered_categories
ON CONFLICT (slug) DO UPDATE
SET "nameFr" = EXCLUDED."nameFr";

CREATE TEMP TABLE stg_autopart_products_ready AS
WITH specs AS (
  SELECT
    trim(product_id) AS source_id,
    '<h3>Spécifications</h3><ul>' ||
    string_agg(
      '<li><strong>' || pg_temp.autopart_html(trim(spec_label)) || ':</strong> ' ||
      pg_temp.autopart_html(trim(spec_value)) || '</li>',
      '' ORDER BY trim(spec_label), trim(spec_value)
    ) ||
    '</ul>' AS html
  FROM (
    SELECT DISTINCT product_id, spec_label, spec_value
    FROM stg_autopart_specs
    WHERE NULLIF(trim(product_id), '') IS NOT NULL
      AND NULLIF(trim(spec_label), '') IS NOT NULL
      AND NULLIF(trim(spec_value), '') IS NOT NULL
  ) s
  GROUP BY trim(product_id)
),
oem AS (
  SELECT
    trim(product_id) AS source_id,
    '<h3>Références d''origine</h3><ul>' ||
    string_agg(
      '<li>' || pg_temp.autopart_html(trim(reference)) ||
      CASE
        WHEN NULLIF(trim(brand), '') IS NOT NULL
        THEN ' <span>(' || pg_temp.autopart_html(trim(brand)) || ')</span>'
        ELSE ''
      END ||
      '</li>',
      '' ORDER BY trim(brand), trim(reference)
    ) ||
    '</ul>' AS html
  FROM (
    SELECT DISTINCT product_id, brand, reference
    FROM stg_autopart_oem
    WHERE NULLIF(trim(product_id), '') IS NOT NULL
      AND NULLIF(trim(reference), '') IS NOT NULL
  ) o
  GROUP BY trim(product_id)
),
compat AS (
  SELECT
    trim(product_id) AS source_id,
    '<h3>Compatibilité Véhicules</h3><ul>' ||
    string_agg(
      '<li><strong>' || pg_temp.autopart_html(trim(brand)) || '</strong> ' ||
      pg_temp.autopart_html(trim(model)) ||
      CASE
        WHEN NULLIF(trim(detail), '') IS NOT NULL
        THEN ' — ' || pg_temp.autopart_html(trim(detail))
        ELSE ''
      END ||
      '</li>',
      '' ORDER BY trim(brand), trim(model), trim(detail)
    ) ||
    '</ul>' AS html
  FROM (
    SELECT DISTINCT product_id, brand, model, detail
    FROM stg_autopart_compat
    WHERE NULLIF(trim(product_id), '') IS NOT NULL
      AND NULLIF(trim(brand), '') IS NOT NULL
      AND NULLIF(trim(model), '') IS NOT NULL
  ) c
  GROUP BY trim(product_id)
),
extra_images AS (
  SELECT
    trim(product_id) AS source_id,
    min(trim(image_url)) FILTER (WHERE trim(image_url) ~* '^(https?://|/)') AS image_url
  FROM stg_autopart_images
  WHERE NULLIF(trim(product_id), '') IS NOT NULL
  GROUP BY trim(product_id)
)
SELECT
  p.source_id,
  'ap-' || p.source_id AS product_id,
  'AP-' || p.source_id AS sku,
  p.name,
  'autopart-' || p.source_id AS slug,
  (
    '<p>' || pg_temp.autopart_html(COALESCE(p.source_description, p.name)) || '</p>' ||
    '<h3>Informations produit</h3><ul>' ||
    '<li><strong>Marque:</strong> ' || pg_temp.autopart_html(p.brand) || '</li>' ||
    COALESCE('<li><strong>Référence fabricant:</strong> ' || pg_temp.autopart_html(p.mpn) || '</li>', '') ||
    COALESCE('<li><strong>Référence source:</strong> ' || pg_temp.autopart_html(p.source_sku) || '</li>', '') ||
    COALESCE('<li><strong>EAN:</strong> ' || pg_temp.autopart_html(p.gtin13) || '</li>', '') ||
    '<li><strong>Disponibilité:</strong> ' || pg_temp.autopart_html(p.availability) || '</li>' ||
    '<li><strong>Prix:</strong> ' || to_char(p.price, 'FM999999990.000') || ' ' || pg_temp.autopart_html(p.price_currency) || '</li>' ||
    COALESCE('<li><strong>Livraison:</strong> ' || to_char(p.shipping_cost, 'FM999999990.000') || ' TND</li>', '') ||
    COALESCE('<li><strong>Catégorie:</strong> ' || pg_temp.autopart_html(p.category_label) || '</li>', '') ||
    COALESCE('<li><strong>Sous-catégorie:</strong> ' || pg_temp.autopart_html(replace(p.subcategory_slug, '-', ' ')) || '</li>', '') ||
    COALESCE('<li><strong>Source:</strong> ' || pg_temp.autopart_html(p.url) || '</li>', '') ||
    '</ul>' ||
    COALESCE(specs.html, '') ||
    COALESCE(oem.html, '') ||
    COALESCE(compat.html, '')
  ) AS description,
  b.id AS brand_id,
  c.id AS category_id,
  p.price,
  CASE WHEN p.availability ILIKE '%stock%' THEN 10 ELSE 0 END AS stock_qty,
  COALESCE(p.image_url, extra_images.image_url) AS image_url,
  p.name AS image_alt
FROM stg_autopart_product_clean p
JOIN "Brand" b ON b.slug = (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM "Brand" bx
      WHERE bx.slug = pg_temp.autopart_slug(p.brand)
        AND bx.name <> p.brand
    )
    THEN pg_temp.autopart_slug(p.brand) || '-' || substring(md5(p.brand), 1, 6)
    ELSE pg_temp.autopart_slug(p.brand)
  END
)
JOIN "Category" c ON c.slug = (
  CASE
    WHEN EXISTS (
      SELECT 1 FROM "Category" cx
      WHERE cx.slug = pg_temp.autopart_slug(p.category_label)
        AND cx."nameFr" <> p.category_label
    )
    THEN pg_temp.autopart_slug(p.category_label) || '-' || substring(md5(p.category_label), 1, 6)
    ELSE pg_temp.autopart_slug(p.category_label)
  END
)
LEFT JOIN specs ON specs.source_id = p.source_id
LEFT JOIN oem ON oem.source_id = p.source_id
LEFT JOIN compat ON compat.source_id = p.source_id
LEFT JOIN extra_images ON extra_images.source_id = p.source_id;

CREATE INDEX ON stg_autopart_products_ready (source_id);
CREATE INDEX ON stg_autopart_products_ready (product_id);

INSERT INTO "Product" (
  id,
  sku,
  "nameFr",
  slug,
  description,
  "isFeatured",
  "isPublished",
  "brandId",
  "categoryId",
  "createdAt"
)
SELECT
  product_id,
  sku,
  name,
  slug,
  description,
  false,
  true,
  brand_id,
  category_id,
  now()
FROM stg_autopart_products_ready
ON CONFLICT (id) DO UPDATE
SET
  sku = EXCLUDED.sku,
  "nameFr" = EXCLUDED."nameFr",
  slug = EXCLUDED.slug,
  description = EXCLUDED.description,
  "isPublished" = true,
  "brandId" = EXCLUDED."brandId",
  "categoryId" = EXCLUDED."categoryId";

INSERT INTO "ProductVariant" (
  id,
  "productId",
  volume,
  price,
  "stockQty",
  "skuVariant"
)
SELECT
  'apv-' || source_id,
  product_id,
  'Pièce',
  price::double precision,
  stock_qty,
  sku || '-PIECE'
FROM stg_autopart_products_ready
ON CONFLICT ("skuVariant") DO UPDATE
SET
  price = EXCLUDED.price,
  "stockQty" = EXCLUDED."stockQty",
  volume = EXCLUDED.volume,
  "productId" = EXCLUDED."productId";

INSERT INTO "ProductImage" (
  id,
  "productId",
  url,
  "altFr",
  "isPrimary",
  "sortOrder"
)
SELECT
  'apimg-' || source_id,
  product_id,
  image_url,
  image_alt,
  true,
  0
FROM stg_autopart_products_ready
WHERE image_url IS NOT NULL
ON CONFLICT (id) DO UPDATE
SET
  url = EXCLUDED.url,
  "altFr" = EXCLUDED."altFr",
  "isPrimary" = true,
  "sortOrder" = 0;

CREATE TEMP TABLE stg_autopart_vehicle_makes AS
SELECT DISTINCT
  COALESCE(NULLIF(trim(brand), ''), 'Autre') AS name,
  pg_temp.autopart_slug(COALESCE(NULLIF(trim(brand), ''), 'Autre')) AS slug
FROM stg_autopart_compat
WHERE NULLIF(trim(product_id), '') IS NOT NULL
  AND NULLIF(trim(model), '') IS NOT NULL;

INSERT INTO "VehicleMake" (id, name, slug)
SELECT
  'ap-vmake-' || substring(md5(slug), 1, 20),
  name,
  slug
FROM stg_autopart_vehicle_makes
ON CONFLICT (slug) DO UPDATE
SET name = EXCLUDED.name;

CREATE TEMP TABLE stg_autopart_vehicle_models AS
SELECT DISTINCT ON (slug)
  make_id,
  name,
  slug
FROM (
  SELECT
    make_table.id AS make_id,
    COALESCE(NULLIF(trim(c.model), ''), 'Modèle inconnu') AS name,
    make_table.slug || '-' || pg_temp.autopart_slug(COALESCE(NULLIF(trim(c.model), ''), 'modele-inconnu')) AS slug
  FROM stg_autopart_compat c
  JOIN "VehicleMake" make_table
    ON make_table.slug = pg_temp.autopart_slug(COALESCE(NULLIF(trim(c.brand), ''), 'Autre'))
  WHERE NULLIF(trim(c.product_id), '') IS NOT NULL
    AND NULLIF(trim(c.model), '') IS NOT NULL
) models
ORDER BY slug, length(name) DESC, name;

INSERT INTO "VehicleModel" (id, "makeId", "vehicleType", name, slug)
SELECT
  'ap-vmodel-' || substring(md5(make_id || ':' || slug), 1, 20),
  make_id,
  'AUTOMOBILE',
  name,
  slug
FROM stg_autopart_vehicle_models
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  "makeId" = EXCLUDED."makeId";

COMMIT;

SELECT
  (SELECT count(*) FROM "Product" WHERE id LIKE 'ap-%') AS imported_products,
  (SELECT count(*) FROM "ProductVariant" WHERE id LIKE 'apv-%') AS imported_variants,
  (SELECT count(*) FROM "ProductImage" WHERE id LIKE 'apimg-%') AS imported_images,
  (SELECT count(*) FROM "VehicleCompatibility" WHERE id LIKE 'ap-vcompat-%') AS imported_compatibilities,
  (SELECT count(*) FROM "Product" WHERE id LIKE 'ap-%' AND description LIKE '%Spécifications%') AS products_with_specs,
  (SELECT count(*) FROM "Product" WHERE id LIKE 'ap-%' AND description LIKE '%Références d''origine%') AS products_with_oem_refs,
  (SELECT count(*) FROM "Product" WHERE id LIKE 'ap-%' AND description LIKE '%Compatibilité Véhicules%') AS products_with_compatibility;

