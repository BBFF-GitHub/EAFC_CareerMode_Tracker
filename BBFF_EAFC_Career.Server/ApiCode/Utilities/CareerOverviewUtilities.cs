using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class CareerOverviewUtilities
    {
        #region Get methods
        public static List<CareerOverviewDto> GetCareerOverview(int careerId)
        {
            List<CareerOverviewDto> careerOverviewRows = new List<CareerOverviewDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_career_overview", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                int year = Convert.ToInt32(row["Year"]);
                int stintNumber = row.Table.Columns.Contains("StintNumber") && row["StintNumber"] != DBNull.Value ? Convert.ToInt32(row["StintNumber"]) : 1;

                if (careerOverviewRows.Any(x => x.Year == year && x.StintNumber == stintNumber) && row["CupName"] != DBNull.Value)
                {
                    careerOverviewRows.First(x => x.Year == year && x.StintNumber == stintNumber).Cups.Add(new CupDto
                    {
                        CupName = row["CupName"].ToString(),
                        CupProgress = row["CupProgress"] != DBNull.Value ? row["CupProgress"].ToString() : "In Progress"
                    });
                }
                else
                {
                    careerOverviewRows.Add(new CareerOverviewDto
                    {
                        ID = Convert.ToInt32(row["ID"]),
                        CareerID = careerId,
                        Year = year,
                        StintNumber = stintNumber,
                        DepartureReason = row.Table.Columns.Contains("DepartureReason") && row["DepartureReason"] != DBNull.Value ? row["DepartureReason"].ToString() : null,
                        CountryCode = row["CountryCode"] != DBNull.Value ? row["CountryCode"].ToString() : "-",
                        Team = row["Team"] != DBNull.Value ? row["Team"].ToString() : "-",
                        League = row["League"] != DBNull.Value ? row["League"].ToString() : "-",
                        GamesPlayed = row["GamesPlayed"] != DBNull.Value ? Convert.ToInt32(row["GamesPlayed"]) : 0,
                        Wins = row["Wins"] != DBNull.Value ? Convert.ToInt32(row["Wins"]) : 0,
                        Draws = row["Draws"] != DBNull.Value ? Convert.ToInt32(row["Draws"]) : 0,
                        Losses = row["Losses"] != DBNull.Value ? Convert.ToInt32(row["Losses"]) : 0,
                        GoalsScored = row["GoalsScored"] != DBNull.Value ? Convert.ToInt32(row["GoalsScored"]) : 0,
                        GoalsAgainst = row["GoalsAgainst"] != DBNull.Value ? Convert.ToInt32(row["GoalsAgainst"]) : 0,
                        LeaguePos = row["LeaguePos"] != DBNull.Value ? Convert.ToInt32(row["LeaguePos"]) : 0,
                        Completed = Convert.ToBoolean(row["Completed"]),
                        PrimaryColour = row.Table.Columns.Contains("PrimaryColour") && row["PrimaryColour"] != DBNull.Value ? row["PrimaryColour"].ToString() : null,
                        SecondaryColour = row.Table.Columns.Contains("SecondaryColour") && row["SecondaryColour"] != DBNull.Value ? row["SecondaryColour"].ToString() : null,
                        TertiaryColour = row.Table.Columns.Contains("TertiaryColour") && row["TertiaryColour"] != DBNull.Value ? row["TertiaryColour"].ToString() : null,
                        Cups = row["CupName"] == DBNull.Value ? new List<CupDto>() : new List<CupDto>
                        {
                            new CupDto
                            {
                                CupName = row["CupName"].ToString(),
                                CupProgress = row["CupProgress"] != DBNull.Value ? row["CupProgress"].ToString() : "In Progress"
                            }
                        }
                    });
                }
            }

            return careerOverviewRows;
        }
        #endregion
    }
}
