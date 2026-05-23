import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import QrCard from "../_components/QrCard"
import PrintButton from "../_components/PrintButton"

const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://web-kenshin-app.vercel.app"

function formatDate(date: Date | null): string | null {
  if (!date) return null
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export async function generateMetadata(props: {
  params: Promise<{ uniqueKey: string }>
}) {
  const { uniqueKey } = await props.params
  const examinee = await prisma.examinee.findUnique({ where: { uniqueKey } })
  return {
    title: examinee ? `QRコード：${examinee.name}` : "QRコード",
  }
}

export default async function QrPrintPage(props: {
  params: Promise<{ uniqueKey: string }>
}) {
  const { uniqueKey } = await props.params
  const examinee = await prisma.examinee.findUnique({ where: { uniqueKey } })
  if (!examinee) notFound()

  const qrUrl = `${APP_URL}/questionnaire/${uniqueKey}`

  return (
    <>
      {/* 印刷用スタイル */}
      <style>{`
        @media print {
          @page { margin: 15mm; }
          body { background: white !important; }
        }
      `}</style>

      <div className="min-h-screen bg-gray-50 print:bg-white">
        {/* 操作バー（印刷時は非��示） */}
        <div className="print:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <Link
            href="/staff/answers"
            className="text-sm text-blue-600 hover:underline"
          >
            ← 一覧に戻る
          </Link>
          <PrintButton />
        </div>

        {/* QRカード（印刷コンテンツ） */}
        <div className="flex items-center justify-center py-12 px-4 print:py-0 print:px-0 print:block">
          <div className="w-64 print:w-auto print:mx-auto print:pt-4">
            <QrCard
              name={examinee.name}
              examinationDate={formatDate(examinee.examinationDate)}
              uniqueKey={uniqueKey}
              qrUrl={qrUrl}
              size={200}
            />
          </div>
        </div>
      </div>
    </>
  )
}
