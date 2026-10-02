using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;
using System.Data;
using System.Text;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class OfficialPlayerDataUtilities
    {
        private const int BatchSize = 500;

        public static int ImportFromCsv(Stream csvStream)
        {
            List<string[]> rows = new List<string[]>();

            using (StreamReader reader = new StreamReader(csvStream))
            {
                string headerLine = reader.ReadLine(); //Name,Photo,Nationality,Flag,Position,OGClub,Gender - skip it
                string line;
                while ((line = reader.ReadLine()) != null)
                {
                    if (string.IsNullOrWhiteSpace(line)) continue;
                    string[] fields = ParseCsvLine(line);
                    if (fields.Length < 7) continue; //skip malformed rows rather than failing the whole import
                    rows.Add(fields);
                }
            }

            //Replace wholesale, matching how a fresh CSV file used to fully replace the old one
            MySqlUtilities.ExecuteSPUpdate("truncate_official_player_data");

            for (int i = 0; i < rows.Count; i += BatchSize)
            {
                List<string[]> batch = rows.Skip(i).Take(BatchSize).ToList();
                InsertBatch(batch);
            }

            return rows.Count;
        }

        private static void InsertBatch(List<string[]> batch)
        {
            StringBuilder sql = new StringBuilder("INSERT INTO OfficialPlayerData (Name, PhotoUrl, Nationality, FlagUrl, Position, OGClub, Gender) VALUES ");
            List<MySqlParameter> paramList = new List<MySqlParameter>();

            for (int i = 0; i < batch.Count; i++)
            {
                if (i > 0) sql.Append(",");
                sql.Append($"(@name{i}, @photo{i}, @nat{i}, @flag{i}, @pos{i}, @club{i}, @gender{i})");

                string[] row = batch[i];
                paramList.Add(new MySqlParameter($"@name{i}", row[0]));
                paramList.Add(new MySqlParameter($"@photo{i}", row[1]));
                paramList.Add(new MySqlParameter($"@nat{i}", row[2]));
                paramList.Add(new MySqlParameter($"@flag{i}", row[3]));
                paramList.Add(new MySqlParameter($"@pos{i}", row[4]));
                paramList.Add(new MySqlParameter($"@club{i}", row[5]));
                paramList.Add(new MySqlParameter($"@gender{i}", row[6].Trim()));
            }

            MySqlUtilities.ExecuteText(sql.ToString(), paramList);
        }

        //Small state-machine CSV split that tolerates a quoted field containing a comma -
        //the naive client-side version this replaces just did line.split(',') and would have
        //broken on exactly that.
        private static string[] ParseCsvLine(string line)
        {
            List<string> fields = new List<string>();
            StringBuilder current = new StringBuilder();
            bool inQuotes = false;

            for (int i = 0; i < line.Length; i++)
            {
                char c = line[i];
                if (inQuotes)
                {
                    if (c == '"')
                    {
                        if (i + 1 < line.Length && line[i + 1] == '"') { current.Append('"'); i++; }
                        else inQuotes = false;
                    }
                    else current.Append(c);
                }
                else
                {
                    if (c == '"') inQuotes = true;
                    else if (c == ',') { fields.Add(current.ToString()); current.Clear(); }
                    else current.Append(c);
                }
            }
            fields.Add(current.ToString());

            return fields.ToArray();
        }

        public static void AddPlayer(OfficialPlayerDataDto obj)
        {
            MySqlUtilities.ExecuteSPUpdate("add_official_player_data", new List<MySqlParameter>
            {
                new MySqlParameter("p_playerName", obj.Name),
                new MySqlParameter("p_photoUrl", obj.PhotoUrl),
                new MySqlParameter("p_nationality", obj.Nationality),
                new MySqlParameter("p_flagUrl", obj.FlagUrl),
                new MySqlParameter("p_pos", obj.Position),
                new MySqlParameter("p_ogClub", obj.OgClub),
                new MySqlParameter("p_gender", obj.Gender)
            });
        }

        public static List<OfficialPlayerDataDto> GetByName(string name)
        {
            return MapResults(MySqlUtilities.GetSPData("get_official_player_by_name", new List<MySqlParameter>
            {
                new MySqlParameter("playerName", name)
            }));
        }

        public static List<OfficialPlayerDataDto> GetByClub(string ogClub, string gender)
        {
            return MapResults(MySqlUtilities.GetSPData("get_official_players_by_club", new List<MySqlParameter>
            {
                new MySqlParameter("p_ogClub", ogClub),
                new MySqlParameter("p_gender", gender)
            }));
        }

        public static int GetRowCount()
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_official_player_data_count").Rows;
            if (results.Count == 0) return 0;
            return Convert.ToInt32(results[0]["RowCount"]);
        }

        private static List<OfficialPlayerDataDto> MapResults(DataTable dt)
        {
            List<OfficialPlayerDataDto> toRtn = new List<OfficialPlayerDataDto>();

            foreach (DataRow row in dt.Rows)
            {
                toRtn.Add(new OfficialPlayerDataDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Name = row["Name"].ToString(),
                    PhotoUrl = row["PhotoUrl"] != DBNull.Value ? row["PhotoUrl"].ToString() : null,
                    Nationality = row["Nationality"] != DBNull.Value ? row["Nationality"].ToString() : null,
                    FlagUrl = row["FlagUrl"] != DBNull.Value ? row["FlagUrl"].ToString() : null,
                    Position = row["Position"] != DBNull.Value ? row["Position"].ToString() : null,
                    OgClub = row["OGClub"] != DBNull.Value ? row["OGClub"].ToString() : null,
                    Gender = row["Gender"] != DBNull.Value ? row["Gender"].ToString() : null
                });
            }

            return toRtn;
        }
    }
}
