import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import type { Session } from "next-auth"

export default async function DashboardPage() {
  const session: Session | null = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!user) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="container mx-auto">
          <h1 className="text-2xl font-bold text-red-600">User not found</h1>
        </div>
      </div>
    )
  }

  if (user.role === "MERCHANT") {
    // Fetch merchant's plans and subscribers
    const plans = await prisma.plan.findMany({
      where: { merchantId: user.id },
      include: {
        subscriptions: {
          include: {
            user: {
              select: {
                id: true,
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

    const totalRevenue = plans.reduce((sum, plan) => {
      return sum + (plan.subscriptions.length * plan.price)
    }, 0)

    const totalSubscribers = plans.reduce((sum, plan) => {
      return sum + plan.subscriptions.length
    }, 0)

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Merchant Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.businessName}</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Plans</h3>
              <p className="text-2xl font-bold">{plans.length}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Total Subscribers</h3>
              <p className="text-2xl font-bold">{totalSubscribers}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Revenue</h3>
              <p className="text-2xl font-bold">${totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Plans Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Plans</h2>
              <a
                href="/dashboard/create-plan"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Create New Plan
              </a>
            </div>

            {plans.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">You haven't created any plans yet.</p>
                <a
                  href="/dashboard/create-plan"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Create Your First Plan
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-card p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-2">{plan.name}</h3>
                    <p className="text-muted-foreground mb-4">{plan.description}</p>
                    <div className="mb-4">
                      <span className="text-xl font-bold">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.interval}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">
                        {plan.subscriptions.length} subscribers
                      </span>
                      <span className="text-sm font-medium">
                        ${(plan.subscriptions.length * plan.price).toFixed(2)}/mo
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  } else {
    // Regular user dashboard
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const totalSpending = subscriptions.reduce((sum, sub) => {
      return sum + sub.plan.price
    }, 0)

    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')

    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Your Dashboard</h1>
            <p className="text-muted-foreground">Manage your subscriptions</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Active Subscriptions</h3>
              <p className="text-2xl font-bold">{activeSubscriptions.length}</p>
            </div>
            <div className="bg-card p-6 rounded-lg border">
              <h3 className="text-sm font-medium text-muted-foreground">Monthly Spending</h3>
              <p className="text-2xl font-bold">${totalSpending.toFixed(2)}</p>
            </div>
          </div>

          {/* Subscriptions Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Your Subscriptions</h2>
              <a
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Browse Marketplace
              </a>
            </div>

            {subscriptions.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-lg border">
                <p className="text-muted-foreground mb-4">You don't have any subscriptions yet.</p>
                <a
                  href="/marketplace"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Explore Plans
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {subscriptions.map((subscription) => (
                  <div key={subscription.id} className="bg-card p-6 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold mb-1">{subscription.plan.name}</h3>
                        <p className="text-muted-foreground mb-2">{subscription.plan.description}</p>
                        <p className="text-sm text-muted-foreground">
                          by {subscription.plan.merchant.businessName}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="mb-2">
                          <span className="text-lg font-bold">${subscription.plan.price}</span>
                          <span className="text-muted-foreground">/{subscription.plan.interval}</span>
                        </div>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          subscription.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {subscription.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }
}