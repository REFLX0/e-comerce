-- CreateIndex: speed up best-sellers aggregation query
CREATE INDEX IF NOT EXISTS "Order_status_createdAt_idx" ON "Order"("status", "createdAt");
