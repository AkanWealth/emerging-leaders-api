-- AddForeignKey
ALTER TABLE "UserMindsetProgress" ADD CONSTRAINT "UserMindsetProgress_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "MindsetItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMindsetProgress" ADD CONSTRAINT "UserMindsetProgress_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MindsetGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
