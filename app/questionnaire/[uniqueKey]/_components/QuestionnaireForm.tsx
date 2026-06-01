'use client'

import { useState, useTransition, useRef } from 'react'
import { AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react'
import { saveAnswers } from '../actions'
import { useLocale } from '@/hooks/useLocale'
import type { Lang } from '@/hooks/useLocale'
import LanguageSwitcher from '@/components/LanguageSwitcher'

// ─── Types ───────────────────────────────────────────────────────────────────

type Question = {
  questionCode: string
  questionName: string
  category: string
  displayOrder: number
}

type Examinee = {
  name: string
  birthDate: string
  gender: string
  examinationDate: string | null
  fiscalYear: number
  uniqueKey: string
}

type Props = {
  examinee: Examinee
  questions: Question[]
  existingAnswers: Record<string, string>
}

// ─── Nav labels per language ─────────────────────────────────────────────────

const NAV: Record<Lang, { next: string; back: string }> = {
  ja: { next: '次へ', back: '戻る' },
  en: { next: 'Next', back: 'Back' },
  'zh-CN': { next: '下一步', back: '返回' },
  'zh-TW': { next: '下一步', back: '返回' },
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function QuestionnaireForm({ examinee, questions, existingAnswers }: Props) {
  // ── i18n ──────────────────────────────────────────────────────────────────
  const { t, lang, formatDate } = useLocale()
  const nav = NAV[lang]

  // ── State ─────────────────────────────────────────────────────────────────
  const [answers, setAnswers] = useState<Record<string, string>>(existingAnswers)
  const [submitted, setSubmitted] = useState(
    questions.length > 0 &&
    questions.every((q) => existingAnswers[q.questionCode] !== undefined),
  )
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Wizard navigation state
  const initialIndex = (() => {
    const first = questions.findIndex((q) => !existingAnswers[q.questionCode])
    return first === -1 ? questions.length - 1 : first
  })()
  const [currentIndex, setCurrentIndex] = useState(initialIndex)
  const [isVisible, setIsVisible] = useState(true)
  const isAnimating = useRef(false)

  // ── Derived ───────────────────────────────────────────────────────────────
  const allAnswered = questions.every((q) => answers[q.questionCode] !== undefined)
  const remaining = questions.length - Object.keys(answers).length

  const currentQuestion = questions[currentIndex]
  const isFirst = currentIndex === 0
  const isLast = currentIndex === questions.length - 1
  const currentAnswered = currentQuestion
    ? answers[currentQuestion.questionCode] !== undefined
    : false

  const percent = questions.length > 0
    ? Math.round(((currentIndex + 1) / questions.length) * 100)
    : 0

  // ── Handlers ──────────────────────────────────────────────────────────────
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
        setError(result.error ?? t.errorFallback)
      }
    })
  }

  function goNext() {
    if (isLast || isAnimating.current) return
    isAnimating.current = true
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((i) => i + 1)
      setIsVisible(true)
      isAnimating.current = false
    }, 150)
  }

  function goBack() {
    if (isFirst || isAnimating.current) return
    isAnimating.current = true
    setIsVisible(false)
    setTimeout(() => {
      setCurrentIndex((i) => i - 1)
      setIsVisible(true)
      isAnimating.current = false
    }, 150)
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (!currentQuestion) return null

  const categoryLabel = t.categories[currentQuestion.category] ?? currentQuestion.category

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">

      {/* ── 進捗バー（sticky） ────────────────────────────── */}
      <div className="sticky top-0 z-10 bg-[var(--color-bg)] px-4 pt-4 pb-3 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div className="flex justify-between text-xs text-[var(--color-text-muted)] mb-1.5">
            <span>{currentIndex + 1} / {questions.length} 問</span>
            <span>{percent}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* ── ヘッダー + 言語切替 ──────────────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-text)]">{t.pageTitle}</h1>
            <p className="text-sm text-[var(--color-text-muted)] mt-1">
              {t.fiscalYear.replace('{year}', String(examinee.fiscalYear))}
            </p>
          </div>
          <LanguageSwitcher uniqueKey={examinee.uniqueKey} currentLang={lang} />
        </div>

        {/* ── 受診者情報 ────────────────────────────────── */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h2 className="text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wide mb-3">
            {t.examineeInfo}
          </h2>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div>
              <dt className="text-[var(--color-text-muted)]">{t.name}</dt>
              <dd className="font-medium text-[var(--color-text)]">{examinee.name}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">{t.gender}</dt>
              <dd className="font-medium text-[var(--color-text)]">{examinee.gender}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-muted)]">{t.birthDate}</dt>
              <dd className="font-medium text-[var(--color-text)]">{formatDate(examinee.birthDate)}</dd>
            </div>
            {examinee.examinationDate && (
              <div>
                <dt className="text-[var(--color-text-muted)]">{t.examinationDate}</dt>
                <dd className="font-medium text-[var(--color-text)]">
                  {formatDate(examinee.examinationDate)}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {/* ── エラー ───────────────────────────────────── */}
        {error && (
          <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-warning rounded-xl p-4 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* ── 完了メッセージ ────────────────────────────── */}
        {submitted && !error && (
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-success rounded-xl p-4 text-sm font-medium">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{t.submitSuccess}</span>
          </div>
        )}

        {/* ── 質問カード（フェードアニメーション） ─────────── */}
        <div
          className="transition-opacity duration-150"
          style={{ opacity: isVisible ? 1 : 0 }}
        >
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            {/* カテゴリヘッダー */}
            <div className="bg-primary px-5 py-3">
              <p className="text-xs font-semibold text-white/80 uppercase tracking-wide">
                {categoryLabel}
              </p>
            </div>

            {/* 質問テキスト */}
            <div className="px-6 pt-6 pb-4">
              <p className="text-xl font-medium text-[var(--color-text)] leading-relaxed mb-6">
                {currentQuestion.questionName}
              </p>

              {/* 選択肢ボタン */}
              <div className="flex gap-4">
                {[
                  { value: '1', label: t.yes },
                  { value: '2', label: t.no },
                ].map(({ value, label }) => {
                  const id = `${currentQuestion.questionCode}-${value}`
                  const checked = answers[currentQuestion.questionCode] === value
                  return (
                    <label
                      key={value}
                      htmlFor={id}
                      className={`flex-1 flex items-center justify-center py-4 rounded-xl border-2 text-base font-semibold cursor-pointer transition-all duration-200 ${
                        checked
                          ? 'border-primary bg-primary text-white shadow-sm'
                          : 'border-primary/30 text-primary hover:border-primary/60 hover:bg-primary/5'
                      }`}
                    >
                      <input
                        id={id}
                        type="radio"
                        name={currentQuestion.questionCode}
                        value={value}
                        checked={checked}
                        onChange={() => handleChange(currentQuestion.questionCode, value)}
                        className="sr-only"
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>
          </div>
        </div>

        {/* ── ナビゲーション ────────────────────────────── */}
        <div className="flex flex-col items-center gap-3">
          {isLast ? (
            <>
              {/* 未回答の注意 */}
              {!allAnswered && (
                <p className="text-xs text-warning text-center">
                  {t.incompleteWarning.replace('{remaining}', String(remaining))}
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!allAnswered || isPending}
                className="w-full md:w-2/3 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-[#0a3d73] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base focus:outline-none focus:ring-4 focus:ring-primary/30"
              >
                {isPending ? t.saving : t.submit}
              </button>
            </>
          ) : (
            <button
              onClick={goNext}
              disabled={!currentAnswered}
              className="w-full md:w-2/3 py-4 bg-primary text-white font-semibold rounded-xl hover:bg-[#0a3d73] disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-base focus:outline-none focus:ring-4 focus:ring-primary/30"
            >
              {nav.next}
            </button>
          )}

          {!isFirst && (
            <button
              onClick={goBack}
              className="flex items-center gap-1 text-sm text-[var(--color-text-muted)] hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              {nav.back}
            </button>
          )}
        </div>

        <p className="text-xs text-[var(--color-text-muted)] text-center pb-4">{t.editNote}</p>
      </div>
    </div>
  )
}
