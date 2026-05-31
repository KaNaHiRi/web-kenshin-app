"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"

const NAV_ITEMS = [
  { href: "/staff/answers", label: "回答一覧" },
  { href: "/staff/import", label: "CSVインポート" },
  { href: "/staff/qr", label: "QR印刷" },
  { href: "/staff/analytics", label: "集計" },
  { href: "/staff/security", label: "セキュリティ" },
  { href: "/staff/questions", label: "問診項目" },
  { href: "/staff/admin", label: "スタッフ管理" },
]

export default function StaffNavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1 overflow-x-auto min-w-0">
      {NAV_ITEMS.map(({ href, label }) => {
        const isActive = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`whitespace-nowrap px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              isActive
                ? "bg-primary/10 text-primary"
                : "text-[var(--color-text-muted)] hover:text-primary hover:bg-primary/5"
            }`}
          >
            {label}
          </Link>
        )
      })}
    </nav>
  )
}
