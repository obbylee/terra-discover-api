-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "profilePicture" TEXT,
    "bio" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Space" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "alternateNames" TEXT[],
    "description" TEXT NOT NULL,
    "activities" TEXT[],
    "historicalContext" TEXT,
    "architecturalStyle" VARCHAR(100),
    "operatingHours" JSONB,
    "entranceFee" JSONB,
    "contactInfo" JSONB,
    "accessibility" JSONB,
    "typeId" TEXT NOT NULL,
    "submittedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Space_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceType" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "SpaceType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceCategory" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "SpaceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SpaceFeature" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" TEXT,

    CONSTRAINT "SpaceFeature_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_SpaceToSpaceCategory" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SpaceToSpaceCategory_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateTable
CREATE TABLE "_SpaceToSpaceFeature" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_SpaceToSpaceFeature_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Space_typeId_idx" ON "Space"("typeId");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceType_name_key" ON "SpaceType"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceCategory_name_key" ON "SpaceCategory"("name");

-- CreateIndex
CREATE UNIQUE INDEX "SpaceFeature_name_key" ON "SpaceFeature"("name");

-- CreateIndex
CREATE INDEX "_SpaceToSpaceCategory_B_index" ON "_SpaceToSpaceCategory"("B");

-- CreateIndex
CREATE INDEX "_SpaceToSpaceFeature_B_index" ON "_SpaceToSpaceFeature"("B");

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "SpaceType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Space" ADD CONSTRAINT "Space_submittedById_fkey" FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceToSpaceCategory" ADD CONSTRAINT "_SpaceToSpaceCategory_A_fkey" FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceToSpaceCategory" ADD CONSTRAINT "_SpaceToSpaceCategory_B_fkey" FOREIGN KEY ("B") REFERENCES "SpaceCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceToSpaceFeature" ADD CONSTRAINT "_SpaceToSpaceFeature_A_fkey" FOREIGN KEY ("A") REFERENCES "Space"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SpaceToSpaceFeature" ADD CONSTRAINT "_SpaceToSpaceFeature_B_fkey" FOREIGN KEY ("B") REFERENCES "SpaceFeature"("id") ON DELETE CASCADE ON UPDATE CASCADE;
