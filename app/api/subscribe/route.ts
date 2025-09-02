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
            businessName: true, // ✅ Use businessName for merchants
          },
        },
      },
    })

    if (!plan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Check if user already subscribed to this plan
    const existingSubscription = await prisma.userSubscription.findUnique({
      where: {
        userId_planId: {
          userId: (session.user as any).id,
          planId,
        },
      },
    })

    if (existingSubscription) {
      return NextResponse.json({ error: "Already subscribed to this plan" }, { status: 400 })
    }

    // 1. Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: (session.user as any).id,
        planId,
        status: "active",
      },
      include: {
        plan: {
          include: {
            merchant: {
              select: {
                id: true,
                email: true,
                businessName: true,
              },
            },
          },
        },
      },
    })

    // 2. Simulate transaction (initial payment)
    const fee = plan.price * 0.05 // 5% platform fee
    const netAmount = plan.price - fee

    const transaction = await prisma.transaction.create({
      data: {
        userId: (session.user as any).id,
        planId: plan.id,
        merchantId: plan.merchantId,
        amount: plan.price,
        fee,
        netAmount,
        status: "paid",
        nextPayment: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
    })

    const scheduledDate = new Date(transaction.createdAt)
scheduledDate.setDate(scheduledDate.getDate() + 2)

const payoutFee = typeof transaction.fee === "number" ? transaction.fee : 0
const payoutNetAmount =
  typeof transaction.netAmount === "number"
    ? transaction.netAmount
    : typeof transaction.amount === "number"
    ? transaction.amount - fee
    : 0

await prisma.payout.create({
  data: {
    merchantId: transaction.merchantId,
    transactionId: transaction.id,
    amount: transaction.netAmount, // or however you calculate payout
    fee: payoutFee,
    netAmount: payoutNetAmount,
    scheduledDate,
    status: "pending",
  },
})

    // 3. Create invoice (fake PDF url for now)
    await prisma.invoice.create({
      data: {
        transactionId: transaction.id,
        pdfUrl: `/invoices/${transaction.id}.pdf`,
      },
    })

    return NextResponse.json({ 
      success: true,
      subscription, 
      transaction,
      message: "Successfully subscribed!"
    })
  } catch (error) {
    console.error("Error subscribing:", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}