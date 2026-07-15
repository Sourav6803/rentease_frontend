/* eslint-disable */
// firebase-messaging-sw.js
// Service worker for Firebase Cloud Messaging (background/closed-tab push).
//
// NOTE: Service workers cannot read process.env, so the public Firebase *web*
// config is hardcoded here. Paste the values from:
//   Firebase Console → Project settings → Your apps → Web app
// (These are public values — no secret keys.)


self.firebaseConfig = {
  apiKey: 'AIzaSyAysDYysJFf1g-ANzOXTtuoiKAeupCZkl4',
  authDomain: 'jamalpur-bazar-7f15b.firebaseapp.com',
  projectId: 'jamalpur-bazar-7f15b',
  storageBucket: 'jamalpur-bazar-7f15b.firebasestorage.app',
  messagingSenderId: '173254412310',
  appId: '1:173254412310:web:b811039d3337b9b18c0d37',
  measurementId: "G-4N3T0JNY9N"
}

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging.js')

firebase.initializeApp(self.firebaseConfig)
const messaging = firebase.messaging()

// Handle background messages (app in background or closed).
messaging.onBackgroundMessage((payload) => {
  const notification = payload.notification || {}
  const data = payload.data || {}
  const link = data.url || (notification.click_action && notification.click_action !== 'FLUTTER_NOTIFICATION_CLICK' ? notification.click_action : '/notifications')

  self.registration.showNotification(notification.title || 'RentEase', {
    body: notification.body || '',
    icon: '/logo.png',
    badge: '/badge.png',
    image: notification.image || undefined,
    data: { url: link },
    tag: data.notificationId || undefined,
  })
})

// Open the right route when a notification is clicked.
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const targetUrl = (event.notification.data && event.notification.data.url) || '/notifications'

  event.waitUntil(
    self.clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if ('focus' in client) {
            client.navigate(targetUrl)
            return client.focus()
          }
        }
        return self.clients.openWindow(targetUrl)
      })
  )
})
