import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }   // 👈 must await now
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { id } = await context.params   // 👈 await the params

    // Verify subscription belongs to user
    const subscription = await prisma.userSubscription.findUnique({
      where: { id },
    })

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
    }

    // Cancel subscription
    await prisma.userSubscription.update({
      where: { id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
    })

    return NextResponse.json({ message: "Subscription cancelled successfully" }, { status: 200 })
  } catch (e) {
    console.error("Error cancelling subscription:", e)
    return NextResponse.json({ message: "Error cancelling subscription" }, { status: 500 })
  }
}