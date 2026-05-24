'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'

// ─── Types ──────────────────────────────────────────────────────────────────

export type QuestionStat = {
  questionCode: string
  questionName: string
  category: string
  yesCount: number
  noCount: number
  totalAnswered: number
  yesRate: number
}

export type CategoryStat = {
  category: string
  yesCount: number
  totalAnswered: number
  yesRate: number
  questionCount: number
}

export type AnalyticsData = {
  year: number
  totalExaminees: number
  answeredExaminees: number
  responseRate: number
  questionStats: QuestionStat[]
  categoryStats: CategoryStat[]
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, string> = {
  既往歴: '#3b82f6',
  服薬: '#8b5cf6',
  生活習慣: '#10b981',
}
const FALLBACK_COLOR = '#6b7280'

const PIE_COLORS = {
  answered: '#10b981',
  unanswered: '#e5e7eb',
}

// ─── Custom Tooltip ──────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function QuestionTooltip(props: any) {
  if (!props.active || !props.payload?.length) return null
  const stat = props.payload[0].payload as QuestionStat
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-md text-sm max-w-xs">
      <p className="font-medium text-gray-900 mb-2 leading-snug">{stat.questionName}</p>
      <p className="text-emerald-600">
        はい&nbsp;:&nbsp;{stat.yesCount}人（{stat.yesRate}%）
      </p>
      <p className="text-gray-500">
        いいえ&nbsp;:&nbsp;{stat.noCount}人
      </p>
      <p className="text-gray-400 text-xs mt-1">回答総数 {stat.totalAnswered}人</p>
    </div>
  )
}

// ─── Stat Card ───────────────────────────────────────────────────────────────

type StatCardProps = {
  label: string
  value: number
  unit: string
  valueColor?: string
}

function StatCard({ label, value, unit, valueColor = 'text-gray-900' }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`mt-1 text-3xl font-bold ${valueColor}`}>
        {value.toLocaleString()}
        <span className="text-base font-normal text-gray-500 ml-1">{unit}</span>
      </p>
    </div>
  )
}

// ─── Main Component ──────────────────────────────────────────────────────────

export default function AnalyticsCharts({ data }: { data: AnalyticsData }) {
  const {
    totalExaminees,
    answeredExaminees,
    responseRate,
    questionStats,
    categoryStats,
  } = data

  const unanswered = totalExaminees - answeredExaminees

  const pieData = [
    { name: '回答済み', value: answeredExaminees },
    { name: '未回答', value: unanswered },
  ]

  // カテゴリ順序（seed定義順）
  const categoryOrder = ['既往歴', '服薬', '生活習慣']
  const categories = categoryOrder.filter((c) =>
    questionStats.some((q) => q.category === c)
  )

  const rateColor =
    responseRate >= 70
      ? 'text-emerald-600'
      : responseRate >= 40
      ? 'text-amber-500'
      : 'text-red-500'

  const noData = totalExaminees === 0

  return (
    <div className="space-y-5">
      {/* ── サマリーカード ─────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="受診者総数" value={totalExaminees} unit="人" />
        <StatCard
          label="回答済み"
          value={answeredExaminees}
          unit="人"
          valueColor="text-emerald-600"
        />
        <StatCard label="未回答" value={unanswered} unit="人" valueColor="text-gray-400" />
        <StatCard
          label="回答率"
          value={responseRate}
          unit="%"
          valueColor={rateColor}
        />
      </div>

      {noData ? (
        <div className="bg-white rounded-xl border border-gray-200 py-20 text-center text-gray-400">
          この年度のデータがありません
        </div>
      ) : (
        <>
          {/* ── 回答率 + カテゴリ別 ──────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            {/* ドーナッツチャート */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-1">回答率</h2>
              <div className="relative">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={68}
                      outerRadius={96}
                      dataKey="value"
                      startAngle={90}
                      endAngle={-270}
                      paddingAngle={unanswered === 0 ? 0 : 2}
                    >
                      <Cell fill={PIE_COLORS.answered} />
                      <Cell fill={PIE_COLORS.unanswered} />
                    </Pie>
                    <Tooltip
                      formatter={(v) => [`${Number(v ?? 0)}人`, '']}
                    />
                    <Legend
                      iconType="circle"
                      iconSize={8}
                      formatter={(value) => (
                        <span className="text-xs text-gray-600">{value}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* 中央テキスト */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-6">
                  <span className={`text-4xl font-bold ${rateColor}`}>{responseRate}%</span>
                  <span className="text-xs text-gray-400 mt-0.5">回答率</span>
                </div>
              </div>
            </div>

            {/* カテゴリ別「はい」回答率 */}
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-4">
                カテゴリ別「はい」回答率
              </h2>
              {categoryStats.length === 0 ? (
                <p className="text-gray-400 text-sm text-center py-16">データなし</p>
              ) : (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart
                    data={categoryStats}
                    margin={{ top: 4, right: 16, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                    <XAxis
                      dataKey="category"
                      tick={{ fontSize: 12, fill: '#374151' }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tickFormatter={(v) => `${v}%`}
                      tick={{ fontSize: 11, fill: '#9ca3af' }}
                      width={36}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      formatter={(v) => [`${Number(v ?? 0)}%`, 'はい回答率']}
                      cursor={{ fill: '#f9fafb' }}
                    />
                    <Bar dataKey="yesRate" radius={[6, 6, 0, 0]} maxBarSize={64}>
                      {categoryStats.map((entry, i) => (
                        <Cell
                          key={i}
                          fill={CATEGORY_COLORS[entry.category] ?? FALLBACK_COLOR}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
              {/* カテゴリ凡例 */}
              <div className="flex flex-wrap gap-3 mt-3">
                {categoryStats.map((cs) => (
                  <div key={cs.category} className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{
                        backgroundColor: CATEGORY_COLORS[cs.category] ?? FALLBACK_COLOR,
                      }}
                    />
                    {cs.category}（{cs.yesRate}%）
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── カテゴリ別・項目ごとの棒グラフ ─────────── */}
          {categories.map((cat) => {
            const catQuestions = questionStats.filter((q) => q.category === cat)
            const color = CATEGORY_COLORS[cat] ?? FALLBACK_COLOR
            const chartHeight = catQuestions.length * 40 + 24

            const allNoData = catQuestions.every((q) => q.totalAnswered === 0)

            return (
              <div key={cat} className="bg-white rounded-xl border border-gray-200 p-5">
                <div className="flex items-center gap-2 mb-5">
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <h2 className="text-sm font-semibold text-gray-700">
                    {cat}　―　項目別「はい」回答率
                  </h2>
                  <span className="ml-auto text-xs text-gray-400">
                    {catQuestions.length}項目
                  </span>
                </div>

                {allNoData ? (
                  <p className="text-gray-400 text-sm text-center py-6">
                    このカテゴリの回答データがありません
                  </p>
                ) : (
                  <ResponsiveContainer width="100%" height={chartHeight}>
                    <BarChart
                      data={catQuestions}
                      layout="vertical"
                      margin={{ top: 0, right: 52, left: 8, bottom: 0 }}
                    >
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="#f3f4f6"
                        horizontal={false}
                      />
                      <XAxis
                        type="number"
                        domain={[0, 100]}
                        tickFormatter={(v) => `${v}%`}
                        tick={{ fontSize: 11, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        type="category"
                        dataKey="questionName"
                        width={196}
                        tick={{ fontSize: 11, fill: '#374151' }}
                        tickFormatter={(v: string) =>
                          v.length > 17 ? v.slice(0, 17) + '…' : v
                        }
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<QuestionTooltip />} cursor={{ fill: '#f9fafb' }} />
                      <Bar
                        dataKey="yesRate"
                        fill={color}
                        radius={[0, 6, 6, 0]}
                        barSize={20}
                        label={{
                          position: 'right',
                          // LabelFormatter receives RenderableText (includes null)
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          formatter: (v: any) => `${v ?? 0}%`,
                          fontSize: 11,
                          fill: '#6b7280',
                        }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            )
          })}
        </>
      )}
    </div>
  )
}
