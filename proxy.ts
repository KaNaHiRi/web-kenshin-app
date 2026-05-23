// Next.js 16: middleware は proxy.ts にリネームされた
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { auth } from "@/auth"
import { NextResponse, after } from "next/server"
import {
  ACTIVITY_COOKIE,
  IDLE_TIMEOUT_MS,
  SESSION_COOKIE_NAMES,
  isIdleExpired,
  makeActivityCookie,
} from "@/lib/security/session"
import { getClientIp, writeAccessLog } from "@/lib/security/access-log"

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname === "/staff/login"
  const isAuthenticated = !!req.auth

  // ─── ログインページ ─────────────────────────────────────────
  if (isLoginPage) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/staff/answers", req.url))
    }
    return NextResponse.next()
  }

  // ─── 未認証 → ログインへ ────────────────────────────────────
  if (!isAuthenticated) {
    const loginUrl = new URL("/staff/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ─── アイドルタイムアウト確認 ───────────────────────────────
  const activityValue = req.cookies.get(ACTIVITY_COOKIE)?.value
  if (isIdleExpired(activityValue)) {
    // セッションCookieとアクティビティCookieを削除してログインへ
    const res = NextResponse.redirect(
      new URL("/staff/login?reason=timeout", req.url)
    )
    SESSION_COOKIE_NAMES.forEach((name) => res.cookies.delete(name))
    res.cookies.delete(ACTIVITY_COOKIE)
    return res
  }

  // ─── 認証済みリクエスト ─────────────────────────────────────
  const response = NextResponse.next()

  // アクティビティCookieを更新（スライディングウィンドウ）
  response.cookies.set(ACTIVITY_COOKIE, makeActivityCookie(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    // アイドルタイムアウトより少し長めに設定
    maxAge: Math.floor(IDLE_TIMEOUT_MS / 1000) + 120,
  })

  // アクセスログ（レスポンス後に非同期書き込み、アプリをブロックしない）
  // HTMLページ要求のみ記録（RSCプリフェッチ等は除外）
  const isHtmlRequest =
    req.headers.get("accept")?.includes("text/html") ?? false
  if (isHtmlRequest) {
    const username = req.auth?.user?.email ?? null
    const ip = getClientIp(req)
    const method = req.method
    after(async () => {
      await writeAccessLog(username, ip, method, pathname)
    })
  }

  return response
})

export const config = {
  matcher: ["/staff/:path*"],
}
