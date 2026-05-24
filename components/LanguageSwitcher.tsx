'use client'

import Link from 'next/link'
import type { Lang } from '@/hooks/useLocale'

// ─── 言語定義 ────────────────────────────────────────────────────────────────

const LANGS: { code: Lang; label: string }[] = [
  { code: 'ja',    label: '日本語'   },
  { code: 'en',    label: 'English'  },
  { code: 'zh-CN', label: '简体中文' },
  { code: 'zh-TW', label: '繁體中文' },
]

// ─── Props ───────────────────────────────────────────────────────────────────

type Props = {
  /** 問診票の uniqueKey（遷移先 URL の組み立てに使用） */
  uniqueKey: string
  /** 現在選択されている言語コード */
  currentLang: Lang
}

// ─── コンポーネント ──────────────────────────────────────────────────────────

/**
 * 4言語の切替ボタンを横並びで表示する。
 * クリックで /questionnaire/[uniqueKey]?lang=xx へ遷移する。
 * 現在の言語はハイライト（青い塗りつぶし）で示す。
 */
export default function LanguageSwitcher({ uniqueKey, currentLang }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5" role="navigation" aria-label="言語切替">
      {LANGS.map(({ code, label }) => {
        const isActive = code === currentLang
        return (
          <Link
            key={code}
            href={`/questionnaire/${uniqueKey}?lang=${code}`}
            aria-current={isActive ? 'true' : undefined}
            className={[
              'px-3 py-1 rounded-full text-xs font-medium transition-colors',
              isActive
                ? 'bg-blue-600 text-white'
                : 'border border-gray-300 text-gray-600 hover:border-gray-400 hover:bg-gray-50',
            ].join(' ')}
          >
            {label}
          </Link>
        )
      })}
    </div>
  )
}
