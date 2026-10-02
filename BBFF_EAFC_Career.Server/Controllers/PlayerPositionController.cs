using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayerPositionController : ControllerBase
    {
        public PlayerPositionController() { }

        [HttpPost]
        public bool Post(PlayerPositionSaveDto obj)
        {
            try
            {
                return PlayerPositionUtilities.SaveEligiblePositions(obj);
            }
            catch
            {
                return false;
            }
        }
    }
}
