using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CurrentSeasonController : ControllerBase
    {
        public CurrentSeasonController() { }

        [HttpGet]
        public CurrentSeasonDto Get(int careerId, int year)
        {
            try
            {
                return CurrentSeasonUtilities.GetSeasonDetails(careerId, year);
            }
            catch
            {
                return null;
            }
        }

        [HttpPut]
        public bool Put([FromBody] CurrentSeasonDto seasonObj)
        {
            try
            {
                return CurrentSeasonUtilities.UpdateSeasonDetails(seasonObj);
            }
            catch
            {
                return false;
            }
        }
    }
}
