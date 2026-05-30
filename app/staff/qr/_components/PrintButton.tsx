"use client"

import { Printer } from "lucide-react"

type Props = {
  label?: string
}

export default function PrintButton({ label = "印刷" }: Props) {
  return (
    <button
      onClick={() => window.print()}
      className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#0a3d73] transition-colors print:hidden focus:outline-none focus:ring-3 focus:ring-primary/30"
    >
      <Printer className="w-4 h-4" />
      {label}
    </button>
  )
}
