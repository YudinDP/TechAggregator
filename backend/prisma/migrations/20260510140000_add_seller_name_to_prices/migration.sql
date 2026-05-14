-- Колонки могли уже быть добавлены через ensureSellerColumns() на сервере
ALTER TABLE "Price" ADD COLUMN IF NOT EXISTS "sellerName" TEXT;

ALTER TABLE "PriceHistory" ADD COLUMN IF NOT EXISTS "sellerName" VARCHAR(255);
