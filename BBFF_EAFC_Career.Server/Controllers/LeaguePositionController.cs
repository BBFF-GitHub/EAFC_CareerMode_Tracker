using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class LeaguePositionController : ControllerBase
    {
        public LeaguePositionController() { }

        [HttpGet]
        public List<CurrentSeasonLeaguePos> Get(int careerId)
        {
            try
            {
                return LeaguePositionUtilities.GetLeaguePositions(careerId);
            }
            catch
            {
                return null;
            }
        }
    }
}
