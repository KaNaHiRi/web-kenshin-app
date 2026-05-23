import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import QuestionnaireForm from './_components/QuestionnaireForm'

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

  return (
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
  )
}
