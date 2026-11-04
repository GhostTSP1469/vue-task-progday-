import { defineStore } from "pinia";
import { ref, watch } from "vue";

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
    const response = await fetch('http://localhost:3000/settings')
    const data = await response.json()
    settings.value = data
  }

  async function saveSettings() {
    await fetch('http://localhost:3000/settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
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
