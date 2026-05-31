import Image from "next/image"
import { auth } from "@/auth"
import StaffNavLinks from "./_components/StaffNavLinks"
import LogoutButton from "./_components/LogoutButton"

export default async function StaffLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* ヘッダー（ログインページでは非表示） */}
      {session && (
        <header className="bg-white border-b border-primary/20 sticky top-0 z-10 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between gap-4">
            {/* システム名 + ナビ */}
            <div className="flex items-center gap-4 min-w-0 flex-1 overflow-hidden">
              <div className="flex items-center gap-2 shrink-0">
                <Image src="/logo.png" alt="KaNaHiRi" width={36} height={36} className="rounded-lg" />
                <span className="text-sm font-bold text-primary whitespace-nowrap">
                  特定健診WEB問診
                </span>
              </div>
              <StaffNavLinks />
            </div>

            {/* ユーザー情報 */}
            <div className="flex items-center gap-3 shrink-0">
              <span className="text-sm text-[var(--color-text-muted)] hidden sm:block">
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
