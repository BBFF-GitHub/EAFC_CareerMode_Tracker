using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class HeadToHeadUtilities
    {
        #region Get methods
        public static List<HeadToHeadTeamResultDto> GetHeadToHeadTeamResults(int careerId)
        {
            List<HeadToHeadTeamResultDto> toRtn = new List<HeadToHeadTeamResultDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_team_result_h2h", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                toRtn.Add(new HeadToHeadTeamResultDto()
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Team = row["Team"].ToString(),
                    TeamCountryCode = row["CountryCode"] != DBNull.Value ? row["CountryCode"].ToString() : "",
                    TeamCssStyles = row["CSSStyles"] != DBNull.Value ? row["CSSStyles"].ToString() : "",
                    GamesPlayed = Convert.ToInt32(row["GamesPlayed"]),
                    Wins = Convert.ToInt32(row["Wins"]),
                    Draws = Convert.ToInt32(row["Draws"]),
                    Losses = Convert.ToInt32(row["Losses"]),
                    GoalsScored = Convert.ToInt32(row["GoalsScored"]),
                    GoalsAgainst = Convert.ToInt32(row["GoalsAgainst"])
                });
            }

            foreach (HeadToHeadTeamResultDto team in toRtn)
            {
                team.GoalDifference = team.GoalsScored - team.GoalsAgainst;
                team.Points = (team.Wins * 3) + team.Draws;
                team.AvgGoalsScored = (double)team.GoalsScored / (double)team.GamesPlayed;
                team.AvgGoalsScored = Math.Round(team.AvgGoalsScored, 2);
                team.AvgGoalsAgainst = (double)team.GoalsAgainst / (double)team.GamesPlayed;
                team.AvgGoalsAgainst = Math.Round(team.AvgGoalsAgainst, 2);
                team.AvgGoalDifference = (double)(team.GoalsScored - team.GoalsAgainst) / (double)team.GamesPlayed;
                team.AvgGoalDifference = Math.Round(team.AvgGoalDifference, 2);
                team.AvgPoints = (double)team.Points / (double)team.GamesPlayed;
                team.AvgPoints = Math.Round(team.AvgPoints, 2);
            }

            toRtn = toRtn.OrderByDescending(x => x.AvgPoints).ThenByDescending(x => x.GoalDifference)
                .ThenByDescending(x => x.GoalsScored).ThenBy(x => x.GoalsAgainst).ThenBy(x => x.Team).ToList();

            return toRtn;
        }

        public static List<HeadToHeadPlayerTeamGoalDto> GetHeadToHeadPlayerTeamGoals(int careerId)
        {
            List<HeadToHeadPlayerTeamGoalDto> toRtn = new List<HeadToHeadPlayerTeamGoalDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_player_team_goals_h2h", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                toRtn.Add(new HeadToHeadPlayerTeamGoalDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    PlayerID = Convert.ToInt32(row["PlayerID"]),
                    PlayerName = row["PlayerName"].ToString(),
                    Position = row["Position"].ToString(),
                    PlayerImagePath = row["ImagePath"].ToString(),
                    Team = row["Team"].ToString(),
                    TeamCountryCode = row["CountryCode"] != DBNull.Value ? row["CountryCode"].ToString() : "",
                    TeamCssStyles = row["CSSStyles"] != DBNull.Value ? row["CSSStyles"].ToString() : "",
                    Goals = Convert.ToInt32(row["Goals"])
                });
            }

            return toRtn.OrderBy(x => x.PlayerName).ThenBy(x => x.Team).ToList();
        }
        #endregion
    }
}
