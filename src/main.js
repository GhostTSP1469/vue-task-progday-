import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { createPinia } from 'pinia'

createApp(App).use(router).use(createPinia()).mount('#app')

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(async (mine) => {
    // лишние регистрации показали бы одно и то же уведомление несколько раз
    const all = await navigator.serviceWorker.getRegistrations()
    for (const registration of all) {
      if (registration !== mine) await registration.unregister()
    }
  })
}

// iOS игнорирует user-scalable=no, поэтому масштабирование блокируем вручную
const stop = (e) => e.preventDefault()
for (const name of ['gesturestart', 'gesturechange', 'gestureend']) {
  document.addEventListener(name, stop, { passive: false })
}
document.addEventListener('touchmove', (e) => {
  if (e.touches.length > 1) e.preventDefault()
}, { passive: false })
