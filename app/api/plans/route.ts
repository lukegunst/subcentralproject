import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            name: true,
            businessName: true, // include businessName for display
          },
        },
        subscriptions: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error("Error fetching plans:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || (session.user as any).role !== "MERCHANT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { name, description, price, interval, imageUrl } = await request.json()

    if (!name || !price || !interval) {
      return NextResponse.json(
        { error: "Name, price, and interval are required" },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        interval,
        imageUrl, // Save the uploaded image URL here
        merchantId: (session.user as any).id,
      },
      include: {
        merchant: {
          select: {
            id: true,
            email: true,
            name: true,
            businessName: true,
          },
        },
      },
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error("Error creating plan:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}