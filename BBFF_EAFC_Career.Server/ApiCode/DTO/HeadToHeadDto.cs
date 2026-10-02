namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class HeadToHeadTeamResultDto
    {
        public int ID { get; set; }
        public string Team { get; set; }
        public string TeamImagePath { get; set; }
        public string TeamCountryCode { get; set; }
        public string TeamCssStyles { get; set; }
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsScored { get; set; }
        public int GoalsAgainst { get; set; }
        public int GoalDifference { get; set; }
        public int Points { get; set; }
        public double AvgGoalsScored { get; set; }
        public double AvgGoalsAgainst { get; set; }
        public double AvgGoalDifference { get; set; }
        public double AvgPoints { get; set; }
    }

    public class HeadToHeadPlayerTeamGoalDto
    {
        public int ID { get; set; }
        public int PlayerID { get; set; }
        public string PlayerName { get; set; }
        public string Position { get; set; }
        public string PlayerImagePath { get; set; }
        public string Team { get; set; }
        public string TeamImagePath { get; set; }
        public string TeamCountryCode { get; set; }
        public string TeamCssStyles { get; set; }
        public int Goals { get; set; }
    }
}
