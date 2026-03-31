import { useState } from 'react'
import { useCompare } from '../hooks/useCompare'
import { X, Plus } from 'lucide-react'
import {
  ResponsiveContainer, LineChart, Line,
  XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts'

const COLORS = ['#6c8ef5', '#4ecca3', '#f5a623', '#f25f5c', '#c27cf5', '#5cf2e8']

const PRESETS = [
  ['AAPL', 'MSFT', 'GOOGL'],
  ['RELIANCE.NS', 'TCS.NS', 'INFY.NS'],
  ['TSLA', 'AMZN', 'META'],
]

function buildChartData(data: Record<string, any[]>) {
  const tickers = Object.keys(data)
  if (!tickers.length) return []
  const base = data[tickers[0]]
  return base.map((row, i) => {
    const point: any = { month: row.month }
    for (const t of tickers) {
      const d = data[t]
      if (d[i]) {
        // normalise to 100 at start for fair comparison
        point[t] = parseFloat(((d[i].close / d[0].close) * 100).toFixed(2))
      }
    }
    return point
  })
}

function buildReturnData(data: Record<string, any[]>) {
  const tickers = Object.keys(data)
  return tickers.map(t => {
    const d = data[t]
    const ret = ((d[d.length - 1].close - d[0].open) / d[0].open * 100).toFixed(1)
    return { ticker: t, return: parseFloat(ret) }
  })
}

export default function Compare() {
  const [tickers, setTickers] = useState<string[]>(['AAPL', 'MSFT'])
  const [input, setInput] = useState('')
  const [period, setPeriod] = useState('1y')
  const { data, loading, error, load } = useCompare()

  const addTicker = () => {
    const t = input.trim().toUpperCase()
    if (t && !tickers.includes(t) && tickers.length < 6) {
      setTickers(prev => [...prev, t])
      setInput('')
    }
  }

  const removeTicker = (t: string) =>
    setTickers(prev => prev.filter(x => x !== t))

  const chartData = buildChartData(data)
  const returnData = buildReturnData(data)
  const hasTickers = Object.keys(data).length > 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Compare</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Compare up to 6 tickers - normalised to 100 at start date
        </p>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 20,
      }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 14 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTicker()}
            placeholder="Add ticker e.g. TSLA"
            style={{
              flex: 1, minWidth: 160, padding: '9px 12px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
            }}
          />
          <button onClick={addTicker}
            style={{
              padding: '9px 16px', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text)', display: 'flex', alignItems: 'center', gap: 6,
            }}>
            <Plus size={15} /> Add
          </button>
          <select value={period} onChange={e => setPeriod(e.target.value)}
            style={{
              padding: '9px 12px', background: 'var(--bg3)',
              border: '1px solid var(--border)', borderRadius: 8,
              color: 'var(--text)', fontSize: 13,
            }}>
            <option value="6mo">6 months</option>
            <option value="1y">1 year</option>
            <option value="2y">2 years</option>
          </select>
          <button onClick={() => load(tickers, period)} disabled={loading}
            style={{
              padding: '9px 24px', background: 'var(--accent)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontWeight: 600, opacity: loading ? 0.6 : 1,
            }}>
            {loading ? 'Loading…' : 'Compare'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 14 }}>
          {tickers.map((t, i) => (
            <span key={t} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '4px 10px', borderRadius: 20,
              background: 'var(--bg3)', border: `1px solid ${COLORS[i % COLORS.length]}`,
              fontSize: 12, color: COLORS[i % COLORS.length],
            }}>
              {t}
              <X size={11} style={{ cursor: 'pointer' }} onClick={() => removeTicker(t)} />
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Presets:</span>
          {PRESETS.map((p, i) => (
            <button key={i} onClick={() => { setTickers(p); load(p, period) }}
              style={{
                padding: '3px 10px', background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 20,
                color: 'var(--muted)', fontSize: 12,
              }}>
              {p.join(' vs ')}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div style={{
          padding: '12px 16px', background: 'rgba(242,95,92,0.1)',
          border: '1px solid var(--down)', borderRadius: 'var(--radius)',
          color: 'var(--down)', fontSize: 13,
        }}>{error}</div>
      )}

      {hasTickers && (
        <>
          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20,
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
              Normalised performance (base 100)
            </p>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={chartData}>
                <CartesianGrid stroke="#2e3147" strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fill: '#7b82a8', fontSize: 11 }} />
                <YAxis tick={{ fill: '#7b82a8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: '#1a1d27', border: '1px solid #2e3147', borderRadius: 8 }}
                  formatter={(value, name) => [`${Number(value ?? 0).toFixed(1)}`, String(name)]}
                />
                <Legend wrapperStyle={{ fontSize: 12, color: '#7b82a8' }} />
                {Object.keys(data).map((t, i) => (
                  <Line
                    key={t} type="monotone" dataKey={t}
                    stroke={COLORS[i % COLORS.length]}
                    strokeWidth={2} dot={false}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20,
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
              Total return comparison (%)
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {returnData.map((r, i) => (
                <div key={r.ticker} style={{
                  flex: 1, minWidth: 120,
                  background: 'var(--bg3)', border: `1px solid ${COLORS[i % COLORS.length]}`,
                  borderRadius: 'var(--radius)', padding: '16px 20px',
                }}>
                  <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{r.ticker}</p>
                  <p style={{
                    fontSize: 24, fontWeight: 700,
                    color: r.return >= 0 ? 'var(--up)' : 'var(--down)',
                  }}>
                    {r.return >= 0 ? '+' : ''}{r.return}%
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div style={{
            background: 'var(--bg2)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 20, overflowX: 'auto',
          }}>
            <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
              Latest month snapshot
            </p>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr>
                  {['Ticker', 'Open', 'Close', 'High', 'Low', 'Volume'].map(h => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px',
                      borderBottom: '1px solid var(--border)',
                      color: 'var(--muted)', fontWeight: 500,
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {Object.entries(data).map(([t, rows], i) => {
                  const last = rows[rows.length - 1]
                  return (
                    <tr key={t} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px', color: COLORS[i % COLORS.length], fontWeight: 600 }}>{t}</td>
                      <td style={{ padding: '8px 10px' }}>{last.open.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>{last.close.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>{last.high.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>{last.low.toLocaleString()}</td>
                      <td style={{ padding: '8px 10px' }}>{(last.vol / 1e6).toFixed(1)}M</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </>
      )}

      {!loading && !hasTickers && (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--muted)', fontSize: 14 }}>
          Add tickers above and click Compare
        </div>
      )}
    </div>
  )
}
