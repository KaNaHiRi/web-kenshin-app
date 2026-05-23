'use client'

import { useState, useTransition } from 'react'
import { saveAnswers } from '../actions'

type Question = {
  questionCode: string
  questionName: string
  category: string
  displayOrder: number
}

type Examinee = {
  name: string
  birthDate: Date
  gender: string
  examinationDate: Date | null
  fiscalYear: number
  uniqueKey: string
}

type Props = {
  examinee: Examinee
  questions: Question[]
  existingAnswers: Record<string, string>
}

const CATEGORIES = ['既往歴', '服薬', '生活習慣'] as const

function formatDate(date: Date): string {
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
}

export default function QuestionnaireForm({ examinee, questions, existingAnswers }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers)
  const [submitted, setSubmitted] = useState(Object.keys(existingAnswers).length > 0)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const grouped = CATEGORIES.reduce<Record<string, Question[]>>((acc, cat) => {
    acc[cat] = questions.filter((q) => q.category === cat)
    return acc
  }, {})

  const allAnswered = questions.every((q) => answers[q.questionCode] !== undefined)

  function handleChange(questionCode: string, value: string) {
    setAnswers((prev) => ({ ...prev, [questionCode]: value }))
    setSubmitted(false)
    setError(null)
  }

  function handleSubmit() {
    if (!allAnswered) return
    startTransition(async () => {
      const result = await saveAnswers(examinee.uniqueKey, answers)
      if (result.success) {
        setSubmitted(true)
        setError(null)
      } else {
        setError(result.error ?? '保存に失敗しました')
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">

        {/* ヘッダー */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">特定健康診査 問診票</h1>
          <p className="text-sm text-gray-500 mt-1">{examinee.fiscalYear}年度</p>
        </div>

        {/* 受診者情報 */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">受診者情報</h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-gray-500">氏名</dt>
              <dd className="font-medium text-gray-900">{examinee.name}</dd>
            </div>
            <div>
              <dt className="text-gray-500">性別</dt>
              <dd className="font-medium text-gray-900">{examinee.gender}</dd>
            </div>
            <div>
              <dt className="text-gray-500">生年月日</dt>
              <dd className="font-medium text-gray-900">{formatDate(examinee.birthDate)}</dd>
            </div>
            {examinee.examinationDate && (
              <div>
                <dt className="text-gray-500">受診予定日</dt>
                <dd className="font-medium text-gray-900">{formatDate(examinee.examinationDate)}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* 問診項目 */}
        {CATEGORIES.map((category) => {
          const qs = grouped[category]
          if (!qs || qs.length === 0) return null
          return (
            <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-5 py-3 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-700">{category}</h2>
              </div>
              <div className="divide-y divide-gray-100">
                {qs.map((q) => (
                  <div key={q.questionCode} className="px-5 py-4">
                    <p className="text-sm text-gray-800 mb-3 leading-relaxed">{q.questionName}</p>
                    <div className="flex gap-6">
                      {[
                        { value: '1', label: 'はい' },
                        { value: '2', label: 'いいえ' },
                      ].map(({ value, label }) => {
                        const id = `${q.questionCode}-${value}`
                        const checked = answers[q.questionCode] === value
                        return (
                          <label
                            key={value}
                            htmlFor={id}
                            className={`flex items-center gap-2 cursor-pointer px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                              checked
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50'
                            }`}
                          >
                            <input
                              id={id}
                              type="radio"
                              name={q.questionCode}
                              value={value}
                              checked={checked}
                              onChange={() => handleChange(q.questionCode, value)}
                              className="sr-only"
                            />
                            <span
                              className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${
                                checked ? 'border-blue-500' : 'border-gray-300'
                              }`}
                            >
                              {checked && <span className="w-2 h-2 rounded-full bg-blue-500" />}
                            </span>
                            {label}
                          </label>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* エラー */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 text-sm">
            {error}
          </div>
        )}

        {/* 完了メッセージ */}
        {submitted && !error && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-xl p-4 text-sm font-medium">
            問診票の回答を保存しました。ありがとうございました。
          </div>
        )}

        {/* 未回答注意 */}
        {!allAnswered && (
          <p className="text-xs text-amber-600 text-center">
            すべての質問に回答してから送信してください（残り {questions.length - Object.keys(answers).length} 問）
          </p>
        )}

        {/* 送信ボタン */}
        <button
          onClick={handleSubmit}
          disabled={!allAnswered || isPending}
          className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm"
        >
          {isPending ? '保存中...' : '回答を送信する'}
        </button>

        <p className="text-xs text-gray-400 text-center pb-4">
          送信後も回答を修正して再送信できます
        </p>
      </div>
    </div>
  )
}
