import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

// GET - Fetch specific subscription details
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

    const subscriptionId = params.id

    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
      include: {
        plan: {
          include: {
            merchant: {
              select: {
                id: true,
                businessName: true,
                email: true,
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          }
        }
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Check if user owns this subscription OR is the merchant who owns the plan
    const isOwner = subscription.userId === session.user.id
    const isMerchant = subscription.plan.merchantId === session.user.id

    if (!isOwner && !isMerchant) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only view your own subscriptions or subscriptions to your plans' },
        { status: 403 }
      )
    }

    return NextResponse.json(subscription)
  } catch (error) {
    console.error('Error fetching subscription:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}

// PUT - Update subscription (e.g., cancel, reactivate)
export async function PUT(
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

    const subscriptionId = params.id
    const { status } = await request.json()

    // Validate status
    const validStatuses = ['active', 'cancelled', 'expired']
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be one of: active, cancelled, expired' },
        { status: 400 }
      )
    }

    // Check if subscription exists and user owns it
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId },
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

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only modify your own subscriptions' },
        { status: 403 }
      )
    }

    // Update subscription
    const updatedSubscription = await prisma.userSubscription.update({
      where: { id: subscriptionId },
      data: { status },
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
      message: `Subscription ${status} successfully`,
      subscription: updatedSubscription
    })
  } catch (error) {
    console.error('Error updating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    )
  }
}

// DELETE - Permanently delete subscription
export async function DELETE(
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

    const subscriptionId = params.id

    // Check if subscription exists and user owns it
    const subscription = await prisma.userSubscription.findUnique({
      where: { id: subscriptionId }
    })

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscription.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized - You can only delete your own subscriptions' },
        { status: 403 }
      )
    }

    // Delete subscription
    await prisma.userSubscription.delete({
      where: { id: subscriptionId }
    })

    return NextResponse.json({
      message: 'Subscription deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting subscription:', error)
    return NextResponse.json(
      { error: 'Failed to delete subscription' },
      { status: 500 }
    )
  }
}