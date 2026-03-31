import client from './client'

export async function addSchedule(email: string, ticker: string, frequency: string) {
  const res = await client.post('/api/scheduler/add', { email, ticker, frequency })
  return res.data
}

export async function removeSchedule(email: string, ticker: string) {
  const res = await client.delete('/api/scheduler/remove', { params: { email, ticker } })
  return res.data
}

export async function listSchedules() {
  const res = await client.get('/api/scheduler/list')
  return res.data
}

export async function sendNow(email: string, ticker: string) {
  const res = await client.post('/api/scheduler/send-now', { email, ticker, frequency: 'manual' })
  return res.data
}
