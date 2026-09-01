-- ============================================================
-- DEDUPLICATE ALL PRODUCT VARIANTS BY PRODUCT & VOLUME
-- ============================================================

BEGIN;

DO $$
DECLARE
  rec RECORD;
  best_id text;
  other_id text;
  v_count integer := 0;
BEGIN
  -- Find all (productId, volume) combinations that have more than 1 variant row
  FOR rec IN (
    SELECT
      "productId",
      UPPER(TRIM(REGEXP_REPLACE(volume, '\s+', '', 'g'))) AS norm_vol,
      ARRAY_AGG(
        id
        ORDER BY
          (CASE WHEN "imageUrl" IS NOT NULL AND "imageUrl" != '' THEN 0 ELSE 1 END) ASC,
          (CASE WHEN price > 0 THEN 0 ELSE 1 END) ASC,
          "createdAt" DESC
      ) AS variant_ids,
      COUNT(*) AS cnt
    FROM public."ProductVariant"
    WHERE volume IS NOT NULL AND volume != ''
    GROUP BY "productId", UPPER(TRIM(REGEXP_REPLACE(volume, '\s+', '', 'g')))
    HAVING COUNT(*) > 1
  ) LOOP
    best_id := rec.variant_ids[1];
    
    -- For any duplicate variants, re-link cart items / order items to best_id and delete duplicates
    FOREACH other_id IN ARRAY rec.variant_ids[2:] LOOP
      -- Update references in OrderItem / WishlistItem / CartItem if any
      UPDATE public."OrderItem" SET "variantId" = best_id WHERE "variantId" = other_id;
      
      -- Delete the duplicate variant
      DELETE FROM public."ProductVariant" WHERE id = other_id;
      v_count := v_count + 1;
    END LOOP;
  END LOOP;

  RAISE NOTICE 'Deleted % duplicate variant rows across the database.', v_count;
END $$;

-- Clean up duplicate ProductImage rows (same url on the same product)
DELETE FROM public."ProductImage"
WHERE id IN (
  SELECT id FROM (
    SELECT id, ROW_NUMBER() OVER (PARTITION BY "productId", url ORDER BY "isPrimary" DESC, "sortOrder" ASC) as rnum
    FROM public."ProductImage"
  ) t
  WHERE t.rnum > 1
);

COMMIT;
