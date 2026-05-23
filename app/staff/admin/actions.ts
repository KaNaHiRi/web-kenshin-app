"use server"

import bcrypt from "bcryptjs"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// ─── 型定義 ─────────────────────────────────────────────────────────────────

export type ActionState = {
  success?: string
  error?: string
} | undefined

// ─── バリデーションヘルパー ──────────────────────────────────────────────────

function validateUsername(username: string): string | null {
  if (!username) return "ユーザー名を入力してください"
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username))
    return "ユーザー名は半角英数字・アンダースコア、3〜20文字で入力してください"
  return null
}

function validatePassword(password: string): string | null {
  if (!password) return "パスワードを入力してください"
  if (password.length < 8) return "パスワードは8文字以上で入力してください"
  return null
}

// ─── スタッフ追加 ────────────────────────────────────────────────────────────

export async function addStaff(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session) return { error: "認証が必要です" }

  const username = ((formData.get("username") as string) ?? "").trim()
  const displayName = ((formData.get("displayName") as string) ?? "").trim()
  const password = (formData.get("password") as string) ?? ""
  const confirmPassword = (formData.get("confirmPassword") as string) ?? ""

  // バリデーション
  const usernameErr = validateUsername(username)
  if (usernameErr) return { error: usernameErr }

  if (!displayName) return { error: "表示名を入力してください" }
  if (displayName.length > 100) return { error: "表示名は100文字以内で入力してください" }

  const passwordErr = validatePassword(password)
  if (passwordErr) return { error: passwordErr }

  if (password !== confirmPassword) return { error: "パスワードが一致しません" }

  // 重複チェック
  const existing = await prisma.staff.findUnique({ where: { username } })
  if (existing) return { error: "そのユーザー名はすでに使用されています" }

  // 作成
  const hashedPassword = await bcrypt.hash(password, 10)
  await prisma.staff.create({
    data: { username, displayName, hashedPassword },
  })

  revalidatePath("/staff/admin")
  return { success: `スタッフ「${displayName}」を追加しました` }
}

// ─── スタッフ削除 ────────────────────────────────────────────────────────────

export async function deleteStaff(staffId: number): Promise<ActionState> {
  const session = await auth()
  if (!session) return { error: "認証が必要です" }

  const currentUsername = session.user?.email ?? ""

  // 対象スタッフを取得
  const target = await prisma.staff.findUnique({ where: { id: staffId } })
  if (!target) return { error: "スタッフが見つかりません" }

  // 自分自身は削除不可
  if (target.username === currentUsername) {
    return { error: "自分自身のアカウントは削除できません" }
  }

  // 最後の1人は削除不可
  const count = await prisma.staff.count()
  if (count <= 1) {
    return { error: "スタッフが1名のため削除できません（最低1名必要です）" }
  }

  await prisma.staff.delete({ where: { id: staffId } })

  revalidatePath("/staff/admin")
  return { success: `スタッフ「${target.displayName}」を削除しました` }
}

// ─── パスワード変更 ──────────────────────────────────────────────────────────

export async function changePassword(
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const session = await auth()
  if (!session) return { error: "認証が必要です" }

  const currentUsername = session.user?.email ?? ""
  const targetId = parseInt((formData.get("targetId") as string) ?? "0", 10)
  const newPassword = (formData.get("newPassword") as string) ?? ""
  const confirmPassword = (formData.get("confirmPassword") as string) ?? ""

  if (!targetId) return { error: "対象スタッフが指定されていません" }

  // 対象スタッフを取得
  const target = await prisma.staff.findUnique({ where: { id: targetId } })
  if (!target) return { error: "スタッフが見つかりません" }

  // 自分自身のパスワード変更の場合は現在のパスワードを確認
  if (target.username === currentUsername) {
    const currentPassword = (formData.get("currentPassword") as string) ?? ""
    if (!currentPassword) return { error: "現在のパスワードを入力してください" }
    const valid = await bcrypt.compare(currentPassword, target.hashedPassword)
    if (!valid) return { error: "現在のパスワードが正しくありません" }
  }

  const passwordErr = validatePassword(newPassword)
  if (passwordErr) return { error: passwordErr }

  if (newPassword !== confirmPassword) return { error: "パスワードが一致しません" }

  const hashedPassword = await bcrypt.hash(newPassword, 10)
  await prisma.staff.update({
    where: { id: targetId },
    data: { hashedPassword },
  })

  revalidatePath("/staff/admin")
  return { success: `${target.displayName} のパスワードを変更しました` }
}
