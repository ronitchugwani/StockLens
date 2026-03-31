import { useState, useEffect } from 'react'
import { Clock, Trash2, Send, Plus } from 'lucide-react'
import { addSchedule, removeSchedule, listSchedules, sendNow } from '../api/scheduler'

interface Schedule { email: string; ticker: string; frequency: string }

export default function Scheduler() {
  const [email, setEmail] = useState('')
  const [ticker, setTicker] = useState('')
  const [frequency, setFrequency] = useState('weekly')
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ text: string; ok: boolean } | null>(null)

  useEffect(() => { refresh() }, [])

  const refresh = async () => {
    try {
      const res = await listSchedules()
      setSchedules(res.schedules)
    } catch {}
  }

  const flash = (text: string, ok: boolean) => {
    setMessage({ text, ok })
    setTimeout(() => setMessage(null), 4000)
  }

  const handleAdd = async () => {
    if (!email || !ticker) return
    setLoading(true)
    try {
      await addSchedule(email, ticker.toUpperCase(), frequency)
      flash(`Scheduled ${frequency} report for ${ticker.toUpperCase()}`, true)
      refresh()
    } catch (e: any) {
      flash(e.response?.data?.detail ?? 'Failed to add schedule', false)
    } finally { setLoading(false) }
  }

  const handleRemove = async (s: Schedule) => {
    try {
      await removeSchedule(s.email, s.ticker)
      flash('Schedule removed', true)
      refresh()
    } catch { flash('Failed to remove', false) }
  }

  const handleSendNow = async (s: Schedule) => {
    try {
      await sendNow(s.email, s.ticker)
      flash(`Report sent to ${s.email}`, true)
    } catch { flash('Failed to send', false) }
  }

  const freqColors: Record<string, string> = {
    daily: '#f5a623', weekly: '#6c8ef5', monthly: '#4ecca3',
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Scheduler</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Automate PDF report delivery to any email address
        </p>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24,
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          New scheduled report
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <input
            value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Email address"
            type="email"
            style={{
              flex: 2, minWidth: 200, padding: '10px 14px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
            }}
          />
          <input
            value={ticker} onChange={e => setTicker(e.target.value)}
            placeholder="Ticker e.g. AAPL"
            style={{
              flex: 1, minWidth: 130, padding: '10px 14px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
            }}
          />
          <select value={frequency} onChange={e => setFrequency(e.target.value)}
            style={{
              padding: '10px 12px', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text)', fontSize: 13,
            }}>
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
            <option value="monthly">Monthly</option>
          </select>
          <button onClick={handleAdd} disabled={loading}
            style={{
              padding: '10px 20px', background: 'var(--accent)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6,
              opacity: loading ? 0.6 : 1,
            }}>
            <Plus size={15} /> {loading ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {message && (
        <div style={{
          padding: '12px 16px', borderRadius: 'var(--radius)', fontSize: 13,
          background: message.ok ? 'rgba(78,204,163,0.1)' : 'rgba(242,95,92,0.1)',
          border: `1px solid ${message.ok ? 'var(--up)' : 'var(--down)'}`,
          color: message.ok ? 'var(--up)' : 'var(--down)',
        }}>{message.text}</div>
      )}

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <Clock size={16} color="var(--muted)" />
          <p style={{ fontSize: 13, color: 'var(--muted)' }}>
            Active schedules ({schedules.length})
          </p>
        </div>

        {schedules.length === 0 ? (
          <p style={{ fontSize: 13, color: 'var(--muted)', textAlign: 'center', padding: '24px 0' }}>
            No active schedules. Add one above.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {schedules.map((s, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                background: 'var(--bg3)', border: '1px solid var(--border)',
                borderRadius: 8, padding: '14px 16px', flexWrap: 'wrap', gap: 10,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                    background: `${freqColors[s.frequency]}22`,
                    color: freqColors[s.frequency],
                    border: `1px solid ${freqColors[s.frequency]}55`,
                  }}>{s.frequency}</span>
                  <div>
                    <p style={{ fontWeight: 600, fontSize: 14 }}>{s.ticker}</p>
                    <p style={{ fontSize: 12, color: 'var(--muted)' }}>{s.email}</p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => handleSendNow(s)}
                    title="Send now"
                    style={{
                      padding: '7px 12px', background: 'var(--bg2)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      color: 'var(--accent)', display: 'flex', alignItems: 'center', gap: 6,
                      fontSize: 12,
                    }}>
                    <Send size={13} /> Send now
                  </button>
                  <button onClick={() => handleRemove(s)}
                    title="Delete schedule"
                    style={{
                      padding: '7px 10px', background: 'var(--bg2)',
                      border: '1px solid var(--border)', borderRadius: 8,
                      color: 'var(--down)', display: 'flex', alignItems: 'center',
                    }}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
