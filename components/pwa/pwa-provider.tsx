"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

interface PWAContextType {
  isInstalled: boolean
  isInstallable: boolean
  installPWA: () => Promise<void>
  notificationPermission: NotificationPermission
  requestNotificationPermission: () => Promise<void>
  sendNotification: (title: string, body: string) => void
  scheduleNotification: (title: string, body: string, delayMinutes: number) => void
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    // Skip service worker registration for now due to v0 preview limitations
    console.log("[v0] PWA Provider initialized without service worker")

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const installPWA = async () => {
    if (!deferredPrompt) return

    deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === "accepted") {
      setIsInstallable(false)
      setIsInstalled(true)
      setDeferredPrompt(null)
    }
  }

  const requestNotificationPermission = async () => {
    if (!("Notification" in window)) return

    try {
      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)
    } catch (error) {
      console.error("[v0] Notification permission error:", error)
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (notificationPermission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.png",
        badge: "/icon-192.png",
        vibrate: [100, 50, 100],
      })
    }
  }

  const scheduleNotification = (title: string, body: string, delayMinutes: number) => {
    if (notificationPermission === "granted") {
      setTimeout(
        () => {
          sendNotification(title, body)
        },
        delayMinutes * 60 * 1000,
      )
    }
  }

  return (
    <PWAContext.Provider
      value={{
        isInstalled,
        isInstallable,
        installPWA,
        notificationPermission,
        requestNotificationPermission,
        sendNotification,
        scheduleNotification,
      }}
    >
      {children}
    </PWAContext.Provider>
  )
}

export function usePWA() {
  const context = useContext(PWAContext)
  if (context === undefined) {
    throw new Error("usePWA must be used within a PWAProvider")
  }
  return context
}
