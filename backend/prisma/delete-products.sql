-- Delete related records for products we are about to delete or hide
DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");
DELETE FROM "ProductSpecs" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");
DELETE FROM "VehicleCompatibility" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");
DELETE FROM "Review" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");
DELETE FROM "WishlistItem" WHERE "productId" NOT IN (SELECT "productId" FROM "OrderItem");

-- Delete products that have never been ordered
DELETE FROM "Product" WHERE id NOT IN (SELECT "productId" FROM "OrderItem");

-- For products that have been ordered, hide them from the catalogue
UPDATE "Product" 
SET "isPublished" = false, "isFeatured" = false 
WHERE id IN (SELECT "productId" FROM "OrderItem");
