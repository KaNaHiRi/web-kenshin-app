import Link from "next/link"
import { prisma } from "@/lib/prisma"
import QrCard from "./_components/QrCard"
import PrintButton from "./_components/PrintButton"
import YearFilter from "../answers/_components/YearFilter"
import { ArrowLeft, QrCode } from "lucide-react"

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://web-kenshin-app.vercel.app"

function formatDate(date: Date | null): string | null {
  if (!date) return null
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export const metadata = {
  title: "QRコード一括印刷 | 特定健診WEB問診",
}

export default async function QrBulkPage(props: {
  searchParams: Promise<{ year?: string }>
}) {
  const { year } = await props.searchParams

  const yearGroups = await prisma.examinee.groupBy({
    by: ["fiscalYear"],
    orderBy: { fiscalYear: "desc" },
  })
  const allYears = yearGroups.map((g) => g.fiscalYear)
  const currentYear = year
    ? parseInt(year, 10)
    : (allYears[0] ?? new Date().getFullYear())

  const examinees = await prisma.examinee.findMany({
    where: { fiscalYear: currentYear },
    orderBy: { name: "asc" },
  })

  return (
    <>
      {/* 印刷用スタイル */}
      <style>{`
        @media print {
          @page { margin: 10mm; size: A4; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-[var(--color-bg)] print:bg-white">
        {/* 操作バー（印刷時は非表示） */}
        <div className="print:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex items-center gap-4">
            <Link
              href="/staff/answers"
              className="inline-flex items-center gap-1.5 text-sm text-[var(--color-text-muted)] hover:text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              一覧に戻る
            </Link>
            {allYears.length > 0 && (
              <YearFilter years={allYears} currentYear={currentYear} />
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-text-muted)]">{examinees.length}件</span>
            <PrintButton label={`${examinees.length}件を印刷`} />
          </div>
        </div>

        {/* 印刷ヘッダー */}
        <div className="hidden print:block text-center pt-4 pb-2 mb-2 border-b border-gray-200">
          <p className="text-sm font-bold text-[var(--color-text)]">
            {currentYear}年度　特定健診WEB問診　QRコード一覧（{examinees.length}件）
          </p>
        </div>

        {/* コンテンツ */}
        {examinees.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-[var(--color-text-muted)] print:hidden">
            <QrCode className="w-10 h-10 opacity-40" />
            <p>{currentYear}年度の受診者データがありません</p>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto px-4 py-6 print:px-2 print:py-0">
            <div
              className="grid gap-4 print:gap-2"
              style={{
                gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
              }}
            >
              {examinees.map((e) => (
                <QrCard
                  key={e.id}
                  name={e.name}
                  examinationDate={formatDate(e.examinationDate)}
                  uniqueKey={e.uniqueKey}
                  qrUrl={`${APP_URL}/questionnaire/${e.uniqueKey}`}
                  size={130}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  )
}
