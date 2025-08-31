import { redirect } from "next/navigation"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import DashboardTabs from "./DashboardTabs"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) redirect("/auth/signin")

  const user = await prisma.user.findUnique({
    where: { email: session.user.email as string },
    select: { id: true, role: true },
  })

  if (!user) redirect("/auth/signin")

  // 🛒 Customer Dashboard
  if (user.role === "CUSTOMER") {
    const subscriptions = await prisma.userSubscription.findMany({
      where: { userId: user.id },
      include: {
        plan: {
          include: { merchant: { select: { id: true, name: true, email: true } } },
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
          <div className="space-y-4">
            {subscriptions.map((subscription) => (
              <div key={subscription.id} className="bg-white border rounded-lg p-6 shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{subscription.plan.name}</h2>
                    <p className="text-gray-600">{subscription.plan.description}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Merchant: {subscription.plan.merchant.name || subscription.plan.merchant.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-600">
                      ${subscription.plan.price}/{subscription.plan.interval}
                    </p>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      subscription.status === "active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
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
    )
  }

  // 🏪 Merchant Dashboard - Fetch Data
  const plans = await prisma.plan.findMany({
    where: { merchantId: user.id },
    include: {
      subscriptions: {
        include: { user: { select: { id: true, email: true, name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  })

  const payouts = await prisma.payout.findMany({
    where: { merchantId: user.id },
    orderBy: { scheduledDate: "desc" },
  })

  const totalSubscribers = plans.reduce((acc, p) => acc + p.subscriptions.length, 0)
  const monthlyRevenue = plans.reduce(
    (acc, plan) =>
      acc + (plan.interval === "monthly" ? plan.price * plan.subscriptions.length : 0),
    0
  )

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Merchant Dashboard</h1>

      {/* 📊 Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Plans</h3>
          <p className="text-3xl font-bold text-blue-600">{plans.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Total Subscribers</h3>
          <p className="text-3xl font-bold text-green-600">{totalSubscribers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-2">Monthly Revenue</h3>
          <p className="text-3xl font-bold text-purple-600">${monthlyRevenue.toFixed(2)}</p>
        </div>
      </div>

      {/* 🗂️ Tabbed Content */}
      <DashboardTabs plans={plans} payouts={payouts} />
    </div>
  )
}