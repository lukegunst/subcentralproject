// app/api/upload/route.ts
export const runtime = "nodejs"

import { NextResponse } from "next/server"
import { supabaseAdmin } from "@/lib/supabaseAdmin"

export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get("file") as File | null

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)

  const fileExt = file.name.split(".").pop() || "png"
  const filename = `${Math.random().toString(36).slice(2)}.${fileExt}`
  const bucket = "merchant-plan-images"

  const { error: uploadError } = await supabaseAdmin.storage
    .from(bucket)
    .upload(filename, buffer, {
      contentType: file.type || "application/octet-stream",
    })

  if (uploadError) {
    console.error("Upload error:", uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(filename)
  return NextResponse.json({ publicUrl: data.publicUrl })
}