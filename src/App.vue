<script setup>
import { useSettingsStore } from './components/datas/settings.js'

const settingsStore = useSettingsStore()
</script>

<template>
  <div
    class="min-h-screen bg-slate-100 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100"
    :class="{ dark: settingsStore.settings.darkMode }"
  >
    <main class="mx-auto max-w-md px-4 pt-6 pb-28">
      <RouterView />
    </main>

    <nav
      class="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90"
    >
      <div class="mx-auto flex max-w-md justify-around px-2 py-2">
        <RouterLink
          to="/main"
          class="flex-1 rounded-xl py-2 text-center text-sm font-medium text-slate-500 transition dark:text-slate-400"
          active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          Сегодня
        </RouterLink>
        <RouterLink
          to="/task"
          class="flex-1 rounded-xl py-2 text-center text-sm font-medium text-slate-500 transition dark:text-slate-400"
          active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          Новая задача
        </RouterLink>
        <RouterLink
          to="/settings"
          class="flex-1 rounded-xl py-2 text-center text-sm font-medium text-slate-500 transition dark:text-slate-400"
          active-class="bg-indigo-50 text-indigo-600 dark:bg-indigo-500/15 dark:text-indigo-300"
        >
          Настройки
        </RouterLink>
      </div>
    </nav>
  </div>
</template>

<style scoped>
</style>
