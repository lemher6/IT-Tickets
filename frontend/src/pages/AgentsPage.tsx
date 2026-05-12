import { useEffect, useState } from 'react'
import { api } from '../services/api'
import type { Agent } from '../types'
import styles from './AgentsPage.module.css'

const TIER_COLORS: Record<string, string> = {
  'Tier 1': 'var(--accent)',
  'Tier 2': 'var(--accent2)',
  'Tier 3 (Escalation)': 'var(--green)',
}

const initials = (name: string) => name.split(' ').map(n => n[0]).join('')

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getAgents().then(setAgents).finally(() => setLoading(false))
  }, [])

  if (loading) return <div className={styles.loading}>Loading…</div>

  const max = Math.max(...agents.map(a => a.totalTickets), 1)

  return (
    <div className="animate-up">
      <div className={styles.header}>
        <div className={styles.label}>Support Team</div>
        <h1 className={styles.title}>Agents</h1>
      </div>

      <div className={styles.grid}>
        {agents.map((agent, i) => (
          <div key={agent.agentKey} className="card animate-up" style={{ animationDelay: `${i * .07}s` }}>
            <div className={styles.agentTop}>
              <div className={styles.avatar} style={{ background: `linear-gradient(135deg, ${TIER_COLORS[agent.tierLevel] ?? 'var(--accent)'}88, ${TIER_COLORS[agent.tierLevel] ?? 'var(--accent2)'}88)`, border: `1px solid ${TIER_COLORS[agent.tierLevel] ?? 'var(--accent)'}40` }}>
                {initials(agent.agentName)}
              </div>
              <div>
                <div className={styles.agentName}>{agent.agentName}</div>
                <div className={styles.tier} style={{ color: TIER_COLORS[agent.tierLevel] ?? 'var(--accent)' }}>{agent.tierLevel}</div>
              </div>
            </div>

            <div className={styles.specialty}>{agent.specialty}</div>

            <div className={styles.statRow}>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Total</div>
                <div className={styles.statValue}>{agent.totalTickets}</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Open</div>
                <div className={styles.statValue} style={{ color: agent.openTickets > 0 ? 'var(--amber)' : 'var(--green)' }}>
                  {agent.openTickets}
                </div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statLabel}>Avg Score</div>
                <div className={styles.statValue} style={{ color: 'var(--green)' }}>
                  {agent.avgSatisfaction != null ? agent.avgSatisfaction.toFixed(1) : '—'}
                </div>
              </div>
            </div>

            {/* workload bar */}
            <div className={styles.workloadWrap}>
              <div className={styles.workloadLabel}>Workload</div>
              <div className={styles.workloadTrack}>
                <div className={styles.workloadFill} style={{ width: `${(agent.totalTickets / max) * 100}%` }} />
              </div>
            </div>

            {/* sat bar */}
            {agent.avgSatisfaction != null && (
              <div className={styles.workloadWrap}>
                <div className={styles.workloadLabel}>Satisfaction</div>
                <div className={styles.workloadTrack}>
                  <div className={styles.satFill} style={{ width: `${(agent.avgSatisfaction / 5) * 100}%` }} />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
