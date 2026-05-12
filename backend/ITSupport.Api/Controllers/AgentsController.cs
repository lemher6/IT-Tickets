using ITSupport.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITSupport.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AgentsController(ExcelDataService svc) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll() => Ok(svc.GetAgents());

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var agent = svc.GetAgents().FirstOrDefault(a => a.AgentKey == id);
        return agent is null ? NotFound() : Ok(agent);
    }
}
