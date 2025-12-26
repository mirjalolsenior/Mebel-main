// Generate VAPID keys for Web Push API
// In production, store these in environment variables
export const VAPID_KEYS = {
  publicKey:
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
    "BDTvkEJJfVpJ4g3-QnN5dN6w1e4d5eH4d5eH4d5eH4d5eH4d5eH4d5eH4d5eH4d5eH4d5eH4",
  privateKey: process.env.VAPID_PRIVATE_KEY || "your-vapid-private-key-here",
}

// Note: Generate your own VAPID keys using:
// npx web-push generate-vapid-keys
export function getPublicVAPIDKey() {
  return VAPID_KEYS.publicKey
}

export function getPrivateVAPIDKey() {
  return VAPID_KEYS.privateKey
}
