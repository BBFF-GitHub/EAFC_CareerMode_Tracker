using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class SeasonUtilities
    {
        public static void AddMidSeasonMove(CareerOverviewDto obj)
        {
            //Custom team mid-season isn't supported in this first pass - the wizard that calls this
            //only offers authentic clubs, so PrimaryColour should never be set here. Guarding anyway.
            if (obj.PrimaryColour != null && obj.PrimaryColour.Length > 0)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_custom_team", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", obj.CareerID),
                    new MySqlParameter("cc", obj.CountryCode),
                    new MySqlParameter("team", obj.Team),
                    new MySqlParameter("primaryColour", obj.PrimaryColour),
                    new MySqlParameter("secondaryColour", obj.SecondaryColour),
                    new MySqlParameter("tertiaryColour", obj.TertiaryColour)
                });
            }

            //Starts a new stint for the SAME year - the old CurrentSeason/CareerOverview rows for
            //this year are left completely untouched, a frozen record of the spell that just ended.
            MySqlUtilities.ExecuteSPUpdate("add_mid_season_move", new List<MySqlParameter>
            {
                new MySqlParameter("careerId", obj.CareerID),
                new MySqlParameter("yr", obj.Year),
                new MySqlParameter("cc", obj.CountryCode),
                new MySqlParameter("team", obj.Team),
                new MySqlParameter("league", obj.League),
                new MySqlParameter("reason", obj.Reason),
                new MySqlParameter("p_female", obj.Female)
            });

            foreach (CupDto cup in obj.Cups)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_season_cup", new List<MySqlParameter>
                {
                    new MySqlParameter("careerId", obj.CareerID),
                    new MySqlParameter("p_cupName", cup.CupName)
                });
            }

            //Deliberately no squad carry-over and no finish_last_season call - the new stint starts
            //with an empty squad, same as any other authentic team, so the existing pre-populate-players
            //flow (which auto-triggers whenever a season has no formation and no squad yet) picks it up.

            //Update last saved date of career
            CareerUtilities.UpdateLastSavedTime(obj.CareerID);
        }

        public static void AddNewSeason(CareerOverviewDto obj)
        {
            //Add new custom team
            if (obj.PrimaryColour != null && obj.PrimaryColour.Length > 0)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_custom_team", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", obj.CareerID),
                    new MySqlParameter("cc", obj.CountryCode),
                    new MySqlParameter("team", obj.Team),
                    new MySqlParameter("primaryColour", obj.PrimaryColour),
                    new MySqlParameter("secondaryColour", obj.SecondaryColour),
                    new MySqlParameter("tertiaryColour", obj.TertiaryColour)
                });
            }

            //Create Career Overview & Current Season objs
            MySqlUtilities.ExecuteSPUpdate("add_new_season", new List<MySqlParameter>
            {
                new MySqlParameter("careerId", obj.CareerID),
                new MySqlParameter("cc", obj.CountryCode),
                new MySqlParameter("team", obj.Team),
                new MySqlParameter("league", obj.League),
                new MySqlParameter("p_female", obj.Female)
            });

            //Create Career Overview Cup & Current Season Cup objs
            foreach (CupDto cup in obj.Cups)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_season_cup", new List<MySqlParameter>
                {
                    new MySqlParameter("careerId", obj.CareerID),
                    new MySqlParameter("p_cupName", cup.CupName)
                });
            }

            //If we've stayed at the club from last season, clone squad details & tidy-up
            if (obj.StayWithClub)
            {
                List<CurrentSeasonSquadPlayer> lastSeasonSquad = GetLastSeasonSquad(obj.CareerID);
                lastSeasonSquad = lastSeasonSquad.Where(x => !x.PreContractOut && !x.Retiring).ToList();

                foreach (CurrentSeasonSquadPlayer player in lastSeasonSquad)
                {
                    MySqlUtilities.ExecuteSPUpdate("clone_squad_player", new List<MySqlParameter>
                    {
                        new MySqlParameter("careerId", obj.CareerID),
                        new MySqlParameter("pid", player.PlayerID),
                        new MySqlParameter("pName", player.Player),
                        new MySqlParameter("pos", player.Position),
                        new MySqlParameter("ordr", player.Order),
                        new MySqlParameter("lin", player.LoanedIn),
                        new MySqlParameter("lout", player.LoanedOut),
                        new MySqlParameter("trl", player.TransferListed),
                        new MySqlParameter("ll", player.LoanListed),
                        new MySqlParameter("ys", player.YouthSquad)
                    });
                }
            }
            else if (obj.Year > 0)
            {
                MySqlUtilities.ExecuteSPUpdate("finish_last_season", new List<MySqlParameter>
                {
                    new MySqlParameter("careerId", obj.CareerID)
                });
            }

            //Update last saved date of career
            CareerUtilities.UpdateLastSavedTime(obj.CareerID);
        }

        public static void NewInternationalJob(CareerOverviewDto obj)
        {
            //Create International Career Overview obj
            MySqlUtilities.ExecuteSPUpdate("add_new_international_job", new List<MySqlParameter>
            {
                new MySqlParameter("careerId", obj.CareerID),
                new MySqlParameter("team", obj.Team)
            });

            //Update last saved date of career
            CareerUtilities.UpdateLastSavedTime(obj.CareerID);
        }

        public static void EndSeason(EndOfSeasonDto obj)
        {
            //Update CareerOverview
            MySqlUtilities.ExecuteSPUpdate("end_season", new List<MySqlParameter>
            {
                new MySqlParameter("cid", obj.CareerID),
                new MySqlParameter("yr", obj.Year)
            });

            //Add League Table & Stats
            foreach (EndOfSeasonLeagueTableRowDto leagueRow in obj.LeagueTable)
            {
                MySqlUtilities.ExecuteSPUpdate("add_to_final_league_table", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", obj.CareerID),
                    new MySqlParameter("yr", obj.Year),
                    new MySqlParameter("teamName", leagueRow.TeamName),
                    new MySqlParameter("img", leagueRow.TeamImagePath),
                    new MySqlParameter("cssStyle", leagueRow.TeamCssStyles),
                    new MySqlParameter("gp", leagueRow.GamesPlayed),
                    new MySqlParameter("wins", leagueRow.Wins),
                    new MySqlParameter("draws", leagueRow.Draws),
                    new MySqlParameter("losses", leagueRow.Losses),
                    new MySqlParameter("gs", leagueRow.GoalsScored),
                    new MySqlParameter("ga", leagueRow.GoalsAgainst),
                    new MySqlParameter("pos", leagueRow.Pos)
                });
            }

            //Add Cup Winners & Score
            foreach (EndOfSeasonCupFinalsTableRowDto cupRow in obj.CupFinals)
            {
                MySqlUtilities.ExecuteSPUpdate("add_to_cup_final_table", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", obj.CareerID),
                    new MySqlParameter("yr", obj.Year),
                    new MySqlParameter("cupFinal", cupRow.CupFinal),
                    new MySqlParameter("homeTeam", cupRow.HomeTeam),
                    new MySqlParameter("homeImg", cupRow.HomeTeamImg),
                    new MySqlParameter("homeStyle", cupRow.HomeTeamStyle),
                    new MySqlParameter("awayTeam", cupRow.AwayTeam),
                    new MySqlParameter("awayImg", cupRow.AwayTeamImg),
                    new MySqlParameter("awayStyle", cupRow.AwayTeamStyle),
                    new MySqlParameter("hScore", cupRow.HomeScore),
                    new MySqlParameter("aScore", cupRow.AwayScore),
                    new MySqlParameter("penaltyWinner", cupRow.PenaltyWinner)
                });
            }
        }

        private static List<CurrentSeasonSquadPlayer> GetLastSeasonSquad(int careerId)
        {
            List<CurrentSeasonSquadPlayer> lastSeasonSquad = new List<CurrentSeasonSquadPlayer>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_squad_from_last_season_to_clone", new List<MySqlParameter>
            {
                new MySqlParameter("careerId", careerId)
            }).Rows;

            foreach (DataRow row in results)
            {
                lastSeasonSquad.Add(new CurrentSeasonSquadPlayer
                {
                    PlayerID = Convert.ToInt32(row["PlayerID"]),
                    Player = row["Player"].ToString(),
                    Position = row["Position"].ToString(),
                    Order = row["Order"] != DBNull.Value ? Convert.ToInt32(row["Order"]) : 0,
                    LoanedIn = row["LoanedIn"] != DBNull.Value ? Convert.ToBoolean(row["LoanedIn"]) : false,
                    LoanedOut = row["LoanedOut"] != DBNull.Value ? Convert.ToBoolean(row["LoanedOut"]) : false,
                    TransferListed = row["TransferListed"] != DBNull.Value ? Convert.ToBoolean(row["TransferListed"]) : false,
                    LoanListed = row["LoanListed"] != DBNull.Value ? Convert.ToBoolean(row["LoanListed"]) : false,
                    YouthSquad = row["YouthSquad"] != DBNull.Value ? Convert.ToBoolean(row["YouthSquad"]) : false,
                    PreContract = row["PreContract"] != DBNull.Value ? Convert.ToBoolean(row["PreContract"]) : false,
                    PreContractOut = row["PreContractOut"] != DBNull.Value ? Convert.ToBoolean(row["PreContractOut"]) : false,
                    Retiring = row["Retiring"] != DBNull.Value ? Convert.ToBoolean(row["Retiring"]) : false
                });
            }

            return lastSeasonSquad;
        }
    }
}
