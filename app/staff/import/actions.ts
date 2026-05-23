'use server'

import { prisma } from '@/lib/prisma'

export type ExamineeRow = {
  UniqueKey: string
  ExternalId?: string
  Name: string
  BirthDate: string
  Gender: string
  ExaminationDate?: string
  FiscalYear: string
  [key: string]: string | undefined
}

export type ImportResult = {
  count: number
  errors: string[]
}

export async function importExaminees(rows: ExamineeRow[]): Promise<ImportResult> {
  const errors: string[] = []
  let count = 0

  for (const row of rows) {
    if (!row.UniqueKey || !row.Name || !row.BirthDate || !row.Gender || !row.FiscalYear) {
      errors.push(`必須項目不足のためスキップ (UniqueKey: ${row.UniqueKey || '不明'})`)
      continue
    }

    const birthDate = new Date(row.BirthDate)
    if (isNaN(birthDate.getTime())) {
      errors.push(`生年月日の形式が不正のためスキップ (UniqueKey: ${row.UniqueKey})`)
      continue
    }

    const fiscalYear = parseInt(row.FiscalYear, 10)
    if (isNaN(fiscalYear)) {
      errors.push(`受診年度の形式が不正のためスキップ (UniqueKey: ${row.UniqueKey})`)
      continue
    }

    let examinationDate: Date | null = null
    if (row.ExaminationDate) {
      examinationDate = new Date(row.ExaminationDate)
      if (isNaN(examinationDate.getTime())) {
        errors.push(`受診予定日の形式が不正のためスキップ (UniqueKey: ${row.UniqueKey})`)
        continue
      }
    }

    await prisma.examinee.upsert({
      where: { uniqueKey: row.UniqueKey },
      update: {
        externalId: row.ExternalId || null,
        name: row.Name,
        birthDate,
        gender: row.Gender,
        examinationDate,
        fiscalYear,
        importedAt: new Date(),
      },
      create: {
        uniqueKey: row.UniqueKey,
        externalId: row.ExternalId || null,
        name: row.Name,
        birthDate,
        gender: row.Gender,
        examinationDate,
        fiscalYear,
      },
    })
    count++
  }

  return { count, errors }
}
