using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class OfficialPlayerDataController : ControllerBase
    {
        public OfficialPlayerDataController() { }

        [HttpPost]
        public IActionResult Post(OfficialPlayerDataDto obj)
        {
            try
            {
                OfficialPlayerDataUtilities.AddPlayer(obj);
                return Ok();
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }

        [HttpGet("byname")]
        public List<OfficialPlayerDataDto> GetByName([FromQuery] string name)
        {
            try
            {
                return OfficialPlayerDataUtilities.GetByName(name);
            }
            catch
            {
                return new List<OfficialPlayerDataDto>();
            }
        }

        [HttpGet("byclub")]
        public List<OfficialPlayerDataDto> GetByClub([FromQuery] string ogClub, [FromQuery] string gender)
        {
            try
            {
                return OfficialPlayerDataUtilities.GetByClub(ogClub, gender);
            }
            catch
            {
                return new List<OfficialPlayerDataDto>();
            }
        }

        [HttpGet("count")]
        public int GetCount()
        {
            try
            {
                return OfficialPlayerDataUtilities.GetRowCount();
            }
            catch
            {
                return 0;
            }
        }

        //Admin action: replaces the whole table from a freshly-exported CSV in the same
        //Name,Photo,Nationality,Flag,Position,OGClub,Gender shape as the old static asset.
        //No auth on this app at all currently, so this is no less protected than anything
        //else - same trust model as every other endpoint.
        [HttpPost("import")]
        [RequestSizeLimit(50_000_000)]
        public IActionResult Import(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            try
            {
                if (OfficialPlayerDataUtilities.GetRowCount() > 0)
                    return Conflict("Player data already exists - this is a once-off import. Clear the OfficialPlayerData table first if you need to replace it.");

                using (Stream stream = file.OpenReadStream())
                {
                    int imported = OfficialPlayerDataUtilities.ImportFromCsv(stream);
                    return Ok(new { imported });
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    }
}
