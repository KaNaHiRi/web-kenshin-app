"use client"

import { useState } from "react"
import { Plus, KeyRound, Trash2, CheckCircle2 } from "lucide-react"
import { deleteStaff } from "../actions"
import ChangePasswordModal from "./ChangePasswordModal"
import AddStaffModal from "./AddStaffModal"

type StaffRow = {
  id: number
  username: string
  displayName: string
  createdAt: Date
}

type Props = {
  staffList: StaffRow[]
  currentUsername: string
  totalCount: number
}

function fmt(date: Date): string {
  return `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, "0")}/${String(date.getDate()).padStart(2, "0")}`
}

export default function StaffTable({
  staffList,
  currentUsername,
  totalCount,
}: Props) {
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [changePwTarget, setChangePwTarget] = useState<StaffRow | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)

  function showToast(type: "success" | "error", message: string) {
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  async function handleDelete(staff: StaffRow) {
    if (confirmDeleteId !== staff.id) {
      setConfirmDeleteId(staff.id)
      return
    }
    setConfirmDeleteId(null)
    setDeletingId(staff.id)
    try {
      const result = await deleteStaff(staff.id)
      if (result?.error) {
        showToast("error", result.error)
      } else if (result?.success) {
        showToast("success", result.success)
      }
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div>
      {/* トースト通知 */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-lg text-sm font-medium transition-all flex items-center gap-2 ${
            toast.type === "success"
              ? "bg-success text-white"
              : "bg-warning text-white"
          }`}
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary">スタッフ管理</h1>
          <p className="text-sm text-[var(--color-text-muted)] mt-1">{totalCount}名登録中</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-[#0a3d73] transition-colors shadow-sm focus:outline-none focus:ring-3 focus:ring-primary/30"
        >
          <Plus className="w-4 h-4" />
          スタッフ追加
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-primary/5 border-b border-primary/10">
            <tr>
              {["表示名", "ユーザー名", "登録日", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-semibold text-primary uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-[var(--color-text-muted)]">
                  スタッフが登録されていません
                </td>
              </tr>
            ) : (
              staffList.map((staff) => {
                const isSelf = staff.username === currentUsername
                const isDeleting = deletingId === staff.id
                const isConfirming = confirmDeleteId === staff.id

                return (
                  <tr key={staff.id} className="hover:bg-primary/5 transition-colors">
                    {/* 表示名 */}
                    <td className="px-5 py-3.5 font-medium text-[var(--color-text)] whitespace-nowrap">
                      {staff.displayName}
                      {isSelf && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-lg text-xs font-medium bg-primary/10 text-primary">
                          自分
                        </span>
                      )}
                    </td>

                    {/* ユーザー名 */}
                    <td className="px-5 py-3.5 font-mono text-xs text-[var(--color-text-muted)]">
                      {staff.username}
                    </td>

                    {/* 登録日 */}
                    <td className="px-5 py-3.5 text-[var(--color-text-muted)] text-xs whitespace-nowrap">
                      {fmt(staff.createdAt)}
                    </td>

                    {/* アクション */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2 justify-end">
                        {/* パスワード変更 */}
                        <button
                          onClick={() => setChangePwTarget(staff)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors"
                        >
                          <KeyRound className="w-3.5 h-3.5" />
                          パスワード変更
                        </button>

                        {/* 削除 */}
                        {!isSelf && (
                          isConfirming ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-[var(--color-text-muted)]">本当に削除しますか？</span>
                              <button
                                onClick={() => handleDelete(staff)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-warning hover:bg-[#d97706] disabled:opacity-50 rounded-lg transition-colors"
                              >
                                {isDeleting ? "削除中…" : "はい"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-[var(--color-text-muted)] bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                いいえ
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(staff)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-warning bg-orange-50 hover:bg-orange-100 disabled:opacity-50 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              削除
                            </button>
                          )
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* モーダル: スタッフ追加 */}
      {showAddModal && (
        <AddStaffModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(msg) => showToast("success", msg)}
        />
      )}

      {/* モーダル: パスワード変更 */}
      {changePwTarget && (
        <ChangePasswordModal
          targetId={changePwTarget.id}
          targetName={changePwTarget.displayName}
          isSelf={changePwTarget.username === currentUsername}
          onClose={() => setChangePwTarget(null)}
          onSuccess={(msg) => showToast("success", msg)}
        />
      )}
    </div>
  )
}
