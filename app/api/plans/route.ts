import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

// GET - Fetch all plans
export async function GET() {
  try {
    const plans = await prisma.plan.findMany({
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
            email: true,
          }
        },
        subscriptions: {
          select: {
            id: true,
            status: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json(plans)
  } catch (error) {
    console.error('Error fetching plans:', error)
    return NextResponse.json(
      { error: 'Failed to fetch plans' },
      { status: 500 }
    )
  }
}

// POST - Create new plan (merchants only)
export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is a merchant
    const user = await prisma.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'MERCHANT') {
      return NextResponse.json(
        { error: 'Only merchants can create plans' },
        { status: 403 }
      )
    }

    const { name, description, price, interval } = await request.json()

    // Validate required fields
    if (!name || !price || !interval) {
      return NextResponse.json(
        { error: 'Name, price, and interval are required' },
        { status: 400 }
      )
    }

    const plan = await prisma.plan.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        interval,
        merchantId: session.user.id,
      },
      include: {
        merchant: {
          select: {
            businessName: true,
            email: true,
          }
        }
      }
    })

    return NextResponse.json(plan, { status: 201 })
  } catch (error) {
    console.error('Error creating plan:', error)
    return NextResponse.json(
      { error: 'Failed to create plan' },
      { status: 500 }
    )
  }
}