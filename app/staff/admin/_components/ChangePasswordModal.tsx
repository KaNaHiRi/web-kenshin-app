"use client"

import { useActionState, useEffect, useRef } from "react"
import { changePassword } from "../actions"

type Props = {
  targetId: number
  targetName: string
  isSelf: boolean
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function ChangePasswordModal({
  targetId,
  targetName,
  isSelf,
  onClose,
  onSuccess,
}: Props) {
  const [state, formAction, pending] = useActionState(changePassword, undefined)
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
        {/* header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              パスワード変更
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">{targetName}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* hidden: targetId */}
          <input type="hidden" name="targetId" value={targetId} />

          {/* エラー表示 */}
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* 現在のパスワード（自分自身の場合のみ） */}
          {isSelf && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                現在のパスワード
              </label>
              <input
                type="password"
                name="currentPassword"
                required
                autoComplete="current-password"
                placeholder="現在のパスワードを入力"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          )}

          {/* 新しいパスワード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード
            </label>
            <input
              type="password"
              name="newPassword"
              required
              autoComplete="new-password"
              placeholder="8文字以上"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* 新しいパスワード確認 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              新しいパスワード確認
            </label>
            <input
              type="password"
              name="confirmPassword"
              required
              autoComplete="new-password"
              placeholder="もう一度入力"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {pending ? "変更中…" : "変更する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
