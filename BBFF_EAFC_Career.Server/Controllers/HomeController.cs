using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class HomeController : ControllerBase
    {
        public HomeController() { }

        [HttpGet]
        public HomeHeroDto Get()
        {
            try
            {
                return HomeUtilities.GetHomeHero();
            }
            catch
            {
                return new HomeHeroDto { HeroAvailable = false };
            }
        }
    }
}
