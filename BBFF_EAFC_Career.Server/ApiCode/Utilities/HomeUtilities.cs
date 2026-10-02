using BBFF_EAFC_Career.ApiCode.DTO;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class HomeUtilities
    {
        public static HomeHeroDto GetHomeHero()
        {
            DataRowCollection results = MySqlUtilities.GetSPData("get_home_hero").Rows;

            //No career, no season, or the procedure otherwise short-circuited - just the HeroAvailable column exists
            if (results.Count == 0)
                return new HomeHeroDto { HeroAvailable = false };

            DataRow row = results[0];

            HomeHeroDto hero = new HomeHeroDto
            {
                HeroAvailable = Convert.ToBoolean(row["HeroAvailable"])
            };

            if (!hero.HeroAvailable) return hero;

            hero.ClubName = row.Table.Columns.Contains("ClubName") && row["ClubName"] != DBNull.Value ? row["ClubName"].ToString() : null;
            hero.PrimaryColour = row.Table.Columns.Contains("PrimaryColour") && row["PrimaryColour"] != DBNull.Value ? row["PrimaryColour"].ToString() : null;
            hero.SecondaryColour = row.Table.Columns.Contains("SecondaryColour") && row["SecondaryColour"] != DBNull.Value ? row["SecondaryColour"].ToString() : null;
            hero.TertiaryColour = row.Table.Columns.Contains("TertiaryColour") && row["TertiaryColour"] != DBNull.Value ? row["TertiaryColour"].ToString() : null;
            hero.PlayerName = row.Table.Columns.Contains("PlayerName") && row["PlayerName"] != DBNull.Value ? row["PlayerName"].ToString() : null;
            hero.PlayerImagePath = row.Table.Columns.Contains("PlayerImagePath") && row["PlayerImagePath"] != DBNull.Value ? row["PlayerImagePath"].ToString() : null;

            return hero;
        }
    }
}
