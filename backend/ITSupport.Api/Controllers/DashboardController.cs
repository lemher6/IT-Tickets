using ITSupport.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ITSupport.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class DashboardController(ExcelDataService svc) : ControllerBase
{
    [HttpGet("stats")]
    public IActionResult GetStats() => Ok(svc.GetDashboardStats());

    [HttpGet("submitters")]
    public IActionResult GetSubmitters() => Ok(svc.GetSubmitters());
}
