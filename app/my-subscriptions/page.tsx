import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import CancelButton from "./CancelButton"

export default async function MySubscriptionsPage() {
  const session = await getServerSession(authOptions)

  if (!session || !session.user) {
    redirect("/auth/signin")
  }

  // Get user ID from database
  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true },
  })

  if (!user) {
    redirect("/auth/signin")
  }

  const subscriptions = await prisma.userSubscription.findMany({
    where: { userId: user.id },
    include: {
      plan: {
        include: {
          merchant: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Subscriptions</h1>

      {subscriptions.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">You don't have any subscriptions yet.</p>
          <a
            href="/marketplace"
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Browse Marketplace
          </a>
        </div>
      ) : (
        <div className="space-y-6">
          {subscriptions.map((subscription) => (
            <div
              key={subscription.id}
              className="bg-white border rounded-lg p-6 shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h2 className="text-xl font-semibold mb-2">
                    {subscription.plan.name}
                  </h2>
                  <p className="text-gray-600 mb-2">
                    {subscription.plan.description}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    Merchant: {subscription.plan.merchant.name || subscription.plan.merchant.email}
                  </p>
                  <div className="flex items-center space-x-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        subscription.status === "active"
                          ? "bg-green-100 text-green-800"
                          : subscription.status === "cancelled"
                          ? "bg-red-100 text-red-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {subscription.status}
                    </span>
                    <span className="text-sm text-gray-500">
                      Subscribed on {new Date(subscription.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-green-600 mb-2">
                    ${subscription.plan.price}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    per {subscription.plan.interval}
                  </p>
                  {subscription.status === "active" && (
                    <CancelButton subscriptionId={subscription.id} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}