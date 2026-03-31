import type { StockInfo } from '../hooks/useStock'

export default function StockInfoBar({ info, ticker }: {
  info: StockInfo | null, ticker: string
}) {
  if (!info) return null
  const currency = ticker.endsWith('.NS') || ticker.endsWith('.BO') ? '₹' : '$'
  const mcap = info.market_cap >= 1e12
    ? (info.market_cap / 1e12).toFixed(2) + 'T'
    : info.market_cap >= 1e9
      ? (info.market_cap / 1e9).toFixed(1) + 'B'
      : (info.market_cap / 1e6).toFixed(0) + 'M'

  const items = [
    { label: 'Company', value: info.name },
    { label: 'Sector', value: info.sector },
    { label: 'Market cap', value: currency + mcap },
    { label: 'P/E ratio', value: info.pe_ratio ? info.pe_ratio.toFixed(1) : 'N/A' },
    { label: '52w high', value: currency + info['52w_high'].toLocaleString() },
    { label: '52w low', value: currency + info['52w_low'].toLocaleString() },
  ]

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '14px 20px',
      display: 'flex', flexWrap: 'wrap', gap: '16px 32px',
    }}>
      {items.map(({ label, value }) => (
        <div key={label}>
          <p style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 2 }}>{label}</p>
          <p style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{value}</p>
        </div>
      ))}
    </div>
  )
}
