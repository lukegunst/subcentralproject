import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payouts = await prisma.payout.findMany({
    where: { merchantId: session.user.id },
    orderBy: { scheduledDate: "desc" },
  })

  return NextResponse.json(payouts)
}