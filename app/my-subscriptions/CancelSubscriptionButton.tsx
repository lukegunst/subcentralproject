'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface CancelSubscriptionButtonProps {
  subscriptionId: string
}

export default function CancelSubscriptionButton({ subscriptionId }: CancelSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    
    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (response.ok) {
        router.refresh() // Refresh the page to show updated status
      } else {
        const error = await response.json()
        alert('Failed to cancel subscription: ' + error.error)
      }
    } catch (error) {
      alert('An error occurred while cancelling the subscription')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="space-y-2">
        <p className="text-xs text-red-600">Are you sure?</p>
        <div className="flex space-x-2">
          <button
            onClick={handleCancel}
            disabled={loading}
            className="text-xs px-2 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Cancelling...' : 'Yes, Cancel'}
          </button>
          <button
            onClick={() => setShowConfirm(false)}
            className="text-xs px-2 py-1 border rounded hover:bg-gray-50"
          >
            No, Keep
          </button>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="text-xs px-3 py-1 border border-red-200 text-red-600 rounded hover:bg-red-50"
    >
      Cancel
    </button>
  )
}