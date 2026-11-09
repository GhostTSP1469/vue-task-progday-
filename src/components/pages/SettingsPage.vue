<script setup>
import { useSettingsStore } from '../datas/settings.js'
import { ref, onMounted } from 'vue'
import { userHeaders } from '../../userId.js'
const settingsStore = useSettingsStore()
const DAYS=[{num:1,label:'Пн'},{num:2,label:'Вт'},{num:3,label:'Ср'},{num:4,label:'Чт'},{num:5,label:'Пт'},{num:6,label:'Сб'},{num:0,label:'Вс'}]

const pushSupported = 'Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window
const permission = ref(pushSupported ? Notification.permission : 'unsupported')
const pushError = ref('')

// Safari надёжнее принимает ключ как массив байт, а не как строку
function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  return Uint8Array.from(atob(base64), char => char.charCodeAt(0))
}

// если Service Worker не поднялся, ready на iPhone может висеть вечно
function getRegistration() {
  return Promise.race([
    navigator.serviceWorker.ready,
    new Promise((_, reject) => setTimeout(() => reject(new Error('Service Worker не запустился')), 8000))
  ])
}

async function subscribeToPush() {
  const registration = await getRegistration()
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY)
  })
  const response = await fetch('/api/subscribe', {
    method: 'POST',
    body: JSON.stringify(subscription),
    headers: userHeaders
  })
  if (!response.ok) throw new Error('Сервер не принял подписку')
}

async function askPermission() {
  pushError.value = ''
  try {
    const result = await Notification.requestPermission()
    permission.value = result
    if (result === 'granted') await subscribeToPush()
  } catch (err) {
    pushError.value = err.message
  }
}

// разрешение уже есть, а подписки на сервере может не быть (сбросили базу, не дошёл запрос)
onMounted(async () => {
  if (permission.value !== 'granted') return
  try {
    await subscribeToPush()
  } catch (err) {
    pushError.value = err.message
  }
})

function toggleDay(num){
    const index=settingsStore.settings.workDays.indexOf(num)
    if(index===-1){
        settingsStore.settings.workDays.push(num)
    }else{
        settingsStore.settings.workDays.splice(index,1)
    }
}
</script>

<template>
  <div class="flex flex-col gap-4">
    <h1 class="text-3xl font-bold tracking-tight">Настройки</h1>
<section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800">
      <h2 class="font-medium">Push-уведомления</h2>

      <p v-if="permission === 'granted'" class="mt-1 text-sm text-slate-500 dark:text-slate-400">Включены</p>
      <p v-else-if="permission === 'denied'" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        Ты отказал в разрешении. Включи уведомления для сайта в настройках браузера (значок замка у адреса) или телефона.
      </p>
      <p v-else-if="permission === 'unsupported'" class="mt-1 text-sm text-slate-500 dark:text-slate-400">
        push  здесь недоступен. На iPhone добавь сайт на экран «Домой» и открой с иконки.
      </p>
      <p v-else class="mt-1 text-sm text-slate-500 dark:text-slate-400">Выключены</p>

      <p v-if="pushError" class="mt-1 text-sm text-red-600 dark:text-red-400">{{ pushError }}</p>

      <button
        v-if="permission === 'default'"
        @click="askPermission"
        class="mt-3 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
      >
        Включить
      </button>
    </section>

    <section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800">
      <h2 class="font-medium">Рабочие часы</h2>

      <div class="mt-3 flex flex-col gap-2">
        <label class="flex items-center justify-between gap-3">
          <span class="text-sm text-slate-600 dark:text-slate-300">Начало</span>
          <input
            type="time"
            v-model="settingsStore.settings.workStart"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:[color-scheme:dark]"
          >
        </label>

        <label class="flex items-center justify-between gap-3">
          <span class="text-sm text-slate-600 dark:text-slate-300">Окончание</span>
          <input
            type="time"
            v-model="settingsStore.settings.workEnd"
            class="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:[color-scheme:dark]"
          >
        </label>
      </div>
    </section>

    <section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800">
      <h2 class="font-medium">Рабочие дни</h2>

      <div class="mt-3 flex flex-wrap gap-2">
        <button
          v-for="day in DAYS"
          :key="day.num"
          @click="toggleDay(day.num)"
          class="h-10 w-10 rounded-xl text-sm font-medium transition"
          :class="settingsStore.settings.workDays.includes(day.num)
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'"
        >
          {{ day.label }}
        </button>
      </div>
    </section>

    <section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800">
      <h2 class="font-medium">Напоминания о здоровье</h2>

      <label class="mt-3 flex items-center justify-between gap-3">
        <span class="text-sm text-slate-600 dark:text-slate-300">Включены</span>
        <input
          type="checkbox"
          v-model="settingsStore.settings.remindersOn"
          class="h-5 w-5 cursor-pointer accent-indigo-600"
        >
      </label>

      <label class="mt-2 flex items-center justify-between gap-3">
        <span class="text-sm text-slate-600 dark:text-slate-300">Интервал, минут</span>
        <input
          type="number"
          v-model.number="settingsStore.settings.reminderInterval"
          min="5"
          step="5"
          :disabled="!settingsStore.settings.remindersOn"
          class="w-24 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm tabular-nums focus:border-indigo-400 focus:outline-none disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800"
        >
      </label>
    </section>

    <section class="rounded-2xl bg-white p-4 shadow-sm dark:bg-slate-900 dark:shadow-none dark:ring-1 dark:ring-slate-800">
      <h2 class="font-medium">Оформление</h2>

      <div class="mt-3 flex items-center justify-between gap-3">
        <span class="text-sm text-slate-600 dark:text-slate-300">{{ settingsStore.settings.darkMode ? 'Темная тема' : 'Светлая тема' }}</span>

        <label class="switch">
          <input type="checkbox" v-model="settingsStore.settings.darkMode">
          <span class="slider"></span>
        </label>
      </div>
    </section>

    
  </div>
</template>

<style scoped>
/* The switch - the box around the slider */
.switch {
  display: block;
  --width-of-switch: 3.5em;
  --height-of-switch: 2em;
  /* size of sliding icon -- sun and moon */
  --size-of-icon: 1.4em;
  /* it is like a inline-padding of switch */
  --slider-offset: 0.3em;
  position: relative;
  width: var(--width-of-switch);
  height: var(--height-of-switch);
}

/* Hide default HTML checkbox */
.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

/* The slider */
.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #f4f4f5;
  transition: .4s;
  border-radius: 30px;
}

.slider:before {
  position: absolute;
  content: "";
  height: var(--size-of-icon,1.4em);
  width: var(--size-of-icon,1.4em);
  border-radius: 20px;
  left: var(--slider-offset,0.3em);
  top: 50%;
  transform: translateY(-50%);
  background: linear-gradient(40deg,#ff0080,#ff8c00 70%);
  transition: .4s;
}

input:checked + .slider {
  background-color: #303136;
}

input:checked + .slider:before {
  left: calc(100% - (var(--size-of-icon,1.4em) + var(--slider-offset,0.3em)));
  background: #303136;
  /* change the value of second inset in box-shadow to change the angle and direction of the moon  */
  box-shadow: inset -3px -2px 5px -2px #8983f7, inset -10px -4px 0 0 #a3dafb;
}
</style>
