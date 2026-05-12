import { NavLink, Outlet } from 'react-router-dom'
import { LayoutDashboard, Ticket, Users } from 'lucide-react'
import styles from './Layout.module.css'

const nav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/tickets',   icon: Ticket,          label: 'Tickets'  },
  { to: '/agents',    icon: Users,            label: 'Agents'   },
]

export default function Layout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span className={styles.dot} />
          IT Support
        </div>
        <nav className={styles.nav}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to}
              className={({ isActive }) => `${styles.link} ${isActive ? styles.active : ''}`}>
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className={styles.badge}>● Q1 2023</div>
      </aside>
      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  )
}
