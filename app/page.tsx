import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-black-600">SubCentral</h1>
          <nav className="space-x-4">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-900">Sign In</Link>
            <Link href="/auth/signup" className="bg-gray-600 text-white px-4 py-2 rounded-lg">Get Started</Link>
          </nav>
        </div>
      </header>

      {/* Hero Content */}
      <main className="flex flex-col items-center justify-center flex-1 text-center px-4">
        <h2 className="text-4xl font-bold text-gray-800 mb-4">
          Seamless Subscriptions for Businesses & Customers
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Businesses can offer monthly plans, and customers can manage all of their subscriptions in one place.
        </p>
        <div className="space-x-4">
          <Link href="/auth/signup?role=merchant" className="bg-gray-600 text-white px-6 py-3 rounded-lg">
            Merchant Login
          </Link>
          <Link href="/marketplace" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg">
            Browse Marketplace
          </Link>
        </div>
      </main>
    </div>
  )
}