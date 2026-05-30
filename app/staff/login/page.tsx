import { ClipboardList, AlertCircle } from "lucide-react"
import LoginForm from "./_components/LoginForm"

export const metadata = {
  title: "スタッフログイン | 特定健診WEB問診",
}

const REASON_MESSAGES: Record<string, string> = {
  timeout: "セッションがタイムアウトしました。再度ログインしてください。",
}

export default async function LoginPage(props: {
  searchParams: Promise<{ reason?: string }>
}) {
  const { reason } = await props.searchParams
  const message = reason ? REASON_MESSAGES[reason] : undefined

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "linear-gradient(to bottom, var(--color-primary), var(--color-accent))" }}
    >
      <div className="w-full max-w-sm">
        {/* ロゴ／タイトル */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-white/20 mb-4">
            <ClipboardList className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">スタッフログイン</h1>
          <p className="text-sm text-white/70 mt-1">特定健診WEB問診 管理画面</p>
        </div>

        {/* タイムアウト等のメッセージ */}
        {message && (
          <div className="mb-4 flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-warning">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* ログインカード */}
        <div className="bg-white rounded-2xl shadow-xl px-8 py-8">
          <LoginForm />
        </div>
      </div>
    </div>
  )
}
