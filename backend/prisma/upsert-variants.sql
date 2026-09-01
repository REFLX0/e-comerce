-- Auto-generated per-volume variant & image import
BEGIN;
CREATE EXTENSION IF NOT EXISTS pgcrypto;
ALTER TABLE "public"."ProductVariant" ADD COLUMN IF NOT EXISTS "imageUrl" TEXT;

-- 1. Liqui Moly — Huile de boîte de vitesses à double embrayage 8100
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Huile de boîte de vitesses à double%')
     OR LOWER(slug) LIKE LOWER('%huile-de-boite-de-vitesses-a-d%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (250.0 DT) with image /uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 250.0, 10, 'VAR-LIQU-HUILEDEB-5L', '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 250.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (60.0 DT) with image /uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 10, 'VAR-LIQU-HUILEDEB-1L', '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 60.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-huile-de-boite-de-vitesses-a-double-emb-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 2. Liqui Moly — Leichtlauf High Tech 5W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Leichtlauf High Tech 5W-40%')
     OR LOWER(slug) LIKE LOWER('%leichtlauf-high-tech-5w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (155.0 DT) with image /uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 155.0, 10, 'VAR-LIQU-LEICHTLA-5L', '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 155.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (130.0 DT) with image /uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-4l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 130.0, 10, 'VAR-LIQU-LEICHTLA-4L', '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-4l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 130.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-4l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-4l.png', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (35.0 DT) with image /uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, 'VAR-LIQU-LEICHTLA-1L', '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 35.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-leichtlauf-high-tech-5w-40-1l.png', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 3. Liqui Moly — Molygen New Generation 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 10W-40%')
     OR LOWER(slug) LIKE LOWER('%molygen-new-generation-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (160.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 160.0, 10, 'VAR-LIQU-MOLYGENN-5L', '/uploads/products/liqui-moly-molygen-new-generation-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 160.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-10w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (40.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-10w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, 'VAR-LIQU-MOLYGENN-1L', '/uploads/products/liqui-moly-molygen-new-generation-10w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 40.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-10w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-10w-40-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 4. Liqui Moly — Molygen New Generation 5W-30
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 5W-30%')
     OR LOWER(slug) LIKE LOWER('%molygen-new-generation-5w-30%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (170.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-5w-30-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 170.0, 10, 'VAR-LIQU-MOLYGENN-5L', '/uploads/products/liqui-moly-molygen-new-generation-5w-30-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 170.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-5w-30-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-5w-30-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (42.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-5w-30-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 42.0, 10, 'VAR-LIQU-MOLYGENN-1L', '/uploads/products/liqui-moly-molygen-new-generation-5w-30-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 42.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-5w-30-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-5w-30-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 5. Liqui Moly — Molygen New Generation 5W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Molygen New Generation 5W-40%')
     OR LOWER(slug) LIKE LOWER('%molygen-new-generation-5w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (185.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-5w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 185.0, 10, 'VAR-LIQU-MOLYGENN-5L', '/uploads/products/liqui-moly-molygen-new-generation-5w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 185.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-5w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-5w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (45.0 DT) with image /uploads/products/liqui-moly-molygen-new-generation-5w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 10, 'VAR-LIQU-MOLYGENN-1L', '/uploads/products/liqui-moly-molygen-new-generation-5w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 45.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-molygen-new-generation-5w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-molygen-new-generation-5w-40-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 6. Liqui Moly — MoS2 Leichtlauf 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%MoS2 Leichtlauf 10W-40%')
     OR LOWER(slug) LIKE LOWER('%mos2-leichtlauf-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 1L (35.0 DT) with image /uploads/products/liqui-moly-mos2-leichtlauf-10w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 35.0, 10, 'VAR-LIQU-MOS2LEIC-1L', '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 35.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-1l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (105.0 DT) with image /uploads/products/liqui-moly-mos2-leichtlauf-10w-40-4l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 105.0, 10, 'VAR-LIQU-MOS2LEIC-4L', '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-4l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 105.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-4l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-4l.png', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 5L (125.0 DT) with image /uploads/products/liqui-moly-mos2-leichtlauf-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 125.0, 10, 'VAR-LIQU-MOS2LEIC-5L', '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 125.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-mos2-leichtlauf-10w-40-5l.png', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 7. Liqui Moly — Special Tec AA 5W-20
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec AA 5W-20%')
     OR LOWER(slug) LIKE LOWER('%special-tec-aa-5w-20%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (174.0 DT) with image /uploads/products/liqui-moly-special-tec-aa-5w-20-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 174.0, 10, 'VAR-LIQU-SPECIALT-5L', '/uploads/products/liqui-moly-special-tec-aa-5w-20-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 174.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-aa-5w-20-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-aa-5w-20-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (42.0 DT) with image /uploads/products/liqui-moly-special-tec-aa-5w-20-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 42.0, 10, 'VAR-LIQU-SPECIALT-1L', '/uploads/products/liqui-moly-special-tec-aa-5w-20-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 42.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-aa-5w-20-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-aa-5w-20-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 8. Liqui Moly — Special Tec F 0W-30
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F 0W-30%')
     OR LOWER(slug) LIKE LOWER('%special-tec-f-0w-30%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (230.0 DT) with image /uploads/products/liqui-moly-special-tec-f-0w-30-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 230.0, 10, 'VAR-LIQU-SPECIALT-5L', '/uploads/products/liqui-moly-special-tec-f-0w-30-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 230.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-0w-30-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-0w-30-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (57.0 DT) with image /uploads/products/liqui-moly-special-tec-f-0w-30-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 57.0, 10, 'VAR-LIQU-SPECIALT-1L', '/uploads/products/liqui-moly-special-tec-f-0w-30-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 57.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-0w-30-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-0w-30-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 9. Liqui Moly — Special Tec F 5W-30 (FORD)
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F 5W-30 (FORD)%')
     OR LOWER(slug) LIKE LOWER('%special-tec-f-5w-30-ford%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (154.0 DT) with image /uploads/products/liqui-moly-special-tec-f-5w-30-ford-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 154.0, 10, 'VAR-LIQU-SPECIALT-5L', '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 154.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (45.0 DT) with image /uploads/products/liqui-moly-special-tec-f-5w-30-ford-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 45.0, 10, 'VAR-LIQU-SPECIALT-1L', '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 45.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-5w-30-ford-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 10. Liqui Moly — Special Tec F ECO 5W-20
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Special Tec F ECO 5W-20%')
     OR LOWER(slug) LIKE LOWER('%special-tec-f-eco-5w-20%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (175.0 DT) with image /uploads/products/liqui-moly-special-tec-f-eco-5w-20-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 175.0, 10, 'VAR-LIQU-SPECIALT-5L', '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 175.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (40.0 DT) with image /uploads/products/liqui-moly-special-tec-f-eco-5w-20-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, 'VAR-LIQU-SPECIALT-1L', '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 40.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-special-tec-f-eco-5w-20-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 11. Liqui Moly — Super Leichtlauf 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Super Leichtlauf 10W-40%')
     OR LOWER(slug) LIKE LOWER('%super-leichtlauf-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (110.0 DT) with image /uploads/products/liqui-moly-super-leichtlauf-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 110.0, 10, 'VAR-LIQU-SUPERLEI-5L', '/uploads/products/liqui-moly-super-leichtlauf-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 110.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-super-leichtlauf-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-super-leichtlauf-10w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (100.0 DT) with image /uploads/products/liqui-moly-super-leichtlauf-10w-40-4l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 100.0, 10, 'VAR-LIQU-SUPERLEI-4L', '/uploads/products/liqui-moly-super-leichtlauf-10w-40-4l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 100.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/liqui-moly-super-leichtlauf-10w-40-4l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-super-leichtlauf-10w-40-4l.png', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (28.0 DT) with image /uploads/products/liqui-moly-super-leichtlauf-10w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 28.0, 10, 'VAR-LIQU-SUPERLEI-1L', '/uploads/products/liqui-moly-super-leichtlauf-10w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 28.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-super-leichtlauf-10w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-super-leichtlauf-10w-40-1l.png', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 12. Liqui Moly — Synthoil Race Tech GT1 10W-60
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Synthoil Race Tech GT1 10W-60%')
     OR LOWER(slug) LIKE LOWER('%synthoil-race-tech-gt1-10w-60%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (200.0 DT) with image /uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 200.0, 10, 'VAR-LIQU-SYNTHOIL-5L', '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 200.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (55.0 DT) with image /uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 55.0, 10, 'VAR-LIQU-SYNTHOIL-1L', '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 55.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-synthoil-race-tech-gt1-10w-60-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 13. Liqui Moly — Top Tec 4100 5W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4100 5W-40%')
     OR LOWER(slug) LIKE LOWER('%top-tec-4100-5w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (157.0 DT) with image /uploads/products/liqui-moly-top-tec-4100-5w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 157.0, 10, 'VAR-LIQU-TOPTEC41-5L', '/uploads/products/liqui-moly-top-tec-4100-5w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 157.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4100-5w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4100-5w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (37.0 DT) with image /uploads/products/liqui-moly-top-tec-4100-5w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 37.0, 10, 'VAR-LIQU-TOPTEC41-1L', '/uploads/products/liqui-moly-top-tec-4100-5w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 37.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4100-5w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4100-5w-40-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 14. Liqui Moly — Top Tec 4110 5W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4110 5W-40%')
     OR LOWER(slug) LIKE LOWER('%top-tec-4110-5w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (154.0 DT) with image /uploads/products/liqui-moly-top-tec-4110-5w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 154.0, 10, 'VAR-LIQU-TOPTEC41-5L', '/uploads/products/liqui-moly-top-tec-4110-5w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 154.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4110-5w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4110-5w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (36.0 DT) with image /uploads/products/liqui-moly-top-tec-4110-5w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 36.0, 10, 'VAR-LIQU-TOPTEC41-1L', '/uploads/products/liqui-moly-top-tec-4110-5w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 36.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4110-5w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4110-5w-40-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 15. Liqui Moly — Top Tec 4200 5W-30 New Generation
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4200 5W-30 New Generation%')
     OR LOWER(slug) LIKE LOWER('%top-tec-4200-5w-30-new-generat%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (190.0 DT) with image /uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 190.0, 10, 'VAR-LIQU-TOPTEC42-5L', '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 190.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (46.0 DT) with image /uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 46.0, 10, 'VAR-LIQU-TOPTEC42-1L', '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 46.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4200-5w-30-new-generation-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 16. Liqui Moly — Top Tec 4300 5W-30 (PSA)
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4300 5W-30 (PSA)%')
     OR LOWER(slug) LIKE LOWER('%top-tec-4300-5w-30-psa%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (160.0 DT) with image /uploads/products/liqui-moly-top-tec-4300-5w-30-psa-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 160.0, 10, 'VAR-LIQU-TOPTEC43-5L', '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 160.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (43.0 DT) with image /uploads/products/liqui-moly-top-tec-4300-5w-30-psa-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 43.0, 10, 'VAR-LIQU-TOPTEC43-1L', '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 43.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4300-5w-30-psa-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 17. Liqui Moly — Top Tec 4600 5W-30
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 4600 5W-30%')
     OR LOWER(slug) LIKE LOWER('%top-tec-4600-5w-30%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (170.0 DT) with image /uploads/products/liqui-moly-top-tec-4600-5w-30-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 170.0, 10, 'VAR-LIQU-TOPTEC46-5L', '/uploads/products/liqui-moly-top-tec-4600-5w-30-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 170.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4600-5w-30-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4600-5w-30-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (40.0 DT) with image /uploads/products/liqui-moly-top-tec-4600-5w-30-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, 'VAR-LIQU-TOPTEC46-1L', '/uploads/products/liqui-moly-top-tec-4600-5w-30-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 40.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-4600-5w-30-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-4600-5w-30-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 18. Liqui Moly — Top Tec 6100 0W-30
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 6100 0W-30%')
     OR LOWER(slug) LIKE LOWER('%top-tec-6100-0w-30%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (174.0 DT) with image /uploads/products/liqui-moly-top-tec-6100-0w-30-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 174.0, 10, 'VAR-LIQU-TOPTEC61-5L', '/uploads/products/liqui-moly-top-tec-6100-0w-30-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 174.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-6100-0w-30-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-6100-0w-30-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (46.0 DT) with image /uploads/products/liqui-moly-top-tec-6100-0w-30-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 46.0, 10, 'VAR-LIQU-TOPTEC61-1L', '/uploads/products/liqui-moly-top-tec-6100-0w-30-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 46.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-6100-0w-30-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-6100-0w-30-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 19. Liqui Moly — Top Tec 6200 0W-20
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec 6200 0W-20%')
     OR LOWER(slug) LIKE LOWER('%top-tec-6200-0w-20%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (260.0 DT) with image /uploads/products/liqui-moly-top-tec-6200-0w-20-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 260.0, 10, 'VAR-LIQU-TOPTEC62-5L', '/uploads/products/liqui-moly-top-tec-6200-0w-20-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 260.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-6200-0w-20-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-6200-0w-20-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (60.0 DT) with image /uploads/products/liqui-moly-top-tec-6200-0w-20-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 10, 'VAR-LIQU-TOPTEC62-1L', '/uploads/products/liqui-moly-top-tec-6200-0w-20-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 60.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-6200-0w-20-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-6200-0w-20-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 20. Liqui Moly — Top Tec ATF 1100
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1100%')
     OR LOWER(slug) LIKE LOWER('%top-tec-atf-1100%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (160.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1100-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 160.0, 10, 'VAR-LIQU-TOPTECAT-5L', '/uploads/products/liqui-moly-top-tec-atf-1100-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 160.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1100-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1100-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (40.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1100-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, 'VAR-LIQU-TOPTECAT-1L', '/uploads/products/liqui-moly-top-tec-atf-1100-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 40.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1100-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1100-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 21. Liqui Moly — Top Tec ATF 1200
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1200%')
     OR LOWER(slug) LIKE LOWER('%top-tec-atf-1200%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (210.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1200-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 210.0, 10, 'VAR-LIQU-TOPTECAT-5L', '/uploads/products/liqui-moly-top-tec-atf-1200-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 210.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1200-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1200-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (50.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1200-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 50.0, 10, 'VAR-LIQU-TOPTECAT-1L', '/uploads/products/liqui-moly-top-tec-atf-1200-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 50.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1200-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1200-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 22. Liqui Moly — Top Tec ATF 1800
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Top Tec ATF 1800%')
     OR LOWER(slug) LIKE LOWER('%top-tec-atf-1800%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (270.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1800-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 270.0, 10, 'VAR-LIQU-TOPTECAT-5L', '/uploads/products/liqui-moly-top-tec-atf-1800-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 270.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1800-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1800-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (60.0 DT) with image /uploads/products/liqui-moly-top-tec-atf-1800-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 60.0, 10, 'VAR-LIQU-TOPTECAT-1L', '/uploads/products/liqui-moly-top-tec-atf-1800-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 60.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/liqui-moly-top-tec-atf-1800-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/liqui-moly-top-tec-atf-1800-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 23. Mannol — Classic 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Classic 10W-40%')
     OR LOWER(slug) LIKE LOWER('%classic-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (90.0 DT) with image /uploads/products/mannol-classic-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 90.0, 10, 'VAR-MANN-CLASSIC1-5L', '/uploads/products/mannol-classic-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 90.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/mannol-classic-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-classic-10w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (71.0 DT) with image /uploads/products/mannol-classic-10w-40-4l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 71.0, 10, 'VAR-MANN-CLASSIC1-4L', '/uploads/products/mannol-classic-10w-40-4l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 71.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/mannol-classic-10w-40-4l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-classic-10w-40-4l.png', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (21.0 DT) with image /uploads/products/mannol-classic-10w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 21.0, 10, 'VAR-MANN-CLASSIC1-1L', '/uploads/products/mannol-classic-10w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 21.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/mannol-classic-10w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-classic-10w-40-1l.png', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 24. Mannol — Defender 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Defender 10W-40%')
     OR LOWER(slug) LIKE LOWER('%defender-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (100.0 DT) with image /uploads/products/mannol-defender-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 100.0, 10, 'VAR-MANN-DEFENDER-5L', '/uploads/products/mannol-defender-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 100.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/mannol-defender-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-defender-10w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 7L (135.0 DT) with image /uploads/products/mannol-defender-10w-40-7l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '7L', 135.0, 10, 'VAR-MANN-DEFENDER-7L', '/uploads/products/mannol-defender-10w-40-7l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 135.0,
      volume = '7L',
      "imageUrl" = '/uploads/products/mannol-defender-10w-40-7l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-defender-10w-40-7l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 25. Mannol — Diesel Extra 10W-40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Diesel Extra 10W-40%')
     OR LOWER(slug) LIKE LOWER('%diesel-extra-10w-40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (90.0 DT) with image /uploads/products/mannol-diesel-extra-10w-40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 90.0, 10, 'VAR-MANN-DIESELEX-5L', '/uploads/products/mannol-diesel-extra-10w-40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 90.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/mannol-diesel-extra-10w-40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-diesel-extra-10w-40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (23.0 DT) with image /uploads/products/mannol-diesel-extra-10w-40-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 23.0, 10, 'VAR-MANN-DIESELEX-1L', '/uploads/products/mannol-diesel-extra-10w-40-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 23.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/mannol-diesel-extra-10w-40-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-diesel-extra-10w-40-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 26. Mannol — Energy Combi LL 5W-30
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Energy Combi LL 5W-30%')
     OR LOWER(slug) LIKE LOWER('%energy-combi-ll-5w-30%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (170.0 DT) with image /uploads/products/mannol-energy-combi-ll-5w-30-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 170.0, 10, 'VAR-MANN-ENERGYCO-5L', '/uploads/products/mannol-energy-combi-ll-5w-30-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 170.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/mannol-energy-combi-ll-5w-30-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-energy-combi-ll-5w-30-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (40.0 DT) with image /uploads/products/mannol-energy-combi-ll-5w-30-1l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 40.0, 10, 'VAR-MANN-ENERGYCO-1L', '/uploads/products/mannol-energy-combi-ll-5w-30-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 40.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/mannol-energy-combi-ll-5w-30-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/mannol-energy-combi-ll-5w-30-1l.png', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 27. Wolf — Guardtech 10W40 B4
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Guardtech 10W40 B4%')
     OR LOWER(slug) LIKE LOWER('%guardtech-10w40-b4%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (89.0 DT) with image /uploads/products/wolf-guardtech-10w40-b4-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 89.0, 10, 'VAR-WOLF-GUARDTEC-5L', '/uploads/products/wolf-guardtech-10w40-b4-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 89.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/wolf-guardtech-10w40-b4-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-guardtech-10w40-b4-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (70.0 DT) with image /uploads/products/wolf-guardtech-10w40-b4-4l.webp
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 70.0, 10, 'VAR-WOLF-GUARDTEC-4L', '/uploads/products/wolf-guardtech-10w40-b4-4l.webp')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 70.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/wolf-guardtech-10w40-b4-4l.webp',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-guardtech-10w40-b4-4l.webp', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (20.0 DT) with image /uploads/products/wolf-guardtech-10w40-b4-1l.webp
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 20.0, 10, 'VAR-WOLF-GUARDTEC-1L', '/uploads/products/wolf-guardtech-10w40-b4-1l.webp')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 20.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/wolf-guardtech-10w40-b4-1l.webp',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-guardtech-10w40-b4-1l.webp', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 28. Wolf — Officialtech 5W30 C3 SP Extra
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Officialtech 5W30 C3 SP Extra%')
     OR LOWER(slug) LIKE LOWER('%officialtech-5w30-c3-sp-extra%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (125.0 DT) with image /uploads/products/wolf-officialtech-5w30-c3-sp-extra-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 125.0, 10, 'VAR-WOLF-OFFICIAL-5L', '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 125.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (109.0 DT) with image /uploads/products/wolf-officialtech-5w30-c3-sp-extra-4l.jpg
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 109.0, 10, 'VAR-WOLF-OFFICIAL-4L', '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-4l.jpg')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 109.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-4l.jpg',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-4l.jpg', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (29.0 DT) with image /uploads/products/wolf-officialtech-5w30-c3-sp-extra-1l.webp
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 29.0, 10, 'VAR-WOLF-OFFICIAL-1L', '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-1l.webp')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 29.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-1l.webp',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-officialtech-5w30-c3-sp-extra-1l.webp', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 29. Wolf — Officialtech 5W30 MS-Ford
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Officialtech 5W30 MS-Ford%')
     OR LOWER(slug) LIKE LOWER('%officialtech-5w30-ms-ford%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (131.0 DT) with image /uploads/products/wolf-officialtech-5w30-ms-ford-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 131.0, 10, 'VAR-WOLF-OFFICIAL-5L', '/uploads/products/wolf-officialtech-5w30-ms-ford-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 131.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/wolf-officialtech-5w30-ms-ford-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-officialtech-5w30-ms-ford-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (31.0 DT) with image /uploads/products/wolf-officialtech-5w30-ms-ford-1l.jpg
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 31.0, 10, 'VAR-WOLF-OFFICIAL-1L', '/uploads/products/wolf-officialtech-5w30-ms-ford-1l.jpg')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 31.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/wolf-officialtech-5w30-ms-ford-1l.jpg',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-officialtech-5w30-ms-ford-1l.jpg', false, 1)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- 30. Wolf — Vitaltech 5W40
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Vitaltech 5W40%')
     OR LOWER(slug) LIKE LOWER('%vitaltech-5w40%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 5L (108.0 DT) with image /uploads/products/wolf-vitaltech-5w40-5l.png
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '5L', 108.0, 10, 'VAR-WOLF-VITALTEC-5L', '/uploads/products/wolf-vitaltech-5w40-5l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 108.0,
      volume = '5L',
      "imageUrl" = '/uploads/products/wolf-vitaltech-5w40-5l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-vitaltech-5w40-5l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Variant 4L (93.0 DT) with image /uploads/products/wolf-vitaltech-5w40-4l.jpg
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 93.0, 10, 'VAR-WOLF-VITALTEC-4L', '/uploads/products/wolf-vitaltech-5w40-4l.jpg')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 93.0,
      volume = '4L',
      "imageUrl" = '/uploads/products/wolf-vitaltech-5w40-4l.jpg',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-vitaltech-5w40-4l.jpg', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L (26.0 DT) with image /uploads/products/wolf-vitaltech-5w40-1l.jpg
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 26.0, 10, 'VAR-WOLF-VITALTEC-1L', '/uploads/products/wolf-vitaltech-5w40-1l.jpg')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      price = 26.0,
      volume = '1L',
      "imageUrl" = '/uploads/products/wolf-vitaltech-5w40-1l.jpg',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/wolf-vitaltech-5w40-1l.jpg', false, 2)
    ON CONFLICT DO NOTHING;
  END IF;
END $$;

-- Liqui Moly — Motorbike HD Synth 20W-50 Street
DO $$
DECLARE prod_id text; BEGIN
  SELECT id INTO prod_id FROM public."Product"
  WHERE LOWER("nameFr") LIKE LOWER('%Motorbike HD Synth 20W-50%')
     OR LOWER(slug) LIKE LOWER('%motorbike-hd-synth-20w-50%')
  LIMIT 1;
  IF prod_id IS NOT NULL THEN
    -- Variant 4L with image
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '4L', 0.0, 10, 'VAR-LIQU-MOTBIKE-4L', '/uploads/products/motorbike-hd-synth-20w-50-street-4l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      volume = '4L',
      "imageUrl" = '/uploads/products/motorbike-hd-synth-20w-50-street-4l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/motorbike-hd-synth-20w-50-street-4l.png', false, 1)
    ON CONFLICT DO NOTHING;
    -- Variant 1L with image (correct 1L bottle)
    INSERT INTO public."ProductVariant" (id, "productId", volume, price, "stockQty", "skuVariant", "imageUrl")
    VALUES (gen_random_uuid()::text, prod_id, '1L', 0.0, 10, 'VAR-LIQU-MOTBIKE-1L', '/uploads/products/motorbike-hd-synth-20w-50-street-1l.png')
    ON CONFLICT ("skuVariant") DO UPDATE SET
      volume = '1L',
      "imageUrl" = '/uploads/products/motorbike-hd-synth-20w-50-street-1l.png',
      "stockQty" = GREATEST("ProductVariant"."stockQty", 5);
    INSERT INTO public."ProductImage" (id, "productId", url, "isPrimary", "sortOrder")
    VALUES (gen_random_uuid()::text, prod_id, '/uploads/products/motorbike-hd-synth-20w-50-street-1l.png', true, 0)
    ON CONFLICT DO NOTHING;
    -- Update existing wrong-image variant to use correct 1L image
    UPDATE public."ProductVariant"
    SET "imageUrl" = '/uploads/products/motorbike-hd-synth-20w-50-street-1l.png'
    WHERE "productId" = prod_id AND volume IN ('1L', '1 L') AND "skuVariant" != 'VAR-LIQU-MOTBIKE-1L';
    UPDATE public."ProductVariant"
    SET "imageUrl" = '/uploads/products/motorbike-hd-synth-20w-50-street-4l.png'
    WHERE "productId" = prod_id AND volume IN ('4L', '4 L') AND "skuVariant" != 'VAR-LIQU-MOTBIKE-4L';
    -- Fix primary image to be the 1L
    UPDATE public."ProductImage"
    SET "isPrimary" = false
    WHERE "productId" = prod_id;
    UPDATE public."ProductImage"
    SET "isPrimary" = true
    WHERE "productId" = prod_id AND url = '/uploads/products/motorbike-hd-synth-20w-50-street-1l.png';
  END IF;
END $$;

COMMIT;