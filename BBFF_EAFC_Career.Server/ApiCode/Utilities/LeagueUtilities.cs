using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class LeagueUtilities
    {
        public static List<LeagueDto> GetLeagues(bool female)
        {
            List<LeagueDto> leagues = new List<LeagueDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_leagues", new List<MySqlParameter> {
                new MySqlParameter("p_female", female)
            }).Rows;

            foreach (DataRow row in results)
            {
                leagues.Add(new LeagueDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Country = row["Country"].ToString(),
                    CountryCode = row["CountryCode"].ToString(),
                    League = row["LeagueName"].ToString(),
                    NumberOfGames = Convert.ToInt32(row["NumberOfGames"]),
                    Female = row.Table.Columns.Contains("Female") && row["Female"] != DBNull.Value && Convert.ToBoolean(row["Female"])
                });
            }

            return leagues;
        }
    }
}
