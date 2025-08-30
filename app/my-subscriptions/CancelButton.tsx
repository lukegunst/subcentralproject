'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"

export default function CancelButton({ subId }: { subId: string }) {
  const [loading, setLoading] = useState(false)

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/subscriptions/${subId}`, { method: "DELETE" })

      if (res.ok) {
        toast.success("Subscription cancelled successfully")
        window.location.reload()
      } else {
        const err = await res.json()
        toast.error(err.message || "Unable to cancel subscription")
      }
    } catch (e) {
      console.error(e)
      toast.error("Unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button 
      variant="destructive" 
      onClick={handleCancel}
      disabled={loading}
    >
      {loading ? "Cancelling..." : "Cancel"}
    </Button>
  )
}