using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class PlayerStatUtilities
    {
        public static List<PlayerDto> GetPlayerList(int careerId, int year)
        {
            List<PlayerDto> toRtn = new List<PlayerDto>();
            List<PlayerDto> playerList = new List<PlayerDto>();
            DataRowCollection clubResults = MySqlUtilities.GetSPData("get_player_stats", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            List<int> tempCaps, tempGoals;
            foreach (DataRow row in clubResults)
            {
                //Populate list of caps and goals
                tempCaps = new List<int>();
                tempGoals = new List<int>();
                GetYearlyStats(row, tempCaps, tempGoals, year);

                if (tempCaps.Sum() > 0)
                {
                    playerList.Add(new PlayerDto
                    {
                        ID = Convert.ToInt32(row["ID"]),
                        Name = row["Name"].ToString(),
                        Pos = row["Position"].ToString(),
                        ImagePath = row["ImagePath"].ToString(),
                        Caps = tempCaps,
                        Goals = tempGoals,
                        InternationalCaps = new List<int>(),
                        InternationalGoals = new List<int>(),
                        TotalCaps = tempCaps.Sum(),
                        TotalGoals = tempGoals.Sum(),
                        TotalInternationalCaps = 0,
                        TotalInternationalGoals = 0
                    });
                }
            }

            toRtn = GetInternationalPlayerStats(playerList, careerId, year);
            return toRtn.OrderByDescending(x => x.TotalCaps).ToList();
        }

        private static void GetYearlyStats(DataRow row, List<int> caps, List<int> goals, int maxYear)
        {
            string capCol = "", goalCol = "";

            for (int i = 1; i <= maxYear; i++)
            {
                capCol = $"Y{i}C";
                goalCol = $"Y{i}G";

                caps.Add(row[capCol] != DBNull.Value ? Convert.ToInt32(row[capCol]) : 0);
                goals.Add(row[goalCol] != DBNull.Value ? Convert.ToInt32(row[goalCol]) : 0);
            }
        }

        private static List<PlayerDto> GetInternationalPlayerStats(List<PlayerDto> playerList, int careerId, int year)
        {
            DataRowCollection internationalResults = MySqlUtilities.GetSPData("get_international_player_stats", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;

            List<int> tempCaps, tempGoals;
            foreach (DataRow row in internationalResults)
            {
                //Populate list of caps and goals
                tempCaps = new List<int>();
                tempGoals = new List<int>();
                GetYearlyStats(row, tempCaps, tempGoals, year);

                if (tempCaps.Sum() > 0)
                {
                    if (playerList.Any(x => x.ID == Convert.ToInt32(row["ID"])))
                    {
                        playerList.First(x => x.ID == Convert.ToInt32(row["ID"])).InternationalCaps = tempCaps;
                        playerList.First(x => x.ID == Convert.ToInt32(row["ID"])).InternationalGoals = tempGoals;
                        playerList.First(x => x.ID == Convert.ToInt32(row["ID"])).TotalInternationalCaps = tempCaps.Sum();
                        playerList.First(x => x.ID == Convert.ToInt32(row["ID"])).TotalInternationalGoals = tempGoals.Sum();
                    }
                    else
                    {
                        playerList.Add(new PlayerDto
                        {
                            ID = Convert.ToInt32(row["ID"]),
                            Name = row["Name"].ToString(),
                            Pos = row["Position"].ToString(),
                            ImagePath = row["ImagePath"].ToString(),
                            Caps = new List<int>(),
                            Goals = new List<int>(),
                            InternationalCaps = tempCaps,
                            InternationalGoals = tempGoals,
                            TotalCaps = 0,
                            TotalGoals = 0,
                            TotalInternationalCaps = tempCaps.Sum(),
                            TotalInternationalGoals = tempGoals.Sum()
                        });
                    }
                }
            }

            return playerList;
        }
    }
}
