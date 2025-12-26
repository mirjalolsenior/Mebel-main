import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint is required" }, { status: 400 })
    }

    const { error } = await supabase
      .from("push_subscriptions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("endpoint", endpoint)

    if (error) {
      console.error("[Push] Unsubscribe error:", error)
      return NextResponse.json({ error: "Failed to unsubscribe" }, { status: 500 })
    }

    console.log("[Push] Successfully unsubscribed:", endpoint.slice(0, 30))

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from push notifications",
    })
  } catch (error) {
    console.error("[Push] Unsubscribe error:", error)
    return NextResponse.json({ error: "Failed to unsubscribe from push notifications" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Push unsubscribe endpoint ready. Use POST to unsubscribe." })
}
