-- ============================================================
-- Fix Volume Variants, Primary Images & 20L Bidon Mapping
-- ============================================================

BEGIN;

-- 1. Specific Fix for: Liqui Moly Huile de boîte de vitesses à double embrayage 8100
DO $$
DECLARE
  p_id text;
BEGIN
  SELECT id INTO p_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Huile de boîte de vitesses à double%')
     OR LOWER(slug) LIKE LOWER('%huile-de-boite-de-vitesses-a-d%')
     OR sku = 'TSC-00419'
  LIMIT 1;

  IF p_id IS NOT NULL THEN
    -- Ensure 20L variant exists with the big blue bidon photo
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (
      gen_random_uuid()::text,
      p_id,
      '20L',
      850.0,
      5,
      'TSC-00419-U-3',
      '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-embrayage-810.png'
    )
    ON CONFLICT ("skuVariant") DO UPDATE SET
      volume = '20L',
      price = 850.0,
      "imageUrl" = '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-embrayage-810.png';

    -- Ensure 5L variant has the 5L red canister photo
    UPDATE public."ProductVariant"
    SET "imageUrl" = '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-5l.png'
    WHERE "productId" = p_id AND (volume = '5L' OR "skuVariant" LIKE '%-5L' OR "skuVariant" = 'TSC-00419-U-1');

    -- Ensure 1L variant has the 1L black bottle photo
    UPDATE public."ProductVariant"
    SET "imageUrl" = '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-1l.png'
    WHERE "productId" = p_id AND (volume = '1L' OR "skuVariant" LIKE '%-1L' OR "skuVariant" = 'TSC-00419-U-2');

    -- Update ProductImage sortOrder: 1L first (primary), then 5L, then 20L
    UPDATE public."ProductImage"
    SET "isPrimary" = true, "sortOrder" = 0
    WHERE "productId" = p_id AND url LIKE '%-1l.png';

    UPDATE public."ProductImage"
    SET "isPrimary" = false, "sortOrder" = 1
    WHERE "productId" = p_id AND url LIKE '%-5l.png';

    UPDATE public."ProductImage"
    SET "isPrimary" = false, "sortOrder" = 2
    WHERE "productId" = p_id AND url LIKE '%-810.png';
  END IF;
END $$;

-- 2. General Automated Volume Image Matching across all Products
-- If a variant has null or empty imageUrl, match it to an image whose URL contains the volume
UPDATE public."ProductVariant" pv
SET "imageUrl" = pi.url
FROM public."ProductImage" pi
WHERE pv."productId" = pi."productId"
  AND (pv."imageUrl" IS NULL OR pv."imageUrl" = '')
  AND pv.volume IS NOT NULL
  AND pv.volume != ''
  AND (
    LOWER(pi.url) LIKE '%-' || LOWER(TRIM(pv.volume)) || '.%'
    OR LOWER(pi.url) LIKE '%_' || LOWER(TRIM(pv.volume)) || '.%'
    OR LOWER(pi.url) LIKE '%-' || LOWER(TRIM(pv.volume)) || '-%'
  );

-- 3. Prioritize 1L / smallest bottle as primary image across all products with volume variants
UPDATE public."ProductImage" pi
SET "isPrimary" = true, "sortOrder" = 0
WHERE LOWER(pi.url) LIKE '%-1l.%'
   OR LOWER(pi.url) LIKE '%_1l.%'
   OR LOWER(pi.url) LIKE '%-1l-%';

-- Reset other images of those products to not be primary
UPDATE public."ProductImage" pi
SET "isPrimary" = false, "sortOrder" = 1
WHERE NOT (LOWER(pi.url) LIKE '%-1l.%' OR LOWER(pi.url) LIKE '%_1l.%' OR LOWER(pi.url) LIKE '%-1l-%')
  AND EXISTS (
    SELECT 1 FROM public."ProductImage" pi2
    WHERE pi2."productId" = pi."productId"
      AND (LOWER(pi2.url) LIKE '%-1l.%' OR LOWER(pi2.url) LIKE '%_1l.%' OR LOWER(pi2.url) LIKE '%-1l-%')
  );

COMMIT;
