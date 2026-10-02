namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class TeamDto
    {
        public int ID { get; set; }
        public string Country { get; set; }
        public string CountryCode { get; set; }
        public string Team { get; set; }
        public string PrimaryColour { get; set; }
        public string SecondaryColour { get; set; }
        public string TertiaryColour { get; set; }
        public bool Female { get; set; }
        public int InitialStartingLeagueID { get; set; }
        public string InitialStartingLeagueName { get; set; }
    }
}
