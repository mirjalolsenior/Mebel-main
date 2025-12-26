import webpush from "web-push"
import { createClient } from "@/lib/supabase/server"

let webPushInitialized = false

const sentNotifications = new Map<string, number>()
const DUPLICATE_CHECK_WINDOW = 5 * 60 * 1000 // 5 minutes

export function initWebPush(): boolean {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    const privateKey = process.env.VAPID_PRIVATE_KEY

    if (!publicKey || !privateKey) {
      console.warn("[Push] VAPID keys not configured. Skipping web-push initialization.")
      return false
    }

    webpush.setVapidDetails("mailto:sherdormebel@example.com", publicKey, privateKey)

    webPushInitialized = true
    console.log("[Push] Web-push initialized successfully")
    return true
  } catch (error) {
    console.error("[Push] Failed to initialize web-push:", error)
    return false
  }
}

export interface PushNotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  vibrate?: number[]
  tag?: string
  requireInteraction?: boolean
  actions?: Array<{ action: string; title: string; icon?: string }>
  data?: Record<string, any>
}

export interface SendPushResult {
  success: number
  failed: number
  errors: Array<{ endpoint: string; error: string }>
}

function shouldSendNotification(tag: string): boolean {
  const lastSent = sentNotifications.get(tag)
  const now = Date.now()

  if (lastSent && now - lastSent < DUPLICATE_CHECK_WINDOW) {
    console.log(`[Push] Skipping duplicate notification: ${tag}`)
    return false
  }

  sentNotifications.set(tag, now)
  return true
}

export async function sendPushNotificationToAll(payload: PushNotificationPayload): Promise<SendPushResult> {
  if (!webPushInitialized) {
    initWebPush()
  }

  const supabase = await createClient()
  const result: SendPushResult = { success: 0, failed: 0, errors: [] }

  const notificationTag = payload.tag || `notification-${Date.now()}`
  if (!shouldSendNotification(notificationTag)) {
    console.log("[Push] Notification skipped (duplicate within 5 minutes)")
    return { success: 0, failed: 0, errors: [] }
  }

  try {
    const { data: subscriptions, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })

    if (error || !subscriptions) {
      console.error("[Push] Failed to fetch subscriptions:", error)
      return result
    }

    console.log(`[Push] Sending notification to ${subscriptions.length} devices`)

    const notification: PushNotificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon-192.jpg",
      badge: payload.badge || "/icon-192.jpg",
      vibrate: payload.vibrate || [100, 50, 100],
      tag: notificationTag,
      requireInteraction: payload.requireInteraction ?? true,
      data: {
        dateOfArrival: Date.now(),
        ...payload.data,
      },
      actions: payload.actions || [
        { action: "explore", title: "Ko'rish" },
        { action: "close", title: "Yopish" },
      ],
    }

    for (const subscription of subscriptions) {
      try {
        const subscriptionObject = {
          endpoint: subscription.endpoint,
          keys: {
            auth: subscription.auth,
            p256dh: subscription.p256dh,
          },
        }

        // Platform-specific payload handling
        let payloadToSend = notification
        if (subscription.platform === "ios") {
          // iOS has specific payload limitations
          payloadToSend = {
            ...notification,
            actions: undefined, // iOS doesn't support action buttons in same way
          }
        }

        await webpush.sendNotification(subscriptionObject, JSON.stringify(payloadToSend))

        await supabase.from("notification_logs").insert({
          subscription_id: subscription.id,
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          status: "sent",
          platform: subscription.platform || "unknown",
          sent_at: new Date().toISOString(),
        })

        result.success++
        console.log(`[Push] Sent to ${subscription.endpoint.slice(0, 30)}... (${subscription.platform})`)
      } catch (error: any) {
        result.failed++

        if (error.statusCode === 410 || error.statusCode === 404) {
          // Subscription no longer valid
          await supabase.from("push_subscriptions").update({ is_active: false }).eq("id", subscription.id)
          console.warn(`[Push] Marked subscription as inactive (${error.statusCode})`)
        } else if (error.statusCode === 429) {
          // Rate limited
          console.warn("[Push] Rate limited by push service")
        }

        await supabase.from("notification_logs").insert({
          subscription_id: subscription.id,
          title: notification.title,
          body: notification.body,
          icon: notification.icon,
          status: "failed",
          platform: subscription.platform || "unknown",
          error_message: error.message,
        })

        result.errors.push({
          endpoint: subscription.endpoint.slice(0, 50),
          error: error.message,
        })

        console.error(`[Push] Failed to send:`, error.message)
      }
    }
  } catch (error) {
    console.error("[Push] Error in sendPushNotificationToAll:", error)
  }

  return result
}

export async function sendPushNotification(endpoint: string, payload: PushNotificationPayload): Promise<boolean> {
  if (!webPushInitialized) {
    initWebPush()
  }

  try {
    const supabase = await createClient()

    const { data: subscription, error } = await supabase
      .from("push_subscriptions")
      .select("*")
      .eq("endpoint", endpoint)
      .single()

    if (error || !subscription) {
      console.error("[Push] Subscription not found:", endpoint)
      return false
    }

    const subscriptionObject = {
      endpoint: subscription.endpoint,
      keys: {
        auth: subscription.auth,
        p256dh: subscription.p256dh,
      },
    }

    const notification: PushNotificationPayload = {
      title: payload.title,
      body: payload.body,
      icon: payload.icon || "/icon-192.jpg",
      badge: payload.badge || "/icon-192.jpg",
      vibrate: payload.vibrate || [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        ...payload.data,
      },
    }

    await webpush.sendNotification(subscriptionObject, JSON.stringify(notification))

    await supabase.from("notification_logs").insert({
      subscription_id: subscription.id,
      title: notification.title,
      body: notification.body,
      icon: notification.icon,
      status: "sent",
      sent_at: new Date().toISOString(),
    })

    return true
  } catch (error: any) {
    console.error("[Push] Error sending notification:", error)
    return false
  }
}

export async function checkAndSendDeliveryNotifications(): Promise<void> {
  const supabase = await createClient()

  try {
    const { data: zakazlar, error } = await supabase
      .from("zakazlar")
      .select("*")
      .not("qachon_berish_kerak", "is", null)
      .order("qachon_berish_kerak", { ascending: true })

    if (error || !zakazlar) {
      console.error("[Push] Failed to fetch zakazlar:", error)
      return
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    let notificationsCount = 0

    const dueToday = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() === today.getTime()
    })

    if (dueToday.length > 0) {
      await sendPushNotificationToAll({
        title: "⏰ Bugun yetkazish kerak!",
        body: `${dueToday.length} ta zakaz bugun yetkazilishi kerak.`,
        tag: "delivery-today",
      })
      notificationsCount += 1
    }

    const overdue = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() < today.getTime()
    })

    if (overdue.length > 0) {
      await sendPushNotificationToAll({
        title: "🚨 Kechikkan zakazlar!",
        body: `${overdue.length} ta zakaz muddati o'tib ketgan.`,
        tag: "delivery-overdue",
      })
      notificationsCount += 1
    }

    const dueTomorrow = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() === tomorrow.getTime()
    })

    if (dueTomorrow.length > 0) {
      await sendPushNotificationToAll({
        title: "📅 Ertaga yetkazish kerak",
        body: `${dueTomorrow.length} ta zakaz ertaga yetkazilishi kerak.`,
        tag: "delivery-tomorrow",
      })
      notificationsCount += 1
    }

    await supabase.from("notification_check_logs").insert({
      check_type: "delivery_dates",
      affected_count: dueToday.length + overdue.length + dueTomorrow.length,
      notifications_sent: notificationsCount,
    })

    console.log(`[Push] Delivery check completed. Sent ${notificationsCount} notifications.`)
  } catch (error) {
    console.error("[Push] Error in checkAndSendDeliveryNotifications:", error)

    const supabase = await createClient()
    await supabase.from("notification_check_logs").insert({
      check_type: "delivery_dates",
      affected_count: 0,
      notifications_sent: 0,
      error_message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

export async function checkAndSendInventoryNotifications(lowStockThreshold = 10): Promise<void> {
  const supabase = await createClient()

  try {
    const { data: items, error } = await supabase.from("ombor").select("*").order("qoldiq", { ascending: true })

    if (error || !items) {
      console.error("[Push] Failed to fetch inventory:", error)
      return
    }

    let notificationsCount = 0
    const depleted = items.filter((item) => item.qoldiq === 0)
    const lowStock = items.filter((item) => item.qoldiq > 0 && item.qoldiq < lowStockThreshold)

    if (depleted.length > 0) {
      await sendPushNotificationToAll({
        title: "❌ Tovarlar tugadi!",
        body: `${depleted.length} ta tovar omborda tugagan.`,
        tag: "inventory-depleted",
      })
      notificationsCount += 1
    }

    if (lowStock.length > 0) {
      await sendPushNotificationToAll({
        title: "⚠️ Kam qolgan tovarlar",
        body: `${lowStock.length} ta tovar omborda kam qolgan.`,
        tag: "inventory-low",
      })
      notificationsCount += 1
    }

    await supabase.from("notification_check_logs").insert({
      check_type: "low_stock",
      affected_count: depleted.length + lowStock.length,
      notifications_sent: notificationsCount,
    })

    console.log(`[Push] Inventory check completed. Sent ${notificationsCount} notifications.`)
  } catch (error) {
    console.error("[Push] Error in checkAndSendInventoryNotifications:", error)

    const supabase = await createClient()
    await supabase.from("notification_check_logs").insert({
      check_type: "low_stock",
      affected_count: 0,
      notifications_sent: 0,
      error_message: error instanceof Error ? error.message : "Unknown error",
    })
  }
}
