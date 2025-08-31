import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import SubscribeButton  from "./SubscribeButton"  // 👈 Updated to relative import
import type { Session } from "next-auth"

export default async function Marketplace() {
  const session: Session | null = await getServerSession(authOptions)
  
  // Fetch all subscription plans
  const plans = await prisma.plan.findMany({
    include: {
      merchant: {
        select: {
          businessName: true,
        },
      },
    },
  })

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Subscription Marketplace</h1>
          {session?.user && (
            <div className="text-sm text-muted-foreground">
              Welcome, {session.user.email}
            </div>
          )}
        </div>

        {plans.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No subscription plans available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plans.map((plan) => (
              <div key={plan.id} className="border rounded-lg p-6 bg-card">
                <h3 className="text-xl font-semibent mb-2">{plan.name}</h3>
                <p className="text-muted-foreground mb-4">{plan.description}</p>
                <div className="mb-4">
                  <span className="text-2xl font-bold">${plan.price}</span>
                  <span className="text-muted-foreground">/{plan.interval}</span>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  by {plan.merchant.businessName}
                </p>
                
                {session?.user ? (
                  <SubscribeButton planId={plan.id} />
                ) : (
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      Sign in to subscribe
                    </p>
                    <a
                      href="/auth/signin"
                      className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    >
                      Sign In
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}