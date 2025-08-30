import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import CancelButton from "./CancelButton"

export default async function MySubscriptionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    return <div className="p-6">Unauthorized</div>
  }

  const subs = await prisma.userSubscription.findMany({
    where: { userId: session.user.id },
    include: { plan: { include: { merchant: true } } },
    orderBy: { createdAt: 'desc' }
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Subscriptions</h1>
      
      {subs.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">You are not subscribed to any plans yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subs.map(sub => (
            <Card key={sub.id} className={sub.status === 'CANCELLED' ? 'opacity-60' : ''}>
              <CardHeader>
                <CardTitle className="flex justify-between items-start">
                  <span>{sub.plan.title}</span>
                  <span className={`text-xs px-2 py-1 rounded ${
                    sub.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                    sub.status === 'CANCELLED' ? 'bg-red-100 text-red-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {sub.status}
                  </span>
                </CardTitle>
                <p className="text-sm text-gray-500">{sub.plan.merchant.businessName}</p>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 mb-2">{sub.plan.description}</p>
                <p className="text-lg font-semibold text-green-600">
                  {sub.plan.currency} {sub.plan.price} / {sub.plan.interval}
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Subscribed: {new Date(sub.createdAt).toLocaleDateString()}
                </p>
                {sub.cancelledAt && (
                  <p className="text-xs text-red-500">
                    Cancelled: {new Date(sub.cancelledAt).toLocaleDateString()}
                  </p>
                )}
              </CardContent>
              <CardFooter>
                {sub.status === 'ACTIVE' ? (
                  <CancelButton subId={sub.id} />
                ) : (
                  <p className="text-sm text-gray-500">Subscription cancelled</p>
                )}
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}