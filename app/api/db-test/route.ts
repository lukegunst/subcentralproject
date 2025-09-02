// app/api/db-test/route.ts
import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    // lightweight check
    const result: any = await prisma.$queryRaw`SELECT 1 as result`
    return NextResponse.json({ ok: true, result })
  } catch (err: any) {
    console.error("DB test error:", err)
    // Return enough info to debug (temporary — remove after)
    return NextResponse.json(
      { ok: false, message: err.message, code: err?.code ?? null },
      { status: 500 }
    )
  }
}