import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session: Session | null = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const planId = params.id

    // Check if plan exists and belongs to the current merchant
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        merchant: {
          select: {
            id: true,
            businessName: true,
          }
        }
      }
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if current user is the merchant who owns this plan
    if (plan.merchantId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only view subscribers of your own plans' },
        { status: 403 }
      )
    }

    // Fetch all subscribers for this plan
    const subscribers = await prisma.userSubscription.findMany({
      where: {
        planId: planId,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      plan: {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        price: plan.price,
        interval: plan.interval,
        merchant: plan.merchant,
      },
      subscribers: subscribers.map(sub => ({
        id: sub.id,
        status: sub.status,
        createdAt: sub.createdAt,
        updatedAt: sub.updatedAt,
        user: sub.user,
      })),
      totalSubscribers: subscribers.length,
      activeSubscribers: subscribers.filter(sub => sub.status === 'active').length,
    })
  } catch (error) {
    console.error('Error fetching plan subscribers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscribers' },
      { status: 500 }
    )
  }
}