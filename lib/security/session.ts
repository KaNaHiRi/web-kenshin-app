import { createHmac, timingSafeEqual } from "node:crypto"

/** アイドルタイムアウト（ミリ秒） */
export const IDLE_TIMEOUT_MS = 30 * 60 * 1000 // 30分

/** アクティビティCookie名 */
export const ACTIVITY_COOKIE = "kenshin_activity"

/** next-auth の JWT Cookie 名（開発/本番どちらも削除できるよう両方持つ） */
export const SESSION_COOKIE_NAMES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
]

function secret(): string {
  return (
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "fallback-dev-secret"
  )
}

/** タイムスタンプ（ms）を HMAC 署名して Cookie 値を生成 */
export function makeActivityCookie(): string {
  const ts = String(Date.now())
  const sig = createHmac("sha256", secret())
    .update(ts)
    .digest("base64url")
  return `${ts}.${sig}`
}

/**
 * Cookie 値を検証し、アイドル期限切れかを返す。
 * - Cookie が存在しない（初回リクエスト）→ false（期限切れでない）
 * - 署名が不正                            → true（期限切れ扱い）
 * - タイムスタンプが古い                  → true
 */
export function isIdleExpired(cookieValue: string | undefined): boolean {
  // Cookie なし = ログイン直後の初回リクエスト → タイムアウトしていない
  if (!cookieValue) return false

  const dot = cookieValue.lastIndexOf(".")
  if (dot === -1) return true // 不正な形式

  const tsStr = cookieValue.slice(0, dot)
  const sig = cookieValue.slice(dot + 1)
  const ts = parseInt(tsStr, 10)
  if (isNaN(ts)) return true

  // 署名を定数時間で検証（タイミング攻撃対策）
  const expected = createHmac("sha256", secret())
    .update(tsStr)
    .digest("base64url")

  try {
    const a = Buffer.from(sig)
    const b = Buffer.from(expected)
    if (a.length !== b.length) return true
    if (!timingSafeEqual(a, b)) return true
  } catch {
    return true
  }

  return Date.now() - ts > IDLE_TIMEOUT_MS
}
