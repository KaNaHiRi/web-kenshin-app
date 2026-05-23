"use server"

import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// ─── 型定義 ──────────────────────────────────────────────────────────────────

export type ActionState = {
  success?: string
  error?: string
} | undefined

// ─── 認証ガード ──────────────────────────────────────────────────────────────

async function requireAuth(): Promise<true | ActionState> {
  const session = await auth()
  if (!session) return { error: "認証が必要です" }
  return true
}

// ─── 問診項目追加 ─────────────────────────────────────────────────────────────

export async function addQuestion(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await requireAuth()
  if (guard !== true) return guard

  const questionCode = ((formData.get("questionCode") as string) ?? "").trim()
  const questionName = ((formData.get("questionName") as string) ?? "").trim()
  const category = ((formData.get("category") as string) ?? "").trim()

  // バリデーション
  if (!questionCode) return { error: "質問コードを入力してください" }
  if (!/^[A-Za-z0-9_-]{1,20}$/.test(questionCode))
    return { error: "質問コードは半角英数字・ハイフン・アンダースコア、1〜20文字で入力してください" }
  if (!questionName) return { error: "質問名を入力してください" }
  if (questionName.length > 200) return { error: "質問名は200文字以内で入力してください" }
  if (!category) return { error: "カテゴリを入力してください" }
  if (category.length > 50) return { error: "カテゴリは50文字以内で入力してください" }

  // 重複チェック
  const existing = await prisma.questionMaster.findUnique({
    where: { questionCode },
  })
  if (existing) return { error: "その質問コードはすでに使用されています" }

  // カテゴリ内の最大 displayOrder を取得して +1
  const maxOrder = await prisma.questionMaster.aggregate({
    _max: { displayOrder: true },
  })
  const displayOrder = (maxOrder._max.displayOrder ?? 0) + 1

  await prisma.questionMaster.create({
    data: { questionCode, questionName, category, displayOrder, isActive: 1 },
  })

  revalidatePath("/staff/questions")
  revalidatePath("/questionnaire")
  return { success: `「${questionName}」を追加しました` }
}

// ─── 問診項目更新 ─────────────────────────────────────────────────────────────

export async function updateQuestion(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const guard = await requireAuth()
  if (guard !== true) return guard

  const id = parseInt((formData.get("id") as string) ?? "0", 10)
  const questionName = ((formData.get("questionName") as string) ?? "").trim()
  const category = ((formData.get("category") as string) ?? "").trim()

  if (!id) return { error: "対象が指定されていません" }
  if (!questionName) return { error: "質問名を入力してください" }
  if (questionName.length > 200) return { error: "質問名は200文字以内で入力してください" }
  if (!category) return { error: "カテゴリを入力してください" }
  if (category.length > 50) return { error: "カテゴリは50文字以内で入力してください" }

  const target = await prisma.questionMaster.findUnique({ where: { id } })
  if (!target) return { error: "項目が見つかりません" }

  await prisma.questionMaster.update({
    where: { id },
    data: { questionName, category },
  })

  revalidatePath("/staff/questions")
  revalidatePath("/questionnaire")
  return { success: `「${questionName}」を更新しました` }
}

// ─── 有効/無効 切り替え ───────────────────────────────────────────────────────

export async function toggleActive(questionId: number): Promise<ActionState> {
  const guard = await requireAuth()
  if (guard !== true) return guard

  const target = await prisma.questionMaster.findUnique({
    where: { id: questionId },
  })
  if (!target) return { error: "項目が見つかりません" }

  const newActive = target.isActive === 1 ? 0 : 1
  await prisma.questionMaster.update({
    where: { id: questionId },
    data: { isActive: newActive },
  })

  revalidatePath("/staff/questions")
  revalidatePath("/questionnaire")
  return {
    success: `「${target.questionName}」を${newActive === 1 ? "有効" : "無効"}にしました`,
  }
}

// ─── 問診項目削除 ─────────────────────────────────────────────────────────────

export async function deleteQuestion(questionId: number): Promise<ActionState> {
  const guard = await requireAuth()
  if (guard !== true) return guard

  const target = await prisma.questionMaster.findUnique({
    where: { id: questionId },
    include: { _count: { select: { answers: true } } },
  })
  if (!target) return { error: "項目が見つかりません" }

  // 回答データがある場合は削除不可
  if (target._count.answers > 0) {
    return {
      error: `「${target.questionName}」には${target._count.answers}件の回答データがあるため削除できません。無効化をお使いください。`,
    }
  }

  await prisma.questionMaster.delete({ where: { id: questionId } })

  revalidatePath("/staff/questions")
  revalidatePath("/questionnaire")
  return { success: `「${target.questionName}」を削除しました` }
}

// ─── 表示順の移動（カテゴリ内） ───────────────────────────────────────────────

export async function moveOrder(
  questionId: number,
  direction: "up" | "down"
): Promise<ActionState> {
  const guard = await requireAuth()
  if (guard !== true) return guard

  const target = await prisma.questionMaster.findUnique({
    where: { id: questionId },
  })
  if (!target) return { error: "項目が見つかりません" }

  // 同カテゴリの全問題を displayOrder 順に取得
  const siblings = await prisma.questionMaster.findMany({
    where: { category: target.category },
    orderBy: { displayOrder: "asc" },
  })

  const idx = siblings.findIndex((q) => q.id === questionId)
  const swapIdx = direction === "up" ? idx - 1 : idx + 1

  if (swapIdx < 0 || swapIdx >= siblings.length) {
    return { error: "これ以上移動できません" }
  }

  const swapTarget = siblings[swapIdx]

  // displayOrder を交換
  await prisma.$transaction([
    prisma.questionMaster.update({
      where: { id: target.id },
      data: { displayOrder: swapTarget.displayOrder },
    }),
    prisma.questionMaster.update({
      where: { id: swapTarget.id },
      data: { displayOrder: target.displayOrder },
    }),
  ])

  revalidatePath("/staff/questions")
  return { success: "" }
}
