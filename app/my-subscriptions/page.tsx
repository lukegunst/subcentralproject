import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"
import CancelSubscriptionButton from "./CancelSubscriptionButton"

export default async function MySubscriptionsPage() {
  const session: Session | null = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: session.user.id },
    include: {
      plan: {
        include: {
          merchant: {
            select: {
              businessName: true,
              email: true,
            }
          }
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
  const cancelledSubscriptions = subscriptions.filter(sub => sub.status === 'cancelled')
  const totalSpending = activeSubscriptions.reduce((sum, sub) => sum + sub.plan.price, 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Subscriptions</h1>
          <p className="text-muted-foreground">Manage all your active subscriptions</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
            <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Monthly Spending</h3>
            <p className="text-2xl font-bold">${totalSpending.toFixed(2)}</p>
          </div>
          <div className="bg-card p-6 rounded-lg border">
            <h3 className="text-sm font-medium text-muted-foreground">Total Subscriptions</h3>
            <p className="text-2xl font-bold">{subscriptions.length}</p>
          </div>
        </div>

        {subscriptions.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-lg border">
            <h2 className="text-xl font-semibold mb-2">No Subscriptions Yet</h2>
            <p className="text-muted-foreground mb-6">
              You haven't subscribed to any plans yet. Explore our marketplace to find services you love.
            </p>
            <a
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Browse Marketplace
            </a>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Active Subscriptions */}
            {activeSubscriptions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Active Subscriptions</h2>
                <div className="space-y-4">
                  {activeSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="bg-card p-6 rounded-lg border">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{subscription.plan.name}</h3>
                          <p className="text-muted-foreground mb-2">{subscription.plan.description}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {subscription.plan.merchant.businessName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Subscribed on {new Date(subscription.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-6">
                          <div className="mb-3">
                            <span className="text-xl font-bold">${subscription.plan.price}</span>
                            <span className="text-muted-foreground">/{subscription.plan.interval}</span>
                          </div>
                          <div className="space-y-2">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                            <div>
                              <CancelSubscriptionButton subscriptionId={subscription.id} />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cancelled Subscriptions */}
            {cancelledSubscriptions.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold mb-4">Cancelled Subscriptions</h2>
                <div className="space-y-4">
                  {cancelledSubscriptions.map((subscription) => (
                    <div key={subscription.id} className="bg-card p-6 rounded-lg border opacity-75">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold mb-1">{subscription.plan.name}</h3>
                          <p className="text-muted-foreground mb-2">{subscription.plan.description}</p>
                          <p className="text-sm text-muted-foreground mb-2">
                            by {subscription.plan.merchant.businessName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Cancelled on {new Date(subscription.updatedAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right ml-6">
                          <div className="mb-3">
                            <span className="text-xl font-bold text-muted-foreground">${subscription.plan.price}</span>
                            <span className="text-muted-foreground">/{subscription.plan.interval}</span>
                          </div>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Cancelled
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Actions */}
        <div className="mt-8 text-center">
          <a
            href="/marketplace"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 mr-4"
          >
            Browse More Plans
          </a>
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  )
}