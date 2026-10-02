using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;
using System.Numerics;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class CurrentSeasonUtilities
    {
        #region Get methods
        public static CurrentSeasonDto GetSeasonDetails(int careerId, int year)
        {
            CurrentSeasonDto seasonDeets = new CurrentSeasonDto();

            GetBasicDetails(careerId, year, seasonDeets);
            GetFixtures(seasonDeets);
            GetCupDetails(seasonDeets);
            GetLeaguePositions(seasonDeets);
            GetSquad(seasonDeets);

            if (seasonDeets.Fixtures.Count(x => x.Result.Length == 0) == 0)
                GetEndOfSeasonResults(seasonDeets);
            else
                seasonDeets.EndOfSeasonResults = new EndOfSeasonDto { LeagueTable = new List<EndOfSeasonLeagueTableRowDto>(),
                    CupFinals = new List<EndOfSeasonCupFinalsTableRowDto>() };

            seasonDeets.PendingChanges = new CurrentSeasonChangesDto
            {
                BasicChanges = false,
                CupChanges = false,
                FixtureAdd = false,
                FixtureChanges = false,
                LeaguePosChanges = false,
                LeagueStatChanges = false,
                SeasonAwardsChanges = false,
                SquadAdditions = false,
                SquadChanges = false,
                SquadRemovals = false,
                TeamPlayerStatsChanges = false,
                TransferLogUpdate = false
            };

            return seasonDeets;
        }
        #endregion

        #region Update methods
        public static bool UpdateSeasonDetails(CurrentSeasonDto seasonObj)
        {
            try
            {
                //Save basic settings
                if (seasonObj.PendingChanges.BasicChanges)
                    SaveBasicDetailChanges(seasonObj);

                //Save cup settings
                if (seasonObj.PendingChanges.CupChanges)
                    SaveCupDetailChanges(seasonObj.SeasonCups, seasonObj.CareerID, seasonObj.Year);

                //Remove old fixtures
                if (seasonObj.PendingChanges.FixtureRemovals)
                    RemoveFixtures(seasonObj.Fixtures.Where(x => x.Remove.HasValue && x.Remove.Value).ToList());

                //Save new fixtures
                if (seasonObj.PendingChanges.FixtureAdd)
                    SaveNewFixtures(seasonObj.Fixtures.Where(x => x.Added.HasValue && x.Added.Value).ToList(), seasonObj.ID);

                //Save fixture settings
                if (seasonObj.PendingChanges.FixtureChanges)
                    SaveFixtureChanges(seasonObj.Fixtures.Where(x => x.Edited).ToList(), seasonObj.CareerID, seasonObj.Year);

                //Save league pos settings
                if (seasonObj.PendingChanges.LeaguePosChanges)
                    SaveLeaguePosChanges(seasonObj.LeaguePos);

                //Save league stats settings
                if (seasonObj.PendingChanges.LeagueStatChanges)
                    SaveLeagueStatChanges(seasonObj.LeagueStats);

                //Save season award settings
                if (seasonObj.PendingChanges.SeasonAwardsChanges)
                    SaveSeasonAwardsChanges(seasonObj);

                //Save new squad additions
                if (seasonObj.PendingChanges.SquadAdditions)
                    SaveSquadAdditions(seasonObj.Squad.Where(x => !x.Saved).ToList(), seasonObj.CareerID, seasonObj.ID);

                //Save squad setting updates
                if (seasonObj.PendingChanges.SquadChanges)
                    SaveSquadChanges(seasonObj.Squad.Where(x => x.Saved && x.Edited).ToList(), seasonObj.Year);

                //Remove players no longer in squad
                if (seasonObj.PendingChanges.SquadRemovals)
                    RemoveFromSquad(seasonObj.Squad.Where(x => x.Remove).ToList());

                //Save players scoring against particular teams
                if (seasonObj.PendingChanges.TeamPlayerStatsChanges)
                    UpdateTeamPlayerStatsTable(seasonObj.TeamPlayerStats, seasonObj.CareerID);

                //Save additions to transfer log
                if (seasonObj.PendingChanges.TransferLogUpdate)
                    UpdateTransferLog(seasonObj.Transfers, seasonObj.CareerID);

                //Update last saved date of career
                CareerUtilities.UpdateLastSavedTime(seasonObj.CareerID);

                return true;
            }
            catch
            {
                return false;
            }
        }
        #endregion

        #region Private methods
        private static void GetBasicDetails(int careerId, int year, CurrentSeasonDto seasonDeets)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_season_basic_details", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId),
                new MySqlParameter("yr", year)
            }).Rows;
            DataRow row = results[0];

            seasonDeets.ID = Convert.ToInt32(row["ID"]);
            seasonDeets.CareerID = careerId;
            seasonDeets.Year = year;
            seasonDeets.StintNumber = row.Table.Columns.Contains("StintNumber") && row["StintNumber"] != DBNull.Value ? Convert.ToInt32(row["StintNumber"]) : 1;
            seasonDeets.DepartureReason = row.Table.Columns.Contains("DepartureReason") && row["DepartureReason"] != DBNull.Value ? row["DepartureReason"].ToString() : null;
            seasonDeets.Female = row.Table.Columns.Contains("Female") && row["Female"] != DBNull.Value && Convert.ToBoolean(row["Female"]);
            seasonDeets.CountryCode = row["CountryCode"].ToString();
            seasonDeets.Team = row["Team"].ToString();
            seasonDeets.TeamCSSStyles = row["CSSStyles"] != DBNull.Value ? row["CSSStyles"].ToString() : "";
            seasonDeets.PrimaryColour = row.Table.Columns.Contains("PrimaryColour") && row["PrimaryColour"] != DBNull.Value ? row["PrimaryColour"].ToString() : null;
            seasonDeets.SecondaryColour = row.Table.Columns.Contains("SecondaryColour") && row["SecondaryColour"] != DBNull.Value ? row["SecondaryColour"].ToString() : null;
            seasonDeets.TertiaryColour = row.Table.Columns.Contains("TertiaryColour") && row["TertiaryColour"] != DBNull.Value ? row["TertiaryColour"].ToString() : null;
            seasonDeets.League = row["League"].ToString();
            seasonDeets.Formation = row["Formation"] != DBNull.Value ? row["Formation"].ToString() : "";
            seasonDeets.CustomTeam = row["CustomTeam"] != DBNull.Value ? Convert.ToBoolean(row["CustomTeam"].ToString()) : false;

            seasonDeets.LeagueStats = new CurrentSeasonLeagueStats
            {
                ID = Convert.ToInt32(row["LeagueStatsID"]),
                CurrentSeasonID = Convert.ToInt32(row["ID"]),
                GamesPlayed = Convert.ToInt32(row["GamesPlayed"]),
                Wins = Convert.ToInt32(row["Wins"]),
                Draws = Convert.ToInt32(row["Draws"]),
                Losses = Convert.ToInt32(row["Losses"]),
                GoalsScored = Convert.ToInt32(row["GoalsScored"]),
                GoalsAgainst = Convert.ToInt32(row["GoalsAgainst"])
            };
            seasonDeets.LeagueStats.GoalDifference = seasonDeets.LeagueStats.GoalsScored - seasonDeets.LeagueStats.GoalsAgainst;
            seasonDeets.LeagueStats.Points = (seasonDeets.LeagueStats.Wins * 3) + seasonDeets.LeagueStats.Draws;

            seasonDeets.SeasonAwards = new CurrentSeasonAwardsDto
            {
                BestPlayer = row["BestPlayer"] != DBNull.Value ? row["BestPlayer"].ToString() : "",
                BestPlayerRating = row["BestPlayerRating"] != DBNull.Value ? Convert.ToDouble(row["BestPlayerRating"]) : 0,
                BestYoungPlayer = row["BestYoungPlayer"] != DBNull.Value ? row["BestYoungPlayer"].ToString() : "",
                BestYoungPlayerRating = row["BestYoungPlayerRating"] != DBNull.Value ? Convert.ToDouble(row["BestYoungPlayerRating"]) : 0,
                BestPlaymaker = row["BestPlaymaker"] != DBNull.Value ? row["BestPlaymaker"].ToString() : "",
                BestPlaymakerAssists = row["BestPlaymakerAssists"] != DBNull.Value ? Convert.ToInt32(row["BestPlaymakerAssists"]) : 0
            };
            seasonDeets.TeamPlayerStats = new List<TeamPlayerStatsObj>();
        }

        private static void SaveBasicDetailChanges(CurrentSeasonDto seasonDeets)
        {
            MySqlUtilities.ExecuteSPUpdate("update_season_basic_details", new List<MySqlParameter>
            {
                new MySqlParameter("id", seasonDeets.ID),
                new MySqlParameter("form", seasonDeets.Formation)
            });
        }

        private static void GetCupDetails(CurrentSeasonDto seasonDeets)
        {
            seasonDeets.SeasonCups = new List<CupDto>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_season_cup_details", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                seasonDeets.SeasonCups.Add(new CupDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    CountryCode = seasonDeets.CountryCode,
                    CupName = row["CupName"].ToString(),
                    CupProgress = row["CupProgress"] != DBNull.Value ? row["CupProgress"].ToString() : "-",
                    Out = seasonDeets.Fixtures.Count(x => x.Competition == row["CupName"].ToString() && x.Result.Length == 0) == 0
                });
            }
        }

        private static void SaveCupDetailChanges(List<CupDto> cupDeets, int careerId, int year)
        {
            foreach (CupDto cup in cupDeets.Where(x => x.CupProgress != "-"))
            {
                MySqlUtilities.ExecuteSPUpdate("update_season_cup_details", new List<MySqlParameter>
                {
                    new MySqlParameter("id", cup.ID),
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("yr", year),
                    new MySqlParameter("progress", cup.CupProgress)
                });
            }
        }

        private static void GetFixtures(CurrentSeasonDto seasonDeets)
        {
            seasonDeets.Fixtures = new List<CurrentSeasonFixture>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_season_fixtures", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                seasonDeets.Fixtures.Add(new CurrentSeasonFixture()
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
                    Scorers = row["Scorers"] != DBNull.Value ? row["Scorers"].ToString() : "",
                    PlayGame = row["PlayGame"] != DBNull.Value ? Convert.ToBoolean(row["PlayGame"]) : false,
                });
            }

            seasonDeets.Fixtures = seasonDeets.Fixtures.OrderBy(x => x.Order).ThenBy(x => x.ID).ToList();
        }

        private static void SaveNewFixtures(List<CurrentSeasonFixture> fixtures, int seasonId)
        {
            foreach (CurrentSeasonFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_season_fixtures", new List<MySqlParameter>
                {
                    new MySqlParameter("sid", seasonId),
                    new MySqlParameter("comp", fixture.Competition),
                    new MySqlParameter("ordr", fixture.Order),
                    new MySqlParameter("venue", fixture.Venue),
                    new MySqlParameter("team", fixture.VersusTeam),
                    new MySqlParameter("play", fixture.PlayGame)
                });
            }
        }

        private static void SaveFixtureChanges(List<CurrentSeasonFixture> fixtures, int careerId, int year)
        {
            foreach (CurrentSeasonFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("update_season_fixtures", new List<MySqlParameter>
                {
                    new MySqlParameter("id", fixture.ID),
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("yr", year),
                    new MySqlParameter("ordr", fixture.Order),
                    new MySqlParameter("venue", fixture.Venue),
                    new MySqlParameter("team", fixture.VersusTeam),
                    new MySqlParameter("result", fixture.Result),
                    new MySqlParameter("gf", fixture.OurScore),
                    new MySqlParameter("ga", fixture.VersusScore),
                    new MySqlParameter("pens", fixture.Penalties),
                    new MySqlParameter("scorers", fixture.Scorers),
                     new MySqlParameter("play", fixture.PlayGame)
                });
            }
        }

        private static void RemoveFixtures(List<CurrentSeasonFixture> fixtures)
        {
            foreach (CurrentSeasonFixture fixture in fixtures)
            {
                MySqlUtilities.ExecuteSPUpdate("remove_fixture", new List<MySqlParameter>
                {
                    new MySqlParameter("id", fixture.ID),
                });
            }
        }

        private static void GetLeaguePositions(CurrentSeasonDto seasonDeets)
        {
            seasonDeets.LeaguePos = new List<CurrentSeasonLeaguePos>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_season_league_pos", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                seasonDeets.LeaguePos.Add(new CurrentSeasonLeaguePos
                {
                    ID = Convert.ToInt32(row["ID"]),
                    GameWeek = Convert.ToInt32(row["GameWeek"]),
                    Position = row["Position"] != DBNull.Value ? Convert.ToInt32(row["Position"]) : 0
                });
            }
        }

        private static void SaveLeaguePosChanges(List<CurrentSeasonLeaguePos> leaguePos)
        {
            foreach (CurrentSeasonLeaguePos pos in leaguePos.Where(x => x.Position != null && x.Position != 0))
            {
                MySqlUtilities.ExecuteSPUpdate("update_season_league_pos", new List<MySqlParameter>
                {
                    new MySqlParameter("id", pos.ID),
                    new MySqlParameter("position", pos.Position.Value)
                });
            }
        }

        private static void SaveLeagueStatChanges(CurrentSeasonLeagueStats leagueStats)
        {
            MySqlUtilities.ExecuteSPUpdate("update_season_league_stats", new List<MySqlParameter>
            {
                new MySqlParameter("id", leagueStats.ID),
                new MySqlParameter("gp", leagueStats.GamesPlayed),
                new MySqlParameter("w", leagueStats.Wins),
                new MySqlParameter("d", leagueStats.Draws),
                new MySqlParameter("l", leagueStats.Losses),
                new MySqlParameter("gs", leagueStats.GoalsScored),
                new MySqlParameter("ga", leagueStats.GoalsAgainst)
            });
        }

        private static void SaveSeasonAwardsChanges(CurrentSeasonDto seasonDeets)
        {
            MySqlUtilities.ExecuteSPUpdate("update_season_awards_details", new List<MySqlParameter>
            {
                new MySqlParameter("id", seasonDeets.ID),
                new MySqlParameter("bp", seasonDeets.SeasonAwards.BestPlayer),
                new MySqlParameter("bpr", seasonDeets.SeasonAwards.BestPlayerRating),
                new MySqlParameter("byp", seasonDeets.SeasonAwards.BestYoungPlayer),
                new MySqlParameter("bypr", seasonDeets.SeasonAwards.BestYoungPlayerRating),
                new MySqlParameter("play", seasonDeets.SeasonAwards.BestPlaymaker),
                new MySqlParameter("playa", seasonDeets.SeasonAwards.BestPlaymakerAssists)
            });
        }

        private static void GetSquad(CurrentSeasonDto seasonDeets)
        {
            seasonDeets.Squad = new List<CurrentSeasonSquadPlayer>();
            DataRowCollection results = MySqlUtilities.GetSPData("get_season_squad", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            //Eligible positions per player, keyed by PlayerID - falls back to just their
            //primary Position if a player has no PlayerPosition rows for any reason
            Dictionary<int, List<string>> eligiblePositionsByPlayer = new Dictionary<int, List<string>>();
            DataRowCollection eligibleResults = MySqlUtilities.GetSPData("get_squad_eligible_positions", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;
            foreach (DataRow eligibleRow in eligibleResults)
            {
                int pid = Convert.ToInt32(eligibleRow["PlayerID"]);
                string pos = eligibleRow["Position"].ToString();
                if (!eligiblePositionsByPlayer.ContainsKey(pid)) eligiblePositionsByPlayer[pid] = new List<string>();
                if (!eligiblePositionsByPlayer[pid].Contains(pos)) eligiblePositionsByPlayer[pid].Add(pos);
            }

            foreach (DataRow row in results)
            {
                int? playerId = row["PlayerID"] != DBNull.Value ? Convert.ToInt32(row["PlayerID"]) : (int?)null;

                seasonDeets.Squad.Add(new CurrentSeasonSquadPlayer
                {
                    ID = Convert.ToInt32(row["ID"]),
                    PlayerID = playerId,
                    Player = row["Player"].ToString(),
                    Position = row["Position"].ToString(),
                    ImagePath = row["ImagePath"].ToString(),
                    EligiblePositions = playerId.HasValue && eligiblePositionsByPlayer.ContainsKey(playerId.Value)
                        ? eligiblePositionsByPlayer[playerId.Value]
                        : new List<string> { row["Position"].ToString() },
                    Order = row["Order"] != DBNull.Value ? Convert.ToInt32(row["Order"]) : 0,
                    LoanedIn = row["LoanedIn"] != DBNull.Value ? Convert.ToBoolean(row["LoanedIn"]) : false,
                    LoanedOut = row["LoanedOut"] != DBNull.Value ? Convert.ToBoolean(row["LoanedOut"]) : false,
                    TransferListed = row["TransferListed"] != DBNull.Value ? Convert.ToBoolean(row["TransferListed"]) : false,
                    LoanListed = row["LoanListed"] != DBNull.Value ? Convert.ToBoolean(row["LoanListed"]) : false,
                    YouthSquad = row["YouthSquad"] != DBNull.Value ? Convert.ToBoolean(row["YouthSquad"]) : false,
                    PreContract = row["PreContract"] != DBNull.Value ? Convert.ToBoolean(row["PreContract"]) : false,
                    PreContractOut = row["PreContractOut"] != DBNull.Value ? Convert.ToBoolean(row["PreContractOut"]) : false,
                    Retiring = row["Retiring"] != DBNull.Value ? Convert.ToBoolean(row["Retiring"]) : false,
                    Caps = row["Caps"] != DBNull.Value ? Convert.ToInt32(row["Caps"]) : 0,
                    Goals = row["Goals"] != DBNull.Value ? Convert.ToInt32(row["Goals"]) : 0,
                    Rating = row["Rating"] != DBNull.Value ? Convert.ToDouble(row["Rating"]) : 0,
                    MotmPoints = row.Table.Columns.Contains("MotmPoints") && row["MotmPoints"] != DBNull.Value ? Convert.ToInt32(row["MotmPoints"]) : 0,
                    RatingDisplay = row["Rating"] != DBNull.Value && Convert.ToInt32(row["Caps"]) > 0 ?
                        Math.Round(Convert.ToDouble(row["Rating"]) / Convert.ToInt32(row["Caps"]), 2) : 0,
                    Saved = true
                });
            }
        }

        private static void RemoveFromSquad(List<CurrentSeasonSquadPlayer> squad)
        {
            foreach (CurrentSeasonSquadPlayer player in squad)
            {
                MySqlUtilities.ExecuteSPUpdate("remove_from_season_squad", new List<MySqlParameter>
                {
                    new MySqlParameter("id", player.ID)
                });
            }
        }

        private static void SaveSquadAdditions(List<CurrentSeasonSquadPlayer> squad, int careerId, int seasonId)
        {
            foreach (CurrentSeasonSquadPlayer player in squad)
            {
                MySqlUtilities.ExecuteSPUpdate("add_new_squad_player", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("sid", seasonId),
                    new MySqlParameter("pName", player.Player),
                    new MySqlParameter("pos", player.Position),
                    new MySqlParameter("picPath", player.ImagePath),
                    new MySqlParameter("ordr", player.Order),
                    new MySqlParameter("lin", player.LoanedIn),
                    new MySqlParameter("lout", player.LoanedOut),
                    new MySqlParameter("trl", player.TransferListed),
                    new MySqlParameter("ll", player.LoanListed),
                    new MySqlParameter("ys", player.YouthSquad),
                    new MySqlParameter("precon", player.PreContract)
                });
            }
        }

        private static void SaveSquadChanges(List<CurrentSeasonSquadPlayer> squad, int year)
        {
            foreach (CurrentSeasonSquadPlayer player in squad)
            {
                MySqlUtilities.ExecuteSPUpdate("update_season_squad", new List<MySqlParameter>
                {
                    new MySqlParameter("id", player.ID),
                    new MySqlParameter("yr", year),
                    new MySqlParameter("position", player.Position),
                    new MySqlParameter("ordr", player.Order),
                    new MySqlParameter("lin", player.LoanedIn),
                    new MySqlParameter("lout", player.LoanedOut),
                    new MySqlParameter("trl", player.TransferListed),
                    new MySqlParameter("ll", player.LoanListed),
                    new MySqlParameter("ys", player.YouthSquad),
                    new MySqlParameter("precon", player.PreContract),
                    new MySqlParameter("preconout", player.PreContractOut),
                    new MySqlParameter("retire", player.Retiring),
                    new MySqlParameter("caps", player.Caps),
                    new MySqlParameter("goals", player.Goals),
                    new MySqlParameter("rating", player.Rating),
                    new MySqlParameter("motmPoints", player.MotmPoints)
                });
            }
        }

        private static void UpdateTeamPlayerStatsTable(List<TeamPlayerStatsObj> teamPlayerStats, int careerId)
        {
            foreach (TeamPlayerStatsObj player in teamPlayerStats)
            {
                MySqlUtilities.ExecuteSPUpdate("update_team_player_stats", new List<MySqlParameter>
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

        private static void UpdateTransferLog(List<TransferLogDto> transfers, int careerId)
        {
            foreach (TransferLogDto trans in transfers)
            {
                MySqlUtilities.ExecuteSPUpdate("add_to_transfer_log", new List<MySqlParameter>
                {
                    new MySqlParameter("cid", careerId),
                    new MySqlParameter("yr", trans.Year),
                    new MySqlParameter("dt", trans.RawDate.AddHours(1)),
                    new MySqlParameter("tin", trans.Status.ToLower() == "in"),
                    new MySqlParameter("player", trans.Player),
                    new MySqlParameter("imgPath", trans.PlayerImagePath),
                    new MySqlParameter("fromClub", trans.FromClub),
                    new MySqlParameter("toClub", trans.ToClub),
                    new MySqlParameter("fee", trans.Fee),
                    new MySqlParameter("feeDsply", trans.FeeDisplay),
                    new MySqlParameter("loan", trans.Fee < 0)
                });
            }
        }

        private static void GetEndOfSeasonResults(CurrentSeasonDto seasonDeets)
        {
            seasonDeets.EndOfSeasonResults = new EndOfSeasonDto
            {
                LeagueTable = new List<EndOfSeasonLeagueTableRowDto>(),
                CupFinals = new List<EndOfSeasonCupFinalsTableRowDto>()
            };

            GetEndOfSeasonLeagueTable(seasonDeets);
            GetEndOfSeasonCupFinals(seasonDeets);
        }

        private static void GetEndOfSeasonLeagueTable(CurrentSeasonDto seasonDeets)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_end_of_season_league_table", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                seasonDeets.EndOfSeasonResults.LeagueTable.Add(new EndOfSeasonLeagueTableRowDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    TeamName = row["TeamName"].ToString(),
                    TeamImagePath = row["TeamImagePath"].ToString(),
                    TeamCssStyles = row["TeamCSSStyles"].ToString(),
                    GamesPlayed = Convert.ToInt32(row["GamesPlayed"]),
                    Wins = Convert.ToInt32(row["Wins"]),
                    Draws = Convert.ToInt32(row["Draws"]),
                    Losses = Convert.ToInt32(row["Losses"]),
                    GoalsScored = Convert.ToInt32(row["GoalsScored"]),
                    GoalsAgainst = Convert.ToInt32(row["GoalsAgainst"]),
                    Pos = Convert.ToInt32(row["Position"])
                });
            }
        }

        private static void GetEndOfSeasonCupFinals(CurrentSeasonDto seasonDeets)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_end_of_season_cup_finals", new List<MySqlParameter>
            {
                new MySqlParameter("seasonId", seasonDeets.ID)
            }).Rows;

            foreach (DataRow row in results)
            {
                seasonDeets.EndOfSeasonResults.CupFinals.Add(new EndOfSeasonCupFinalsTableRowDto
                {
                    CupFinal = row["CupFinal"].ToString(),
                    HomeTeam = row["HomeTeam"].ToString(),
                    HomeTeamImg = row["HomeTeamImg"].ToString(),
                    HomeTeamStyle = row["HomeTeamStyle"].ToString(),
                    AwayTeam = row["AwayTeam"].ToString(),
                    AwayTeamImg = row["AwayTeamImg"].ToString(),
                    AwayTeamStyle = row["AwayTeamStyle"].ToString(),
                    HomeScore = Convert.ToInt32(row["HomeScore"]),
                    AwayScore = Convert.ToInt32(row["AwayScore"]),
                    PenaltyWinner = row["PenaltyWinner"].ToString()
                });
            }
        }
        #endregion
    }
}
