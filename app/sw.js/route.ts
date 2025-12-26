export const dynamic = "force-dynamic"

export async function GET() {
  const serviceWorkerCode = `
// Service Worker with comprehensive Web Push API support for Android and iOS PWA
// Handles both foreground and background notifications
const CACHE_NAME = "sherdor-mebel-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

const PLATFORM = getPlatform()

function getPlatform() {
  // Detect iOS vs Android in service worker context
  if ('serviceWorkerContainer' in navigator) {
    const ua = navigator.userAgent || ''
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios'
    if (/Android/.test(ua)) return 'android'
  }
  return 'unknown'
}

self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...", { platform: PLATFORM })
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[SW] Cache opened")
        return cache.addAll(urlsToCache).catch((err) => {
          console.warn("[SW] Some files failed to cache:", err)
          return Promise.resolve()
        })
      })
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return
  }

  // Network-first strategy for API calls, cache-first for assets
  const url = new URL(event.request.url)
  const isAPI = url.pathname.startsWith("/api/")

  if (isAPI) {
    // Network-first for API calls
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.ok) {
            const cache = caches.open(CACHE_NAME)
            cache.then((c) => c.put(event.request, response.clone()))
          }
          return response
        })
        .catch(() => caches.match(event.request)),
    )
  } else {
    // Cache-first for assets
    event.respondWith(
      caches
        .match(event.request)
        .then((response) => response || fetch(event.request))
        .catch(() => new Response("Offline")),
    )
  }
})

self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...")
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[SW] Deleting old cache:", cacheName)
              return caches.delete(cacheName)
            }
          }),
        )
      })
      .then(() => self.clients.claim()),
  )
})

self.addEventListener("push", (event) => {
  console.log("[SW] Push notification received:", { platform: PLATFORM })

  let notificationData = {
    title: "Sherdor Mebel",
    body: "Yangi xabar",
    icon: "/icon-192.jpg",
    badge: "/icon-192.jpg",
    vibrate: [100, 50, 100],
  }

  if (event.data) {
    try {
      const data = event.data.json()
      notificationData = { ...notificationData, ...data }
    } catch (error) {
      notificationData.body = event.data.text()
    }
  }

  const notificationOptions = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    vibrate: notificationData.vibrate,
    tag: "sherdor-mebel-notification",
    requireInteraction: true, // Keeps notification visible on mobile
    silent: false, // Ensure sound/vibration plays
    data: {
      dateOfArrival: Date.now(),
      url: "/",
      ...notificationData.data,
    },
    actions: [
      {
        action: "explore",
        title: "Ko'rish",
        icon: "/icon-192.jpg",
      },
      {
        action: "close",
        title: "Yopish",
        icon: "/icon-192.jpg",
      },
    ],
  }

  // iOS-specific: Remove unsupported properties
  if (PLATFORM === "ios") {
    delete notificationOptions.badge
    // iOS doesn't support all actions, limit to one
    notificationOptions.actions = notificationOptions.actions.slice(0, 1)
  }

  event.waitUntil(
    self.registration.showNotification(notificationData.title, notificationOptions),
  )
})

self.addEventListener("notificationclick", (event) => {
  console.log("[SW] Notification clicked:", { action: event.action, platform: PLATFORM })
  event.notification.close()

  const urlToOpen = event.notification.data?.url || "/"

  event.waitUntil(
    clients
      .matchAll({
        type: "window",
        includeUncontrolled: true,
      })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url === urlToOpen && "focus" in client) {
            return client.focus()
          }
        }
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      }),
  )
})

self.addEventListener("notificationclose", (event) => {
  console.log("[SW] Notification closed")
})

self.addEventListener("message", (event) => {
  console.log("[SW] Message received:", event.data)

  if (event.data.type === "SKIP_WAITING") {
    self.skipWaiting()
  }

  if (event.data.type === "SYNC_SUBSCRIPTIONS") {
    syncSubscriptions()
  }
})

if ('periodicSync' in self.registration) {
  self.addEventListener("periodicsync", (event) => {
    if (event.tag === "sync-subscriptions") {
      event.waitUntil(syncSubscriptions())
    }
  })
}

async function syncSubscriptions() {
  try {
    console.log("[SW] Syncing subscription status...")
    const subscription = await self.registration.pushManager.getSubscription()
    if (subscription) {
      // Notify clients that subscription is active
      const clients = await self.clients.matchAll()
      clients.forEach((client) => {
        client.postMessage({
          type: "SUBSCRIPTION_ACTIVE",
          subscription: {
            endpoint: subscription.endpoint,
            platform: PLATFORM,
          },
        })
      })
    }
  } catch (error) {
    console.error("[SW] Error syncing subscriptions:", error)
  }
}
`

  return new Response(serviceWorkerCode, {
    headers: {
      "Content-Type": "application/javascript; charset=utf-8",
      "Cache-Control": "no-cache, no-store, must-revalidate",
    },
  })
}
