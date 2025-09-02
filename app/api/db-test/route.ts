// app/api/db-test/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // simple lightweight check
    const res = await prisma.$queryRaw`SELECT 1 as result`
    return NextResponse.json({ ok: true, res })
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err.message, stack: err.stack?.slice(0, 1000) },
      { status: 500 }
    )
  }
}