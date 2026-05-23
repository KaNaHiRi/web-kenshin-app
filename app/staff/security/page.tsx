import { prisma } from "@/lib/prisma"

export const metadata = {
  title: "セキュリティログ | 特定健診WEB問診",
}

function fmt(date: Date): string {
  return (
    `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")} ` +
    `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}:${String(date.getSeconds()).padStart(2, "0")}`
  )
}

const WINDOW_MS = 15 * 60 * 1000
const MAX_FAILURES = 5

export default async function SecurityPage() {
  const [recentAttempts, recentAccess] = await Promise.all([
    prisma.loginAttempt.findMany({
      orderBy: { attemptedAt: "desc" },
      take: 30,
    }),
    prisma.accessLog.findMany({
      orderBy: { accessedAt: "desc" },
      take: 50,
    }),
  ])

  // 現在ロック中のIPを計算
  const since = new Date(Date.now() - WINDOW_MS)
  const failGroups = await prisma.loginAttempt.groupBy({
    by: ["ipAddress"],
    where: { success: false, attemptedAt: { gte: since } },
    _count: { id: true },
  })
  const lockedIps = failGroups
    .filter((g) => g._count.id >= MAX_FAILURES)
    .map((g) => g.ipAddress)

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">セキュリティログ</h1>
        <p className="text-sm text-gray-500 mt-1">
          ログイン試行履歴・アクセスログ・ロック状況を確認できます
        </p>
      </div>

      {/* ロック中IP */}
      {lockedIps.length > 0 && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-5 py-4">
          <h2 className="text-sm font-semibold text-red-700 mb-2">
            🔒 現在ブロック中のIP（直近15分以内に5回以上失敗）
          </h2>
          <div className="flex flex-wrap gap-2">
            {lockedIps.map((ip) => (
              <span
                key={ip}
                className="inline-block font-mono text-xs bg-red-100 text-red-800 px-2 py-1 rounded"
              >
                {ip}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ログイン試行ログ */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          ログイン試行ログ（直近30件）
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["日時", "IPアドレス", "ユーザー名", "結果"].map((h) => (
                  <th
                    key={h}
                    className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAttempts.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    ログがありません
                  </td>
                </tr>
              ) : (
                recentAttempts.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {fmt(a.attemptedAt)}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">
                      {a.ipAddress}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700">{a.username}</td>
                    <td className="px-4 py-2.5">
                      {a.success ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          成功
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                          失敗
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* アクセスログ */}
      <section>
        <h2 className="text-base font-semibold text-gray-800 mb-3">
          アクセスログ（直近50件）
        </h2>
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {["日時", "ユーザー", "IPアドレス", "メソッド", "パス"].map(
                  (h) => (
                    <th
                      key={h}
                      className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentAccess.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-gray-400 text-sm"
                  >
                    ログがありません
                  </td>
                </tr>
              ) : (
                recentAccess.map((l) => (
                  <tr key={l.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2.5 text-gray-500 text-xs whitespace-nowrap">
                      {fmt(l.accessedAt)}
                    </td>
                    <td className="px-4 py-2.5 text-gray-700 text-xs">
                      {l.username ?? "—"}
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-500">
                      {l.ipAddress}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="font-mono text-xs text-blue-600">
                        {l.method}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600 max-w-xs truncate">
                      {l.path}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
