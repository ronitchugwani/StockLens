import {
  ResponsiveContainer, BarChart, Bar,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import type { MonthlyBar } from '../types'

export default function VolumeChart({ data }: { data: MonthlyBar[] }) {
  const formatted = data.map(d => ({
    ...d, volM: parseFloat((d.vol / 1e6).toFixed(2)),
  }))

  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
        Monthly volume (M shares)
      </p>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={formatted}>
          <CartesianGrid stroke="#2e3147" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#7b82a8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#7b82a8', fontSize: 11 }} tickFormatter={v => v + 'M'} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3147', borderRadius: 8 }}
            formatter={value => [`${Number(value ?? 0)}M`, 'Volume']}
          />
          <Bar dataKey="volM" fill="#7f77dd" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
