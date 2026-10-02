using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class PlayerStatsController : ControllerBase
    {
        public PlayerStatsController() { }

        [HttpGet]
        public List<PlayerDto> Get(int careerId, int year)
        {
            try
            {
                return PlayerStatUtilities.GetPlayerList(careerId, year);
            }
            catch
            {
                return null;
            }
        }
    }
}
