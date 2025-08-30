'use client'

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewPlanPage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    price: "",
    interval: "month"
  })
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    const res = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        price: parseFloat(form.price),
      }),
    })

    if (res.ok) {
      router.push("/dashboard")
    } else {
      alert("Error creating plan")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded shadow w-full max-w-md space-y-4"
      >
        <h1 className="text-xl font-bold">Create Subscription Plan</h1>

        <input
          type="text"
          placeholder="Title"
          className="border px-3 py-2 w-full rounded"
          required
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />

        <textarea
          placeholder="Description"
          className="border px-3 py-2 w-full rounded"
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <input
          type="number"
          placeholder="Price"
          className="border px-3 py-2 w-full rounded"
          required
          value={form.price}
          onChange={(e) => setForm({ ...form, price: e.target.value })}
        />

        <select
          className="border px-3 py-2 w-full rounded"
          value={form.interval}
          onChange={(e) => setForm({ ...form, interval: e.target.value })}
        >
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Plan
        </button>
      </form>
    </div>
  )
}