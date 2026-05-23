"use client"

import { useActionState, useEffect, useRef } from "react"
import { addQuestion, updateQuestion } from "../actions"

type Question = {
  id: number
  questionCode: string
  questionName: string
  category: string
  displayOrder: number
  isActive: number
}

type Props = {
  /** null = 追加モード, Question = 編集モード */
  target: Question | null
  existingCategories: string[]
  onClose: () => void
  onSuccess: (message: string) => void
}

export default function QuestionModal({
  target,
  existingCategories,
  onClose,
  onSuccess,
}: Props) {
  const isEdit = target !== null
  const action = isEdit ? updateQuestion : addQuestion

  const [state, formAction, pending] = useActionState(action, undefined)
  const formRef = useRef<HTMLFormElement>(null)
  const prevSuccessRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (state?.success && state.success !== prevSuccessRef.current) {
      prevSuccessRef.current = state.success
      onSuccess(state.success)
      onClose()
    }
  }, [state?.success, onClose, onSuccess])

  // カテゴリの候補（既存のカテゴリ + 重複なし）
  const categoryOptions = existingCategories

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 p-6">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-semibold text-gray-900">
            {isEdit ? "問診項目を編集" : "問診項目を追加"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="閉じる"
          >
            <svg className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        <form ref={formRef} action={formAction} className="space-y-4">
          {/* hidden: id (編集時) */}
          {isEdit && <input type="hidden" name="id" value={target.id} />}

          {/* エラー */}
          {state?.error && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {state.error}
            </div>
          )}

          {/* 質問コード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              質問コード
              <span className="ml-1 text-xs text-gray-400">（一意のID）</span>
            </label>
            {isEdit ? (
              /* 編集時は読み取り専用 */
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={target.questionCode}
                  readOnly
                  className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">変更不可</span>
              </div>
            ) : (
              <>
                <input
                  type="text"
                  name="questionCode"
                  required
                  autoComplete="off"
                  placeholder="例: 7505023"
                  defaultValue=""
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                />
                <p className="text-xs text-gray-400 mt-1">
                  半角英数字・ハイフン・アンダースコア、1〜20文字
                </p>
              </>
            )}
          </div>

          {/* 質問名 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              質問名
            </label>
            <textarea
              name="questionName"
              required
              rows={2}
              placeholder="例: 脳卒中（脳出血・脳梗塞等）の既往がある"
              defaultValue={target?.questionName ?? ""}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              カテゴリ
            </label>
            <input
              type="text"
              name="category"
              required
              list="category-list"
              placeholder="既往歴 / 服薬 / 生活習慣 など"
              defaultValue={target?.category ?? ""}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="category-list">
              {categoryOptions.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-xs text-gray-400 mt-1">
              既存のカテゴリを選ぶか、新規カテゴリ名を入力
            </p>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              {pending ? (isEdit ? "更新中…" : "追加中…") : isEdit ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
