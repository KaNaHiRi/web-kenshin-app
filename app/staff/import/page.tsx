import ImportClient from './_components/ImportClient'

export default function ImportPage() {
  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">受診者CSVインポート</h1>
      <p className="text-sm text-gray-500 mb-6">
        CSVファイルをアップロードして受診者データを一括登録します。UniqueKeyが既存の場合は上書き更新されます。
      </p>
      <ImportClient />
    </div>
  )
}
