"use client"

type CancelButtonProps = {
  subscriptionId: string
}

export default function CancelButton({ subscriptionId }: CancelButtonProps) {
  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel this subscription?")) return

    try {
      const response = await fetch(`/api/subscriptions/${subscriptionId}`, {
        method: "DELETE",
      })
      if (response.ok) {
        window.location.reload()
      } else {
        alert("Failed to cancel subscription")
      }
    } catch (error) {
      alert("Error cancelling subscription")
    }
  }

  return (
    <button
      onClick={handleCancel}
      className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
    >
      Cancel
    </button>
  )
}