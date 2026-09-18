-- Session invalidation on password reset/change.
ALTER TABLE public."User" ADD COLUMN IF NOT EXISTS "passwordChangedAt" TIMESTAMP(3);

-- Contact address for guest orders (no userId), so shipping notices can be sent.
ALTER TABLE public."Order" ADD COLUMN IF NOT EXISTS "shipEmail" TEXT;

-- Emails are stored canonicalised (lower-cased, trimmed) from here on; fold any
-- existing rows so the login/reset lookups can find them.
-- Skipped when folding would collide with an existing canonical row; those need
-- a manual merge and are left untouched rather than silently dropped.
UPDATE public."User" u
SET "email" = lower(btrim(u."email"))
WHERE u."email" <> lower(btrim(u."email"))
  AND NOT EXISTS (
    SELECT 1 FROM public."User" other
    WHERE other."id" <> u."id"
      AND other."email" = lower(btrim(u."email"))
  );

-- Guard so cancelling/returning an order credits its stock back exactly once.
ALTER TABLE public."Order" ADD COLUMN IF NOT EXISTS "stockReleasedAt" TIMESTAMP(3);

-- Orders cancelled or returned before this change never gave their stock back.
-- Mark them released rather than restocking retroactively: the true counts are
-- unknown at this point and a blind credit would over-report inventory.
UPDATE public."Order"
SET "stockReleasedAt" = COALESCE("updatedAt", now())
WHERE "status" IN ('CANCELLED', 'RETURNED')
  AND "stockReleasedAt" IS NULL;
