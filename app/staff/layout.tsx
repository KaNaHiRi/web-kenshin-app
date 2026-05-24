import Link from "next/link"
import { auth } from "@/auth"
import LogoutButton from "./_components/LogoutButton"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー（ログインページでは非表示） */}
      {session && (
        <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
            {/* ナビゲーション */}
            <nav className="flex items-center gap-6">
              <span className="text-sm font-semibold text-gray-900">
                特定健診WEB問診
              </span>
              <Link
                href="/staff/answers"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                回答一覧
              </Link>
              <Link
                href="/staff/import"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                CSVインポート
              </Link>
              <Link
                href="/staff/qr"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                QR印刷
              </Link>
              <Link
                href="/staff/analytics"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                集計
              </Link>
              <Link
                href="/staff/security"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                セキュリティ
              </Link>
              <Link
                href="/staff/questions"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                問診項目
              </Link>
              <Link
                href="/staff/admin"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                スタッフ管理
              </Link>
            </nav>

            {/* ユーザー情報 */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {session.user?.name ?? "スタッフ"}
              </span>
              <LogoutButton />
            </div>
          </div>
        </header>
      )}

      <main>{children}</main>
    </div>
  )
}
