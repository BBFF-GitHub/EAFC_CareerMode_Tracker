using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TeamController : ControllerBase
    {
        public TeamController() { }

        [HttpGet]
        public List<TeamDto> Get(string countryCode, bool? female)
        {
            try
            {
                return TeamUtilities.GetTeams(countryCode, female);
            }
            catch
            {
                return null;
            }
        }
    }
}
