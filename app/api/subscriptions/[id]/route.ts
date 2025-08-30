import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    // Verify the subscription belongs to the current user
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: params.id },
    })

    if (!subscription || subscription.userId !== session.user.id) {
      return NextResponse.json({ message: "Subscription not found" }, { status: 404 })
    }

    // Update subscription status to cancelled
    await prisma.userSubscription.update({
      where: { id: params.id },
      data: { 
        status: "CANCELLED", 
        cancelledAt: new Date() 
      },
    })

    return NextResponse.json({ message: "Subscription cancelled successfully" }, { status: 200 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Error cancelling subscription" }, { status: 500 })
  }
}