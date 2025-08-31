"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewPlanForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    interval: "monthly",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const response = await fetch("/api/plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: parseFloat(formData.price),
          interval: formData.interval,
        }),
      })

      if (response.ok) {
        router.push("/dashboard?success=Plan created")
      } else {
        const result = await response.json()
        setError(result.error || "Failed to create plan")
      }
    } catch (err) {
      setError("An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h1 className="text-2xl font-bold">Create New Plan</h1>
      {error && <p className="text-red-500">{error}</p>}

      <input
        type="text"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="Plan name"
        className="border p-2 w-full"
        required
      />

      <textarea
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        placeholder="Plan description"
        className="border p-2 w-full"
      />

      <input
        type="number"
        name="price"
        value={formData.price}
        onChange={handleInputChange}
        placeholder="Price"
        className="border p-2 w-full"
        required
      />

      <select
        name="interval"
        value={formData.interval}
        onChange={handleInputChange}
        className="border p-2 w-full"
      >
        <option value="monthly">Monthly</option>
        <option value="yearly">Yearly</option>
      </select>

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Creating..." : "Create Plan"}
      </button>
    </form>
  )
}