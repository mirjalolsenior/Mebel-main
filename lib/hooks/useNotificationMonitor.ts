"use client"

import { useEffect } from "react"
import { usePWA } from "@/components/pwa/pwa-provider"
import { supabase } from "@/lib/supabase/client"

interface MonitorOptions {
  checkInterval?: number // in milliseconds
  lowStockThreshold?: number
}

export function useNotificationMonitor(options: MonitorOptions = {}) {
  const { checkInterval = 5 * 60 * 1000, lowStockThreshold = 10 } = options // Default: 5 minutes
  const { sendNotification, notificationPermission } = usePWA()

  useEffect(() => {
    if (notificationPermission !== "granted") return

    checkNotifications()

    const interval = setInterval(checkNotifications, checkInterval)

    return () => clearInterval(interval)
  }, [notificationPermission, checkInterval, lowStockThreshold])

  async function checkNotifications() {
    try {
      await Promise.all([checkDeliveryDates(), checkLowStock()])
    } catch (error) {
      console.error("[v0] Notification check error:", error)
    }
  }

  async function checkDeliveryDates() {
    const { data: zakazlar, error } = await supabase
      .from("zakazlar")
      .select("*")
      .not("qachon_berish_kerak", "is", null)
      .order("qachon_berish_kerak", { ascending: true })

    if (error || !zakazlar) return

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check for orders due today
    const dueToday = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() === today.getTime()
    })

    if (dueToday.length > 0) {
      sendNotification(
        "⏰ Bugun yetkazish kerak!",
        `${dueToday.length} ta zakaz bugun yetkazilishi kerak. Buyurtmalarni tekshiring.`,
      )
    }

    // Check for overdue orders
    const overdue = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() < today.getTime()
    })

    if (overdue.length > 0) {
      sendNotification(
        "🚨 Kechikkan zakazlar!",
        `${overdue.length} ta zakaz muddati o'tib ketgan. Iltimos, tekshiring.`,
      )
    }

    // Check for orders due within 1 day
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const dueTomorrow = zakazlar.filter((z) => {
      const deliveryDate = new Date(z.qachon_berish_kerak)
      deliveryDate.setHours(0, 0, 0, 0)
      return deliveryDate.getTime() === tomorrow.getTime()
    })

    if (dueTomorrow.length > 0) {
      sendNotification("📅 Ertaga yetkazish kerak", `${dueTomorrow.length} ta zakaz ertaga yetkazilishi kerak.`)
    }
  }

  async function checkLowStock() {
    const { data: items, error } = await supabase.from("ombor").select("*").order("qoldiq", { ascending: true })

    if (error || !items) return

    // Check for depleted stock
    const depleted = items.filter((item) => item.qoldiq === 0)

    if (depleted.length > 0) {
      sendNotification("❌ Tovarlar tugadi!", `${depleted.length} ta tovar omborda tugagan. Yangi tovar keltiring.`)
    }

    // Check for low stock
    const lowStock = items.filter((item) => item.qoldiq > 0 && item.qoldiq < lowStockThreshold)

    if (lowStock.length > 0) {
      sendNotification(
        "⚠️ Kam qolgan tovarlar",
        `${lowStock.length} ta tovar omborda kam qolgan (${lowStockThreshold}dan kam).`,
      )
    }
  }
}
