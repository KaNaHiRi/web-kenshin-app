import { prisma } from '@/lib/prisma'
import AnalyticsYearFilter from './_components/AnalyticsYearFilter'
import AnalyticsCharts, {
  type AnalyticsData,
} from './_components/AnalyticsCharts'

export const metadata = {
  title: '回答集計 | 特定健診WEB問診',
}

export default async function AnalyticsPage(props: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year } = await props.searchParams

  // ── 年度一覧 ─────────────────────────────────────────
  const yearGroups = await prisma.examinee.groupBy({
    by: ['fiscalYear'],
    orderBy: { fiscalYear: 'desc' },
  })
  const allYears = yearGroups.map((g) => g.fiscalYear)
  const currentYear =
    year ? parseInt(year, 10) : (allYears[0] ?? new Date().getFullYear())

  // ── 並列データ取得 ────────────────────────────────────
  const [totalExaminees, answeredExaminees, questions, rawAnswerStats] =
    await Promise.all([
      prisma.examinee.count({
        where: { fiscalYear: currentYear },
      }),
      prisma.examinee.count({
        where: {
          fiscalYear: currentYear,
          answers: { some: {} },
        },
      }),
      prisma.questionMaster.findMany({
        where: { isActive: 1 },
        orderBy: { displayOrder: 'asc' },
      }),
      prisma.questionnaireAnswer.groupBy({
        by: ['questionCode', 'answer'],
        where: {
          examinee: { fiscalYear: currentYear },
        },
        _count: { answer: true },
      }),
    ])

  // ── 項目別集計 ────────────────────────────────────────
  const questionStats = questions.map((q) => {
    const yes = rawAnswerStats.find(
      (s) => s.questionCode === q.questionCode && s.answer === '1'
    )
    const no = rawAnswerStats.find(
      (s) => s.questionCode === q.questionCode && s.answer === '2'
    )
    const yesCount = yes?._count.answer ?? 0
    const noCount = no?._count.answer ?? 0
    const totalAnswered = yesCount + noCount
    const yesRate =
      totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0

    return {
      questionCode: q.questionCode,
      questionName: q.questionName,
      category: q.category,
      yesCount,
      noCount,
      totalAnswered,
      yesRate,
    }
  })

  // ── カテゴリ別集計 ────────────────────────────────────
  const categoryOrder = ['既往歴', '服薬', '生活習慣']
  const categoriesInData = [
    ...new Set(questions.map((q) => q.category)),
  ].sort(
    (a, b) => categoryOrder.indexOf(a) - categoryOrder.indexOf(b)
  )

  const categoryStats = categoriesInData.map((cat) => {
    const catStats = questionStats.filter((q) => q.category === cat)
    const yesCount = catStats.reduce((s, q) => s + q.yesCount, 0)
    const totalAnswered = catStats.reduce((s, q) => s + q.totalAnswered, 0)
    const yesRate =
      totalAnswered > 0 ? Math.round((yesCount / totalAnswered) * 100) : 0
    return {
      category: cat,
      yesCount,
      totalAnswered,
      yesRate,
      questionCount: catStats.length,
    }
  })

  const analyticsData: AnalyticsData = {
    year: currentYear,
    totalExaminees,
    answeredExaminees,
    responseRate:
      totalExaminees > 0
        ? Math.round((answeredExaminees / totalExaminees) * 100)
        : 0,
    questionStats,
    categoryStats,
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* ── ページヘッダー ──────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">回答集計</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">
            {currentYear}年度&nbsp;·&nbsp;有効問診項目 {questions.length}件
          </p>
        </div>
        {allYears.length > 0 && (
          <AnalyticsYearFilter years={allYears} currentYear={currentYear} />
        )}
      </div>

      {/* ── グラフエリア ─────────────────────────────── */}
      <AnalyticsCharts data={analyticsData} />
    </div>
  )
}
