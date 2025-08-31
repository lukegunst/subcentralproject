import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: (session.user as any).id },
      include: {
        plan: {
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                name: true,  // ✅ FIXED
              },
            },
          },
        },
      },
    })

    return NextResponse.json(subscriptions)
  } catch (error) {
    console.error("Error fetching subscriptions:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}