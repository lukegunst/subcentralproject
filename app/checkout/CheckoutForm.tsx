'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { useRouter } from "next/navigation"

export default function CheckoutForm({ planId }: { planId: string }) {
  const [loading, setLoading] = useState(false)
  const [agreed, setAgreed] = useState(false)
  const router = useRouter()

  const handleSubscribe = async () => {
    if (!agreed) {
      toast.error("Please agree to the terms and conditions")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/subscriptions", {  // ✅ Changed from /api/subscribe
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      })

      if (res.ok) {
        toast.success("Successfully subscribed! 🎉")
        router.push("/my-subscriptions")
      } else {
        const err = await res.json()
        toast.error(err.message || "Failed to subscribe")
      }
    } catch (e) {
      console.error(e)
      toast.error("Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <h4 className="font-medium">What you get:</h4>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Access to the subscription service</li>
          <li>• Monthly billing cycle</li>
          <li>• Cancel anytime</li>
        </ul>
      </div>

      <div className="border-t pt-4">
        <label className="flex items-start gap-2 text-sm">
          <input
            type="checkbox"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mt-1"
          />
          <span>
            I agree to the terms and conditions and authorize recurring charges
          </span>
        </label>
      </div>

      <Button 
        onClick={handleSubscribe} 
        disabled={loading || !agreed}
        className="w-full"
      >
        {loading ? "Processing..." : "Subscribe Now"}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        You can cancel your subscription at any time from your account.
      </p>
    </div>
  )
}