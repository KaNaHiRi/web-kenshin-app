import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET,
  providers: [
    Credentials({
      credentials: {
        username: { label: "ユーザー名", type: "text" },
        password: { label: "パスワード", type: "password" },
      },
      async authorize(credentials) {
        const username = credentials?.username as string | undefined
        const password = credentials?.password as string | undefined
        if (!username || !password) return null

        const staff = await prisma.staff.findUnique({ where: { username } })
        if (!staff) return null

        const valid = await bcrypt.compare(password, staff.hashedPassword)
        if (!valid) return null

        // next-auth v5 User型: id, name, email を使用
        // displayName を name に、username を email フィールドに格納
        return {
          id: String(staff.id),
          name: staff.displayName,
          email: staff.username,
        }
      },
    }),
  ],
  pages: {
    signIn: "/staff/login",
  },
  session: {
    strategy: "jwt",
  },
})
