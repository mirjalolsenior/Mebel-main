import { NextResponse } from "next/server"
import { getPublicVAPIDKey } from "@/lib/vapid-keys"

export async function GET() {
  return NextResponse.json({
    publicKey: getPublicVAPIDKey(),
  })
}
