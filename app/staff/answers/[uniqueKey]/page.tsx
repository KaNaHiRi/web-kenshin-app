import Link from 'next/link'
import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

const CATEGORIES = ['既往歴', '服薬', '生活習慣'] as const

const ANSWER_LABELS: Record<string, string> = {
  '1': 'はい',
  '2': 'いいえ',
}

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

function formatDateTime(date: Date): string {
  return (
    `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ` +
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  )
}

export default async function AnswerDetailPage(props: {
  params: Promise<{ uniqueKey: string }>
}) {
  const { uniqueKey } = await props.params

  const [examinee, questions, answers] = await Promise.all([
    prisma.examinee.findUnique({ where: { uniqueKey } }),
    prisma.questionMaster.findMany({
      where: { isActive: 1 },
      orderBy: { displayOrder: 'asc' },
    }),
    prisma.questionnaireAnswer.findMany({ where: { uniqueKey } }),
  ])

  if (!examinee) notFound()

  const answersMap = Object.fromEntries(answers.map((a) => [a.questionCode, a]))
  const answeredCount = answers.length
  const totalCount = questions.length

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
      {/* ナビ */}
      <div>
        <Link href="/staff/answers" className="text-sm text-blue-600 hover:underline">
          ← 回答一覧に戻る
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">回答詳細</h1>
      </div>

      {/* 受診者情報 */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">受診者情報</h2>
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm">
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">UniqueKey</dt>
            <dd className="font-mono text-gray-900">{examinee.uniqueKey}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">氏名</dt>
            <dd className="font-medium text-gray-900">{examinee.name}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">性別</dt>
            <dd className="text-gray-900">{examinee.gender}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">生年月日</dt>
            <dd className="text-gray-900">{formatDate(examinee.birthDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">受診予定日</dt>
            <dd className="text-gray-900">{formatDate(examinee.examinationDate)}</dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs mb-0.5">回答状況</dt>
            <dd>
              <span
                className={`font-semibold ${
                  answeredCount === totalCount
                    ? 'text-green-600'
                    : answeredCount === 0
                      ? 'text-gray-400'
                      : 'text-amber-600'
                }`}
              >
                {answeredCount}/{totalCount}件
              </span>
            </dd>
          </div>
        </dl>
      </div>

      {/* 問診回答 */}
      {CATEGORIES.map((category) => {
        const qs = questions.filter((q) => q.category === category)
        if (qs.length === 0) return null
        return (
          <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
            </div>
            <div className="divide-y divide-gray-100">
              {qs.map((q) => {
                const ans = answersMap[q.questionCode]
                return (
                  <div
                    key={q.questionCode}
                    className="px-5 py-3 flex items-start justify-between gap-4"
                  >
                    <p className="text-sm text-gray-800 flex-1 leading-relaxed">{q.questionName}</p>
                    <div className="flex-shrink-0 text-right min-w-[80px]">
                      {ans ? (
                        <>
                          <span
                            className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              ans.answer === '1'
                                ? 'bg-blue-100 text-blue-700'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            {ANSWER_LABELS[ans.answer] ?? ans.answer}
                          </span>
                          <p className="text-xs text-gray-400 mt-1">{formatDateTime(ans.answeredAt)}</p>
                        </>
                      ) : (
                        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-400">
                          未回答
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
