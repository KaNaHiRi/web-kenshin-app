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
    <div className="bg-white border border-gray-300 rounded-lg p-5 flex flex-col items-center gap-3 break-inside-avoid">
      {/* ヘッダー */}
      <div className="text-center w-full">
        <p className="text-[10px] text-gray-400 tracking-wide">特定健診WEB問診</p>
        <p className="text-base font-bold text-gray-900 mt-0.5 leading-tight">{name}</p>
        <p className="text-xs text-gray-500 mt-1">
          受診予定日：{examinationDate ?? "未定"}
        </p>
      </div>

      {/* QRコード */}
      <QRCodeSVG value={qrUrl} size={size} level="M" includeMargin />

      {/* UniqueKey + URL */}
      <div className="text-center">
        <p className="text-[10px] font-mono text-gray-400">{uniqueKey}</p>
      </div>
    </div>
  )
}
