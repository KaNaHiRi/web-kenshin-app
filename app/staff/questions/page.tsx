import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import QuestionList from "./_components/QuestionList"

export const metadata = {
  title: "問診項目管理 | 特定健診WEB問診",
}

export default async function QuestionsPage() {
  const session = await auth()
  if (!session) redirect("/staff/login")

  const [questions, answerGroups] = await Promise.all([
    prisma.questionMaster.findMany({
      orderBy: { displayOrder: "asc" },
    }),
    prisma.questionnaireAnswer.groupBy({
      by: ["questionCode"],
      _count: { id: true },
    }),
  ])

  const answerCountMap = Object.fromEntries(
    answerGroups.map(({ questionCode, _count }) => [questionCode, _count.id])
  )

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <QuestionList questions={questions} answerCountMap={answerCountMap} />
    </div>
  )
}
