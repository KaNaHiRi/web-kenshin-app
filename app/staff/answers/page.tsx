import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import YearFilter from './_components/YearFilter'

function formatDate(date: Date | null): string {
  if (!date) return '—'
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`
}

function formatDateTime(date: Date): string {
  return (
    `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')} ` +
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
  )
}

type AnswerStatus = 'none' | 'partial' | 'complete'

function StatusBadge({ status, count, total }: { status: AnswerStatus; count: number; total: number }) {
  if (status === 'none') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
        未回答
      </span>
    )
  }
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        回答済み
      </span>
    )
  }
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
      一部回答 {count}/{total}
    </span>
  )
}

export default async function AnswersPage(props: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year } = await props.searchParams

  const [yearGroups, totalQuestions] = await Promise.all([
    prisma.examinee.groupBy({ by: ['fiscalYear'], orderBy: { fiscalYear: 'desc' } }),
    prisma.questionMaster.count({ where: { isActive: 1 } }),
  ])

  const allYears = yearGroups.map((g) => g.fiscalYear)
  const currentYear = year ? parseInt(year, 10) : (allYears[0] ?? new Date().getFullYear())

  const examinees = await prisma.examinee.findMany({
    where: { fiscalYear: currentYear },
    include: {
      _count: { select: { answers: true } },
      answers: {
        orderBy: { answeredAt: 'desc' },
        take: 1,
        select: { answeredAt: true },
      },
    },
    orderBy: { importedAt: 'desc' },
  })

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">問診回答一覧</h1>
          <p className="text-sm text-gray-500 mt-1">{currentYear}年度 · {examinees.length}件</p>
        </div>
        <div className="flex items-center gap-3">
          {allYears.length > 0 && (
            <YearFilter years={allYears} currentYear={currentYear} />
          )}
          <Link
            href={`/staff/qr?year=${currentYear}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-gray-700 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
              />
            </svg>
            QR一括印刷
          </Link>
          <a
            href={`/api/export/csv?year=${currentYear}`}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
          >
            CSV出力
          </a>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['UniqueKey', '氏名', '性別', '生年月日', '受診予定日', '回答状況', '回答日時', '', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {examinees.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
                  {currentYear}年度の受診者データがありません
                </td>
              </tr>
            ) : (
              examinees.map((e) => {
                const count = e._count.answers
                const latestAnsweredAt = e.answers[0]?.answeredAt ?? null
                const status: AnswerStatus =
                  count === 0 ? 'none' : count >= totalQuestions ? 'complete' : 'partial'

                return (
                  <tr key={e.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500">{e.uniqueKey}</td>
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">{e.name}</td>
                    <td className="px-4 py-3 text-gray-600">{e.gender}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(e.birthDate)}</td>
                    <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{formatDate(e.examinationDate)}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={status} count={count} total={totalQuestions} />
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                      {latestAnsweredAt ? formatDateTime(latestAnsweredAt) : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/staff/answers/${e.uniqueKey}`}
                        className="text-blue-600 hover:text-blue-800 text-xs font-medium hover:underline whitespace-nowrap"
                      >
                        詳細 →
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/staff/qr/${e.uniqueKey}`}
                        className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-700 text-xs font-medium hover:underline whitespace-nowrap"
                        title="QRコード印刷"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                          />
                        </svg>
                        QR
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
