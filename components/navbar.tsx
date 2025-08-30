'use client'

import Link from "next/link"
import { useSession, signOut } from "next-auth/react"

interface ExtendedUser {
  id?: string
  email?: string | null
  role?: string
}

interface ExtendedSession {
  user?: ExtendedUser
}

export default function Navbar() {
  const { data: session, status } = useSession()
  const extendedSession = session as ExtendedSession
  const role = extendedSession?.user?.role

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex justify-between items-center">
      <div className="flex gap-4">
        <Link href="/" className="font-bold text-lg hover:text-gray-300">
          SubCentral
        </Link>
        
        {status === "authenticated" && role === "USER" && (
          <>
            <Link href="/marketplace" className="hover:text-gray-300">
              Marketplace
            </Link>
            <Link href="/my-subscriptions" className="hover:text-gray-300">
              My Subscriptions
            </Link>
          </>
        )}
        
        {status === "authenticated" && role === "MERCHANT" && (
          <>
            <Link href="/dashboard" className="hover:text-gray-300">
              Dashboard
            </Link>
            <Link href="/dashboard/plans/new" className="hover:text-gray-300">
              New Plan
            </Link>
            <Link href="/dashboard/subscribers" className="hover:text-gray-300">
              Subscribers
            </Link>
          </>
        )}
      </div>

      <div>
        {status === "loading" ? (
          <span className="text-gray-400">Loading...</span>
        ) : status === "authenticated" ? (
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-300">
              {extendedSession.user?.email} ({role})
            </span>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="bg-red-600 hover:bg-red-700 px-3 py-1 rounded transition-colors"
            >
              Logout
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link 
              href="/auth/signin" 
              className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/auth/signup" 
              className="bg-green-600 hover:bg-green-700 px-3 py-1 rounded transition-colors"
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </nav>
  )
}