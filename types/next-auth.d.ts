import NextAuth, { DefaultSession, DefaultUser } from "next-auth"

// Extend the built-in types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      email: string
      name?: string | null
      image?: string | null
    }
  }

  interface User extends DefaultUser {
    id: string
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    role: string
  }
}