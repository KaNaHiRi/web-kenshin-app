"use client"

import { useActionState, useEffect, useRef } from "react"
import { X, AlertCircle } from "lucide-react"
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

  const inputClass =
    "w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-3 focus:ring-primary/20 focus:border-primary transition-colors"

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4">
        {/* ヘッダー */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-[var(--color-text)]">
            {isEdit ? "問診項目を編集" : "問診項目を追加"}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--color-text-muted)] hover:text-primary transition-colors rounded-lg p-1"
            aria-label="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form ref={formRef} action={formAction} className="px-6 py-5 space-y-4">
          {/* hidden: id (編集時) */}
          {isEdit && <input type="hidden" name="id" value={target.id} />}

          {/* エラー */}
          {state?.error && (
            <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-warning">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{state.error}</span>
            </div>
          )}

          {/* 質問コード */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              質問コード
              <span className="ml-1 text-xs text-[var(--color-text-muted)]">（一意のID）</span>
            </label>
            {isEdit ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={target.questionCode}
                  readOnly
                  className="flex-1 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2.5 text-sm text-[var(--color-text-muted)] cursor-not-allowed"
                />
                <span className="text-xs text-[var(--color-text-muted)] whitespace-nowrap">変更不可</span>
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
                  className={`${inputClass} font-mono`}
                />
                <p className="text-xs text-[var(--color-text-muted)] mt-1">
                  半角英数字・ハイフン・アンダースコア、1〜20文字
                </p>
              </>
            )}
          </div>

          {/* 質問名 */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              質問名
            </label>
            <textarea
              name="questionName"
              required
              rows={2}
              placeholder="例: 脳卒中（脳出血・脳梗塞等）の既往がある"
              defaultValue={target?.questionName ?? ""}
              className={`${inputClass} resize-none`}
            />
          </div>

          {/* カテゴリ */}
          <div>
            <label className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
              カテゴリ
            </label>
            <input
              type="text"
              name="category"
              required
              list="category-list"
              placeholder="既往歴 / 服薬 / 生活習慣 など"
              defaultValue={target?.category ?? ""}
              className={inputClass}
            />
            <datalist id="category-list">
              {existingCategories.map((c) => (
                <option key={c} value={c} />
              ))}
            </datalist>
            <p className="text-xs text-[var(--color-text-muted)] mt-1">
              既存のカテゴリを選ぶか、新規カテゴリ名を入力
            </p>
          </div>

          {/* ボタン */}
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-[var(--color-text-muted)] bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
            >
              キャンセル
            </button>
            <button
              type="submit"
              disabled={pending}
              className="px-5 py-2 text-sm font-semibold text-white bg-primary hover:bg-[#0a3d73] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors focus:outline-none focus:ring-3 focus:ring-primary/30"
            >
              {pending ? (isEdit ? "更新中…" : "追加中…") : isEdit ? "更新する" : "追加する"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
