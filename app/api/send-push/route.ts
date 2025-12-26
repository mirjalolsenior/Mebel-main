import { type NextRequest, NextResponse } from "next/server"
import { sendPushNotificationToAll, initWebPush } from "@/lib/push-notification-service"

// Note: In production, use a library like 'web-push'
// npm install web-push
// For now, this is a placeholder for the backend push sending logic

export async function POST(request: NextRequest) {
  try {
    const { title, body, icon } = await request.json()

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 })
    }

    // Initialize web-push
    if (!initWebPush()) {
      return NextResponse.json({ error: "VAPID keys not configured" }, { status: 400 })
    }

    const result = await sendPushNotificationToAll({
      title,
      body,
      icon,
    })

    return NextResponse.json({
      success: true,
      message: `Push notification sent to ${result.success} devices`,
      ...result,
    })
  } catch (error) {
    console.error("[v0] Send push error:", error)
    return NextResponse.json({ error: "Failed to send push notification" }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Push sending endpoint ready. Use POST to send notifications." })
}
