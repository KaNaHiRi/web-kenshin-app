"use client"

import { useActionState, useEffect, useRef } from "react"
import { X, AlertCircle } from "lucide-react"
import { addStaff } from "../actions"

type Props = {
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function AddStaffModal({ onClose, onSuccess }: Props) {
  const [state, formAction, pending] = useActionState(addStaff, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const prevSuccessRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (state?.success && state.success !== prevSuccessRef.current) {
      prevSuccessRef.current = state.success
      formRef.current?.reset()
      onSuccess(state.success)
      onClose()
    }
  }, [state?.success, onClose, onSuccess])

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-colors"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[var(--color-text)]">スタッフ追加</h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-primary transition-colors rounded-lg p-1"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="px-6 py-5 space-y-4">
          {/* エラー表示 */}
          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-warning">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* ユーザー名 */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              ユーザー名
              <span className="ml-1 text-xs text-[var(--color-text-muted)]">（ログインID）</span>
            </label>
            <input
              type="text"
              name="username"
              required
              autoComplete="off"
              placeholder="例: staff01"
              className={inputClass}
            />
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              半角英数字・アンダースコア、3〜20文字
            </p>
          </div>

          {/* 表示名 */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              表示名
            </label>
            <input
              type="text"
              name="displayName"
              required
              placeholder="例: 山田 太郎"
              className={inputClass}
            />
          </div>

          {/* パスワード */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              パスワード
            </label>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              placeholder="8文字以上"
              className={inputClass}
            />
          </div>

          {/* パスワード確認 */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              パスワード確認
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="もう一度入力"
              className={inputClass}
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#0a3d73] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors focus:outline-none focus:ring-3 focus:ring-primary/30"
            >
              {pending ? "追加中…" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
