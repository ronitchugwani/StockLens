import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard, GitCompare, FileText, Clock, TrendingUp
} from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/compare', icon: GitCompare, label: 'Compare' },
  { to: '/reports', icon: FileText, label: 'Reports' },
  { to: '/scheduler', icon: Clock, label: 'Scheduler' },
]

export default function Sidebar() {
  return (
    <aside style={{
      width: 220, minHeight: '100vh', background: 'var(--bg2)',
      borderRight: '1px solid var(--border)', padding: '24px 0',
      display: 'flex', flexDirection: 'column', gap: 4,
      position: 'fixed', top: 0, left: 0, zIndex: 10,
    }}>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 20px 24px', borderBottom: '1px solid var(--border)',
      }}>
        <TrendingUp size={22} color="var(--accent)" />
        <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text)' }}>
          StockLens
        </span>
      </div>

      <nav style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {links.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} end={to === '/'} style={({ isActive }) => ({
            display: 'flex', alignItems: 'center', gap: 10,
            padding: '10px 12px', borderRadius: 'var(--radius)',
            color: isActive ? 'var(--accent)' : 'var(--muted)',
            background: isActive ? 'rgba(108,142,245,0.1)' : 'transparent',
            fontWeight: isActive ? 600 : 400,
            transition: 'all 0.15s',
          })}>
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
