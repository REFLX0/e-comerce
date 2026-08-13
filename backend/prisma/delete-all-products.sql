-- Delete related records
DELETE FROM "ProductVariant" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");
DELETE FROM "ProductImage" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");
DELETE FROM "Review" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");
DELETE FROM "WishlistItem" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");
DELETE FROM "VehicleCompatibility" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");
DELETE FROM "ProductSpecs" WHERE "productId" NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");

-- Delete products not in orders
DELETE FROM "Product" WHERE id NOT IN (SELECT DISTINCT "productId" FROM "OrderItem");

SELECT COUNT(*) as remaining_products FROM "Product";
