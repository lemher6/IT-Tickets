using ITSupport.Api.Models;
using ITSupport.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITSupport.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TicketsController(ExcelDataService svc) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Ticket>> GetAll(
        [FromQuery] string? priority,
        [FromQuery] bool? open,
        [FromQuery] string? department)
    {
        var tickets = svc.GetTickets().AsQueryable();
        if (!string.IsNullOrEmpty(priority))  tickets = tickets.Where(t => t.PriorityLevel == priority);
        if (open.HasValue)                    tickets = tickets.Where(t => t.IsOpen == open.Value);
        if (!string.IsNullOrEmpty(department)) tickets = tickets.Where(t => t.Department == department);
        return Ok(tickets.ToList());
    }

    [HttpGet("{id}")]
    public ActionResult<Ticket> GetById(string id)
    {
        var ticket = svc.GetTickets().FirstOrDefault(t => t.TicketId == id);
        return ticket is null ? NotFound() : Ok(ticket);
    }

    [HttpPost]
    public ActionResult<Ticket> Create([FromBody] CreateTicketRequest req)
    {
        var ticket = svc.CreateTicket(req);
        return CreatedAtAction(nameof(GetById), new { id = ticket.TicketId }, ticket);
    }

    [HttpPatch("{id}/resolve")]
    public ActionResult<Ticket> Resolve(string id, [FromBody] ResolveTicketRequest req)
    {
        if (req.SatisfactionScore is < 1 or > 5)
            return BadRequest("Satisfaction score must be between 1 and 5.");
        var ticket = svc.ResolveTicket(id, req);
        return ticket is null ? NotFound() : Ok(ticket);
    }
}
