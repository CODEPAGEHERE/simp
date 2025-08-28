/*
  Warnings:

  - A unique constraint covering the columns `[phoneNo]` on the table `Person` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Person_phoneNo_key" ON "Person"("phoneNo");
