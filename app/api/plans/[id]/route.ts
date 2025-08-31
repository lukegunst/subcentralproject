import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            name: true,  // 👈 Changed from businessName to name
          }
        },
        subscriptions: true,
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    return NextResponse.json(plan)
  } catch (error) {
    console.error("Error fetching plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, interval } = await request.json()

    const plan = await prisma.plan.findUnique({
      where: { id: params.id },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    if (plan.merchantId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const updatedPlan = await prisma.plan.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        interval,
      },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            name: true,  // 👈 Changed from businessName to name
          }
        }
      }
    })

    return NextResponse.json(updatedPlan)
  } catch (error) {
    console.error("Error updating plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    if (plan.merchantId !== (session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await prisma.plan.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Plan deleted successfully" })
  } catch (error) {
    console.error("Error deleting plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}