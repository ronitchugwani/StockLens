import { useState } from 'react'
import { FileText, Download, Loader } from 'lucide-react'
import { downloadReport } from '../api/stocks'

const POPULAR = ['AAPL', 'MSFT', 'TSLA', 'GOOGL', 'AMZN', 'RELIANCE.NS', 'TCS.NS', 'INFY.NS']

export default function Reports() {
  const [ticker, setTicker] = useState('')
  const [period, setPeriod] = useState('1y')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const generate = async (t = ticker) => {
    if (!t.trim()) return
    setLoading(true)
    setError(null)
    setSuccess(null)
    try {
      await downloadReport(t.trim().toUpperCase(), period)
      setSuccess(`Report for ${t.toUpperCase()} downloaded successfully.`)
    } catch {
      setError('Failed to generate report. Check the ticker and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Reports</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          Generate a PDF report with charts, data table, and AI insights
        </p>
      </div>

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24,
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          Configure report
        </p>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 16 }}>
          <input
            value={ticker}
            onChange={e => setTicker(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && generate()}
            placeholder="Ticker e.g. AAPL"
            style={{
              flex: 1, minWidth: 160, padding: '10px 14px',
              background: 'var(--bg3)', border: '1px solid var(--border)',
              borderRadius: 8, color: 'var(--text)', fontSize: 14,
            }}
          />
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
          <button onClick={() => generate()} disabled={loading}
            style={{
              padding: '10px 24px', background: 'var(--accent)',
              border: 'none', borderRadius: 8, color: '#fff',
              fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8,
              opacity: loading ? 0.6 : 1,
            }}>
            {loading
              ? <><Loader size={15} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
              : <><Download size={15} /> Generate PDF</>}
          </button>
        </div>

        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--muted)' }}>Quick:</span>
          {POPULAR.map(t => (
            <button key={t} onClick={() => { setTicker(t); generate(t) }}
              style={{
                padding: '3px 10px', background: 'var(--bg3)',
                border: '1px solid var(--border)', borderRadius: 20,
                color: 'var(--muted)', fontSize: 12,
              }}>{t}</button>
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

      {success && (
        <div style={{
          padding: '12px 16px', background: 'rgba(78,204,163,0.1)',
          border: '1px solid var(--up)', borderRadius: 'var(--radius)',
          color: 'var(--up)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 8,
        }}>
          <FileText size={15} /> {success}
        </div>
      )}

      <div style={{
        background: 'var(--bg2)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', padding: 24,
      }}>
        <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 16 }}>
          What's included in each report
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px,1fr))', gap: 12 }}>
          {[
            ['Key metrics', 'Latest close, total return, period high, positive months'],
            ['AI insights', 'Gemini-generated analysis of trends and patterns'],
            ['Monthly breakdown', 'Full OHLCV table with per-month return percentages'],
            ['StockLens branding', 'Professional layout ready to share or archive'],
          ].map(([title, desc]) => (
            <div key={title} style={{
              background: 'var(--bg3)', borderRadius: 8, padding: 16,
              border: '1px solid var(--border)',
            }}>
              <p style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>{title}</p>
              <p style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
