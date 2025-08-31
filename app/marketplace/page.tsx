"use client"
import { useState, useEffect } from "react"
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
      <h1 className="text-3xl font-bold mb-6">Marketplace</h1>

      {plans.length === 0 ? (
        <p>No subscription plans available yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.id} className="border rounded-lg p-6 shadow">
              <h2 className="text-xl font-semibold">{plan.name}</h2>
              <p className="text-gray-600">{plan.description}</p>
              <p className="text-lg font-bold mt-2">
                ${plan.price}/{plan.interval}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Offered by: {plan.merchant?.name || plan.merchant?.email} {/* ✅ FIXED */}
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