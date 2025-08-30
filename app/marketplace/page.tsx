import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import SubscribeButton from "./SubscribeButton"

export default async function MarketplacePage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return <div className="p-6">Unauthorized</div>
  }

  const plans = await prisma.subscriptionPlan.findMany({
    where: { isActive: true },
    include: { merchant: true },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Marketplace</h1>
      
      {plans.length === 0 ? (
        <p>No subscription plans available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => (
            <Card key={plan.id}>
              <CardHeader>
                <CardTitle>{plan.title}</CardTitle>
                <CardDescription>{plan.merchant.businessName}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">{plan.description}</p>
                <p className="text-lg font-semibold text-green-600">
                  {plan.currency} {plan.price} / {plan.interval}
                </p>
              </CardContent>
              <CardFooter>
                <SubscribeButton planId={plan.id} />
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}