"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"
import { headers } from "next/headers"
import {
  isRateLimited,
  getRemainingLockMinutes,
  recordLoginAttempt,
} from "@/lib/security/rate-limit"

export type LoginState =
  | {
      error?: string
    }
  | undefined

/** リクエストヘッダーからクライアントIPを取得 */
async function getIp(): Promise<string> {
  const h = await headers()
  return (
    h.get("x-forwarded-for")?.split(",")[0].trim() ??
    h.get("x-real-ip") ??
    "127.0.0.1"
  )
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const ip = await getIp()
  const username = (formData.get("username") as string | null) ?? ""

  // ─── レート制限チェック ──────────────────────────────────────
  if (await isRateLimited(ip)) {
    const remaining = await getRemainingLockMinutes(ip)
    return {
      error: `ログイン試行回数の上限（5回）に達しました。${remaining}分後に再試行してください。`,
    }
  }

  // ─── 認証 ───────────────────────────────────────────────────
  try {
    await signIn("credentials", {
      username,
      password: formData.get("password"),
      redirectTo: "/staff/answers",
    })
    // redirectTo が設定されている場合、成功時は throw redirect されるため
    // この行には通常到達しないが、念のため記録する
    void recordLoginAttempt(ip, username, true)
  } catch (e) {
    if (e instanceof AuthError) {
      // ログイン失敗を記録（fire-and-forget）
      void recordLoginAttempt(ip, username, false)
      switch (e.type) {
        case "CredentialsSignin":
          return { error: "ユーザー名またはパスワードが正しくありません" }
        default:
          return { error: "ログインに失敗しました。もう一度お試しください" }
      }
    }
    // redirect() による例外 → 成功としてログ記録してから再throw
    void recordLoginAttempt(ip, username, true)
    throw e
  }
}

export async function logout() {
  await signOut({ redirectTo: "/staff/login" })
}
