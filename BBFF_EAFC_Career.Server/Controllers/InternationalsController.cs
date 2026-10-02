using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class InternationalsController : ControllerBase
    {
        public InternationalsController() { }

        [HttpGet]
        public InternationalsDto Get(int careerId, int year)
        {
            try
            {
                return InternationalsUtilities.GetDetails(careerId, year);
            }
            catch
            {
                return null;
            }
        }

        [HttpPut]
        public bool Put([FromBody] InternationalsDto internationalsObj)
        {
            try
            {
                return InternationalsUtilities.UpdateDetails(internationalsObj);
            }
            catch
            {
                return false;
            }
        }

        [HttpDelete]
        public bool Delete(int careerId)
        {
            try
            {
                return InternationalsUtilities.ResignJob(careerId);
            }
            catch
            {
                return false;
            }
        }
    }
}
