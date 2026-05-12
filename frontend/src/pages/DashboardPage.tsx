import { useEffect, useState } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { api } from '../services/api'
import type { DashboardStats } from '../types'
import styles from './DashboardPage.module.css'

const PRIORITY_COLORS: Record<string, string> = {
  Critical: '#f75f5f', High: '#f7b84f', Medium: '#4f8ef7', Low: '#3ddba4'
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getStats().then(setStats).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}>Loading…</div>
  if (!stats)  return <div className={styles.loading}>Failed to load stats.</div>

  return (
    <div className="animate-up">
      <div className={styles.pageHeader}>
        <div className={styles.label}>IT Operations Dashboard</div>
        <h1>Your support operations, <span className={styles.accent}>at a glance.</span></h1>
        <p>Real-time visibility into ticket volume, agent performance, and resolution health.</p>
      </div>

      {/* KPI strip */}
      <div className={styles.kpiStrip}>
        <KPI label="Total Tickets"  value={stats.totalTickets}  color="var(--text)" />
        <KPI label="Open"           value={stats.openTickets}   color="var(--amber)"
          sub={`${((stats.openTickets / stats.totalTickets) * 100).toFixed(1)}% unresolved`} />
        <KPI label="Critical"       value={stats.criticalTickets} color="var(--red)" sub="Immediate action" />
        <KPI label="Avg Satisfaction" value={`${stats.avgSatisfaction}/5`} color="var(--green)"
          sub={`${stats.resolvedTickets} scored tickets`} />
        <KPI label="Avg Resolution" value={`${stats.avgResolutionDays}d`} color="var(--accent)" sub="Days to close" />
      </div>

      {/* Charts row */}
      <div className={styles.chartsRow}>
        {/* Monthly volume */}
        <div className="card" style={{ flex: 2 }}>
          <div className={styles.cardTitle}>Monthly Volume</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={stats.monthlyVolume} barSize={28}>
              <XAxis dataKey="month" tick={{ fill: 'var(--muted)', fontSize: 11, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
              <YAxis hide />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                itemStyle={{ color: 'var(--text)' }} cursor={{ fill: 'rgba(79,142,247,.08)' }} />
              <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority breakdown */}
        <div className="card" style={{ flex: 1 }}>
          <div className={styles.cardTitle}>By Priority</div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={stats.byPriority} dataKey="count" nameKey="priority"
                cx="50%" cy="50%" outerRadius={70} innerRadius={40}
                paddingAngle={3}>
                {stats.byPriority.map(e => (
                  <Cell key={e.priority} fill={PRIORITY_COLORS[e.priority] ?? 'var(--accent)'} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontFamily: 'DM Mono', fontSize: 12 }}
                itemStyle={{ color: 'var(--text)' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.legend}>
            {stats.byPriority.map(e => (
              <span key={e.priority} className={styles.legendItem}>
                <span className={styles.legendDot} style={{ background: PRIORITY_COLORS[e.priority] }} />
                {e.priority} ({e.count})
              </span>
            ))}
          </div>
        </div>

        {/* Department breakdown */}
        <div className="card" style={{ flex: 1 }}>
          <div className={styles.cardTitle}>By Department</div>
          <div className={styles.deptList}>
            {stats.byDepartment.slice(0, 6).map(d => {
              const max = stats.byDepartment[0].count
              return (
                <div key={d.department} className={styles.deptRow}>
                  <span className={styles.deptName}>{d.department}</span>
                  <div className={styles.deptBarWrap}>
                    <div className={styles.deptBar} style={{ width: `${(d.count / max) * 100}%` }} />
                  </div>
                  <span className={styles.deptCount}>{d.count}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function KPI({ label, value, color, sub }: { label: string; value: string | number; color: string; sub?: string }) {
  return (
    <div className={styles.kpi}>
      <div className={styles.kpiLabel}>{label}</div>
      <div className={styles.kpiValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  )
}
