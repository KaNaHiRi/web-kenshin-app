"use client"

import { QRCodeSVG } from "qrcode.react"

type Props = {
  name: string
  examinationDate: string | null
  uniqueKey: string
  qrUrl: string
  size?: number
}

export default function QrCard({
  name,
  examinationDate,
  uniqueKey,
  qrUrl,
  size = 150,
}: Props) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col items-center gap-3 shadow-sm break-inside-avoid">
      {/* ヘッダー */}
      <div className="text-center w-full">
        <p className="text-[10px] text-[var(--color-text-muted)] tracking-wide">特定健診WEB問診</p>
        <p className="text-base font-bold text-[var(--color-text)] mt-0.5 leading-tight">{name}</p>
        <p className="text-xs text-[var(--color-text-muted)] mt-1">
          受診予定日：{examinationDate ?? "未定"}
        </p>
      </div>

      {/* QRコード */}
      <QRCodeSVG value={qrUrl} size={size} level="M" includeMargin />

      {/* UniqueKey */}
      <div className="text-center">
        <p className="text-[10px] font-mono text-[var(--color-text-muted)]">{uniqueKey}</p>
      </div>
    </div>
  )
}
