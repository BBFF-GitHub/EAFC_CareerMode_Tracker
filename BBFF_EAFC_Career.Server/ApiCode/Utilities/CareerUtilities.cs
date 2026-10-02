using BBFF_EAFC_Career.ApiCode.DTO;
using Microsoft.AspNetCore.Http;
using MySql.Data.MySqlClient;
using System.Data;
using System.Xml.Linq;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class CareerUtilities
    {
        #region Get methods
        public static CareerDto GetCareer(int id)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_career", new List<MySqlParameter>
            {
                new MySqlParameter("cid", id)
            }).Rows;
            return GetCareerDetails(results).First();
        }

        public static List<CareerDto> GetCareers()
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_careers").Rows;
            return GetCareerDetails(results);
        }

        public static int GetCareerId(string cName)
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_career_id", new List<MySqlParameter>
            {
                new MySqlParameter("cName", cName)
            }).Rows;

            return Convert.ToInt32(results[0]["ID"]);
        }
        #endregion

        #region Create methods
        public static int CreateNewCareer(CareerDto career)
        {
            MySqlUtilities.ExecuteSPUpdate("create_new_career", new List<MySqlParameter>
            {
                new MySqlParameter("cName", career.Name),
                new MySqlParameter("curr", career.CurrencySymbol)
            });

            return GetCareerId(career.Name);
        }
        #endregion

        #region Update methods
        public static void UpdateLastSavedTime(int careerId)
        {
            MySqlUtilities.ExecuteSPUpdate("update_last_saved", new List<MySqlParameter>
            {
                new MySqlParameter("careerId", careerId)
            });
        }
        #endregion

        #region Delete methods
        public static bool DeleteCareer(int careerId)
        {
            MySqlUtilities.ExecuteSPUpdate("delete_career", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            });

            DataRowCollection results = MySqlUtilities.GetSPData("get_career", new List<MySqlParameter>
            {
                new MySqlParameter("cid", careerId)
            }).Rows;
            return results.Count == 0;
        }
        #endregion

        #region Private methods
        private static List<CareerDto> GetCareerDetails(DataRowCollection results)
        {
            List<CareerDto> careers = new List<CareerDto>();
            foreach (DataRow row in results)
            {
                careers.Add(new CareerDto
                {
                    ID = Convert.ToInt32(row["ID"]),
                    Name = row["Name"].ToString(),
                    DateLastSaved = Convert.ToDateTime(row["DateLastSaved"]),
                    CurrencySymbol = row["CurrencySymbol"].ToString(),
                    CurrentSeason = row["CurrentSeason"] != DBNull.Value ? row["CurrentSeason"].ToString() : "NOT STARTED",
                    Completed = Convert.ToBoolean(row["Completed"])
                });
            }

            //Group by ID, and get correct season
            careers = careers.GroupBy(x => x.ID).Select(x => new CareerDto
            {
                ID = x.Key,
                Name = x.First().Name,
                DateLastSaved = x.First().DateLastSaved,
                LastSaved = x.First().DateLastSaved.ToString("dd/MM/yyyy HH:mm"),
                CurrencySymbol = x.First().CurrencySymbol,
                CurrentSeason = GetCurrentSeason(x)
            }).ToList();

            return careers;
        } 

        private static string GetCurrentSeason(IGrouping<int, CareerDto> group)
        {
            CareerDto current = group.FirstOrDefault(x => !x.Completed);
            if (current == null)
                return "FINISHED";
            else
                return current.CurrentSeason;
        }
        #endregion
    }
}
