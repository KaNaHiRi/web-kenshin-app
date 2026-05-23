'use server'

import { prisma } from '@/lib/prisma'

export type SaveAnswersResult = {
  success: boolean
  error?: string
}

export async function saveAnswers(
  uniqueKey: string,
  answers: Record<string, string>,
): Promise<SaveAnswersResult> {
  const examinee = await prisma.examinee.findUnique({ where: { uniqueKey } })
  if (!examinee) {
    return { success: false, error: '受診者が見つかりません' }
  }

  const entries = Object.entries(answers)
  if (entries.length === 0) {
    return { success: false, error: '回答がありません' }
  }

  await prisma.$transaction(
    entries.map(([questionCode, answer]) =>
      prisma.questionnaireAnswer.upsert({
        where: { uniqueKey_questionCode: { uniqueKey, questionCode } },
        update: { answer, answeredAt: new Date() },
        create: { uniqueKey, questionCode, answer },
      }),
    ),
  )

  return { success: true }
}
