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
  subscribeToPush: () => Promise<void>
  unsubscribeFromPush: () => Promise<void>
  isPushSupported: boolean
  isSubscribed: boolean
  platform: "ios" | "android" | "unknown"
}

const PWAContext = createContext<PWAContextType | undefined>(undefined)

export function PWAProvider({ children }: { children: React.ReactNode }) {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermission>("default")
  const [isPushSupported, setIsPushSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [platform, setPlatform] = useState<"ios" | "android" | "unknown">("unknown")

  useEffect(() => {
    // Check if app is installed
    if (window.matchMedia("(display-mode: standalone)").matches) {
      setIsInstalled(true)
    }

    // Check notification permission
    if ("Notification" in window) {
      setNotificationPermission(Notification.permission)
    }

    setIsPushSupported("serviceWorker" in navigator && "PushManager" in window)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setIsInstallable(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    detectPlatform()
    registerServiceWorker()

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const registerServiceWorker = async () => {
    try {
      // Use environment check to detect preview mode
      if (typeof window !== "undefined" && window.location.hostname.includes("vusercontent")) {
        console.log("[v0] Service Worker skipped in preview environment - using local notifications only")
        return
      }

      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register("/sw.js", {
          scope: "/", // Explicit scope for all routes
        })
        console.log("[v0] Service Worker registered:", registration)

        if (isPushSupported) {
          const subscription = await registration.pushManager.getSubscription()
          setIsSubscribed(!!subscription)
        }

        if ("periodicSync" in registration && platform === "android") {
          try {
            await registration.periodicSync.register("sync-subscriptions", {
              minInterval: 24 * 60 * 60 * 1000, // 24 hours
            })
            console.log("[v0] Periodic sync registered for Android")
          } catch (error) {
            console.warn("[v0] Periodic sync registration failed:", error)
          }
        }

        navigator.serviceWorker.addEventListener("message", (event) => {
          if (event.data.type === "SUBSCRIPTION_ACTIVE") {
            setIsSubscribed(true)
          }
        })

        // Check for updates periodically
        setInterval(() => {
          registration.update()
        }, 60000)
      }
    } catch (error) {
      console.error("[v0] Service Worker registration failed:", error)
    }
  }

  const subscribeToPush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("[v0] Push notifications not supported on this platform")
        return
      }

      const registration = await navigator.serviceWorker.ready
      let subscription = await registration.pushManager.getSubscription()

      if (!subscription) {
        let response
        try {
          response = await fetch("/api/push-public-key")
        } catch (error) {
          console.error("[v0] Failed to fetch VAPID public key:", error)
          throw new Error("Could not fetch VAPID configuration")
        }

        if (!response.ok) {
          throw new Error(`Failed to fetch VAPID key: ${response.statusText}`)
        }

        const { publicKey } = await response.json()

        if (!publicKey) {
          throw new Error("VAPID public key is missing from server")
        }

        try {
          subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey),
          })
        } catch (subscribeError: any) {
          console.error("[v0] Push subscription failed:", subscribeError)
          if (subscribeError.name === "NotAllowedError") {
            throw new Error(
              platform === "ios"
                ? "Push notifications require explicit permission on iOS. Check Settings > Notifications"
                : "Notification permission denied",
            )
          }
          throw subscribeError
        }

        // Send subscription to server
        const subscribeResponse = await fetch("/api/push-subscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...subscription,
            platform,
          }),
        })

        if (subscribeResponse.ok) {
          setIsSubscribed(true)
          console.log("[v0] Successfully subscribed to push notifications")
        }
      } else {
        setIsSubscribed(true)
        console.log("[v0] Already subscribed to push notifications")
      }
    } catch (error) {
      console.error("[v0] Push subscription error:", error)
      setIsSubscribed(false)
      throw error
    }
  }

  const unsubscribeFromPush = async () => {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        return
      }

      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Notify server about unsubscription
        await fetch("/api/push-unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        // Unsubscribe from push manager
        await subscription.unsubscribe()
        setIsSubscribed(false)
        console.log("[v0] Unsubscribed from push notifications")
      }
    } catch (error) {
      console.error("[v0] Push unsubscription error:", error)
    }
  }

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
    if (!("Notification" in window)) {
      console.warn("[v0] Notifications not supported on this browser")
      return
    }

    try {
      if (platform === "ios") {
        console.log("[v0] iOS: Requesting notification permission...")
      }

      const permission = await Notification.requestPermission()
      setNotificationPermission(permission)

      if (permission === "granted") {
        if (isPushSupported) {
          try {
            await subscribeToPush()
          } catch (error) {
            console.error("[v0] Failed to subscribe after permission grant:", error)
          }
        }
      }
    } catch (error) {
      console.error("[v0] Notification permission error:", error)
    }
  }

  const sendNotification = (title: string, body: string) => {
    if (notificationPermission === "granted") {
      new Notification(title, {
        body,
        icon: "/icon-192.jpg",
        badge: "/icon-192.jpg",
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

  const detectPlatform = () => {
    const ua = navigator.userAgent
    if (/iPad|iPhone|iPod/.test(ua)) {
      setPlatform("ios")
      console.log("[PWA] Detected iOS platform - using iOS-specific notification handling")
    } else if (/Android/.test(ua)) {
      setPlatform("android")
      console.log("[PWA] Detected Android platform")
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
        subscribeToPush,
        unsubscribeFromPush,
        isPushSupported,
        isSubscribed,
        platform,
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

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
