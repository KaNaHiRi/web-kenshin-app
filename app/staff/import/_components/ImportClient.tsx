'use client'

import { useRef, useState, useTransition } from 'react'
import Papa from 'papaparse'
import { Upload, CheckCircle2, AlertCircle, RotateCcw } from 'lucide-react'
import { importExaminees, type ExamineeRow, type ImportResult } from '../actions'

const PREVIEW_COLUMNS: (keyof ExamineeRow)[] = [
  'UniqueKey',
  'ExternalId',
  'Name',
  'BirthDate',
  'Gender',
  'ExaminationDate',
  'FiscalYear',
]

const REQUIRED_COLUMNS = new Set(['UniqueKey', 'Name', 'BirthDate', 'Gender', 'FiscalYear'])

export default function ImportClient() {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [rows, setRows] = useState<ExamineeRow[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [isPending, startTransition] = useTransition()

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setFileName(file.name)
    setRows([])
    setParseError(null)
    setResult(null)

    Papa.parse<ExamineeRow>(file, {
      header: true,
      skipEmptyLines: true,
      complete: ({ data }) => setRows(data),
      error: (err) => setParseError(err.message),
    })
  }

  function handleImport() {
    startTransition(async () => {
      const res = await importExaminees(rows)
      setResult(res)
    })
  }

  function handleReset() {
    setFileName(null)
    setRows([])
    setParseError(null)
    setResult(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  return (
    <div className="space-y-6">
      {/* ファイル選択ゾーン */}
      <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 bg-white hover:border-primary/50 transition-colors">
        <label className="block text-sm font-medium text-[var(--color-text)] mb-2">
          CSVファイルを選択
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-[var(--color-text-muted)] file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
        />
        {fileName && (
          <p className="mt-2 text-sm text-[var(--color-text-muted)] flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            選択済み: {fileName}
          </p>
        )}
      </div>

      {/* パースエラー */}
      {parseError && (
        <div className="flex items-start gap-3 bg-orange-50 border border-orange-200 text-warning rounded-xl p-4 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <span>CSVの解析に失敗しました: {parseError}</span>
        </div>
      )}

      {/* プレビューテーブル */}
      {rows.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-[var(--color-text)] mb-2">
            プレビュー（{rows.length} 件）
          </h2>
          <div className="overflow-x-auto bg-white rounded-xl shadow-md overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-primary/5 border-b border-primary/10">
                <tr>
                  {PREVIEW_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2.5 text-left text-xs font-semibold text-primary uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                      {REQUIRED_COLUMNS.has(col as string) && (
                        <span className="text-warning ml-0.5">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-primary/5 transition-colors">
                    {PREVIEW_COLUMNS.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2.5 whitespace-nowrap text-[var(--color-text)]"
                      >
                        {row[col] ?? ''}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {rows.length > 10 && (
            <p className="text-xs text-[var(--color-text-muted)] mt-1.5">
              ※ 先頭 10 件を表示（全 {rows.length} 件）
            </p>
          )}
        </div>
      )}

      {/* 実行ボタン */}
      {rows.length > 0 && !result && (
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={isPending}
            className="px-6 py-2.5 bg-primary text-white text-sm font-semibold rounded-xl hover:bg-[#0a3d73] disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus:outline-none focus:ring-3 focus:ring-primary/30"
          >
            {isPending ? 'インポート中...' : 'インポート実行'}
          </button>
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 border border-gray-200 text-[var(--color-text-muted)] text-sm font-medium rounded-xl hover:text-primary hover:border-primary/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            リセット
          </button>
        </div>
      )}

      {/* 結果 */}
      {result && (
        <div className="space-y-3">
          <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 text-success rounded-xl p-4">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p className="font-medium text-sm">
              インポート完了: {result.count} 件を登録しました
            </p>
          </div>
          {result.errors.length > 0 && (
            <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-xl p-4 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium mb-1">
                  スキップされた行（{result.errors.length} 件）:
                </p>
                <ul className="list-disc list-inside space-y-1 text-amber-700">
                  {result.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          <button
            onClick={handleReset}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 border border-gray-200 text-[var(--color-text-muted)] text-sm font-medium rounded-xl hover:text-primary hover:border-primary/40 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            別のファイルをインポート
          </button>
        </div>
      )}
    </div>
  )
}
