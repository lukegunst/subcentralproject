"use client"
import { useState, useEffect } from "react"
import Link from "next/link"
import SubscribeButton from "./SubscribeButton"

export default function MarketplacePage() {
  const [plans, setPlans] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const res = await fetch("/api/plans")
        const data = await res.json()
        setPlans(data)
      } catch (error) {
        console.error("Error fetching plans:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchPlans()
  }, [])

  if (loading) return <p>Loading marketplace...</p>

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">SubCentral Marketplace | View All Plans</h1>

      {plans.length === 0 ? (
        <p>No subscription plans available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-6 shadow">
              {/* Plan Image */}
              {plan.imageUrl && (
                <img
                  src={plan.imageUrl}
                  alt={`R{plan.name} image`}
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}

              <h2 className="text-2xl font-semibold">{plan.name}</h2>
              <p className="text-gray-600">{plan.description}</p>
              <p className="text-lg font-bold mt-2">
                R{plan.price} / {plan.interval}
              </p>

              {/* Merchant Link */}
              <p className="text-sm text-gray-500 mt-1">
                Offered by:{" "}
                {plan.merchant ? (
                  <Link
  href={`/merchant/R{plan.merchant.id}`}
  className="text-gray-600 hover:underline"
>
  {plan.merchant.businessName || plan.merchant.name || plan.merchant.email}
</Link>
                ) : (
                  "Unknown"
                )}
              </p>

              <div className="mt-4">
                <SubscribeButton planId={plan.id} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}