interface Props {
  label: string
  value: string
  change?: string
  up?: boolean
}

export default function MetricCard({ label, value, change, up }: Props) {
  return (
    <div style={{
      background: 'var(--bg2)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: '16px 20px',
    }}>
      <p style={{ fontSize: 12, color: 'var(--muted)', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>{value}</p>
      {change && (
        <p style={{
          fontSize: 12, marginTop: 4,
          color: up ? 'var(--up)' : 'var(--down)',
        }}>
          {up ? '▲' : '▼'} {change}
        </p>
      )}
    </div>
  )
}
