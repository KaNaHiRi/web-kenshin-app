import "server-only"
import { prisma } from "@/lib/prisma"

/** 同一IPから何回失敗したらロックするか */
const MAX_FAILURES = 5
/** 失敗カウントのウィンドウ（ミリ秒） */
const WINDOW_MS = 15 * 60 * 1000 // 15分

/**
 * 同IP の直近 WINDOW 内の失敗回数が上限に達しているか
 */
export async function isRateLimited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS)
  const count = await prisma.loginAttempt.count({
    where: {
      ipAddress: ip,
      success: false,
      attemptedAt: { gte: since },
    },
  })
  return count >= MAX_FAILURES
}

/**
 * ロック解除まで残り何分かを返す（ロックされていなければ 0）
 */
export async function getRemainingLockMinutes(ip: string): Promise<number> {
  const since = new Date(Date.now() - WINDOW_MS)
  const latest = await prisma.loginAttempt.findFirst({
    where: {
      ipAddress: ip,
      success: false,
      attemptedAt: { gte: since },
    },
    orderBy: { attemptedAt: "desc" },
  })
  if (!latest) return 0
  const unlockAt = latest.attemptedAt.getTime() + WINDOW_MS
  return Math.max(0, Math.ceil((unlockAt - Date.now()) / 60_000))
}

/**
 * ログイン試行を記録する
 */
export async function recordLoginAttempt(
  ip: string,
  username: string,
  success: boolean
): Promise<void> {
  await prisma.loginAttempt.create({
    data: { ipAddress: ip, username, success },
  })
}
