-- CreateTable
CREATE TABLE "MindsetGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindsetGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MindsetItem" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MindsetItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MindsetItem" ADD CONSTRAINT "MindsetItem_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MindsetGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
