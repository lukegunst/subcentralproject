import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, email, password, role, businessName } = body

    // check existing user
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ message: "User already exists" }, { status: 400 })
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    })

    // if merchant, create merchant profile
    if (role === "MERCHANT") {
      await prisma.merchant.create({
        data: {
          userId: user.id,
          businessName: businessName || name || "My Business",
          contactEmail: email,
        },
      })
    }

    return NextResponse.json({ message: "User created successfully" }, { status: 201 })
  } catch (err) {
    console.error("Signup error:", err)
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
  }
}