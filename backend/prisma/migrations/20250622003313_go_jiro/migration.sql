-- CreateTable
CREATE TABLE "Evaluation" (
    "id" SERIAL NOT NULL,
    "shopId" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "jirodo" DOUBLE PRECISION NOT NULL,
    "estimatePortion" INTEGER NOT NULL,
    "actualPortion" INTEGER NOT NULL,
    "orderHelp" INTEGER NOT NULL,
    "exitPressure" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_shopId_fkey" FOREIGN KEY ("shopId") REFERENCES "Shop"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
