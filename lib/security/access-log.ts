import "server-only"
import { prisma } from "@/lib/prisma"
import type { NextRequest } from "next/server"

/** リクエストからクライアントIPを取得 */
export function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ??
    req.headers.get("x-real-ip") ??
    "127.0.0.1"
  )
}

/** アクセスログをDBに書き込む（例外は握り潰してアプリを止めない） */
export async function writeAccessLog(
  username: string | null,
  ip: string,
  method: string,
  path: string
): Promise<void> {
  try {
    await prisma.accessLog.create({
      data: { username, ipAddress: ip, method, path },
    })
  } catch (err) {
    console.error("[AccessLog] write failed:", err)
  }
}
