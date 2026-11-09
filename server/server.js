import express from 'express'
import cors from 'cors'
import fs from 'node:fs'
import webpush from 'web-push'
import { tick } from './tick.js'
const app = express()

webpush.setVapidDetails(
  'mailto:gadoevdavid10@gmail.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
)

function readDb() {
  const data = fs.readFileSync('./db.json', 'utf-8')
  return JSON.parse(data)
}

let db = readDb()
let savingNow = false

function saveDb() {
  savingNow = true
  fs.writeFileSync('./db.json', JSON.stringify(db, null, 2))
  savingNow = false
}

fs.watch('./db.json', () => {
  if (savingNow) return
  try {
    db = readDb()
  } catch {}
})

db.users ??= {}

function getUser(req) {
  const uid = req.headers['x-user-id']
  if (!uid) return null
  db.users[uid] ??= {
    tasks: [],
    settings: {
      workStart: '09:00',
      workEnd: '18:00',
      workDays: [1, 2, 3, 4, 5],
      reminderInterval: 30,
      remindersOn: true,
      darkMode: false
    },
    subscriptions: [],
    sent: [],
    healthIndex: 0
  }
  return db.users[uid]
}

async function sendPushToUser(user, payload) {
  for (const sub of user.subscriptions) {
    try {
      await webpush.sendNotification(sub, JSON.stringify(payload))
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) {
        user.subscriptions = user.subscriptions.filter(s => s.endpoint !== sub.endpoint)
        saveDb()
      }
    }
  }
}

app.use(cors())
app.use(express.json())

app.get('/tasks', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })
  res.json(user.tasks)
})

app.post('/tasks', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })

  const task = { id: Date.now(), ...req.body, completed: false }
  user.tasks.push(task)
  saveDb()
  res.json(task)
})

app.patch('/tasks/:id', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })

  const task = user.tasks.find(t => t.id === Number(req.params.id))
  if (!task) return res.status(404).json({ message: 'Задача не найдена' })

  Object.assign(task, req.body)
  saveDb()
  res.json(task)
})

app.delete('/tasks/:id', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })

  user.tasks = user.tasks.filter(t => t.id !== Number(req.params.id))
  saveDb()
  res.json({ message: 'Задача удалена' })
})

app.get('/settings', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })
  res.json(user.settings)
})

app.put('/settings', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })

  user.settings = { ...user.settings, ...req.body }
  saveDb()
  res.json(user.settings)
})

app.post('/subscribe', (req, res) => {
  const user = getUser(req)
  if (!user) return res.status(401).json({ message: 'Нет userId' })

  const subscription = req.body
  user.subscriptions = user.subscriptions.filter(s => s.endpoint !== subscription.endpoint)
  user.subscriptions.push(subscription)
  saveDb()
  res.json({ message: 'Подписка сохранена' })
})

setInterval(() => {
  let anyChanged = false

  for (const [uid, user] of Object.entries(db.users)) {
    const { pushes, changed } = tick(new Date(), user)
    if (changed) anyChanged = true

    for (const push of pushes) {
      console.log(`push [${uid.slice(0, 8)}]:`, push.title, '—', push.body)
      sendPushToUser(user, push)
    }
  }

  if (anyChanged) saveDb()
}, 60 * 1000)

app.listen(3000, () => {
  console.log('сервер на http://localhost:3000')
})
