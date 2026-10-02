using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CareerOverviewController : ControllerBase
    {
        public CareerOverviewController() { }

        [HttpGet]
        public List<CareerOverviewDto> Get(int careerId)
        {
            try
            {
                return CareerOverviewUtilities.GetCareerOverview(careerId);
            }
            catch
            {
                return null;
            }
        }
    }
}
