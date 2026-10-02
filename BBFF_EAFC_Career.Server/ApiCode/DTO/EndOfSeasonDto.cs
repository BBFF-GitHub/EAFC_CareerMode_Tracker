namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class EndOfSeasonDto
    {
        public int CareerID { get; set; }
        public int Year { get; set; }
        public List<EndOfSeasonLeagueTableRowDto> LeagueTable { get; set; }
        public List<EndOfSeasonCupFinalsTableRowDto> CupFinals { get; set; }
    }

    public class EndOfSeasonLeagueTableRowDto
    {
        public int ID { get; set; }
        public int Pos { get; set; }
        public string TeamName { get; set; }
        public string TeamImagePath { get; set; }
        public string TeamCssStyles { get; set; }
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsScored { get; set; }
        public int GoalsAgainst { get; set; }
    }

    public class EndOfSeasonCupFinalsTableRowDto
    {
        public string CupFinal { get; set; }
        public string HomeTeam { get; set; }
        public string HomeTeamImg { get; set; }
        public string HomeTeamStyle { get; set; }
        public string AwayTeam { get; set; }
        public string AwayTeamImg { get; set; }
        public string AwayTeamStyle { get; set; }
        public int HomeScore { get; set; }
        public int AwayScore { get; set; }
        public string PenaltyWinner { get; set; }
    }
}
