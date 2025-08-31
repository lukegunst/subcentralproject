import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

export async function POST(request: NextRequest) {
  try {
    const session: Session | null = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { planId } = await request.json()
    
    // Debug log
    console.log("API subscribe planId:", planId)

    if (!planId) {
      return NextResponse.json(
        { error: 'Plan ID is required' },
        { status: 400 }
      )
    }

    // Check if plan exists
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
      include: {
        merchant: {
          select: {
            businessName: true,
          }
        }
      }
    })

    if (!plan) {
      console.log("Plan not found for ID:", planId)
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    // Check if user already has an active subscription to this plan
    const existingSubscription = await prisma.userSubscription.findFirst({
      where: {
        userId: session.user.id,
        planId: planId,
        status: 'active'
      }
    })

    if (existingSubscription) {
      return NextResponse.json(
        { error: 'You already have an active subscription to this plan' },
        { status: 400 }
      )
    }

    // Create subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: session.user.id,
        planId: planId,
        status: 'active'
      },
      include: {
        plan: {
          include: {
            merchant: {
              select: {
                businessName: true,
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      message: 'Subscription created successfully',
      subscription
    })
  } catch (error) {
    console.error('Error creating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to create subscription' },
      { status: 500 }
    )
  }
}