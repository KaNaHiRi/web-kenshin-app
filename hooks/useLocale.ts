'use client'

import { useSearchParams } from 'next/navigation'
import ja from '@/locales/ja.json'
import en from '@/locales/en.json'
import zhCN from '@/locales/zh-CN.json'
import zhTW from '@/locales/zh-TW.json'

// ─── 型定義 ──────────────────────────────────────────────────────────────────

/**
 * 翻訳オブジェクトの型。
 * - fiscalYear:        "{year}" プレースホルダーを含む
 * - incompleteWarning: "{remaining}" プレースホルダーを含む
 * - categories:        DBの日本語カテゴリ名 → 各言語名のマッピング
 */
export type Translations = {
  pageTitle: string
  fiscalYear: string
  examineeInfo: string
  name: string
  gender: string
  birthDate: string
  examinationDate: string
  yes: string
  no: string
  errorFallback: string
  submitSuccess: string
  incompleteWarning: string
  submit: string
  saving: string
  editNote: string
  categories: Record<string, string>
}

// ─── 対応言語 ────────────────────────────────────────────────────────────────

const VALID_LANGS = ['ja', 'en', 'zh-CN', 'zh-TW'] as const
export type Lang = (typeof VALID_LANGS)[number]

const LOCALE_MAP: Record<Lang, Translations> = {
  ja,
  en,
  'zh-CN': zhCN,
  'zh-TW': zhTW,
}

function isValidLang(v: string | null): v is Lang {
  return VALID_LANGS.includes(v as Lang)
}

// ─── 日付フォーマット ────────────────────────────────────────────────────────

function makeDateFormatter(lang: Lang): (date: Date) => string {
  if (lang === 'ja') {
    return (date) =>
      `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }
  const locale = lang === 'zh-CN' ? 'zh-CN' : lang === 'zh-TW' ? 'zh-TW' : 'en-US'
  const fmt = new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  return (date) => fmt.format(date)
}

// ─── フック ──────────────────────────────────────────────────────────────────

/**
 * URLの ?lang= パラメータを読んで翻訳オブジェクトを返すフック。
 *
 * - 未指定 / 無効値 → 'ja' へフォールバック
 * - Client Component 専用（'use client' ファイル内で呼ぶ）
 * - useSearchParams() を使用するため、呼び出し元は Suspense でラップすること
 */
export function useLocale() {
  const searchParams = useSearchParams()
  const rawLang = searchParams.get('lang')
  const lang: Lang = isValidLang(rawLang) ? rawLang : 'ja'
  const t: Translations = LOCALE_MAP[lang]
  const formatDate = makeDateFormatter(lang)

  return { t, lang, formatDate }
}
