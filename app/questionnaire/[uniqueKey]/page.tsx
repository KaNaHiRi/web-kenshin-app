import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QuestionnaireForm from './_components/QuestionnaireForm'

// ─── Loading fallback ────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-sm text-gray-400">読み込み中...</div>
    </div>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function QuestionnairePage(props: {
  params: Promise<{ uniqueKey: string }>
}) {
  const { uniqueKey } = await props.params

  const [examinee, questions, existingAnswers] = await Promise.all([
    prisma.examinee.findUnique({ where: { uniqueKey } }),
    prisma.questionMaster.findMany({
      where: { isActive: 1 },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.questionnaireAnswer.findMany({ where: { uniqueKey } }),
  ])

  if (!examinee) notFound()

  const answersMap = Object.fromEntries(
    existingAnswers.map((a) => [a.questionCode, a.answer]),
  )

  // QuestionnaireForm は内部で useSearchParams() を使うため Suspense でラップする
  return (
    <Suspense fallback={<LoadingState />}>
      <QuestionnaireForm
        examinee={{
          uniqueKey: examinee.uniqueKey,
          name: examinee.name,
          birthDate: examinee.birthDate,
          gender: examinee.gender,
          examinationDate: examinee.examinationDate,
          fiscalYear: examinee.fiscalYear,
        }}
        questions={questions}
        existingAnswers={answersMap}
      />
    </Suspense>
  )
}
