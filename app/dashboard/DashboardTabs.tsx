"use client"

import { useState } from "react"

type Plan = {
  id: string
  name: string
  description: string | null
  price: number
  interval: string
  subscriptions: {
    id: string
    user: {
      id: string
      email: string
      name: string | null
    }
  }[]
}

type Payout = {
  id: string
  amount: number
  fee: number
  netAmount: number
  status: string
  scheduledDate: Date
  paidDate: Date | null
}

type Props = {
  plans: Plan[]
  payouts: Payout[]
}

export default function DashboardTabs({ plans, payouts }: Props) {
  const [activeTab, setActiveTab] = useState<"plans" | "payouts">("plans")

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Tab Headers */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab("plans")}
          className={`px-6 py-4 font-medium ${
            activeTab === "plans"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Plans & Subscribers ({plans.length})
        </button>
        <button
          onClick={() => setActiveTab("payouts")}
          className={`px-6 py-4 font-medium ${
            activeTab === "payouts"
              ? "border-b-2 border-blue-500 text-blue-600"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Payouts ({payouts.length})
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === "plans" && (
          <div className="space-y-6">
            {plans.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No plans created yet.</p>
                <a
                  href="/dashboard/plans/new"
                  className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Create Your First Plan
                </a>
              </div>
            ) : (
              plans.map((plan) => (
                <PlanCard key={plan.id} plan={plan} />
              ))
            )}
          </div>
        )}

        {activeTab === "payouts" && (
          <div>
            {payouts.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No payouts scheduled yet.</p>
                <p className="text-sm text-gray-400 mt-2">
                  Payouts will appear here once you have active subscribers.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-3 px-4">Scheduled Date</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Fee</th>
                      <th className="py-3 px-4">Net Amount</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Paid Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {new Date(payout.scheduledDate).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4">${payout.amount.toFixed(2)}</td>
                        <td className="py-3 px-4">${payout.fee.toFixed(2)}</td>
                        <td className="py-3 px-4 font-semibold">
                          ${payout.netAmount.toFixed(2)}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              payout.status === "paid"
                                ? "bg-green-100 text-green-800"
                                : payout.status === "processing"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {payout.status}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          {payout.paidDate
                            ? new Date(payout.paidDate).toLocaleDateString()
                            : "—"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// Individual Plan Card Component
function PlanCard({ plan }: { plan: Plan }) {
  const [showSubscribers, setShowSubscribers] = useState(false)

  return (
    <div className="border rounded-lg p-6 bg-gray-50">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold">{plan.name}</h3>
          <p className="text-gray-600 mt-1">{plan.description}</p>
          <p className="text-lg font-bold text-green-600 mt-2">
            ${plan.price}/{plan.interval}
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Subscribers</p>
          <p className="text-3xl font-bold text-blue-600">{plan.subscriptions.length}</p>
        </div>
      </div>

      {plan.subscriptions.length > 0 && (
        <div>
          <button
            onClick={() => setShowSubscribers(!showSubscribers)}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showSubscribers ? "Hide" : "Show"} Subscribers
          </button>

          {showSubscribers && (
            <div className="mt-4 bg-white rounded border p-4">
              <h4 className="font-medium mb-3">Subscribers ({plan.subscriptions.length})</h4>
              <div className="space-y-2">
                {plan.subscriptions.map((subscription) => (
                  <div
                    key={subscription.id}
                    className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded"
                  >
                    <div>
                      <p className="font-medium">
                        {subscription.user.name || "No name"}
                      </p>
                      <p className="text-sm text-gray-600">{subscription.user.email}</p>
                    </div>
                    <span className="text-sm text-green-600 font-medium">Active</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}