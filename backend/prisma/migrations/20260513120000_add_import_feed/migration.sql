-- CreateTable
CREATE TABLE "ImportFeed" (
    "id" SERIAL NOT NULL,
    "url" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "sellerName" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "lastFetchedAt" TIMESTAMP(3),
    "lastImportAt" TIMESTAMP(3),
    "lastHttpEtag" TEXT,
    "lastHttpModified" TEXT,
    "lastContentHash" TEXT,
    "lastStatus" TEXT,
    "lastMessage" TEXT,

    CONSTRAINT "ImportFeed_pkey" PRIMARY KEY ("id")
);
