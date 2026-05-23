// Next.js 16: middleware は proxy.ts にリネームされた
// https://nextjs.org/docs/app/api-reference/file-conventions/proxy
import { auth } from "@/auth"
import { NextResponse } from "next/server"

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl
  const isLoginPage = pathname === "/staff/login"

  // ログインページ: 認証済みなら /staff/answers へリダイレクト
  if (isLoginPage) {
    if (req.auth) {
      return NextResponse.redirect(new URL("/staff/answers", req.url))
    }
    return NextResponse.next()
  }

  // その他の /staff/* ルート: 未認証なら /staff/login へ
  if (!req.auth) {
    const loginUrl = new URL("/staff/login", req.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }
})

export const config = {
  matcher: ["/staff/:path*"],
}
