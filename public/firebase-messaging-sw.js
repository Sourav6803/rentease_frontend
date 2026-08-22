/* eslint-disable */
// firebase-messaging-sw.js
// Service worker for Firebase Cloud Messaging (background/closed-tab push).
//
// This worker handles FCM push events DIRECTLY (no firebase SDK loaded at SW
// level), so a notification is displayed exactly ONCE. Previously the SDK's
// automatic display plus a manual showNotification() produced duplicates.
//
// Token registration happens page-side (lib/pushNotifications.ts); the worker
// only receives push events and shows the notification.
//
// Payload shape (sent by the backend):
//   { notification: { title, body, icon }, data: { url?, notificationId?, ... } }

self.addEventListener('push', function (event) {
  var payload = null
  try {
    payload = event.data ? event.data.json() : null
  } catch (err) {
    console.error('[fcm-sw] failed to parse push payload:', err)
    return
  }
  if (!payload) return

  console.log('[fcm-sw] background message received:', payload)

  var notification = payload.notification || {}
  var data = payload.data || {}
  var link =
    data.url ||
    (notification.click_action && notification.click_action !== 'FLUTTER_NOTIFICATION_CLICK'
      ? notification.click_action
      : '/notifications')

  event.waitUntil(
    self.registration
      .showNotification(notification.title || 'RentEase', {
        body: notification.body || '',
        icon: notification.icon || '/logo.png',
        badge: '/badge.png',
        image: notification.image || undefined,
        data: { url: link },
        tag: data.notificationId || undefined,
      })
      .then(function () {
        console.log('[fcm-sw] showNotification OK')
      })
      .catch(function (err) {
        console.error('[fcm-sw] showNotification FAILED:', err)
      })
  )
})

// Open the right route when a notification is clicked.
self.addEventListener('notificationclick', function (event) {
  event.notification.close()
  var targetUrl = (event.notification.data && event.notification.data.url) || '/notifications'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then(function (clientList) {
        for (var i = 0; i < clientList.length; i++) {
          var client = clientList[i]
          if ('focus' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      })
  )
})
