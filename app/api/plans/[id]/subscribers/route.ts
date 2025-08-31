import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: { 
        merchant: true,  // 👈 Include merchant relation
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                name: true,
              }
            }
          }
        }
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if the current user is the merchant who owns this plan
    if (plan.merchantId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        interval: plan.interval,
        merchant: plan.merchant,  // 👈 Now this exists
      },
      subscribers: plan.subscriptions.map(sub => ({
        id: sub.id,
        status: sub.status,
        createdAt: sub.createdAt,
        user: sub.user,
      }))
    })
  } catch (error) {
    console.error("Error fetching subscribers:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}