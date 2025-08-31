import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"

export default async function SubscribersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Only merchants can access
  const merchant = await prisma.user.findUnique({
    where: { id: session.user.id }
  })

  if (!merchant || merchant.role !== "MERCHANT") {
    redirect("/dashboard")
  }

  // Fetch subscribers to this merchant’s plans
  const subscribers = await prisma.userSubscription.findMany({
    where: {
      plan: { merchantId: merchant.id }
    },
    include: {
      user: { select: { email: true } },
      plan: { select: { name: true, price: true, interval: true } },
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-6">Your Subscribers</h1>

        {subscribers.length === 0 ? (
          <p className="text-muted-foreground">You don’t have any subscribers yet.</p>
        ) : (
          <div className="space-y-4">
            {subscribers.map((sub) => (
              <div key={sub.id} className="border rounded-lg p-4 bg-card flex justify-between items-center">
                <div>
                  <p className="font-semibold">{sub.user.email}</p>
                  <p className="text-sm text-muted-foreground">
                    subscribed to <strong>{sub.plan.name}</strong> (${sub.plan.price}/{sub.plan.interval})
                  </p>
                </div>
                <span className={`text-xs px-2 py-1 rounded ${
                  sub.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                }`}>
                  {sub.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}