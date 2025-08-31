import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import NewPlanForm from "./NewPlanForm"

export default async function NewPlanPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  // Get user role from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { role: true },
  })

  if (!user || user.role !== "MERCHANT") {
    redirect("/dashboard")
  }

  // ✅ Only merchants will reach here
  return <NewPlanForm />
}