import { ref } from 'vue'
import { defineStore } from 'pinia'
import { userHeaders } from '../../userId.js'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])

  async function getTasks() {
    const response = await fetch('/api/tasks', { headers: userHeaders })
    const data = await response.json()
    tasks.value = data
  }

  getTasks()

  async function addTask(text, start, end, date, repeat, repeatDays) {
    await fetch('/api/tasks', {
      method: 'POST',
      headers: userHeaders,
      body: JSON.stringify({ text, start, end, date, repeat, repeatDays })
    })

    await getTasks()
  }

 async function updateTask(task) {
  await fetch(`/api/tasks/${task.id}`, {
    method: 'PATCH',
    headers: userHeaders,
    body: JSON.stringify({
      text: task.text,
      start: task.start,
      end: task.end,
      date: task.date,
      repeat: task.repeat,
      repeatDays: task.repeatDays
    })
  })

  await getTasks()
}

  async function toggleTaskCompleted(taskId) {
    const task = tasks.value.find(task => task.id === taskId)

    if (task) {
      task.completed = !task.completed

      await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: userHeaders,
        body: JSON.stringify({ completed: task.completed })
      })

      await getTasks()
    }
  }

  async function removeTask(taskId) {
    await fetch(`/api/tasks/${taskId}`, {
      method: 'DELETE',
      headers: userHeaders
    })

    await getTasks()
  }

  return { tasks, addTask, updateTask, removeTask, toggleTaskCompleted, getTasks }
})
