using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class TeamUtilities
    {
        public static List<TeamDto> GetTeams(string countryCode, bool? female = null)
        {
            List<TeamDto> teams = new List<TeamDto>();
            DataRowCollection results;

            object femaleParam = female.HasValue ? (object)female.Value : DBNull.Value;

            if (countryCode.ToLower() == "all")
                results = MySqlUtilities.GetSPData("get_teams", new List<MySqlParameter> {
                    new MySqlParameter("cc", null), new MySqlParameter("p_female", femaleParam)
                }).Rows;
            else
                results = MySqlUtilities.GetSPData("get_teams", new List<MySqlParameter> {
                    new MySqlParameter("cc", countryCode), new MySqlParameter("p_female", femaleParam)
                }).Rows;


            foreach (DataRow row in results)
            {
                teams.Add(new TeamDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Country = row["Country"] != DBNull.Value ? row["Country"].ToString() :
                        row["CountryCode"].ToString() == "INT" ? row["TeamName"].ToString() : "Rest of World",
                    CountryCode = row["CountryCode"].ToString(),
                    Team = row["TeamName"].ToString(),
                    PrimaryColour = row.Table.Columns.Contains("PrimaryColour") && row["PrimaryColour"] != DBNull.Value ? row["PrimaryColour"].ToString() : null,
                    SecondaryColour = row.Table.Columns.Contains("SecondaryColour") && row["SecondaryColour"] != DBNull.Value ? row["SecondaryColour"].ToString() : null,
                    TertiaryColour = row.Table.Columns.Contains("TertiaryColour") && row["TertiaryColour"] != DBNull.Value ? row["TertiaryColour"].ToString() : null,
                    Female = row.Table.Columns.Contains("Female") && row["Female"] != DBNull.Value && Convert.ToBoolean(row["Female"]),
                    InitialStartingLeagueID = row["InitialStartingLeague"] != DBNull.Value ? Convert.ToInt32(row["InitialStartingLeague"]) : 0,
                    InitialStartingLeagueName = row["LeagueName"].ToString()
                });
            }

            return teams.OrderBy(x => x.Country).ThenBy(x => x.Team).ToList();
        }
    }
}
