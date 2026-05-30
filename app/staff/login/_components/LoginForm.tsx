"use client"

import { useActionState } from "react"
import { login, type LoginState } from "@/app/actions/auth"
import { AlertCircle } from "lucide-react"

export default function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(
    login,
    undefined
  )

  return (
    <form action={action} className="space-y-5">
      {state?.error && (
        <div className="flex items-start gap-3 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-warning">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{state.error}</span>
        </div>
      )}

      <div>
        <label htmlFor="username" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          ユーザー名
        </label>
        <input
          id="username"
          name="username"
          type="text"
          autoComplete="username"
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm placeholder-[var(--color-text-muted)] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
          placeholder="admin"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
          パスワード
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm shadow-sm placeholder-[var(--color-text-muted)] focus:border-primary focus:outline-none focus:ring-3 focus:ring-primary/20 transition-colors"
          placeholder="••••••••"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#0a3d73] focus:outline-none focus:ring-3 focus:ring-primary/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {pending ? "ログイン中…" : "ログイン"}
      </button>
    </form>
  )
}
