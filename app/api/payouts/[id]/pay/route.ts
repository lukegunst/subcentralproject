import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const payoutId = params.id

  const payout = await prisma.payout.findUnique({
    where: { id: payoutId },
  })

  if (!payout) {
    return NextResponse.json({ error: "Payout not found" }, { status: 404 })
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  })

  if (!user || user.id !== payout.merchantId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const updated = await prisma.payout.update({
    where: { id: payoutId },
    data: {
      status: "paid",
      paidDate: new Date(),
    },
  })

  return NextResponse.json(updated)
}