import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import StaffTable from "./_components/StaffTable"

export const metadata = {
  title: "スタッフ管理 | 特定健診WEB問診",
}

export default async function AdminPage() {
  const session = await auth()
  if (!session) redirect("/staff/login")

  const currentUsername = session.user?.email ?? ""

  const staffList = await prisma.staff.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      createdAt: true,
    },
    orderBy: { createdAt: "asc" },
  })

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <StaffTable
        staffList={staffList}
        currentUsername={currentUsername}
        totalCount={staffList.length}
      />
    </div>
  )
}
