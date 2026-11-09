const CACHE = 'progday-v2'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.add('/')))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  if (event.request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone()
          caches.open(CACHE).then(cache => cache.put(event.request, copy))
          return response
        }
        return caches.match(event.request).then(cached => cached || response)
      })
      .catch(() =>
        caches.match(event.request).then(cached => {
          if (cached) return cached
          if (url.pathname.startsWith('/api')) return Response.error()
          return caches.match('/')
        })
      )
  )
})

self.addEventListener('push', (event) => {
  // iOS отключает подписку, если на push не показано уведомление, поэтому показываем всегда
  let data = { title: 'ProgDay', body: '' }
  try {
    if (event.data) data = event.data.json()
  } catch {
    data.body = event.data.text()
  }

  // tag: копия того же уведомления заменяет предыдущее, а не висит рядом
  const tag = data.title + '|' + data.body

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      tag,
      renotify: false
    })
  )
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ('focus' in client) {
          if ('navigate' in client) client.navigate('/main')
          return client.focus()
        }
      }
      return clients.openWindow('/main')
    })
  )
})
