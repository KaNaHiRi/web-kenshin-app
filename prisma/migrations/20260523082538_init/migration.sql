-- CreateTable
CREATE TABLE "question_masters" (
    "id" SERIAL NOT NULL,
    "question_code" VARCHAR(20) NOT NULL,
    "question_name" VARCHAR(200) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "display_order" INTEGER NOT NULL,
    "is_active" SMALLINT NOT NULL DEFAULT 1,

    CONSTRAINT "question_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "examinees" (
    "id" SERIAL NOT NULL,
    "unique_key" VARCHAR(50) NOT NULL,
    "external_id" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "birth_date" DATE NOT NULL,
    "gender" VARCHAR(10) NOT NULL,
    "examination_date" DATE,
    "fiscal_year" INTEGER NOT NULL,
    "imported_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "examinees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "questionnaire_answers" (
    "id" SERIAL NOT NULL,
    "unique_key" VARCHAR(50) NOT NULL,
    "question_code" VARCHAR(20) NOT NULL,
    "answer" VARCHAR(50) NOT NULL,
    "answered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "questionnaire_answers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "question_masters_question_code_key" ON "question_masters"("question_code");

-- CreateIndex
CREATE UNIQUE INDEX "examinees_unique_key_key" ON "examinees"("unique_key");

-- CreateIndex
CREATE UNIQUE INDEX "questionnaire_answers_unique_key_question_code_key" ON "questionnaire_answers"("unique_key", "question_code");

-- AddForeignKey
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_unique_key_fkey" FOREIGN KEY ("unique_key") REFERENCES "examinees"("unique_key") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "questionnaire_answers" ADD CONSTRAINT "questionnaire_answers_question_code_fkey" FOREIGN KEY ("question_code") REFERENCES "question_masters"("question_code") ON DELETE RESTRICT ON UPDATE CASCADE;
