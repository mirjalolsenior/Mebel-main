# Mobile PWA Push Notifications - Complete Guide

## 🔴 Problem Analysis

Push notifications on mobile PWAs fail because:

1. **iOS Limitations** (Safari on iOS 16.4+)
   - Different permission model than Android
   - Requires explicit user permission in Settings
   - Different payload size limitations
   - Limited action button support

2. **Android Differences** (Chrome PWA)
   - Uses standard Web Push API
   - Supports background sync and periodic sync
   - Requires proper VAPID key configuration
   - Different notification lifecycle

3. **Service Worker Scope Issues**
   - Incorrect scope can prevent notifications from firing
   - Background sync doesn't work without proper scope

4. **VAPID Key Problems**
   - Public key not accessible to client
   - Private key misconfiguration
   - Keys not matching between client and server

5. **Subscription State Not Synced**
   - Service Worker subscription not checked regularly
   - Stale subscriptions stored in database

---

## ✅ Solution Implementation

### 1. **Service Worker (Enhanced)**
- Platform detection (iOS vs Android)
- Platform-specific notification options
- Proper cache strategies
- Periodic sync for subscription verification

### 2. **PWA Provider (Updated)**
- Client-side platform detection
- Automatic subscription sync
- Error handling with platform-specific messages
- Periodic sync registration for Android

### 3. **Backend Push Service (Enhanced)**
- Platform-aware payload generation
- Subscription status tracking
- Duplicate notification prevention
- Rate limiting and error recovery

### 4. **Database Tracking**
- Platform field on subscriptions
- Notification logs with platform info
- Error tracking for debugging

---

## 📱 Platform-Specific Details

### Android (Chrome PWA)

**Requirements:**
- ✅ Service Worker registration with scope "/"
- ✅ VAPID keys properly configured
- ✅ Push Manager subscription
- ✅ Notification permission granted

**Working Features:**
- Full Web Push API support
- Background notifications when app closed
- Periodic sync API
- Action buttons on notifications
- Full payload support

**Testing:**
```bash
# Chrome DevTools
- Application > Service Workers (verify registered)
- Application > Push Messaging > Create test message
- Notification permission should show "Allow"
```

### iOS (Safari PWA)

**Requirements:**
- ✅ iOS 16.4+ (Web Push API support)
- ✅ Installed via "Add to Home Screen" (critical!)
- ✅ Notification permission in Settings > Notifications
- ✅ App running or recently backgrounded

**Limitations:**
- ❌ No background sync if app force-closed
- ❌ Notifications only work if app installed
- ❌ No periodic sync
- ❌ Limited action button support
- ⚠️ Different permission UI than Android

**Important:** iOS requires installation via Home Screen, not just browser tab!

**iOS Permission Flow:**
```
1. User grants permission in browser prompt
2. App must request permission again when installed via Home Screen
3. User must enable notifications in Settings > Notifications
```

---

## 🔧 Configuration

### VAPID Keys Setup

Generate new VAPID keys:
```bash
npm install -g web-push
web-push generate-vapid-keys
```

Save to environment variables:
```env
NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_public_key_here
VAPID_PRIVATE_KEY=your_private_key_here
```

### Database Schema

Ensure `push_subscriptions` table has:
- `id` (UUID, primary key)
- `endpoint` (TEXT, unique)
- `auth` (TEXT)
- `p256dh` (TEXT)
- `platform` (TEXT) - "android", "ios", or "web"
- `browser` (TEXT) - "chrome", "safari", etc.
- `user_agent` (TEXT)
- `is_active` (BOOLEAN)
- `created_at` (TIMESTAMP)
- `updated_at` (TIMESTAMP)
- `last_verified` (TIMESTAMP)

---

## 📋 Testing Checklist

### Desktop/Laptop Testing
- [ ] Notification permission request appears
- [ ] Permission can be granted/denied
- [ ] Test notification appears
- [ ] Notification click opens app
- [ ] No errors in browser console

### Android PWA Testing

**Installation:**
- [ ] Three-dot menu → "Install app"
- [ ] App appears on home screen
- [ ] App launches standalone (full screen)

**Notifications:**
- [ ] Grant notification permission
- [ ] "Push API" shows as supported
- [ ] Test notification appears
- [ ] Close app completely
- [ ] Send push from admin → Notification appears
- [ ] App closed for 24+ hours → Notification still appears
- [ ] Click notification → App opens
- [ ] Notification actions work

**Debugging:**
```
Chrome DevTools:
1. Inspect app while running
2. Application > Service Workers → Verify "active and running"
3. Application > Manifest → Verify scope is "/"
4. Send test push from /api/send-push
5. Check notification_logs table for delivery status
```

### iOS PWA Testing

**Installation (CRITICAL):**
- [ ] Safari menu → "Add to Home Screen"
- [ ] App name: "Sherdor Mebel"
- [ ] App icon appears on home screen
- [ ] Tap home screen icon to launch

**Initial Permission:**
- [ ] Open app from home screen
- [ ] Grant notification permission in prompt
- [ ] Go to Settings > Notifications > Sherdor Mebel
- [ ] Enable "Allow Notifications"
- [ ] Allow "Critical Alerts" if available

**Notifications:**
- [ ] Send test notification
- [ ] Notification appears on lock screen
- [ ] Notification appears in Notification Center
- [ ] Tap notification → App opens
- [ ] With app in background → Notification still appears
- [ ] With app closed → Notification may not appear immediately
  - (iOS limits background notifications; user must have interacted with app recently)

**Debugging:**
```
Safari on iOS:
1. Unlock device
2. Home screen → open app
3. Settings > Safari > Advanced > Web Inspector
4. On Mac: Safari > Develop > [Device] > [App name]
5. Check console for "[v0]" debug messages
6. Platform should show "ios"
7. Check push_subscriptions table for iOS entries
```

---

## 🚨 Troubleshooting

### Symptom: "Push API (limited)" on Android

**Causes:**
- Service Worker not registered
- PushManager not available
- Old Android version (<5.0)

**Fix:**
```typescript
// Check in console:
console.log("SW available:", "serviceWorker" in navigator)
console.log("PushManager available:", "PushManager" in window)
```

### Symptom: Notifications work on desktop but not mobile

**Check:**
- [ ] App installed on home screen (not just browser tab)
- [ ] Notification permission in Settings
- [ ] Service Worker active (check in app logs)
- [ ] Platform detected correctly (check console)

### Symptom: iOS notifications not appearing

**Critical Steps:**
1. Uninstall app from home screen
2. Close Safari completely
3. Re-add to home screen
4. Grant permissions again
5. Go to Settings > Notifications and enable

### Symptom: "NotAllowedError" when subscribing

**Causes:**
- Notification permission not granted first
- User denied permission
- iOS requires Settings permission enabled

**Fix:**
- Request permission explicitly first
- Check browser console for exact error
- On iOS: Go to Settings > Notifications

### Symptom: No errors but notifications don't arrive

**Debug Steps:**
```sql
-- Check subscriptions in database
SELECT platform, is_active, browser, COUNT(*) 
FROM push_subscriptions 
GROUP BY platform, is_active, browser;

-- Check recent notification logs
SELECT * FROM notification_logs 
ORDER BY sent_at DESC LIMIT 10;

-- Look for errors
SELECT * FROM notification_logs 
WHERE status = 'failed' 
ORDER BY sent_at DESC LIMIT 5;
```

---

## 🔐 Security Considerations

1. **VAPID Keys**
   - Never expose private key to client
   - Rotate keys periodically
   - Use environment variables

2. **Subscription Storage**
   - Store encrypted if handling sensitive data
   - Mark subscriptions inactive if push fails
   - Clean up old subscriptions

3. **User Privacy**
   - Always request permission explicitly
   - Allow users to unsubscribe easily
   - Don't store personal data in notification payloads

---

## 📊 Monitoring

Track notification delivery:

```sql
-- Daily notification summary
SELECT 
  DATE(sent_at) as date,
  platform,
  status,
  COUNT(*) as count
FROM notification_logs
GROUP BY DATE(sent_at), platform, status
ORDER BY date DESC;

-- Subscription health
SELECT 
  platform,
  is_active,
  COUNT(*) as count,
  MAX(last_verified) as last_verified
FROM push_subscriptions
GROUP BY platform, is_active;
```

---

## 🔗 References

- [Web Push API - MDN](https://developer.mozilla.org/en-US/docs/Web/API/Push_API)
- [iOS Web Push Support](https://webkit.org/blog/12945/meet-web-push-on-ios-and-ipados/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [VAPID Keys Spec](https://tools.ietf.org/html/draft-thomson-webpush-vapid)
