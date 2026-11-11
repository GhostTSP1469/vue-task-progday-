const TIME_ZONE = 'Asia/Dushanbe'

export const HEALTH_TEXTS = [
  'Встань и пройдись 2 минуты.',
  'Выпрями спину и расслабь плечи.',
  'Отведи взгляд от экрана и посмотри вдаль.',
  'Выпей стакан воды.'
]

const WEEKDAYS = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }


const LATE_MINUTES = 1

export function getLocalTime(now) {
  const date = now.toLocaleDateString('sv-SE', { timeZone: TIME_ZONE })
  const time = now.toLocaleTimeString('en-GB', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23'
  })
  const day = WEEKDAYS[now.toLocaleDateString('en-US', { timeZone: TIME_ZONE, weekday: 'short' })]
  return { date, time, day }
}

function toMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

function toHhmm(minutes) {
  const h = String(Math.floor(minutes / 60)).padStart(2, '0')
  const m = String(minutes % 60).padStart(2, '0')
  return `${h}:${m}`
}

// Решает, какие push пора отправить прямо сейчас. Меняет db.sent и db.healthIndex.
export function tick(now, user) {
  const { date, time, day } = getLocalTime(now)
  const nowMin = toMinutes(time)
  const pushes = []

  user.sent ??= []
  user.healthIndex ??= 0

  const before = user.sent.length
  user.sent = user.sent.filter(key => key.startsWith(date + '|'))
  let changed = user.sent.length !== before

  for (const task of user.tasks) {
    if (task.completed) continue

    let matches = task.date === date

    if (!matches && task.repeat === 'daily') {
      matches = true
    }

    if (!matches && task.repeat === 'weekly') {
      const taskDate = new Date(task.date + 'T00:00:00')
      matches = taskDate.getDay() === new Date(date + 'T00:00:00').getDay()
    }

    if (!matches) continue

    const late = nowMin - toMinutes(task.start)
    if (late < 0 || late > LATE_MINUTES) continue

    const key = `${date}|task|${task.id}|${task.start}`
    if (user.sent.includes(key)) continue

    user.sent.push(key)
    changed = true
    pushes.push({ title: 'План на день', body: `${task.start} — ${task.text}` })
  }

  const { workStart, workEnd, workDays, remindersOn, reminderInterval } = user.settings
  const interval = Math.max(Number(reminderInterval), 5)

  if (remindersOn && workDays.includes(day) && interval >= 1) {
    const startMin = toMinutes(workStart)
    const endMin = toMinutes(workEnd)
    const slotNumber = Math.floor((nowMin - startMin) / interval)
    const slotMin = startMin + slotNumber * interval
    const late = nowMin - slotMin

    // первое напоминание через интервал после начала, последнее за интервал до конца (10:00–17:00)
    const inWindow = slotNumber >= 1 && slotMin <= endMin - interval
    const key = `${date}|health|${slotMin}`

    if (inWindow && late <= LATE_MINUTES && !user.sent.includes(key)) {
      user.sent.push(key)
      changed = true
      pushes.push({ title: 'Здоровье', body: HEALTH_TEXTS[user.healthIndex % HEALTH_TEXTS.length] })
      user.healthIndex += 1
    }
  }

  return { pushes, changed }
}
