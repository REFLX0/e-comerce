-- CreateEnum
DO $$ BEGIN
  CREATE TYPE "OrderType" AS ENUM ('DELIVERY', 'STORE_PICKUP');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AlterTable
-- Existing rows default to DELIVERY, since that is the only fulfillment
-- path the checkout flow has ever supported. Revenue previously miscounted
-- as "Boutique" (any order with shippingCost = 0, including free-shipping
-- deliveries) will now correctly show as DELIVERY revenue.
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "orderType" "OrderType" NOT NULL DEFAULT 'DELIVERY';
