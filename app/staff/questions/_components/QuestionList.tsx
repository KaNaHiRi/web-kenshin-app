"use client"

import { useState, useTransition } from "react"
import { toggleActive, deleteQuestion, moveOrder } from "../actions"
import QuestionModal from "./QuestionModal"

type Question = {
  id: number
  questionCode: string
  questionName: string
  category: string
  displayOrder: number
  isActive: number
}

type Props = {
  questions: Question[]
  answerCountMap: Record<string, number>
}

// ─── カテゴリ別にグループ化（displayOrder の小さい順） ────────────────────────

function groupByCategory(questions: Question[]): [string, Question[]][] {
  const map = new Map<string, Question[]>()
  for (const q of questions) {
    if (!map.has(q.category)) map.set(q.category, [])
    map.get(q.category)!.push(q)
  }
  // カテゴリの順序 = そのカテゴリ内で最小の displayOrder
  const entries = [...map.entries()].sort((a, b) => {
    const minA = Math.min(...a[1].map((q) => q.displayOrder))
    const minB = Math.min(...b[1].map((q) => q.displayOrder))
    return minA - minB
  })
  return entries
}

export default function QuestionList({ questions, answerCountMap }: Props) {
  const [toast, setToast] = useState<{
    type: "success" | "error"
    message: string
  } | null>(null)
  const [modalTarget, setModalTarget] = useState<Question | null | "new">(undefined as unknown as null)
  const [showModal, setShowModal] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null)
  const [isPending, startTransition] = useTransition()

  const existingCategories = [...new Set(questions.map((q) => q.category))]
  const grouped = groupByCategory(questions)
  const totalActive = questions.filter((q) => q.isActive === 1).length

  function showToast(type: "success" | "error", message: string) {
    if (!message) return
    setToast({ type, message })
    setTimeout(() => setToast(null), 4000)
  }

  function openAdd() {
    setModalTarget(null) // null = 追加モード
    setShowModal(true)
  }

  function openEdit(q: Question) {
    setModalTarget(q)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
  }

  function handleToggle(id: number) {
    startTransition(async () => {
      const result = await toggleActive(id)
      if (result?.error) showToast("error", result.error)
      else if (result?.success) showToast("success", result.success)
    })
  }

  function handleDelete(q: Question) {
    if (confirmDeleteId !== q.id) {
      setConfirmDeleteId(q.id)
      return
    }
    setConfirmDeleteId(null)
    startTransition(async () => {
      const result = await deleteQuestion(q.id)
      if (result?.error) showToast("error", result.error)
      else if (result?.success) showToast("success", result.success)
    })
  }

  function handleMove(id: number, direction: "up" | "down") {
    startTransition(async () => {
      const result = await moveOrder(id, direction)
      if (result?.error) showToast("error", result.error)
    })
  }

  return (
    <div>
      {/* トースト */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 rounded-xl px-5 py-3 shadow-lg text-sm font-medium max-w-sm ${
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
          <h1 className="text-2xl font-bold text-gray-900">問診項目管理</h1>
          <p className="text-sm text-gray-500 mt-1">
            全 {questions.length} 項目（有効 {totalActive} 項目 ·{" "}
            {existingCategories.length} カテゴリ）
          </p>
        </div>
        <button
          onClick={openAdd}
          disabled={isPending}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          項目を追加
        </button>
      </div>

      {/* カテゴリ別グループ */}
      <div className="space-y-6">
        {grouped.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 px-6 py-12 text-center text-gray-400">
            問診項目がありません。「項目を追加」から登録してください。
          </div>
        )}

        {grouped.map(([category, items]) => (
          <section key={category}>
            {/* カテゴリヘッダー */}
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
              <span className="text-xs text-gray-400">{items.length} 項目</span>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="w-8 px-3 py-2.5 text-left text-xs font-medium text-gray-400">
                      順
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      コード
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      質問名
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      回答数
                    </th>
                    <th className="px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      状態
                    </th>
                    <th className="px-4 py-2.5 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {items.map((q, idx) => {
                    const answerCount = answerCountMap[q.questionCode] ?? 0
                    const isFirst = idx === 0
                    const isLast = idx === items.length - 1
                    const isConfirming = confirmDeleteId === q.id

                    return (
                      <tr
                        key={q.id}
                        className={`transition-colors ${
                          q.isActive === 0
                            ? "bg-gray-50 opacity-60"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {/* 並び順ボタン */}
                        <td className="w-8 px-3 py-3">
                          <div className="flex flex-col gap-0.5">
                            <button
                              onClick={() => handleMove(q.id, "up")}
                              disabled={isFirst || isPending}
                              className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="上に移動"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleMove(q.id, "down")}
                              disabled={isLast || isPending}
                              className="p-0.5 text-gray-400 hover:text-gray-700 disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                              title="下に移動"
                            >
                              <svg
                                className="w-3.5 h-3.5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>

                        {/* コード */}
                        <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap">
                          {q.questionCode}
                        </td>

                        {/* 質問名 */}
                        <td className="px-4 py-3 text-gray-800 leading-snug">
                          {q.questionName}
                        </td>

                        {/* 回答数 */}
                        <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">
                          {answerCount > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-gray-700 font-medium">
                                {answerCount}
                              </span>
                              件
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>

                        {/* 状態バッジ */}
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                              q.isActive === 1
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-500"
                            }`}
                          >
                            {q.isActive === 1 ? "有効" : "無効"}
                          </span>
                        </td>

                        {/* 操作ボタン */}
                        <td className="px-4 py-3">
                          {isConfirming ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <span className="text-xs text-gray-600">
                                削除しますか？
                              </span>
                              <button
                                onClick={() => handleDelete(q)}
                                disabled={isPending}
                                className="px-2.5 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                削除
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="px-2.5 py-1 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                              >
                                取消
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-end gap-1.5">
                              {/* 編集 */}
                              <button
                                onClick={() => openEdit(q)}
                                disabled={isPending}
                                className="px-2.5 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg transition-colors"
                              >
                                編集
                              </button>

                              {/* 有効/無効切り替え */}
                              <button
                                onClick={() => handleToggle(q.id)}
                                disabled={isPending}
                                className={`px-2.5 py-1 text-xs font-medium disabled:opacity-50 rounded-lg transition-colors ${
                                  q.isActive === 1
                                    ? "text-amber-700 bg-amber-50 hover:bg-amber-100"
                                    : "text-green-700 bg-green-50 hover:bg-green-100"
                                }`}
                              >
                                {q.isActive === 1 ? "無効化" : "有効化"}
                              </button>

                              {/* 削除（回答データがない場合のみ有効） */}
                              <button
                                onClick={() => handleDelete(q)}
                                disabled={isPending || answerCount > 0}
                                title={
                                  answerCount > 0
                                    ? `回答データ（${answerCount}件）があるため削除できません`
                                    : "削除"
                                }
                                className="px-2.5 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-30 disabled:cursor-not-allowed rounded-lg transition-colors"
                              >
                                削除
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </section>
        ))}
      </div>

      {/* 凡例 */}
      <div className="mt-6 rounded-xl bg-blue-50 border border-blue-100 px-5 py-4 text-xs text-blue-700 space-y-1">
        <p className="font-semibold">📋 操作について</p>
        <ul className="list-disc list-inside space-y-0.5 text-blue-600">
          <li>
            <strong>有効/無効</strong>：無効にすると問診フォームに表示されなくなります（回答データは保持）
          </li>
          <li>
            <strong>削除</strong>：回答データが存在しない項目のみ完全削除できます
          </li>
          <li>
            <strong>↑↓ ボタン</strong>：同カテゴリ内での表示順を変更します
          </li>
          <li>
            <strong>新規カテゴリ</strong>：カテゴリ欄に未登録のカテゴリ名を入力すると新たなカテゴリが作成されます
          </li>
        </ul>
      </div>

      {/* モーダル */}
      {showModal && (
        <QuestionModal
          target={modalTarget as Question | null}
          existingCategories={existingCategories}
          onClose={closeModal}
          onSuccess={(msg) => showToast("success", msg)}
        />
      )}
    </div>
  )
}
