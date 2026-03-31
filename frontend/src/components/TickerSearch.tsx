import { useState } from 'react'
import { Search } from 'lucide-react'

const POPULAR = [
  'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA',
  'RELIANCE.NS', 'TCS.NS', 'INFY.NS', 'HDFCBANK.NS', 'WIPRO.NS',
]

interface Props {
  onSearch: (ticker: string, period: string, source: string) => void
  loading: boolean
}

export default function TickerSearch({ onSearch, loading }: Props) {
  const [ticker, setTicker] = useState('')
  const [period, setPeriod] = useState('1y')
  const [source, setSource] = useState('yahoo')

  const submit = (t = ticker) => {
    if (!t.trim()) return
    onSearch(t.trim().toUpperCase(), period, source)
  }

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20, marginBottom: 24,
    }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 180, position: 'relative' }}>
          <Search size={15} style={{
            position: 'absolute', left: 12, top: '50%',
            transform: 'translateY(-50%)', color: 'var(--muted)',
          }} />
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && submit()}
            placeholder="Ticker symbol e.g. AAPL, TCS.NS"
            style={{
              width: '100%', padding: '10px 12px 10px 36px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
            }}
          />
        </div>

        <select value={period} onChange={e => setPeriod(e.target.value)}
          style={{
            padding: '10px 12px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text)', fontSize: 13,
          }}>
          <option value="6mo">6 months</option>
          <option value="1y">1 year</option>
          <option value="2y">2 years</option>
        </select>

        <select value={source} onChange={e => setSource(e.target.value)}
          style={{
            padding: '10px 12px', background: 'var(--bg3)',
            border: '1px solid var(--border)', borderRadius: 8,
            color: 'var(--text)', fontSize: 13,
          }}>
          <option value="yahoo">Yahoo Finance</option>
          <option value="alphavantage">Alpha Vantage</option>
          <option value="nse">NSE India</option>
        </select>

        <button onClick={() => submit()} disabled={loading}
          style={{
            padding: '10px 24px', background: 'var(--accent)',
            border: 'none', borderRadius: 8, color: '#fff',
            fontWeight: 600, fontSize: 14,
            opacity: loading ? 0.6 : 1,
          }}>
          {loading ? 'Loading…' : 'Search'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14 }}>
        <span style={{ fontSize: 12, color: 'var(--muted)', paddingTop: 2 }}>Quick:</span>
        {POPULAR.map(t => (
          <button key={t} onClick={() => { setTicker(t); submit(t) }}
            style={{
              padding: '3px 10px', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 20,
              color: 'var(--muted)', fontSize: 12,
            }}>
            {t}
          </button>
        ))}
      </div>
    </div>
  )
}
