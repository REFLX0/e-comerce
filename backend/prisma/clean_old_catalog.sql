-- =============================================================================
-- Safe Old Catalogue Cleanup Script
-- Cleans obsolete mock/scraped products while preserving users, orders & billing
-- =============================================================================

BEGIN;

-- 1. Remove old product auxiliary tables
DELETE FROM public."ProductImage";
DELETE FROM public."ProductSpecs";
DELETE FROM public."VehicleCompatibility";
DELETE FROM public."ProductSourcing";

-- 2. Clear old variants that are NOT linked to past orders
-- For variants linked to existing orders, we keep the row with tecdocArticleId = NULL for accounting integrity
DELETE FROM public."ProductVariant" 
WHERE "id" NOT IN (SELECT DISTINCT "variantId" FROM public."OrderItem" WHERE "variantId" IS NOT NULL);

-- 3. Clear old products that are NOT linked to past orders
DELETE FROM public."Product" 
WHERE "id" NOT IN (SELECT DISTINCT "productId" FROM public."OrderItem" WHERE "productId" IS NOT NULL);

-- 4. Clean old scraped vehicle makes and models
DELETE FROM public."VehicleModel";
DELETE FROM public."VehicleMake";

-- 5. Clean old categories and brands
DELETE FROM public."Category";
DELETE FROM public."Brand";

COMMIT;

VACUUM ANALYZE;
