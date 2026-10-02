using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class LeaguePositionUtilities
    {
        public static List<CurrentSeasonLeaguePos> GetLeaguePositions(int careerId)
        {
            List<CurrentSeasonLeaguePos> toRtn = new List<CurrentSeasonLeaguePos>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_league_positions", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                toRtn.Add(new CurrentSeasonLeaguePos
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Year = Convert.ToInt32(row["Year"]),
                    GameWeek = Convert.ToInt32(row["GameWeek"]),
                    Position = row["Position"] != DBNull.Value ? Convert.ToInt32(row["Position"]) : null,
                    Team = row["Team"].ToString(),
                    CSSStyles = row["CSSStyles"].ToString()
                });
            }

            return toRtn;
        }
    }
}
