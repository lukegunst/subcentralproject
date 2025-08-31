"use client"

import { Suspense } from "react"
import CheckoutContent from "./CheckoutContent"

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading checkout...</p>
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  )
}