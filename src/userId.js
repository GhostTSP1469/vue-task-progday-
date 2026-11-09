let id = localStorage.getItem('userId')
if (!id) {
  id = crypto.randomUUID()
  localStorage.setItem('userId', id)
}

export const userId = id

export const userHeaders = {
  'Content-Type': 'application/json',
  'X-User-Id': id
}
