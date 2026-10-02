namespace BBFF_EAFC_Career.ApiCode.DTO
{
    public class InternationalsDto
    {
        public int ID { get; set; }
        public int CareerID { get; set; }
        public int Year { get; set; }
        public string Team { get; set; }
        public string TeamCSSStyles { get; set; }
        public string? PrimaryColour { get; set; }
        public string? SecondaryColour { get; set; }
        public string? TertiaryColour { get; set; }
        public string Formation { get; set; }
        public InternationalsChangesDto PendingChanges { get; set; }
        public List<InternationalsPlayer> Squad { get; set; }
        public InternationalsGameStats GameStats { get; set; }
        public List<CupDto> Cups { get; set; }
        public List<InternationalsFixture> Fixtures { get; set; }
        public List<TeamPlayerStatsObj> TeamPlayerStats { get; set; }
    }

    public class InternationalsChangesDto
    {
        public bool CupChanges { get; set; }
        public bool FixtureAdd { get; set; }
        public bool FixtureChanges { get; set; }
        public bool FixtureRemovals { get; set; }
        public bool SquadAdditions { get; set; }
        public bool SquadChanges { get; set; }
        public bool TeamPlayerStatsChanges { get; set; }
    }

    public class InternationalsFixture
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
        public string Formation { get; set; }
        public string Squad { get; set; }
        public string Scorers { get; set; }
        public bool PlayGame { get; set; }
        public Nullable<bool> Added { get; set; }
        public bool Edited { get; set; }
        public Nullable<bool> Remove { get; set; }
    }

    public class InternationalsGameStats
    {
        public int ID { get; set; }
        public int GamesPlayed { get; set; }
        public int Wins { get; set; }
        public int Draws { get; set; }
        public int Losses { get; set; }
        public int GoalsScored { get; set; }
        public int GoalsAgainst { get; set; }
        public int GoalDifference { get; set; }
    }

    public class InternationalsPlayer
    {
        public int ID { get; set; }
        public Nullable<int> PlayerID { get; set; }
        public string Player { get; set; }
        public string Position { get; set; }
        public string CurrentClub { get; set; }
        public int CallUps { get; set; }
        public int Caps { get; set; }
        public int NewCaps { get; set; }
        public int Goals { get; set; }
        public int NewGoals { get; set; }
        public double Rating { get; set; }
        public double RatingDisplay { get; set; }
        public string ImagePath { get; set; }
        public bool Saved { get; set; }
        public bool Edited { get; set; }
        public bool Remove { get; set; }
        public bool InCurrentSquad { get; set; }
    }
}
