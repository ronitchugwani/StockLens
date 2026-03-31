import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'
import type { MonthlyBar } from '../types'

export default function ReturnChart({ data }: { data: MonthlyBar[] }) {
  const returns = data.slice(1).map((d, i) => ({
    month: d.month,
    return: parseFloat(((d.close - data[i].close) / data[i].close * 100).toFixed(2)),
  }))

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
        Monthly returns (%)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={returns}>
          <CartesianGrid stroke="#2e3147" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#7b82a8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#7b82a8', fontSize: 11 }} tickFormatter={v => v + '%'} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3147', borderRadius: 8 }}
            formatter={value => [`${Number(value ?? 0)}%`, 'Return']}
          />
          <Bar dataKey="return" radius={[4, 4, 0, 0]}>
            {returns.map((r, i) => (
              <Cell key={i} fill={r.return >= 0 ? '#4ecca3' : '#f25f5c'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
