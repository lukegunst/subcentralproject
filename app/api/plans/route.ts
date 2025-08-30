import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 })
  }

  try {
    const body = await req.json()
    const { title, description, price, interval } = body

    if (!title || !price) {
      return NextResponse.json({ message: "Missing fields" }, { status: 400 })
    }

    const merchant = await prisma.merchant.findUnique({
      where: { userId: session.user.id },
    })

    if (!merchant) {
      return NextResponse.json({ message: "Merchant not found" }, { status: 404 })
    }

    await prisma.subscriptionPlan.create({
      data: {
        title,
        description,
        price,
        interval,
        merchantId: merchant.id,
      },
    })

    return NextResponse.json({ message: "Plan created" }, { status: 201 })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ message: "Server error" }, { status: 500 })
  }
}