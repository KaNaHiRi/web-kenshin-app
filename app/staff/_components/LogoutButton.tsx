"use client"

import { logout } from "@/app/actions/auth"

export default function LogoutButton() {
  return (
    <form action={logout}>
      <button
        type="submit"
        className="text-xs font-medium text-[var(--color-text-muted)] border border-gray-200 rounded-lg px-3 py-1.5 hover:text-primary hover:border-primary/40 transition-colors"
      >
        ログアウト
      </button>
    </form>
  )
}
