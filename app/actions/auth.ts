"use server"

import { signIn, signOut } from "@/auth"
import { AuthError } from "next-auth"

export type LoginState =
  | {
      error?: string
    }
  | undefined

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  try {
    await signIn("credentials", {
      username: formData.get("username"),
      password: formData.get("password"),
      redirectTo: "/staff/answers",
    })
  } catch (e) {
    // AuthError はログイン失敗（認証エラー）
    if (e instanceof AuthError) {
      switch (e.type) {
        case "CredentialsSignin":
          return { error: "ユーザー名またはパスワードが正しくありません" }
        default:
          return { error: "ログインに失敗しました。もう一度お試しください" }
      }
    }
    // next-auth の redirect() は例外として投げられるため必ず再throw
    throw e
  }
}

export async function logout() {
  await signOut({ redirectTo: "/staff/login" })
}
