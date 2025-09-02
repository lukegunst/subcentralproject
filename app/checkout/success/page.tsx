import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: { subscriptionId?: string }
}) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    redirect("/auth/signin")
  }

  const { subscriptionId } = searchParams

  if (!subscriptionId) {
    redirect("/marketplace")
  }

  const subscription = await prisma.userSubscription.findUnique({
    where: { id: subscriptionId },
    include: {
      plan: {
        include: { merchant: true }
      }
    }
  })

  if (!subscription || subscription.userId !== session.user.id) {
    redirect("/marketplace")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="max-w-md mx-auto text-center">
        <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h1 className="text-2xl font-bold text-green-600 mb-2">Subscription Successful!</h1>
        <p className="text-muted-foreground mb-6">
          You've successfully subscribed to <strong>{subscription.plan.name}</strong> by {subscription.plan.merchant.businessName}
        </p>
        
        <div className="bg-card p-4 rounded-lg border mb-6">
          <p className="text-sm text-muted-foreground">Amount Charged</p>
          <p className="text-xl font-bold">R{subscription.plan.price}/{subscription.plan.interval}</p>
        </div>

        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-primary text-primary-foreground hover:bg-primary/90 py-2 px-4 rounded-md font-medium"
          >
            View My Dashboard
          </Link>
          <Link
            href="/marketplace"
            className="block w-full border border-input hover:bg-accent py-2 px-4 rounded-md font-medium"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}