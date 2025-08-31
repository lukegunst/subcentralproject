"use client"

import { useSession, signOut } from "next-auth/react"
import Link from "next/link"
import { Menu } from "@headlessui/react"

export default function Navbar() {
  const { data: session } = useSession()

  return (
    <nav className="p-4 bg-gray-800 text-white flex justify-between items-center">
      {/* Left side nav links */}
      <div className="flex space-x-6">
        {!session?.user && (
          <>
            <Link href="/auth/signin" className="hover:underline">Sign In</Link>
            <Link href="/auth/signup" className="hover:underline">Sign Up</Link>
          </>
        )}

        {session?.user && session.user.role === "MERCHANT" && (
          <>
            <Link href="/dashboard" className="hover:underline">Merchant Dashboard</Link>
            <Link href="/dashboard/plans/new" className="hover:underline">Create New Plan</Link>
          </>
        )}

        {session?.user && session.user.role === "CUSTOMER" && (
          <>
            <Link href="/marketplace" className="hover:underline">Marketplace</Link>
            <Link href="/my-subscriptions" className="hover:underline">My Subscriptions</Link>
          </>
        )}
      </div>

      {/* Right side - Profile dropdown */}
      {session?.user && (
        <Menu as="div" className="relative inline-block text-left">
          <Menu.Button className="flex items-center space-x-2 bg-gray-700 px-3 py-2 rounded hover:bg-gray-600">
            {/* Avatar circle with initials */}
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-500 text-white font-bold">
              {session.user.name
                ? session.user.name.charAt(0).toUpperCase()
                : session.user.email.charAt(0).toUpperCase()}
            </div>
            <span className="hidden sm:block">
              {session.user.name || session.user.email}
            </span>
          </Menu.Button>

          {/* Dropdown items */}
          <Menu.Items className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none text-gray-800">
            {session.user.role === "MERCHANT" && (
              <Menu.Item>
                {({ active }) => (
                  <Link
                    href="/profile"
                    className={`block px-4 py-2 text-sm ${
                      active ? "bg-gray-100" : ""
                    }`}
                  >
                    Edit Profile
                  </Link>
                )}
              </Menu.Item>
            )}
            <Menu.Item>
              {({ active }) => (
                <button
                  onClick={() => signOut()}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    active ? "bg-gray-100" : ""
                  }`}
                >
                  Sign Out
                </button>
              )}
            </Menu.Item>
          </Menu.Items>
        </Menu>
      )}
    </nav>
  )
}