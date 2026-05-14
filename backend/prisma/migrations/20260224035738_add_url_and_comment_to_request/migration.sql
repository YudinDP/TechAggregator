-- AlterTable
ALTER TABLE "Request" ADD COLUMN     "comment" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateTable
CREATE TABLE "PriceHistory" (
    "id" SERIAL NOT NULL,
    "productId" INTEGER NOT NULL,
    "storeName" VARCHAR(255) NOT NULL,
    "price" DECIMAL(10,2) NOT NULL,
    "date" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PriceHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_pricehistory_date" ON "PriceHistory"("date");

-- CreateIndex
CREATE INDEX "idx_pricehistory_product_store" ON "PriceHistory"("productId", "storeName");

-- AddForeignKey
ALTER TABLE "PriceHistory" ADD CONSTRAINT "fk_pricehistory_product" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
