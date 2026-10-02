using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class InternationalsUtilities
    {
        #region Get methods
        public static InternationalsDto GetDetails(int careerId, int year)
        {
            InternationalsDto deets = new InternationalsDto();
            GetBasicDetails(careerId, year, deets);

            if (deets.ID == 0)
            {
                deets.Fixtures = new List<InternationalsFixture>();
                deets.Cups = new List<CupDto>();
                deets.Squad = new List<InternationalsPlayer>();
            }
            else
            {
                GetFixtures(deets);
                GetCupDetails(deets);
                GetSquad(deets);
            }

            deets.PendingChanges = new InternationalsChangesDto
            {
                CupChanges = false,
                FixtureAdd = false,
                FixtureChanges = false,
                SquadAdditions = false,
                SquadChanges = false,
                TeamPlayerStatsChanges = false
            };

            return deets;
        }
        #endregion

        #region Update methods
        public static bool ResignJob(int careerId)
        {
            try
            {
                MySqlUtilities.ExecuteSPUpdate("resign_international_job", new List<MySqlParameter>
                {
                    new MySqlParameter("careerId", careerId)
                });
                return true;
            }
            catch
            {
                return false;
            }
        }

        public static bool UpdateDetails(InternationalsDto internationalObj)
        {
            try
            {
                //Save cup settings
                if (internationalObj.PendingChanges.CupChanges)
                    SaveCupDetailChanges(internationalObj.Cups);

                //Remove old fixtures
                if (internationalObj.PendingChanges.FixtureRemovals)
                    RemoveFixtures(internationalObj.Fixtures.Where(x => x.Remove.HasValue && x.Remove.Value).ToList());

                //Save new fixtures
                if (internationalObj.PendingChanges.FixtureAdd)
                    SaveNewFixtures(internationalObj.Fixtures.Where(x => x.Added.HasValue && x.Added.Value).ToList(), internationalObj.ID);

                //Save fixture settings
                if (internationalObj.PendingChanges.FixtureChanges)
                    SaveFixtureChanges(internationalObj.Fixtures.Where(x => x.Edited).ToList(), internationalObj.CareerID, internationalObj.ID);

                //Save new squad additions
                if (internationalObj.PendingChanges.SquadAdditions)
                    SaveSquadAdditions(internationalObj.Squad.Where(x => !x.Saved).ToList(), internationalObj.CareerID, internationalObj.ID);

                //Save squad setting updates
                if (internationalObj.PendingChanges.SquadChanges)
                    SaveSquadChanges(internationalObj.Squad.Where(x => x.Saved && x.Edited).ToList(), internationalObj.Year);

                //Save players scoring against particular teams
                if (internationalObj.PendingChanges.TeamPlayerStatsChanges)
                    UpdateTeamPlayerStatsTable(internationalObj.TeamPlayerStats, internationalObj.CareerID);

                //Update last saved date of career
                CareerUtilities.UpdateLastSavedTime(internationalObj.CareerID);

                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region Private methods
        private static void GetBasicDetails(int careerId, int year, InternationalsDto deets)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_international_basic_details", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;
            if (results.Count == 0) return;

            DataRow row = results[0];
            deets.ID = Convert.ToInt32(row["ID"]);
            deets.CareerID = careerId;
            deets.Year = year;
            deets.Team = row["Team"].ToString();
            deets.TeamCSSStyles = row["CSSStyles"] != DBNull.Value ? row["CSSStyles"].ToString() : "";
            deets.PrimaryColour = row.Table.Columns.Contains("PrimaryColour") && row["PrimaryColour"] != DBNull.Value ? row["PrimaryColour"].ToString() : null;
            deets.SecondaryColour = row.Table.Columns.Contains("SecondaryColour") && row["SecondaryColour"] != DBNull.Value ? row["SecondaryColour"].ToString() : null;
            deets.TertiaryColour = row.Table.Columns.Contains("TertiaryColour") && row["TertiaryColour"] != DBNull.Value ? row["TertiaryColour"].ToString() : null;

            deets.GameStats = new InternationalsGameStats
            {
                ID = Convert.ToInt32(row["ID"]),
                GamesPlayed = Convert.ToInt32(row["GamesPlayed"]),
                Wins = Convert.ToInt32(row["Wins"]),
                Draws = Convert.ToInt32(row["Draws"]),
                Losses = Convert.ToInt32(row["Losses"]),
                GoalsScored = Convert.ToInt32(row["GoalsScored"]),
                GoalsAgainst = Convert.ToInt32(row["GoalsAgainst"])
            };
            deets.GameStats.GoalDifference = deets.GameStats.GoalsScored - deets.GameStats.GoalsAgainst;
            deets.TeamPlayerStats = new List<TeamPlayerStatsObj>();
        }

        private static void GetCupDetails(InternationalsDto deets)
        {
            deets.Cups = new List<CupDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_international_cup_details", new List<MySqlParameter>
            {
                new MySqlParameter("icoId", deets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                deets.Cups.Add(new CupDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Year = Convert.ToInt32(row["Year"]),
                    CupName = row["CupName"].ToString(),
                    CupProgress = row["CupProgress"] != DBNull.Value ? row["CupProgress"].ToString() : "-",
                    Out = deets.Fixtures.Count(x => x.Competition == row["CupName"].ToString() && x.Result.Length == 0) == 0
                });
            }
        }

        private static void SaveCupDetailChanges(List<CupDto> cupDeets)
        {
            foreach (CupDto cup in cupDeets.Where(x => x.CupProgress != "-"))
            {
                MySqlUtilities.ExecuteSPUpdate("update_international_cup_details", new List<MySqlParameter>
                {
                    new MySqlParameter("id", cup.ID),
                    new MySqlParameter("progress", cup.CupProgress)
                });
            }
        }

        private static void GetFixtures(InternationalsDto deets)
        {
            deets.Fixtures = new List<InternationalsFixture>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_international_fixtures", new List<MySqlParameter>
            {
                new MySqlParameter("icoId", deets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                deets.Fixtures.Add(new InternationalsFixture()
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Competition = row["Competition"].ToString(),
                    Order = row["Order"] != DBNull.Value ? Convert.ToInt32(row["Order"]) : 0,
                    Venue = row["Venue"] != DBNull.Value ? row["Venue"].ToString() : "",
                    VersusTeam = row["VersusTeam"] != DBNull.Value ? row["VersusTeam"].ToString() : "",
                    VersusTeamStyle = row["CSSStyles"] != DBNull.Value ? row["CSSStyles"].ToString() : "",
                    Result = row["Result"] != DBNull.Value ? row["Result"].ToString() : "",
                    OurScore = row["OurScore"] != DBNull.Value ? Convert.ToInt32(row["OurScore"]) : 0,
                    VersusScore = row["VersusScore"] != DBNull.Value ? Convert.ToInt32(row["VersusScore"]) : 0,
                    Penalties = row["Penalties"] != DBNull.Value ? Convert.ToBoolean(row["Penalties"]) : false,
                    Formation = row["Formation"] != DBNull.Value ? row["Formation"].ToString() : "",
                    Squad = row["Squad"] != DBNull.Value ? row["Squad"].ToString() : "",
                    Scorers = row["Scorers"] != DBNull.Value ? row["Scorers"].ToString() : "",
                    PlayGame = row.Table.Columns.Contains("PlayGame") && row["PlayGame"] != DBNull.Value && Convert.ToBoolean(row["PlayGame"])
                });
            }

            deets.Fixtures = deets.Fixtures.OrderBy(x => x.Order).ThenBy(x => x.ID).ToList();
            deets.Formation = deets.Fixtures.Count == 0 || deets.Fixtures.Count(x => x.Result != "") == 0 ? "4-4-2" :
                deets.Fixtures.LastOrDefault(x => x.Result != "").Formation;
        }

        private static void SaveNewFixtures(List<InternationalsFixture> fixtures, int intCareerId)
        {
            foreach (InternationalsFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_international_fixtures", new List<MySqlParameter>
                {
                    new MySqlParameter("icoId", intCareerId),
                    new MySqlParameter("comp", fixture.Competition),
                    new MySqlParameter("ordr", fixture.Order),
                    new MySqlParameter("venue", fixture.Venue),
                    new MySqlParameter("team", fixture.VersusTeam),
                    new MySqlParameter("play", fixture.PlayGame)
                });
            }
        }

        private static void SaveFixtureChanges(List<InternationalsFixture> fixtures, int careerId, int icoId)
        {
            foreach (InternationalsFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("update_international_fixtures", new List<MySqlParameter>
                {
                    new MySqlParameter("id", fixture.ID),
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("icoId", icoId),
                    new MySqlParameter("ordr", fixture.Order),
                    new MySqlParameter("venue", fixture.Venue),
                    new MySqlParameter("team", fixture.VersusTeam),
                    new MySqlParameter("result", fixture.Result),
                    new MySqlParameter("gf", fixture.OurScore),
                    new MySqlParameter("ga", fixture.VersusScore),
                    new MySqlParameter("pens", fixture.Penalties),
                    new MySqlParameter("form", fixture.Formation),
                    new MySqlParameter("squad", fixture.Squad),
                    new MySqlParameter("scorers", fixture.Scorers),
                    new MySqlParameter("play", fixture.PlayGame)
                });
            }
        }

        private static void RemoveFixtures(List<InternationalsFixture> fixtures)
        {
            foreach (InternationalsFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("remove_international_fixture", new List<MySqlParameter>
                {
                    new MySqlParameter("id", fixture.ID),
                });
            }
        }

        private static void GetSquad(InternationalsDto deets)
        {
            deets.Squad = new List<InternationalsPlayer>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_international_squad", new List<MySqlParameter>
            {
                new MySqlParameter("icoId", deets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                deets.Squad.Add(new InternationalsPlayer
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Player = row["Player"].ToString(),
                    Position = row["Position"].ToString(),
                    CurrentClub = row["CurrentClub"].ToString(),
                    ImagePath = row["ImagePath"].ToString(),
                    CallUps = row["CallUps"] != DBNull.Value ? Convert.ToInt32(row["CallUps"]) : 0,
                    Caps = row["Caps"] != DBNull.Value ? Convert.ToInt32(row["Caps"]) : 0,
                    NewCaps = 0,
                    Goals = row["Goals"] != DBNull.Value ? Convert.ToInt32(row["Goals"]) : 0,
                    NewGoals = 0,
                    Rating = row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                    RatingDisplay = row["Rating"] != DBNull.Value && Convert.ToInt32(row["Caps"]) > 0 ?
                        Math.Round(Convert.ToDouble(row["Rating"]) / Convert.ToInt32(row["Caps"]), 2) : 0,
                    InCurrentSquad = row["InCurrentSquad"] != DBNull.Value ? Convert.ToBoolean(row["InCurrentSquad"]) : false,
                    Saved = true
                });
            }
        }

        private static void SaveSquadAdditions(List<InternationalsPlayer> squad, int careerId, int icoId)
        {
            foreach (InternationalsPlayer player in squad)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_international_player", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("icoId", icoId),
                    new MySqlParameter("pName", player.Player),
                    new MySqlParameter("pos", player.Position),
                    new MySqlParameter("picPath", player.ImagePath)
                });
            }
        }

        private static void SaveSquadChanges(List<InternationalsPlayer> squad, int year)
        {
            foreach (InternationalsPlayer player in squad)
            {
                MySqlUtilities.ExecuteSPUpdate("update_international_squad", new List<MySqlParameter>
                {
                    new MySqlParameter("id", player.ID),
                    new MySqlParameter("yr", year),
                    new MySqlParameter("position", player.Position),
                    new MySqlParameter("club", player.CurrentClub),
                    new MySqlParameter("callups", player.CallUps),
                    new MySqlParameter("caps", player.Caps),
                    new MySqlParameter("goals", player.Goals),
                    new MySqlParameter("newCaps", player.NewCaps),
                    new MySqlParameter("newGoals", player.NewGoals),
                    new MySqlParameter("rating", player.Rating),
                    new MySqlParameter("inSquad", player.InCurrentSquad)
                });
            }
        }

        private static void UpdateTeamPlayerStatsTable(List<TeamPlayerStatsObj> teamPlayerStats, int careerId)
        {
            foreach (TeamPlayerStatsObj player in teamPlayerStats)
            {
                MySqlUtilities.ExecuteSPUpdate("update_international_player_stats", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("pid", player.PlayerID),
                    new MySqlParameter("team", player.Team),
                    new MySqlParameter("caps", player.Caps),
                    new MySqlParameter("goals", player.Goals),
                    new MySqlParameter("rating", player.Rating)
                });
            }
        }
        #endregion
    }
}
