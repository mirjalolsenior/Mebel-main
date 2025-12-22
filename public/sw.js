const CACHE_NAME = "sherdor-mebel-v1"
const urlsToCache = ["/", "/manifest.json", "/icon-192.jpg", "/icon-512.jpg"]

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache)
    }),
  )
})

// Fetch event
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request)
    }),
  )
})

// Push event for notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "Yangi xabar",
    icon: "/icon-192.jpg",
    badge: "/icon-192.jpg",
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
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

  event.waitUntil(self.registration.showNotification("Sherdor Mebel", options))
})

// Notification click event
self.addEventListener("notificationclick", (event) => {
  event.notification.close()

  if (event.action === "explore") {
    event.waitUntil(clients.openWindow("/"))
  }
})
// public/sw.js
self.addEventListener("push", (event) => {
  const data = event.data?.json ? event.data.json() : (event.data || {});
  const title = data.title || "Sherdor Mebel";
  const options = {
    body: data.body || "Yangi bildirishnoma",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    data: data,
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification?.data?.url || "/")
  );
});
