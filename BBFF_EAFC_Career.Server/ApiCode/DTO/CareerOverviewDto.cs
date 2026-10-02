namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class CareerOverviewDto
    {
        public int ID { get; set; }
        public int CareerID { get; set; }
        public int Year { get; set; }
        public int StintNumber { get; set; }
        public string DepartureReason { get; set; }
        public bool Female { get; set; }
        public string CountryCode { get; set; }
        public string Team { get; set; }
        public string TeamImagePath { get; set; }
        public string League { get; set; }
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsScored { get; set; }
        public int GoalsAgainst { get; set; }
        public int LeaguePos { get; set; }
        public bool Completed { get; set; }
        public bool InternationalTeam { get; set; }
        public List<CupDto> Cups { get; set; }
        public bool StayWithClub { get; set; }
        public Nullable<bool> Internationals { get; set; }
        public string PrimaryColour { get; set; }
        public string SecondaryColour { get; set; }
        public string TertiaryColour { get; set; }
        public string Reason { get; set; }
    }
}
