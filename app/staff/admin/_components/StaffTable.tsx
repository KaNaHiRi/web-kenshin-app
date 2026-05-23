"use client"

import { useState } from "react"
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
          className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-lg text-sm font-medium transition-all ${
            toast.type === "success"
              ? "bg-green-600 text-white"
              : "bg-red-600 text-white"
          }`}
        >
          {toast.type === "success" ? "✓ " : "✕ "}
          {toast.message}
        </div>
      )}

      {/* ヘッダー */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">スタッフ管理</h1>
          <p className="text-sm text-gray-500 mt-1">{totalCount}名登録中</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          スタッフ追加
        </button>
      </div>

      {/* テーブル */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {["表示名", "ユーザー名", "登録日", ""].map((h) => (
                <th
                  key={h}
                  className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {staffList.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-5 py-10 text-center text-gray-400">
                  スタッフが登録されていません
                </td>
              </tr>
            ) : (
              staffList.map((staff) => {
                const isSelf = staff.username === currentUsername
                const isDeleting = deletingId === staff.id
                const isConfirming = confirmDeleteId === staff.id

                return (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    {/* 表示名 */}
                    <td className="px-5 py-3.5 font-medium text-gray-900 whitespace-nowrap">
                      {staff.displayName}
                      {isSelf && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-700">
                          自分
                        </span>
                      )}
                    </td>

                    {/* ユーザー名 */}
                    <td className="px-5 py-3.5 font-mono text-xs text-gray-500">
                      {staff.username}
                    </td>

                    {/* 登録日 */}
                    <td className="px-5 py-3.5 text-gray-500 text-xs whitespace-nowrap">
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
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                            />
                          </svg>
                          パスワード変更
                        </button>

                        {/* 削除 */}
                        {!isSelf && (
                          isConfirming ? (
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs text-gray-600">本当に削除しますか？</span>
                              <button
                                onClick={() => handleDelete(staff)}
                                disabled={isDeleting}
                                className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                {isDeleting ? "削除中…" : "はい"}
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                いいえ
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => handleDelete(staff)}
                              disabled={isDeleting}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50 rounded-lg transition-colors"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
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
