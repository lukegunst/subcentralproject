import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import type { Session } from 'next-auth'

// GET = Fetch current user's subscriptions
export async function GET() {
  const session: Session | null = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: session.user.id },
    include: {
      plan: {
        include: {
          merchant: {
            select: {
              id: true,
              businessName: true,
              email: true
            }
          }
        }
      }
    }
  })

  return NextResponse.json(subscriptions)
}

// DELETE = Cancel one of the user’s subscriptions
export async function DELETE(request: NextRequest) {
  const session: Session | null = await getServerSession(authOptions)

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { subscriptionId } = await request.json()

  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId }
  })

  if (!subscription || subscription.userId !== session.user.id) {
    return NextResponse.json({ error: 'Not found or unauthorized' }, { status: 404 })
  }

  const updated = await prisma.userSubscription.update({
    where: { id: subscriptionId },
    data: { status: 'cancelled' }
  })

  return NextResponse.json({ message: 'Subscription cancelled', subscription: updated })
}