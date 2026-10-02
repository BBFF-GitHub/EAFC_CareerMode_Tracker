using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayerHeadToHeadController : ControllerBase
    {
        public PlayerHeadToHeadController() { }

        [HttpGet]
        public List<HeadToHeadPlayerTeamGoalDto> Get(int careerId)
        {
            try
            {
                return HeadToHeadUtilities.GetHeadToHeadPlayerTeamGoals(careerId);
            }
            catch
            {
                return null;
            }
        }
    }
}
