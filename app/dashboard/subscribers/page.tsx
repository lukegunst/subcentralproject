import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    return <div className="p-6">Unauthorized</div>
  }

  // ✅ Find Merchant linked to this user
  const merchant = await prisma.merchant.findUnique({
    where: { userId: session.user.id },
  })

  if (!merchant) {
    return <div className="p-6">No merchant profile found.</div>
  }

  // ✅ Get all plans for this merchant
  const plans = await prisma.subscriptionPlan.findMany({
    where: { merchantId: merchant.id },
    include: {
      subscriptions: {
        include: { user: true },
      },
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Subscribers</h1>

      {plans.length === 0 ? (
        <p>You have not created any plans yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>
                  {plan.title} ({plan.subscriptions.length} Subscribers)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plan.subscriptions.length === 0 ? (
                  <p className="text-sm text-gray-500">No subscribers yet</p>
                ) : (
                  <ul className="space-y-2">
                    {plan.subscriptions.map(sub => (
                      <li key={sub.id} className="text-sm">
                        {sub.user.email} – {sub.status}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}