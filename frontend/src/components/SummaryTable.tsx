import type { MonthlyBar } from '../types'

export default function SummaryTable({ data, currency = '$' }: {
  data: MonthlyBar[], currency?: string
}) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20, overflowX: 'auto',
    }}>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
        Monthly summary
      </p>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            {['Month', 'Open', 'Close', 'High', 'Low', 'Volume', 'Return'].map(h => (
              <th key={h} style={{
                textAlign: 'left', padding: '8px 10px',
                borderBottom: '1px solid var(--border)',
                color: 'var(--muted)', fontWeight: 500,
              }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => {
            const ret = i === 0
              ? null
              : parseFloat(((row.close - data[i - 1].close) / data[i - 1].close * 100).toFixed(2))
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px 10px' }}>{row.month}</td>
                <td style={{ padding: '8px 10px' }}>{currency}{row.open.toLocaleString()}</td>
                <td style={{ padding: '8px 10px' }}>{currency}{row.close.toLocaleString()}</td>
                <td style={{ padding: '8px 10px' }}>{currency}{row.high.toLocaleString()}</td>
                <td style={{ padding: '8px 10px' }}>{currency}{row.low.toLocaleString()}</td>
                <td style={{ padding: '8px 10px' }}>{(row.vol / 1e6).toFixed(1)}M</td>
                <td style={{ padding: '8px 10px' }}>
                  {ret === null ? '—' : (
                    <span style={{
                      color: ret >= 0 ? 'var(--up)' : 'var(--down)',
                      fontWeight: 600,
                    }}>
                      {ret >= 0 ? '▲' : '▼'} {Math.abs(ret)}%
                    </span>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
