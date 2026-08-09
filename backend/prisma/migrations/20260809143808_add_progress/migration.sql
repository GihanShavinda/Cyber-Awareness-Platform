-- CreateTable
CREATE TABLE "TrainingProgress" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "quizId" INTEGER,
    "score" INTEGER,
    "passed" BOOLEAN NOT NULL DEFAULT false,
    "status" TEXT NOT NULL DEFAULT 'in_progress',
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TrainingProgress_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TrainingProgress" ADD CONSTRAINT "TrainingProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TrainingProgress" ADD CONSTRAINT "TrainingProgress_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
