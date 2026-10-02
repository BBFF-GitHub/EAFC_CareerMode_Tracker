using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class TransferLogUtilities
    {
        public static List<TransferLogDto> GetTransferLog(int careerId)
        {
            List<TransferLogDto> transferLog = new List<TransferLogDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_transfer_log", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                transferLog.Add(new TransferLogDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Year = Convert.ToInt32(row["Year"]),
                    RawDate = Convert.ToDateTime(row["Date"]),
                    Status = Convert.ToBoolean(row["TransferIn"]) ? "In" : "Out",
                    Player = row["Player"].ToString(),
                    PlayerImagePath = row["ImagePath"].ToString(),
                    FromClub = row["FromClub"].ToString(),
                    ToClub = row["ToClub"].ToString(),
                    Fee = Convert.ToInt32(row["Fee"]),
                    FeeDisplay = row["FeeDisplay"].ToString()
                });
            }

            foreach (TransferLogDto log in transferLog)
                log.Date = log.RawDate.ToString("dd/MM/yyyy");

            return transferLog.OrderBy(x => x.RawDate).ToList();
        }
    }
}
