using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class CareerHubController : ControllerBase
    {
        public CareerHubController() { }

        [HttpGet]
        public CareerDto Get(int careerId)
        {
            try
            {
                return CareerUtilities.GetCareer(careerId);
            }
            catch
            {
                return null;
            }
        }

        [HttpPost]
        public void Post(CareerOverviewDto seletion)
        {
            try
            {
                if (seletion.Internationals.HasValue && seletion.Internationals.Value)
                    SeasonUtilities.NewInternationalJob(seletion);
                else if (!string.IsNullOrEmpty(seletion.Reason))
                    SeasonUtilities.AddMidSeasonMove(seletion);
                else
                    SeasonUtilities.AddNewSeason(seletion);
            }
            catch
            {
                return;
            }
        }

        [HttpPut]
        public void Put(EndOfSeasonDto selection)
        {
            try
            {
                SeasonUtilities.EndSeason(selection);
            }
            catch
            {
                return;
            }
        }
    }
}
