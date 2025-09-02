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
  const [imageUrl, setImageUrl] = useState("")
  const [uploading, setUploading] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    setUploading(true)
    setError("")

    try {
      const fd = new FormData()
      fd.append("file", file)

      const res = await fetch("/api/upload", {
        method: "POST",
        body: fd,
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json?.error || "Upload failed")
        setUploading(false)
        return
      }

      setImageUrl(json.publicUrl)
    } catch (err) {
      setError("Upload failed")
      console.error(err)
    } finally {
      setUploading(false)
    }
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
          imageUrl,
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
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create New Plan</h1>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Plan Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Premium Membership"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Describe your plan..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Price (ZAR)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleInputChange}
            placeholder="0.00"
            step="0.01"
            min="0"
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Interval */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Billing Interval</label>
          <select
            name="interval"
            value={formData.interval}
            onChange={handleInputChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Plan Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-100 file:text-white-100 hover:file:bg-blue-100"
          />
          {uploading && <p className="text-sm text-blue-500 mt-2">Uploading image...</p>}
        </div>

        {/* Image Preview */}
        {imageUrl && (
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Image Preview</p>
            <img
              src={imageUrl}
              alt="Plan image preview"
              className="w-48 h-48 object-cover rounded-md border border-gray-200"
            />
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || uploading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium R{
            loading || uploading
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Create Plan"}
        </button>
      </form>
    </div>
  )
}