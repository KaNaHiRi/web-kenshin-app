'use client'

import { useRef, useState, useTransition } from 'react'
import Papa from 'papaparse'
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
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          CSVファイルを選択
        </label>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
        />
        {fileName && (
          <p className="mt-2 text-sm text-gray-600">選択済み: {fileName}</p>
        )}
      </div>

      {parseError && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
          CSVの解析に失敗しました: {parseError}
        </div>
      )}

      {rows.length > 0 && (
        <div>
          <h2 className="text-base font-semibold text-gray-800 mb-2">
            プレビュー（{rows.length} 件）
          </h2>
          <div className="overflow-x-auto border border-gray-200 rounded-lg">
            <table className="min-w-full text-sm divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {PREVIEW_COLUMNS.map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                    >
                      {col}
                      {REQUIRED_COLUMNS.has(col as string) && (
                        <span className="text-red-500 ml-0.5">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {rows.slice(0, 10).map((row, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    {PREVIEW_COLUMNS.map((col) => (
                      <td
                        key={col}
                        className="px-3 py-2 whitespace-nowrap text-gray-700"
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
            <p className="text-xs text-gray-500 mt-1">
              ※ 先頭 10 件を表示（全 {rows.length} 件）
            </p>
          )}
        </div>
      )}

      {rows.length > 0 && !result && (
        <div className="flex gap-3">
          <button
            onClick={handleImport}
            disabled={isPending}
            className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? 'インポート中...' : 'インポート実行'}
          </button>
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
          >
            リセット
          </button>
        </div>
      )}

      {result && (
        <div className="space-y-3">
          <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
            <p className="font-medium">
              インポート完了: {result.count} 件を登録しました
            </p>
          </div>
          {result.errors.length > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 text-sm">
              <p className="font-medium mb-1">
                スキップされた行（{result.errors.length} 件）:
              </p>
              <ul className="list-disc list-inside space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}
          <button
            onClick={handleReset}
            className="px-6 py-2 border border-gray-300 text-gray-700 text-sm font-medium rounded hover:bg-gray-50"
          >
            別のファイルをインポート
          </button>
        </div>
      )}
    </div>
  )
}
