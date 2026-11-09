import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { userHeaders } from '../../userId.js'

export const useSettingsStore = defineStore("settings", () => {
  const settings = ref({
    workStart: "09:00",
    workEnd: "18:00",
    workDays: [1, 2, 3, 4, 5],
    reminderInterval: 60,
    remindersOn: true,
    darkMode: false
  })

  async function getSettings() {
    const response = await fetch('/api/settings', { headers: userHeaders })
    const data = await response.json()
    settings.value = data
  }

  async function saveSettings() {
    await fetch('/api/settings', {
      method: 'PUT',
      headers: userHeaders,
      body: JSON.stringify(settings.value)
    })
  }

  let loaded = false

  watch(settings, () => {
    if (loaded) saveSettings()
  }, { deep: true })

  getSettings().then(() => { loaded = true })

  return { settings, getSettings, saveSettings }
})
