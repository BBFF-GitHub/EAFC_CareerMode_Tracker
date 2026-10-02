using BBFF_EAFC_Career.ApiCode.DTO;
using BBFF_EAFC_Career.ApiCode.Utilities;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace BBFF_EAFC_Career.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class TransferLogController : ControllerBase
    {
        public TransferLogController() { }

        [HttpGet]
        public List<TransferLogDto> Get(int careerId, bool lastTransfer = false)
        {
            try
            {
                List<TransferLogDto> toRtn = TransferLogUtilities.GetTransferLog(careerId);

                if (lastTransfer)
                {
                    TransferLogDto last = toRtn.OrderByDescending(x => x.RawDate).FirstOrDefault();
                    return last != null ? new List<TransferLogDto> { last } : new List<TransferLogDto>();
                }
                else
                    return toRtn;
            }
            catch
            {
                return null;
            }
        }
    }
}
