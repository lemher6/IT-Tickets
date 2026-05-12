import type { Agent, CreateTicketRequest, DashboardStats, ResolveTicketRequest, Submitter, Ticket } from '../types';

const BASE = '/api';

async function get<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE}${path}`);
  if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
  return res.json();
}

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`POST ${path} → ${res.status}`);
  return res.json();
}

async function patch<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`PATCH ${path} → ${res.status}`);
  return res.json();
}

export const api = {
  getStats:       ()                                  => get<DashboardStats>('/dashboard/stats'),
  getTickets:     (params?: Record<string, string>)   => get<Ticket[]>(`/tickets${params ? '?' + new URLSearchParams(params) : ''}`),
  getTicket:      (id: string)                        => get<Ticket>(`/tickets/${id}`),
  createTicket:   (req: CreateTicketRequest)          => post<Ticket>('/tickets', req),
  resolveTicket:  (id: string, req: ResolveTicketRequest) => patch<Ticket>(`/tickets/${id}/resolve`, req),
  getAgents:      ()                                  => get<Agent[]>('/agents'),
  getSubmitters:  ()                                  => get<Submitter[]>('/dashboard/submitters'),
};
