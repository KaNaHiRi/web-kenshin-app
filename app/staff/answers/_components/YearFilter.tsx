'use client'

import { useRouter } from 'next/navigation'

type Props = {
  years: number[]
  currentYear: number
}

export default function YearFilter({ years, currentYear }: Props) {
  const router = useRouter()

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-600">年度</label>
      <select
        value={currentYear}
        onChange={(e) => router.push(`/staff/answers?year=${e.target.value}`)}
        className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {years.map((y) => (
          <option key={y} value={y}>
            {y}年度
          </option>
        ))}
      </select>
    </div>
  )
}
