using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CupController : ControllerBase
    {
        public CupController() { }

        [HttpGet]
        public List<CupDto> Get(string countryCode)
        {
            try
            {
                return CupUtilities.GetCups(countryCode);
            }
            catch
            {
                return null;
            }
        }
    }
}
