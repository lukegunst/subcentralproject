import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }  // 👈 params must be awaited now
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  const { id } = await context.params   // 👈 await the promise

  // Check the plan belongs to this merchant
  const plan = await prisma.subscriptionPlan.findUnique({
    where: { id },
    include: { merchant: true },
  })

  if (!plan || plan.merchantId !== session.user.id) {
    return NextResponse.json({ message: "Not found" }, { status: 404 })
  }

  // Get list of subscribers for this plan
  const subscribers = await prisma.userSubscription.findMany({
    where: { planId: id },
    include: { user: true },
  })

  return NextResponse.json(subscribers)
}