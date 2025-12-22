"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff, Smartphone, CheckCircle, AlertCircle } from "lucide-react"
import { useNotificationMonitor } from "@/lib/hooks/useNotificationMonitor"

export function NotificationManager() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported("Notification" in window)

    if ("Notification" in window) {
      setPermission(Notification.permission)
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  useNotificationMonitor({
    checkInterval: 5 * 60 * 1000,
    lowStockThreshold: 10,
  })

  const requestNotificationPermission = async () => {
    if (!isSupported) return

    try {
      const permission = await Notification.requestPermission()
      setPermission(permission)

      if (permission === "granted") {
        // Show success notification
        new Notification("Sherdor Mebel", {
          body: "Bildirishnomalar muvaffaqiyatli yoqildi!",
          icon: "/icon-192.png",
        })
      }
    } catch (error) {
      console.error("[v0] Notification permission error:", error)
    }
  }

  const installPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstallable(false)
      setDeferredPrompt(null)
    }
  }

  const sendTestNotification = () => {
    if (permission === "granted") {
      new Notification("Test Bildirishnoma", {
        body: "Bu test bildirishnomasi. Tizim to'g'ri ishlayapti!",
        icon: "/icon-192.png",
        badge: "/icon-192.png",
      })
    }
  }

  const scheduleReminder = (title: string, message: string, delayMinutes: number) => {
    if (permission === "granted") {
      setTimeout(
        () => {
          new Notification(title, {
            body: message,
            icon: "/icon-192.png",
            badge: "/icon-192.png",
            vibrate: [100, 50, 100],
          })
        },
        delayMinutes * 60 * 1000,
      )
    }
  }

  return (
    <div className="space-y-6">
      {/* PWA Status */}
      <Card className="glass-card animate-slideIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            PWA Holati
          </CardTitle>
          <CardDescription>Progressive Web App xususiyatlari</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Manifest fayli</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">Responsive dizayn</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-sm">HTTPS protokoli</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <AlertCircle className="w-4 h-4 text-blue-500" />
              <span className="text-sm">O'rnatish tayyor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* PWA Installation */}
      {isInstallable && (
        <Card className="glass-card animate-slideIn border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-primary" />
              Ilovani o'rnatish
            </CardTitle>
            <CardDescription>Sherdor Mebel ilovasini telefoningizga o'rnating</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={installPWA} className="w-full">
              <Smartphone className="w-4 h-4 mr-2" />
              Ilovani o'rnatish
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notification Settings */}
      <Card className="glass-card animate-slideIn">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {permission === "granted" ? (
              <Bell className="w-5 h-5 text-green-500" />
            ) : (
              <BellOff className="w-5 h-5 text-muted-foreground" />
            )}
            Bildirishnomalar
          </CardTitle>
          <CardDescription>Muhim eslatmalar va yangilanishlar uchun bildirishnomalarni yoqing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isSupported ? (
            <p className="text-sm text-muted-foreground">
              Sizning brauzeringiz bildirishnomalarni qo'llab-quvvatlamaydi
            </p>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  Holat:{" "}
                  {permission === "granted" ? "Yoqilgan" : permission === "denied" ? "O'chirilgan" : "Aniqlanmagan"}
                </span>
                {permission === "granted" && (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-gentle"></div>
                )}
              </div>

              {permission !== "granted" && (
                <Button onClick={requestNotificationPermission} className="w-full">
                  <Bell className="w-4 h-4 mr-2" />
                  Bildirishnomalarni yoqish
                </Button>
              )}

              {permission === "granted" && (
                <Button onClick={sendTestNotification} variant="outline" className="w-full bg-transparent">
                  Test bildirishnoma yuborish
                </Button>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Features */}
      {permission === "granted" && (
        <Card className="glass-card animate-slideIn">
          <CardHeader>
            <CardTitle>Avtomatik eslatmalar</CardTitle>
            <CardDescription>Tizim avtomatik ravishda quyidagi holatlar uchun eslatma yuboradi</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm">Zakaz muddati bugun kelganda</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg border border-red-200">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span className="text-sm">Zakaz muddati o'tib ketganda</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm">Zakaz muddati ertaga kelganda</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span className="text-sm">Omborda tovar tugaganda (0 ta)</span>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm">Omborda tovar kam qolganda (10dan kam)</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Manual Reminder Scheduler */}
      {permission === "granted" && (
        <Card className="glass-card animate-slideIn">
          <CardHeader>
            <CardTitle>Test eslatmalari</CardTitle>
            <CardDescription>Eslatma tizimini sinab ko'ring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button
              onClick={() => scheduleReminder("Test eslatma", "Bu 10 soniyadan keyin kelgan eslatma", 0.17)}
              variant="outline"
              className="w-full bg-transparent"
            >
              10 soniyadan keyin eslatma
            </Button>
            <Button
              onClick={() => scheduleReminder("1 daqiqalik eslatma", "Bu 1 daqiqadan keyin kelgan eslatma", 1)}
              variant="outline"
              className="w-full bg-transparent"
            >
              1 daqiqadan keyin eslatma
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
