using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class CupUtilities
    {
        public static List<CupDto> GetCups(string countryCode)
        {
            List<CupDto> cups = new List<CupDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_cups", new List<MySqlParameter>
            {
                new MySqlParameter("cc", countryCode)
            }).Rows;

            foreach (DataRow row in results)
            {
                cups.Add(new CupDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    CountryCode = row["CountryCode"].ToString(),
                    CupName = row["CupName"].ToString(),
                    NumberOfGames = Convert.ToInt32(row["NumberOfGames"]),
                    Compulsory = Convert.ToBoolean(row["Compulsory"])
                });
            }

            return cups;
        }
    }
}
