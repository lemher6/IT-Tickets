import { useEffect, useState } from 'react'
import { Plus, CheckCircle, X } from 'lucide-react'
import { api } from '../services/api'
import type { Agent, CreateTicketRequest, ResolveTicketRequest, Submitter, Ticket } from '../types'
import styles from './TicketsPage.module.css'

const PRIORITIES = ['', 'Critical', 'High', 'Medium', 'Low']

export default function TicketsPage() {
  const [tickets,    setTickets]    = useState<Ticket[]>([])
  const [agents,     setAgents]     = useState<Agent[]>([])
  const [submitters, setSubmitters] = useState<Submitter[]>([])
  const [loading,    setLoading]    = useState(true)
  const [filterPrio, setFilterPrio] = useState('')
  const [filterOpen, setFilterOpen] = useState<'all' | 'open' | 'resolved'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [resolving,  setResolving]  = useState<Ticket | null>(null)

  const load = () => {
    const params: Record<string, string> = {}
    if (filterPrio) params.priority = filterPrio
    if (filterOpen === 'open')     params.open = 'true'
    if (filterOpen === 'resolved') params.open = 'false'
    api.getTickets(params).then(setTickets).finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([api.getAgents(), api.getSubmitters()])
      .then(([a, s]) => { setAgents(a); setSubmitters(s) })
  }, [])

  useEffect(() => { load() }, [filterPrio, filterOpen])

  const priorityClass = (p: string) => {
    const m: Record<string,string> = { Critical:'badge-critical', High:'badge-high', Medium:'badge-medium', Low:'badge-low' }
    return `badge ${m[p] ?? ''}`
  }

  return (
    <div className="animate-up">
      <div className={styles.header}>
        <div>
          <div className={styles.label}>Incident Management</div>
          <h1 className={styles.title}>Tickets</h1>
        </div>
        <button className="btn-primary" onClick={() => setShowCreate(true)}>
          <Plus size={14} style={{ marginRight: 6 }} />New Ticket
        </button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select value={filterPrio} onChange={e => setFilterPrio(e.target.value)}>
          {PRIORITIES.map(p => <option key={p} value={p}>{p || 'All Priorities'}</option>)}
        </select>
        <div className={styles.tabGroup}>
          {(['all','open','resolved'] as const).map(v => (
            <button key={v} className={`${styles.tab} ${filterOpen === v ? styles.tabActive : ''}`}
              onClick={() => setFilterOpen(v)}>
              {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>
        <span className={styles.count}>{tickets.length} tickets</span>
      </div>

      {/* Table */}
      <div className="card" style={{ padding: 0, overflowX: 'auto' }}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th><th>Department</th><th>Location</th>
              <th>Agent</th><th>Tier</th><th>Priority</th>
              <th>Created</th><th>Resolved</th><th>Score</th><th>Days</th><th></th>
            </tr>
          </thead>
          <tbody>
            {loading
              ? <tr><td colSpan={11} className={styles.empty}>Loading…</td></tr>
              : tickets.length === 0
              ? <tr><td colSpan={11} className={styles.empty}>No tickets found.</td></tr>
              : tickets.map(t => (
                <tr key={t.ticketId} className={styles.row}>
                  <td className={styles.id}>{t.ticketId}</td>
                  <td>{t.department ?? '—'}</td>
                  <td className={styles.muted}>{t.location ?? '—'}</td>
                  <td>{t.agentName ?? '—'}</td>
                  <td className={styles.muted}>{t.tierLevel ?? '—'}</td>
                  <td><span className={priorityClass(t.priorityLevel)}>{t.priorityLevel}</span></td>
                  <td className={styles.mono}>{t.dateCreated ? new Date(t.dateCreated).toLocaleDateString() : '—'}</td>
                  <td className={styles.mono}>{t.dateResolved ? new Date(t.dateResolved).toLocaleDateString() : <span className="badge badge-open">Open</span>}</td>
                  <td className={styles.center}>{t.satisfactionScore ?? '—'}</td>
                  <td className={styles.center}>{t.resolutionDays ?? '—'}</td>
                  <td>
                    {t.isOpen && (
                      <button className={styles.resolveBtn} onClick={() => setResolving(t)} title="Resolve">
                        <CheckCircle size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateModal agents={agents} submitters={submitters}
          onClose={() => setShowCreate(false)}
          onCreate={() => { setShowCreate(false); load() }} />
      )}

      {/* Resolve modal */}
      {resolving && (
        <ResolveModal ticket={resolving}
          onClose={() => setResolving(null)}
          onResolve={() => { setResolving(null); load() }} />
      )}
    </div>
  )
}

// ── Create Modal ────────────────────────────────────────────────────────────
function CreateModal({ agents, submitters, onClose, onCreate }:
  { agents: Agent[]; submitters: Submitter[]; onClose: () => void; onCreate: () => void }) {
  const [form, setForm] = useState<CreateTicketRequest>({ submitterKey: submitters[0]?.submitterKey ?? 101, agentKey: agents[0]?.agentKey ?? 1, priorityLevel: 'Medium' })
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    await api.createTicket(form)
    setSaving(false)
    onCreate()
  }

  return (
    <Modal title="New Ticket" onClose={onClose}>
      <label className={styles.formLabel}>Submitter (Department)</label>
      <select value={form.submitterKey} onChange={e => setForm({ ...form, submitterKey: +e.target.value })}>
        {submitters.map(s => <option key={s.submitterKey} value={s.submitterKey}>{s.department} — {s.location}</option>)}
      </select>
      <label className={styles.formLabel}>Assigned Agent</label>
      <select value={form.agentKey} onChange={e => setForm({ ...form, agentKey: +e.target.value })}>
        {agents.map(a => <option key={a.agentKey} value={a.agentKey}>{a.agentName} ({a.tierLevel})</option>)}
      </select>
      <label className={styles.formLabel}>Priority</label>
      <select value={form.priorityLevel} onChange={e => setForm({ ...form, priorityLevel: e.target.value })}>
        {PRIORITIES.filter(Boolean).map(p => <option key={p} value={p}>{p}</option>)}
      </select>
      <div className={styles.modalActions}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? 'Creating…' : 'Create Ticket'}
        </button>
      </div>
    </Modal>
  )
}

// ── Resolve Modal ───────────────────────────────────────────────────────────
function ResolveModal({ ticket, onClose, onResolve }:
  { ticket: Ticket; onClose: () => void; onResolve: () => void }) {
  const [score, setScore] = useState(3)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    setSaving(true)
    await api.resolveTicket(ticket.ticketId, { satisfactionScore: score } as ResolveTicketRequest)
    setSaving(false)
    onResolve()
  }

  return (
    <Modal title={`Resolve ${ticket.ticketId}`} onClose={onClose}>
      <p style={{ color: 'var(--muted)', fontSize: '.85rem', marginBottom: 16 }}>
        {ticket.department} · {ticket.priorityLevel} priority · assigned to {ticket.agentName}
      </p>
      <label className={styles.formLabel}>Satisfaction Score (1–5)</label>
      <div className={styles.stars}>
        {[1,2,3,4,5].map(n => (
          <button key={n} className={`${styles.star} ${n <= score ? styles.starActive : ''}`}
            onClick={() => setScore(n)}>★</button>
        ))}
        <span style={{ color: 'var(--muted)', fontSize: '.8rem', marginLeft: 8 }}>{score}/5</span>
      </div>
      <div className={styles.modalActions}>
        <button className="btn-ghost" onClick={onClose}>Cancel</button>
        <button className="btn-primary" onClick={submit} disabled={saving}>
          {saving ? 'Saving…' : 'Mark Resolved'}
        </button>
      </div>
    </Modal>
  )
}

// ── Generic Modal shell ─────────────────────────────────────────────────────
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <span className={styles.modalTitle}>{title}</span>
          <button className={styles.closeBtn} onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.modalBody}>{children}</div>
      </div>
    </div>
  )
}
