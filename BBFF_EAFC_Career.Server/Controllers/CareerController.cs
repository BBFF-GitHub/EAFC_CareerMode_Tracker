using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CareerController : ControllerBase
    {
        public CareerController() { }

        [HttpGet]
        public List<CareerDto> Get()
        {
            try
            {
                return CareerUtilities.GetCareers();
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        public int Post(CareerDto career)
        {
            try
            {
                return CareerUtilities.CreateNewCareer(career);
            }
            catch
            {
                return 0;
            }
        }

        [HttpDelete]
        public bool Delete(int careerId)
        {
            try
            {
                return CareerUtilities.DeleteCareer(careerId);
            }
            catch
            {
                return false;
            }
        }
    }
}
