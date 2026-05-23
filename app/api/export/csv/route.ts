import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get('year')
  const year = yearParam ? parseInt(yearParam, 10) : new Date().getFullYear()

  const [questions, examinees] = await Promise.all([
    prisma.questionMaster.findMany({
      where: { isActive: 1 },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.examinee.findMany({
      where: { fiscalYear: year },
      orderBy: { uniqueKey: 'asc' },
    }),
  ])

  const uniqueKeys = examinees.map((e) => e.uniqueKey)
  const answers = uniqueKeys.length > 0
    ? await prisma.questionnaireAnswer.findMany({
        where: { uniqueKey: { in: uniqueKeys } },
      })
    : []

  // uniqueKey -> questionCode -> answer value
  const answersMap = new Map<string, Map<string, string>>()
  for (const ans of answers) {
    if (!answersMap.has(ans.uniqueKey)) {
      answersMap.set(ans.uniqueKey, new Map())
    }
    answersMap.get(ans.uniqueKey)!.set(ans.questionCode, ans.answer)
  }

  const codes = questions.map((q) => q.questionCode)

  const INFO_HEADERS = ['UniqueKey', 'ExternalId', 'Name', 'BirthDate', 'Gender']
  const header = [...INFO_HEADERS, ...codes].join(',')

  const rows = examinees.map((e) => {
    const birthDate = [
      e.birthDate.getFullYear(),
      String(e.birthDate.getMonth() + 1).padStart(2, '0'),
      String(e.birthDate.getDate()).padStart(2, '0'),
    ].join('-')

    const info = [e.uniqueKey, e.externalId ?? '', e.name, birthDate, e.gender]

    const ansMap = answersMap.get(e.uniqueKey)
    const values = codes.map((code) => {
      const val = ansMap?.get(code)
      if (val === undefined) return ''   // 未回答
      return val === '1' ? '1' : '0'    // はい=1 / いいえ=0
    })
    return [...info, ...values].join(',')
  })

  const BOM = '﻿'
  const csv = BOM + [header, ...rows].join('\r\n')

  const today = new Date()
  const dateStr = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, '0'),
    String(today.getDate()).padStart(2, '0'),
  ].join('-')
  const filename = `kenshin_answers_${dateStr}.csv`

  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  })
}
