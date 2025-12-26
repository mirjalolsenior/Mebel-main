import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export const maxDuration = 30

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const supabase = await createClient()

    // Get subscription stats
    const { data: allSubs } = await supabase.from("push_subscriptions").select("id", { count: "exact" })

    const { data: activeSubs } = await supabase
      .from("push_subscriptions")
      .select("id", { count: "exact" })
      .eq("is_active", true)

    const { data: recentLogs } = await supabase
      .from("notification_logs")
      .select("status")
      .gte("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const sentCount = recentLogs?.filter((l) => l.status === "sent").length || 0
    const failedCount = recentLogs?.filter((l) => l.status === "failed").length || 0

    const { data: checkLogs } = await supabase
      .from("notification_check_logs")
      .select("*")
      .gte("executed_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order("executed_at", { ascending: false })
      .limit(10)

    return NextResponse.json({
      status: "healthy",
      subscriptions: {
        total: allSubs?.[0]?.count || 0,
        active: activeSubs?.[0]?.count || 0,
      },
      notifications_24h: {
        sent: sentCount,
        failed: failedCount,
        success_rate: sentCount + failedCount > 0 ? ((sentCount / (sentCount + failedCount)) * 100).toFixed(1) : "N/A",
      },
      recent_checks: checkLogs?.slice(0, 5) || [],
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[Health] Check failed:", error)
    return NextResponse.json(
      {
        status: "error",
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    )
  }
}
