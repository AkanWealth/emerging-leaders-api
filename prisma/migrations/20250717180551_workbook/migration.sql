-- CreateTable
CREATE TABLE "Workbook" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Workbook_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module1" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "mindset" TEXT NOT NULL,
    "areasGivenAwayPen" TEXT NOT NULL,
    "whatWentWell" TEXT NOT NULL,
    "whatCouldBeBetter" TEXT NOT NULL,
    "whatCouldYouDoForFree" TEXT NOT NULL,
    "goodCharacteristicsToDevelop" TEXT NOT NULL,
    "dreams" TEXT NOT NULL,
    "characterGoals" TEXT NOT NULL,
    "legacy" TEXT NOT NULL,
    "relationshipStoryChange" TEXT NOT NULL,
    "howToGetThere" TEXT NOT NULL,
    "threeFocusPoints1" TEXT NOT NULL,
    "whoDoYouKnow" TEXT NOT NULL,
    "whoDoYouNeedToKnow" TEXT NOT NULL,
    "threeFocusPoints2" TEXT NOT NULL,
    "leadershipStepToTake" TEXT NOT NULL,

    CONSTRAINT "Module1_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module2" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "goodFinancialManagement" TEXT NOT NULL,
    "badFinancialManagement" TEXT NOT NULL,
    "biggerYesShortTerm" TEXT NOT NULL,
    "biggerYesMediumTerm" TEXT NOT NULL,
    "biggerYesLongTerm" TEXT NOT NULL,
    "leadershipMindsetInMoney" TEXT NOT NULL,
    "savingFor" TEXT NOT NULL,
    "howMuchToSave" DOUBLE PRECISION NOT NULL,
    "incomeAmount" DOUBLE PRECISION NOT NULL,
    "expensesToCut" TEXT NOT NULL,
    "savingsLocation" TEXT NOT NULL,
    "trackSavings" TEXT NOT NULL,
    "wantsVsNeeds" TEXT NOT NULL,
    "income1" DOUBLE PRECISION NOT NULL,
    "income2" DOUBLE PRECISION NOT NULL,
    "income3" DOUBLE PRECISION NOT NULL,
    "otherIncome" DOUBLE PRECISION NOT NULL,
    "food" DOUBLE PRECISION NOT NULL,
    "house" DOUBLE PRECISION NOT NULL,
    "travel" DOUBLE PRECISION NOT NULL,
    "rent" DOUBLE PRECISION NOT NULL,
    "mobile" DOUBLE PRECISION NOT NULL,
    "medical" DOUBLE PRECISION NOT NULL,
    "education" DOUBLE PRECISION NOT NULL,
    "funFund" DOUBLE PRECISION NOT NULL,
    "other1" DOUBLE PRECISION NOT NULL,
    "other2" DOUBLE PRECISION NOT NULL,
    "financeLeadershipStep" TEXT NOT NULL,

    CONSTRAINT "Module2_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Module3" (
    "id" TEXT NOT NULL,
    "workbookId" TEXT NOT NULL,
    "projectPurpose" TEXT NOT NULL,
    "skills" TEXT NOT NULL,
    "experience" TEXT NOT NULL,
    "resources" TEXT NOT NULL,
    "people" TEXT NOT NULL,
    "timeAvailability" TEXT NOT NULL,
    "focusPoint1" TEXT NOT NULL,
    "focusPoint2" TEXT NOT NULL,
    "focusPoint3" TEXT NOT NULL,
    "peopleIKnow" TEXT NOT NULL,
    "peopleINeedToKnow" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "when" TEXT NOT NULL,
    "who" TEXT NOT NULL,
    "leadYourProjectNote" TEXT NOT NULL,
    "additionalNotes" TEXT NOT NULL,

    CONSTRAINT "Module3_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Module1_workbookId_key" ON "Module1"("workbookId");

-- CreateIndex
CREATE UNIQUE INDEX "Module2_workbookId_key" ON "Module2"("workbookId");

-- CreateIndex
CREATE UNIQUE INDEX "Module3_workbookId_key" ON "Module3"("workbookId");

-- AddForeignKey
ALTER TABLE "Module1" ADD CONSTRAINT "Module1_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module2" ADD CONSTRAINT "Module2_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Module3" ADD CONSTRAINT "Module3_workbookId_fkey" FOREIGN KEY ("workbookId") REFERENCES "Workbook"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
