namespace ITSupport.Api.Models;

public class Ticket
{
    public string TicketId { get; set; } = "";
    public int SubmitterKey { get; set; }
    public int AgentKey { get; set; }
    public int DateCreatedKey { get; set; }
    public int? DateResolvedKey { get; set; }
    public string PriorityLevel { get; set; } = "";
    public int? SatisfactionScore { get; set; }

    // Enriched
    public string? AgentName { get; set; }
    public string? TierLevel { get; set; }
    public string? Department { get; set; }
    public string? Location { get; set; }
    public DateTime? DateCreated { get; set; }
    public DateTime? DateResolved { get; set; }
    public bool IsOpen => DateResolvedKey == null;
    public int? ResolutionDays => (DateCreated.HasValue && DateResolved.HasValue)
        ? (int)(DateResolved.Value - DateCreated.Value).TotalDays
        : null;
}

public class Agent
{
    public int AgentKey { get; set; }
    public string AgentName { get; set; } = "";
    public string TierLevel { get; set; } = "";
    public string Specialty { get; set; } = "";
    public double? AvgSatisfaction { get; set; }
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
}

public class Submitter
{
    public int SubmitterKey { get; set; }
    public string Department { get; set; } = "";
    public string Location { get; set; } = "";
}

public class DashboardStats
{
    public int TotalTickets { get; set; }
    public int OpenTickets { get; set; }
    public int ResolvedTickets { get; set; }
    public int CriticalTickets { get; set; }
    public double AvgSatisfaction { get; set; }
    public double AvgResolutionDays { get; set; }
    public List<PriorityBreakdown> ByPriority { get; set; } = new();
    public List<DeptBreakdown> ByDepartment { get; set; } = new();
    public List<MonthlyVolume> MonthlyVolume { get; set; } = new();
}

public class PriorityBreakdown { public string Priority { get; set; } = ""; public int Count { get; set; } }
public class DeptBreakdown    { public string Department { get; set; } = ""; public int Count { get; set; } }
public class MonthlyVolume    { public string Month { get; set; } = ""; public int Count { get; set; } }

public class CreateTicketRequest
{
    public int SubmitterKey { get; set; }
    public int AgentKey { get; set; }
    public string PriorityLevel { get; set; } = "Medium";
}

public class ResolveTicketRequest
{
    public int SatisfactionScore { get; set; }
}
