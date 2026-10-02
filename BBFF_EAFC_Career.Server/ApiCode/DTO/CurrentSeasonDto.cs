namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class CurrentSeasonDto
    {
        public int ID { get; set; }
        public int CareerID { get; set; }
        public int Year { get; set; }
        public int StintNumber { get; set; }
        public string? DepartureReason { get; set; }
        public bool Female { get; set; }
        public string CountryCode { get; set; }
        public string Team { get; set; }
        public string TeamCSSStyles { get; set; }
        public string? PrimaryColour { get; set; }
        public string? SecondaryColour { get; set; }
        public string? TertiaryColour { get; set; }
        public string League { get; set; }
        public string Formation { get; set; }
        public bool CustomTeam { get; set; }
        public CurrentSeasonChangesDto PendingChanges { get; set; }
        public List<CurrentSeasonSquadPlayer> Squad { get; set; }
        public CurrentSeasonLeagueStats LeagueStats { get; set; }
        public List<CurrentSeasonLeaguePos> LeaguePos { get; set; }
        public List<CupDto> SeasonCups { get; set; }
        public List<CurrentSeasonFixture> Fixtures { get; set; }
        public CurrentSeasonAwardsDto SeasonAwards { get; set; }
        public List<TeamPlayerStatsObj> TeamPlayerStats { get; set; }
        public List<TransferLogDto> Transfers { get; set; }
        public EndOfSeasonDto EndOfSeasonResults { get; set; }
    }

    public class CurrentSeasonAwardsDto
    {
        public string BestPlayer { get; set; }
        public Nullable<double> BestPlayerRating { get; set; }
        public string BestYoungPlayer { get; set; }
        public Nullable<double> BestYoungPlayerRating { get; set; }
        public string BestPlaymaker { get; set; }
        public Nullable<int> BestPlaymakerAssists { get; set; }
    }

    public class CurrentSeasonChangesDto
    {
        public bool BasicChanges { get; set; }
        public bool CupChanges { get; set; }
        public bool FixtureAdd { get; set; }
        public bool FixtureChanges { get; set; }
        public bool FixtureRemovals { get; set; }
        public bool LeagueStatChanges { get; set; }
        public bool LeaguePosChanges { get; set; }
        public bool SeasonAwardsChanges { get; set; }
        public bool SquadAdditions { get; set; }
        public bool SquadChanges { get; set; }
        public bool SquadRemovals { get; set; }
        public bool TeamPlayerStatsChanges { get; set; }
        public bool TransferLogUpdate { get; set; }
    }

    public class CurrentSeasonFixture
    {
        public int ID { get; set; }
        public string Competition { get; set; }
        public Nullable<int> Order { get; set; }
        public string Venue { get; set; }
        public string VersusTeam { get; set; }
        public string VersusTeamStyle { get; set; }
        public string Result { get; set; }
        public int OurScore { get; set; }
        public int VersusScore { get; set; }
        public bool Penalties { get; set; }
        public string Scorers { get; set; }
        public Nullable<bool> Added { get; set; }
        public bool Edited { get; set; }
        public Nullable<bool> Remove { get; set; }
        public bool PlayGame { get; set; }
    }

    public class CurrentSeasonLeaguePos
    {
        public int ID { get; set; }
        public Nullable<int> Year { get; set; }
        public int GameWeek { get; set; }
        public Nullable<int> Position { get; set; }
        public string Team { get; set; }
        public string CSSStyles { get; set; }
    }

    public class CurrentSeasonLeagueStats
    {
        public int ID { get; set; }
        public int CurrentSeasonID { get; set; }
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsScored { get; set; }
        public int GoalsAgainst { get; set; }
        public int GoalDifference { get; set; }
        public int Points { get; set; }
    }

    public class CurrentSeasonSquadPlayer
    {
        public int ID { get; set; }
        public Nullable<int> PlayerID { get; set; }
        public string Player { get; set; }
        public string Position { get; set; }
        public Nullable<int> Order { get; set; }
        public bool LoanedIn { get; set; }
        public bool LoanedOut { get; set; }
        public bool TransferListed { get; set; }
        public bool LoanListed { get; set; }
        public bool YouthSquad { get; set; }
        public bool PreContract { get; set; }
        public bool PreContractOut { get; set; }
        public bool Retiring { get; set; }
        public int Caps { get; set; }
        public int Goals { get; set; }
        public double Rating { get; set; }
        public int MotmPoints { get; set; }
        public double RatingDisplay { get; set; }
        public string ImagePath { get; set; }
        public List<string>? EligiblePositions { get; set; }
        public bool Saved { get; set; }
        public bool Edited { get; set; }
        public bool Remove { get; set; }
    }

    public class TeamPlayerStatsObj
    {
        public int PlayerID { get; set; }
        public string Team { get; set; }
        public int Caps { get; set; }
        public int Goals { get; set; }
        public double Rating { get; set; }
        public double RatingDisplay { get; set; }
    }
}
