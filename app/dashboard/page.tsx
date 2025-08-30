import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import Link from "next/link"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "MERCHANT") {
    return <div className="p-6">Unauthorized</div>
  }

  // get merchant plans
  const plans = await prisma.subscriptionPlan.findMany({
    where: { merchant: { userId: session.user.id } },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Merchant Dashboard</h1>
      <Link
        href="/dashboard/plans/new"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        + New Plan
      </Link>

      {plans.length === 0 ? (
        <p className="mt-4 text-gray-600">No plans yet. Create one!</p>
      ) : (
        <ul className="mt-4 space-y-4">
          {plans.map(plan => (
            <li
              key={plan.id}
              className="border rounded p-4 flex justify-between"
            >
              <div>
                <h2 className="text-lg font-semibold">{plan.title}</h2>
                <p>{plan.description}</p>
                <p className="text-sm text-gray-600">
                  {plan.interval} – {plan.currency} {plan.price}
                </p>
              </div>
              {plan.isActive ? (
                <span className="text-green-600">Active</span>
              ) : (
                <span className="text-red-600">Inactive</span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}