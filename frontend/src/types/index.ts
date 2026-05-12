export interface Ticket {
  ticketId: string;
  submitterKey: number;
  agentKey: number;
  dateCreatedKey: number;
  dateResolvedKey: number | null;
  priorityLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  satisfactionScore: number | null;
  agentName: string | null;
  tierLevel: string | null;
  department: string | null;
  location: string | null;
  dateCreated: string | null;
  dateResolved: string | null;
  isOpen: boolean;
  resolutionDays: number | null;
}

export interface Agent {
  agentKey: number;
  agentName: string;
  tierLevel: string;
  specialty: string;
  avgSatisfaction: number | null;
  totalTickets: number;
  openTickets: number;
}

export interface DashboardStats {
  totalTickets: number;
  openTickets: number;
  resolvedTickets: number;
  criticalTickets: number;
  avgSatisfaction: number;
  avgResolutionDays: number;
  byPriority: { priority: string; count: number }[];
  byDepartment: { department: string; count: number }[];
  monthlyVolume: { month: string; count: number }[];
}

export interface Submitter {
  submitterKey: number;
  department: string;
  location: string;
}

export interface CreateTicketRequest {
  submitterKey: number;
  agentKey: number;
  priorityLevel: string;
}

export interface ResolveTicketRequest {
  satisfactionScore: number;
}
