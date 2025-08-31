"use client"
import { useEffect, useState } from "react"

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayouts = async () => {
      try {
        const res = await fetch("/api/payouts")
        const data = await res.json()
        setPayouts(data)
      } catch (err) {
        console.error("Error fetching payouts:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchPayouts()
  }, [])

  if (loading) return <p>Loading payouts...</p>

  if (!payouts.length) return <p>No payouts scheduled yet.</p>

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Payout Report</h1>
      <table className="w-full border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2 text-left">Scheduled Date</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Gross Amount</th>
            <th className="px-4 py-2 text-right">Fees</th>
            <th className="px-4 py-2 text-right">Net Amount</th>
          </tr>
        </thead>
        <tbody>
          {payouts.map((payout) => (
            <tr key={payout.id} className="border-t">
              <td className="px-4 py-2">
                {new Date(payout.scheduledDate).toLocaleDateString()}
              </td>
              <td className="px-4 py-2">{payout.status}</td>
              <td className="px-4 py-2 text-right">${payout.amount.toFixed(2)}</td>
              <td className="px-4 py-2 text-right">${payout.fee.toFixed(2)}</td>
              <td className="px-4 py-2 text-right font-bold">
                ${payout.netAmount.toFixed(2)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}