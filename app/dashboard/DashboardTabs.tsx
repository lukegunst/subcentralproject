'use client'

import { useState } from 'react'
import Link from 'next/link'

// Define types for our data (match Prisma returns)
interface User {
  id: string
  name?: string | null
  email: string
  businessName?: string | null
}

interface Plan {
  id: string
  name: string
  description?: string | null
  price: number
  interval: string
  merchantId?: string
  merchant?: User | null
  subscriptions?: Array<{
    id: string
    userId: string
    user?: User
  }>
}

interface Subscription {
  id: string
  status: string
  plan: Plan & {
    merchant?: User | null
  }
}

interface Invoice {
  id: string
  pdfUrl?: string | null
}

interface Transaction {
  id: string
  createdAt: string | Date
  amount: number
  fee: number
  netAmount: number
  status: string
  nextPayment?: string | Date | null
  customer?: User | null
  plan: Plan & { merchant?: User | null }
  invoice?: Invoice | null
}

// Payout interface updated to match returned objects:
// - allow status to be a string (or "pending" | "paid")
// - accept paidAt OR paidDate (either may come from backend)
// - include optional fields your backend may return (merchantId, fee, netAmount, createdAt, updatedAt)
interface Payout {
  id: string
  amount: number
  scheduledDate: string | Date
  status: "pending" | "paid" | string
  paidAt?: string | Date | null
  paidDate?: string | Date | null
  merchantId?: string
  fee?: number
  netAmount?: number
  createdAt?: string | Date
  updatedAt?: string | Date
}

interface DashboardTabsProps {
  plans?: Plan[]
  subscriptions?: Subscription[]
  transactions?: Transaction[]
  payouts?: Payout[]
  userRole: "MERCHANT" | "CUSTOMER"
}

export default function DashboardTabs({ 
  plans = [], 
  subscriptions = [], 
  transactions = [],
  payouts = [],
  userRole 
}: DashboardTabsProps) {
  const [activeTab, setActiveTab] = useState(userRole === "MERCHANT" ? "plans" : "subscriptions")

  if (userRole === "MERCHANT") {
    return (
      <div>
        {/* Merchant Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("plans")}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "plans"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              My Plans ({plans.length})
            </button>
            <button
              onClick={() => setActiveTab("transactions")}
              className={`py-2 px-1 border-b-2 font-medium text-sm R{
                activeTab === "transactions"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              Transactions ({transactions.length})
            </button>
            {/* ✅ Payouts Tab */}
            <button
              onClick={() => setActiveTab("payouts")}
              className={`py-2 px-1 border-b-2 font-medium text-sm R{
                activeTab === "payouts"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
              }`}
            >
              Payouts ({payouts.length})
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "plans" && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">My Plans</h2>
              <Link
                href="/dashboard/plans/new"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Create New Plan
              </Link>
            </div>
            
            {plans.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">You haven't created any plans yet.</p>
                <Link
                  href="/dashboard/plans/new"
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  Create Your First Plan
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {plans.map((plan) => (
                  <div key={plan.id} className="bg-card p-6 rounded-lg border">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-lg font-semibold">{plan.name}</h3>
                        <p className="text-muted-foreground">{plan.description}</p>
                        <p className="text-sm text-muted-foreground mt-2">
                          {plan.subscriptions?.length ?? 0} subscriber(s)
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                          Owner: {plan.merchant?.businessName ?? plan.merchant?.name ?? '—'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">R{plan.price.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">/{plan.interval}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "transactions" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Transactions</h2>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No transactions yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Date</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Plan</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Customer</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Fee</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Net</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Invoice</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b text-sm">
                          {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                        </td>
                        <td className="p-3 border-b text-sm font-medium">{tx.plan?.name}</td>
                        <td className="p-3 border-b text-sm">
                          {tx.customer?.name ?? tx.customer?.email ?? '-'}
                        </td>
                        <td className="p-3 border-b text-sm font-medium">R{tx.amount.toFixed(2)}</td>
                        <td className="p-3 border-b text-sm text-red-600">-R{tx.fee.toFixed(2)}</td>
                        <td className="p-3 border-b text-sm font-medium text-green-600">
                          R{tx.netAmount.toFixed(2)}
                        </td>
                        <td className="p-3 border-b text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs R{
                            tx.status === "paid" 
                              ? "bg-green-100 text-green-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="p-3 border-b text-sm">
                          <a 
                            href={tx.invoice?.pdfUrl ?? "#"} 
                            className="text-blue-600 hover:underline"
                          >
                            View Invoice
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ✅ Payouts Tab Content */}
        {activeTab === "payouts" && (
          <div>
            <h2 className="text-xl font-semibold mb-6">Payouts</h2>
            {payouts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No payouts scheduled yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-lg">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Scheduled Date</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Status</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Amount</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Paid At</th>
                      <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payouts.map((payout) => (
                      <tr key={payout.id} className="hover:bg-gray-50">
                        <td className="p-3 border-b text-sm">
  { (payout.paidAt ?? payout.paidDate) ? new Date(payout.paidAt ?? payout.paidDate as string | Date).toLocaleDateString() : "-" }
</td>
<td className="p-3 border-b text-sm">
  {payout.status !== "paid" ? (
    <button
      onClick={async () => {
        const res = await fetch(`/api/payouts/R{payout.id}/pay`, { method: "POST" })
        if (res.ok) {
          const updated = await res.json()
          // Optional: update local state to reflect change
          alert("Payout marked as paid")
        } else {
          alert("Failed to mark payout as paid")
        }
      }}
      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
    >
      Mark Paid
    </button>
  ) : (
    <span className="text-green-600 font-medium">Paid</span>
  )}
</td>
                        <td className="p-3 border-b text-sm font-medium">R{payout.amount.toFixed(2)}</td>
                        <td className="p-3 border-b text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            payout.status === "paid"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {payout.status}
                          </span>
                        </td>
                        <td className="p-3 border-b text-sm">
                          { (payout.paidAt ?? payout.paidDate) ? new Date(payout.paidAt ?? payout.paidDate as string | Date).toLocaleDateString() : "-" }
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
    )
  }

  // Customer Dashboard
  return (
    <div>
      {/* Customer Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("subscriptions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "subscriptions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            My Subscriptions ({subscriptions.length})
          </button>
          <button
            onClick={() => setActiveTab("transactions")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "transactions"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300"
            }`}
          >
            Transactions ({transactions.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === "subscriptions" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">My Subscriptions</h2>
            <Link
              href="/marketplace"
              className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Browse Marketplace
            </Link>
          </div>

          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">You don't have any active subscriptions.</p>
              <Link
                href="/marketplace"
                className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              >
                Explore Plans
              </Link>
            </div>
          ) : (
            <div className="grid gap-4">
              {subscriptions.map((subscription) => (
                <div key={subscription.id} className="bg-card p-6 rounded-lg border">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{subscription.plan.name}</h3>
                      <p className="text-muted-foreground">{subscription.plan.description}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        by {subscription.plan.merchant?.businessName ?? subscription.plan.merchant?.name ?? '-'}
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Status: <span className="capitalize">{subscription.status}</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        R{subscription.plan.price}/{subscription.plan.interval}
                      </p>
                      <button className="mt-2 text-sm text-red-600 hover:underline">
                        Cancel Subscription
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === "transactions" && (
        <div>
          <h2 className="text-xl font-semibold mb-6">My Transactions</h2>
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 rounded-lg">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Plan</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Business</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Amount</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Next Payment</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Status</th>
                    <th className="p-3 border-b text-left text-sm font-medium text-gray-700">Invoice</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-gray-50">
                      <td className="p-3 border-b text-sm">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleDateString() : '-'}
                      </td>
                      <td className="p-3 border-b text-sm font-medium">{tx.plan.name}</td>
                      <td className="p-3 border-b text-sm">{tx.plan.merchant?.businessName ?? tx.plan.merchant?.name ?? '-'}</td>
                      <td className="p-3 border-b text-sm font-medium">R{tx.amount.toFixed(2)}</td>
                      <td className="p-3 border-b text-sm">
                        {tx.nextPayment ? new Date(tx.nextPayment as string | Date).toLocaleDateString() : "-"}
                      </td>
                      <td className="p-3 border-b text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          tx.status === "paid" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-yellow-100 text-yellow-800"
                        }`}>
                          {tx.status}
                        </span>
                      </td>
                      <td className="p-3 border-b text-sm">
                        <a 
                          href={tx.invoice?.pdfUrl ?? "#"} 
                          className="text-blue-600 hover:underline"
                        >
                          View Invoice
                        </a>
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
  )
}