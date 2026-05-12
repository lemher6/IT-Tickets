using ClosedXML.Excel;
using ITSupport.Api.Models;

namespace ITSupport.Api.Services;

public class ExcelDataService
{
    private readonly string _filePath;
    private readonly ILogger<ExcelDataService> _logger;

    public ExcelDataService(IConfiguration config, ILogger<ExcelDataService> logger)
    {
        _filePath = config["DataFilePath"] ?? "Data/IT_Support_DataModel.xlsx";
        _logger = logger;
    }

    // ── Readers ────────────────────────────────────────────────────────────

    public List<Ticket> GetTickets()
    {
        using var wb = new XLWorkbook(_filePath);
        var agents     = ReadAgents(wb);
        var submitters = ReadSubmitters(wb);
        var dates      = ReadDates(wb);
        var ws         = wb.Worksheet("Fact_Tickets");
        var tickets    = new List<Ticket>();

        foreach (var row in ws.RowsUsed().Skip(1))
        {
            var dateCreatedKey  = row.Cell(4).GetValue<int>();
            var dateResolvedRaw = row.Cell(5).Value;
            int? dateResolvedKey = dateResolvedRaw.IsBlank ? null : (int?)row.Cell(5).GetValue<int>();

            var ticket = new Ticket
            {
                TicketId        = row.Cell(1).GetString(),
                SubmitterKey    = row.Cell(2).GetValue<int>(),
                AgentKey        = row.Cell(3).GetValue<int>(),
                DateCreatedKey  = dateCreatedKey,
                DateResolvedKey = dateResolvedKey,
                PriorityLevel   = row.Cell(6).GetString(),
                SatisfactionScore = row.Cell(7).Value.IsBlank ? null : (int?)row.Cell(7).GetValue<int>()
            };

            if (agents.TryGetValue(ticket.AgentKey, out var agent))
            {
                ticket.AgentName  = agent.AgentName;
                ticket.TierLevel  = agent.TierLevel;
            }
            if (submitters.TryGetValue(ticket.SubmitterKey, out var sub))
            {
                ticket.Department = sub.Department;
                ticket.Location   = sub.Location;
            }
            if (dates.TryGetValue(dateCreatedKey, out var dc))  ticket.DateCreated  = dc;
            if (dateResolvedKey.HasValue && dates.TryGetValue(dateResolvedKey.Value, out var dr)) ticket.DateResolved = dr;

            tickets.Add(ticket);
        }
        return tickets;
    }

    public List<Agent> GetAgents()
    {
        using var wb   = new XLWorkbook(_filePath);
        var tickets    = GetTickets();
        var agentsList = new List<Agent>();

        foreach (var row in wb.Worksheet("Dim_Agent").RowsUsed().Skip(1))
        {
            var key   = row.Cell(1).GetValue<int>();
            var agentTickets = tickets.Where(t => t.AgentKey == key).ToList();

            agentsList.Add(new Agent
            {
                AgentKey        = key,
                AgentName       = row.Cell(2).GetString(),
                TierLevel       = row.Cell(3).GetString(),
                Specialty       = row.Cell(4).GetString(),
                TotalTickets    = agentTickets.Count,
                OpenTickets     = agentTickets.Count(t => t.IsOpen),
                AvgSatisfaction = agentTickets.Where(t => t.SatisfactionScore.HasValue).Any()
                    ? agentTickets.Where(t => t.SatisfactionScore.HasValue).Average(t => t.SatisfactionScore!.Value)
                    : null
            });
        }
        return agentsList;
    }

    public List<Submitter> GetSubmitters()
    {
        using var wb = new XLWorkbook(_filePath);
        return ReadSubmitters(wb).Values.ToList();
    }

    public DashboardStats GetDashboardStats()
    {
        var tickets = GetTickets();
        var resolved = tickets.Where(t => !t.IsOpen).ToList();

        return new DashboardStats
        {
            TotalTickets      = tickets.Count,
            OpenTickets       = tickets.Count(t => t.IsOpen),
            ResolvedTickets   = resolved.Count,
            CriticalTickets   = tickets.Count(t => t.PriorityLevel == "Critical"),
            AvgSatisfaction   = tickets.Where(t => t.SatisfactionScore.HasValue).Any()
                ? Math.Round(tickets.Where(t => t.SatisfactionScore.HasValue).Average(t => t.SatisfactionScore!.Value), 2)
                : 0,
            AvgResolutionDays = resolved.Where(t => t.ResolutionDays.HasValue).Any()
                ? Math.Round(resolved.Where(t => t.ResolutionDays.HasValue).Average(t => t.ResolutionDays!.Value), 1)
                : 0,
            ByPriority = tickets.GroupBy(t => t.PriorityLevel)
                .Select(g => new PriorityBreakdown { Priority = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count).ToList(),
            ByDepartment = tickets.Where(t => t.Department != null)
                .GroupBy(t => t.Department!)
                .Select(g => new DeptBreakdown { Department = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count).ToList(),
            MonthlyVolume = tickets.Where(t => t.DateCreated.HasValue)
                .GroupBy(t => t.DateCreated!.Value.ToString("MMM yyyy"))
                .Select(g => new MonthlyVolume { Month = g.Key, Count = g.Count() })
                .ToList()
        };
    }

    // ── Writers ────────────────────────────────────────────────────────────

    public Ticket CreateTicket(CreateTicketRequest req)
    {
        using var wb = new XLWorkbook(_filePath);
        var ws       = wb.Worksheet("Fact_Tickets");
        var lastRow  = ws.LastRowUsed()!.RowNumber();
        var lastId   = ws.Cell(lastRow, 1).GetString();
        var nextNum  = int.Parse(lastId.Replace("INC-", "")) + 1;
        var newId    = $"INC-{nextNum}";
        var today    = int.Parse(DateTime.Today.ToString("yyyyMMdd"));

        ws.Cell(lastRow + 1, 1).Value = newId;
        ws.Cell(lastRow + 1, 2).Value = req.SubmitterKey;
        ws.Cell(lastRow + 1, 3).Value = req.AgentKey;
        ws.Cell(lastRow + 1, 4).Value = today;
        ws.Cell(lastRow + 1, 5).Value = "";
        ws.Cell(lastRow + 1, 6).Value = req.PriorityLevel;
        ws.Cell(lastRow + 1, 7).Value = "";

        wb.Save();
        _logger.LogInformation("Created ticket {Id}", newId);

        return GetTickets().First(t => t.TicketId == newId);
    }

    public Ticket? ResolveTicket(string ticketId, ResolveTicketRequest req)
    {
        using var wb = new XLWorkbook(_filePath);
        var ws       = wb.Worksheet("Fact_Tickets");
        var today    = int.Parse(DateTime.Today.ToString("yyyyMMdd"));

        foreach (var row in ws.RowsUsed().Skip(1))
        {
            if (row.Cell(1).GetString() != ticketId) continue;
            row.Cell(5).Value = today;
            row.Cell(7).Value = req.SatisfactionScore;
            wb.Save();
            _logger.LogInformation("Resolved ticket {Id}", ticketId);
            return GetTickets().First(t => t.TicketId == ticketId);
        }
        return null;
    }

    // ── Private helpers ────────────────────────────────────────────────────

    private static Dictionary<int, Agent> ReadAgents(IXLWorkbook wb)
    {
        var dict = new Dictionary<int, Agent>();
        foreach (var row in wb.Worksheet("Dim_Agent").RowsUsed().Skip(1))
        {
            var key = row.Cell(1).GetValue<int>();
            dict[key] = new Agent
            {
                AgentKey  = key,
                AgentName = row.Cell(2).GetString(),
                TierLevel = row.Cell(3).GetString(),
                Specialty = row.Cell(4).GetString()
            };
        }
        return dict;
    }

    private static Dictionary<int, Submitter> ReadSubmitters(IXLWorkbook wb)
    {
        var dict = new Dictionary<int, Submitter>();
        foreach (var row in wb.Worksheet("Dim_Submitter").RowsUsed().Skip(1))
        {
            var key = row.Cell(1).GetValue<int>();
            dict[key] = new Submitter
            {
                SubmitterKey = key,
                Department   = row.Cell(2).GetString(),
                Location     = row.Cell(3).GetString()
            };
        }
        return dict;
    }

    private static Dictionary<int, DateTime> ReadDates(IXLWorkbook wb)
    {
        var dict = new Dictionary<int, DateTime>();
        foreach (var row in wb.Worksheet("Dim_Date").RowsUsed().Skip(1))
        {
            var key = row.Cell(1).GetValue<int>();
            if (DateTime.TryParseExact(key.ToString(), "yyyyMMdd",
                System.Globalization.CultureInfo.InvariantCulture,
                System.Globalization.DateTimeStyles.None, out var dt))
                dict[key] = dt;
        }
        return dict;
    }
}
