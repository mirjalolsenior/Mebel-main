import { NextResponse } from "next/server"
import { checkAndSendDeliveryNotifications, checkAndSendInventoryNotifications } from "@/lib/push-notification-service"

export const maxDuration = 60

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    console.log("[Cron] Starting notification checks...")
    const startTime = Date.now()

    const [deliveryResult, inventoryResult] = await Promise.allSettled([
      checkAndSendDeliveryNotifications(),
      checkAndSendInventoryNotifications(10),
    ])

    const duration = Date.now() - startTime

    return NextResponse.json(
      {
        success: true,
        message: "Notification checks completed",
        duration: `${duration}ms`,
        checks: [
          {
            type: "delivery_dates",
            status: deliveryResult.status === "fulfilled" ? "completed" : "failed",
            error: deliveryResult.status === "rejected" ? deliveryResult.reason?.message : null,
          },
          {
            type: "inventory",
            status: inventoryResult.status === "fulfilled" ? "completed" : "failed",
            error: inventoryResult.status === "rejected" ? inventoryResult.reason?.message : null,
          },
        ],
        timestamp: new Date().toISOString(),
      },
      { status: 200 },
    )
  } catch (error) {
    console.error("[Cron] Error in push-cron endpoint:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}

export async function HEAD() {
  return NextResponse.json({ status: "ok" })
}
