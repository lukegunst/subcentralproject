import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { planId } = await request.json()

    if (!planId) {
      return NextResponse.json({ error: "Plan ID required" }, { status: 400 })
    }

    // Ensure plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            name: true,  // ✅ FIXED: was businessName
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: (session.user as any).id,
        planId,
      },
      include: {
        plan: {
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                name: true, // ✅ FIXED
              },
            },
          },
        },
      },
    })

    return NextResponse.json(subscription)
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}