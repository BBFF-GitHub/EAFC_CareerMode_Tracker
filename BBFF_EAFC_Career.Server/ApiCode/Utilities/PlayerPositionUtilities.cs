using BBFF_EAFC_Career.ApiCode.DTO;
using MySql.Data.MySqlClient;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class PlayerPositionUtilities
    {
        public static bool SaveEligiblePositions(PlayerPositionSaveDto obj)
        {
            try
            {
                //Clear out the player's current eligible positions (never touches their IsPrimary row)...
                MySqlUtilities.ExecuteSPUpdate("clear_player_eligible_positions", new List<MySqlParameter>
                {
                    new MySqlParameter("playerId", obj.PlayerID)
                });

                //...then add back whatever the user just selected
                foreach (string pos in obj.Positions.Distinct())
                {
                    MySqlUtilities.ExecuteSPUpdate("add_player_eligible_position", new List<MySqlParameter>
                    {
                        new MySqlParameter("playerId", obj.PlayerID),
                        new MySqlParameter("pos", pos)
                    });
                }

                return true;
            }
            catch
            {
                return false;
            }
        }
    }
}
