using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TeamHeadToHeadController : ControllerBase
    {
        public TeamHeadToHeadController() { }

        [HttpGet]
        public List<HeadToHeadTeamResultDto> Get(int careerId)
        {
            try
            {
                return HeadToHeadUtilities.GetHeadToHeadTeamResults(careerId);
            }
            catch
            {
                return null;
            }
        }
    }
}
