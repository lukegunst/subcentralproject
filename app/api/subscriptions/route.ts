import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const { planId } = await req.json()

    // Check if already subscribed
    const existing = await prisma.userSubscription.findUnique({
      where: {
        userId_planId: {
          userId: session.user.id,
          planId: planId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ message: "Already subscribed" }, { status: 400 })
    }

    // Create a subscription (mock — no payments yet)
    await prisma.userSubscription.create({
      data: {
        userId: session.user.id,
        planId: planId,
        status: "ACTIVE",
      },
    })

    return NextResponse.json({ message: "Subscribed!" }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}