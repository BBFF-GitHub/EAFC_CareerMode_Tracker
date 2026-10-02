using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LeagueController : ControllerBase
    {
        public LeagueController() { }

        [HttpGet]
        public List<LeagueDto> Get(bool female = false)
        {
            try
            {
                return LeagueUtilities.GetLeagues(female);
            }
            catch
            {
                return null;
            }
        }
    }
}
