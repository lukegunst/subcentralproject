"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: string
  merchant: {
    businessName: string
  }
}

export default function CheckoutContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const planId = searchParams.get("planId")

  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  const [formData, setFormData] = useState({
    fullName: "",
    address: "",
    city: "",
    zipCode: "",
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })

  useEffect(() => {
    if (status === "loading") return

    if (!session) {
      router.push("/auth/signin")
      return
    }

    if (!planId) {
      router.push("/marketplace")
      return
    }

    fetchPlan()
  }, [session, status, planId])

  const fetchPlan = async () => {
    try {
      const response = await fetch(`/api/plans/${planId}`)
      if (response.ok) {
        const planData = await response.json()
        setPlan(planData)
      } else {
        setError("Plan not found")
      }
    } catch (err) {
      setError("Failed to load plan details")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const requiredFields = [
        "fullName",
        "address",
        "city",
        "zipCode",
        "cardNumber",
        "expiryDate",
        "cvv",
      ]
      const missingFields = requiredFields.filter(
        (field) => !formData[field as keyof typeof formData]
      )

      if (missingFields.length > 0) {
        setError("Please fill in all required fields")
        setSubmitting(false)
        return
      }

      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      const result = await response.json()

      if (response.ok) {
        router.push("/checkout/success?subscriptionId=" + result.subscription.id)
      } else {
        setError(result.error || "Failed to create subscription")
      }
    } catch {
      setError("An error occurred during checkout")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading checkout...</p>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push("/marketplace")}
            className="bg-primary text-white px-4 py-2 rounded"
          >
            Back to Marketplace
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Checkout</h1>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Order Summary */}
            <div className="bg-card p-6 rounded-lg border">
              {plan && (
                <>
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  <div className="flex justify-between">
                    <div>
                      <h3>{plan.name}</h3>
                      <p className="text-sm">{plan.description}</p>
                      <p className="text-sm">by {plan.merchant.businessName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">${plan.price}</p>
                      <p className="text-sm">/{plan.interval}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Checkout Form */}
            <div className="bg-card p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                {Object.keys(formData).map((field) => (
                  <input
                    key={field}
                    type="text"
                    name={field}
                    value={formData[field as keyof typeof formData]}
                    onChange={handleInputChange}
                    placeholder={field}
                    required
                    className="w-full px-3 py-2 border rounded-md"
                  />
                ))}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-primary text-white py-2 rounded"
                >
                  {submitting
                    ? "Processing..."
                    : `Subscribe for $${plan?.price}/${plan?.interval}`}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}