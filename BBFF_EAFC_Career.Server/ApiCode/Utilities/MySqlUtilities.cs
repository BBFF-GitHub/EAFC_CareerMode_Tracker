using MySql.Data.MySqlClient;
using System.Data;

namespace BBFF_EAFC_Career.ApiCode.Utilities
{
    public static class MySqlUtilities
    {
        private static string mySqlConnectionString = "server=localhost;database=eafc_db;uid=root;pwd=B3nn3ttB3nn3tt22";

        #region SP methods
        public static DataTable GetSPData(string spName, List<MySqlParameter> paramList = null)
        {
            DataTable dt = new DataTable();

            try
            {
                using (MySqlConnection conn = new MySqlConnection(mySqlConnectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand(spName, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        if (paramList != null && paramList.Count > 0)
                        {
                            foreach (MySqlParameter param in paramList)
                                cmd.Parameters.Add(param);
                        }

                        if (conn.State == ConnectionState.Closed) conn.Open();
                        using (MySqlDataAdapter res = new MySqlDataAdapter(cmd))
                        {
                            res.Fill(dt);
                        }
                        conn.Close();
                    }
                }

                return dt;
            }
            catch
            {
                return dt;
            }
        }

        public static void ExecuteSPUpdate(string spName, List<MySqlParameter> paramList = null)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(mySqlConnectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand(spName, conn))
                    {
                        cmd.CommandType = CommandType.StoredProcedure;
                        if (paramList != null && paramList.Count > 0)
                        {
                            foreach (MySqlParameter param in paramList)
                                cmd.Parameters.Add(param);
                        }

                        if (conn.State == ConnectionState.Closed) conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        #endregion

        #region Raw SQL methods
        //Only for bulk operations where calling a stored procedure once per row would be
        //impractically slow (e.g. importing ~18,000 player rows) - everything else in the
        //app goes through the stored-procedure methods above.
        public static void ExecuteText(string sql, List<MySqlParameter> paramList = null)
        {
            try
            {
                using (MySqlConnection conn = new MySqlConnection(mySqlConnectionString))
                {
                    using (MySqlCommand cmd = new MySqlCommand(sql, conn))
                    {
                        cmd.CommandType = CommandType.Text;
                        if (paramList != null && paramList.Count > 0)
                        {
                            foreach (MySqlParameter param in paramList)
                                cmd.Parameters.Add(param);
                        }

                        if (conn.State == ConnectionState.Closed) conn.Open();
                        cmd.ExecuteNonQuery();
                        conn.Close();
                    }
                }
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        #endregion
    }
}
