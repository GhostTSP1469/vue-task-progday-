import express from 'express'
import cors from 'cors'
import fs from 'node:fs'

const app = express()

function readDb() {
  const data = fs.readFileSync('./db.json', 'utf-8')
  return JSON.parse(data)
}

const db = readDb()

function saveDb() {
  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2))
}

app.use(cors())
app.use(express.json())

app.get('/tasks', (req, res) => {
  res.json(db.tasks)
})

app.post('/tasks', (req, res) => {
  const task = {
    id: Date.now(),
    ...req.body,
    completed: false
  }

  db.tasks.push(task)
  saveDb()

  res.json(task)
})

app.patch('/tasks/:id', (req, res) => {
  const task = db.tasks.find(task => task.id === Number(req.params.id))

  if (!task) {
    return res.status(404).json({ message: 'Задача не найдена' })
  }

  Object.assign(task, req.body)
  saveDb()

  res.json(task)
})

app.delete('/tasks/:id', (req, res) => {
  db.tasks = db.tasks.filter(task => task.id !== Number(req.params.id))

  saveDb()

  res.json({ message: 'Задача удалена' })
})

app.get('/settings', (req, res) => {
  res.json(db.settings)
})

app.put('/settings', (req, res) => {
  db.settings = { ...db.settings, ...req.body }
  saveDb()
  res.json(db.settings)
})

app.listen(3000, () => {
  console.log('сервер на http://localhost:3000')
})