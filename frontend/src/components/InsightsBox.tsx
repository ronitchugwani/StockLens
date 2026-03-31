import { Lightbulb, Loader } from 'lucide-react'

interface Props {
  insights: string
  loading: boolean
  ticker: string
}

export default function InsightsBox({ insights, loading, ticker }: Props) {
  const lines = insights
    .split('\n')
    .map(l => l.replace(/^[-•]\s*/, '').trim())
    .filter(Boolean)

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
        <Lightbulb size={16} color="var(--accent)" />
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          AI insights - {ticker}
        </p>
        {loading && <Loader size={13} color="var(--muted)"
          style={{ marginLeft: 'auto', animation: 'spin 1s linear infinite' }} />}
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      {loading && !lines.length && (
        <p style={{ fontSize: 13, color: 'var(--muted)' }}>
          Generating AI analysis...
        </p>
      )}

      {lines.length > 0 && (
        <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {lines.map((line, i) => (
            <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--text)', lineHeight: 1.6 }}>
              <span style={{ color: 'var(--accent)', marginTop: 2, flexShrink: 0 }}>{'>'}</span>
              {line}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
