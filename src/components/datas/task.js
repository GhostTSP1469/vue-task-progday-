import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])

  async function getTasks() {
    const response = await fetch('http://localhost:3000/tasks')
    const data = await response.json()
    tasks.value = data
  }

  getTasks()

  async function addTask(text, start, end, date) {
    await fetch('http://localhost:3000/tasks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, start, end, date })
    })

    await getTasks()
  }

 async function updateTask(task) {
  await fetch(`http://localhost:3000/tasks/${task.id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: task.text,
      start: task.start,
      end: task.end,
      date: task.date
    })
  })

  await getTasks()
}

  async function toggleTaskCompleted(taskId) {
    const task = tasks.value.find(task => task.id === taskId)

    if (task) {
      task.completed = !task.completed

      await fetch(`http://localhost:3000/tasks/${taskId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ completed: task.completed })
      })

      await getTasks()
    }
  }

  async function removeTask(taskId) {
    await fetch(`http://localhost:3000/tasks/${taskId}`, {
      method: 'DELETE'
    })

    await getTasks()
  }

  return { tasks, addTask, updateTask, removeTask, toggleTaskCompleted, getTasks }
})