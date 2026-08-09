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

// IMPORTANT: The service worker uses the *namespaced* (compat) Firebase API
// (`firebase.initializeApp`, `firebase.messaging()`), so it must load the
// `-compat` builds. The modular `firebase-app.js` / `firebase-messaging.js`
// paths are not importScripts-compatible on v9+ and fail with a NetworkError.
//
// importScripts is synchronous and THROWS on a network failure, which aborts SW
// installation entirely — so a blocked/slow gstatic (corporate proxy, regional
// filtering, CDN blip) means no background push at all. Try the primary CDN and
// fall back to jsDelivr before giving up.
var FIREBASE_SDK_VERSION = '10.12.2'
var SDK_CDNS = [
  'https://www.gstatic.com/firebasejs/' + FIREBASE_SDK_VERSION,
  'https://cdn.jsdelivr.net/npm/firebase@' + FIREBASE_SDK_VERSION + '/compat',
]

function loadFirebaseSdk() {
  for (var i = 0; i < SDK_CDNS.length; i++) {
    try {
      importScripts(SDK_CDNS[i] + '/firebase-app-compat.js')
      importScripts(SDK_CDNS[i] + '/firebase-messaging-compat.js')
      return true
    } catch (err) {
      // Try the next CDN. Log so failures are visible in the SW console.
      console.error('[fcm-sw] failed to load Firebase SDK from ' + SDK_CDNS[i], err)
    }
  }
  return false
}

if (loadFirebaseSdk()) {
  firebase.initializeApp(self.firebaseConfig)
  var messaging = firebase.messaging()

  // Handle background messages (app in background or closed).
  messaging.onBackgroundMessage(function (payload) {
    var notification = payload.notification || {}
    var data = payload.data || {}
    var link =
      data.url ||
      (notification.click_action && notification.click_action !== 'FLUTTER_NOTIFICATION_CLICK'
        ? notification.click_action
        : '/notifications')

    self.registration.showNotification(notification.title || 'RentEase', {
      body: notification.body || '',
      icon: '/logo.png',
      badge: '/badge.png',
      image: notification.image || undefined,
      data: { url: link },
      tag: data.notificationId || undefined,
    })
  })
} else {
  console.error('[fcm-sw] Firebase SDK unavailable from all CDNs — background push disabled')
}

// Open the right route when a notification is clicked. Registered
// unconditionally so clicks still route even if the SDK failed to load.
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
