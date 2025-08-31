import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscription = await prisma.userSubscription.findUnique({
      where: { id: params.id },
      include: {
        plan: {
          include: {
            merchant: {
              select: { id: true, email: true, name: true }, // ✅ FIXED
            },
          },
        },
      },
    })

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 })
    }

    if (subscription.userId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.userSubscription.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Subscription cancelled" })
  } catch (error) {
    console.error("Error cancelling:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}