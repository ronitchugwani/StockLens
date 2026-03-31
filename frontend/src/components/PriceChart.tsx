import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import type { MonthlyBar } from '../types'

export default function PriceChart({ data }: { data: MonthlyBar[] }) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20,
    }}>
      <p style={{ fontSize: 13, color: 'var(--muted)', marginBottom: 14 }}>
        Price history (close)
      </p>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="cg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#6c8ef5" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#6c8ef5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#2e3147" strokeDasharray="3 3" />
          <XAxis dataKey="month" tick={{ fill: '#7b82a8', fontSize: 11 }} />
          <YAxis tick={{ fill: '#7b82a8', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#1a1d27', border: '1px solid #2e3147', borderRadius: 8 }}
            labelStyle={{ color: '#e8eaf6' }}
            itemStyle={{ color: '#6c8ef5' }}
          />
          <Area
            type="monotone" dataKey="close"
            stroke="#6c8ef5" strokeWidth={2}
            fill="url(#cg)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
