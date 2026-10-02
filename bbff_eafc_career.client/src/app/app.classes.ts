export interface CareerObj {
  id?: number;
  name: string;
  dateCreated?: any;
  lastSaved?: any;
  currencySymbol?: string;
  currentSeason?: string;
}

export interface CareerProgressObj {
  year: number;
  text: string;
  progress: number;
  colour: string;
}

export interface CareerOverviewObj {
  id?: number;
  careerId?: number;
  year?: number;
  countryCode?: string;
  team?: string;
  teamImagePath?: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  league?: string;
  gamesPlayed?: number;
  wins?: number;
  draws?: number;
  losses?: number;
  goalsScored?: number;
  goalsAgainst?: number;
  goalDifference?: number;
  leaguePos?: number;
  leaguePosDisplay?: string;
  completed?: boolean;
  cups?: CupObj[];
  cupWinners?: CupObj[];
  cupRunnersUp?: CupObj[];
  cupTooltip?: string;
  leagueWins?: number;
  cupWins?: number;
  viewSeasonHistory?: boolean;
}

export interface CountryObj {
  country: string;
  countryCode: string;
}

export interface CupObj {
  id?: number;
  countryCode?: string;
  cupName: string;
  cupProgress?: string;
  numberOfGames?: number;
  compulsory?: boolean;
  wins?: number;
  out?: boolean;
  bestPlaced?: number;
  bestPlacedDisplay?: string;
}

export interface CurrencyObj {
  name: string;
  value: string;
}

export interface CurrentSeasonObj {
  id: number;
  careerID: number;
  year: number;
  stintNumber?: number;
  departureReason?: string;
  female?: boolean;
  countryCode: string;
  team: string;
  teamCSSStyles?: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  league: string;
  formation?: string;
  customTeam: boolean;
  pendingChanges: CurrentSeasonChangesObj;
  squad: CurrentSeasonSquadPlayerObj[];
  leagueStats: CurrentSeasonLeagueStatsObj;
  leaguePos: CurrentSeasonLeaguePosObj[];
  seasonCups: CupObj[];
  fixtures: CurrentSeasonFixtureObj[];
  seasonAwards: CurrentSeasonAwardsObj;
  teamPlayerStats?: TeamPlayerStatsObj[];
  transfers?: TransferLogObj[];
  endOfSeasonResults?: EndOfSeasonObj;
}

export interface CurrentSeasonAwardsObj {
  bestPlayer?: string;
  bestPlayerRating?: number;
  bestYoungPlayer?: string;
  bestYoungPlayerRating?: number;
  bestPlaymaker?: string;
  bestPlaymakerAssists?: number;
}

export interface CurrentSeasonChangesObj {
  basicChanges: boolean;
  cupChanges: boolean;
  fixtureAdd: boolean;
  fixtureChanges: boolean;
  fixtureRemovals: boolean;
  leagueStatChanges: boolean;
  leaguePosChanges: boolean;
  seasonAwardsChanges: boolean;
  squadAdditions: boolean;
  squadChanges: boolean;
  squadRemovals: boolean;
  teamPlayerStatsChanges: boolean;
  transferLogUpdate: boolean;
}

export interface CurrentSeasonFixtureObj {
  id: number;
  competition: string;
  order?: number;
  venue?: string;
  versusTeam?: string;
  versusTeamObj?: any;
  versusTeamStyle?: string;
  result?: string;
  ourScore?: number;
  versusScore?: number;
  penalties?: boolean;
  formation?: string;
  squad?: string;
  scorers?: string;
  added?: boolean;
  edited: boolean;
  showBin?: boolean;
  remove?: boolean;
  competitions?: string[];
  teams?: TeamObj[];
  playGame?: boolean;
}

export interface CurrentSeasonLeaguePosObj {
  id: number;
  year?: number;
  gameWeek: number;
  position?: number;
  team?: string;
  cssStyles?: string;
}

export interface CurrentSeasonLeagueStatsObj {
  id: number;
  currentSeasonID?: number;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
}

export interface CurrentSeasonSquadPlayerObj {
  id: number;
  playerID?: number;
  player: string;
  position: string;
  eligiblePositions?: string[];
  currentClub: string;
  posId?: number;
  order?: number;
  loanedIn: boolean;
  loanedOut: boolean;
  transferListed: boolean;
  loanListed: boolean;
  youthSquad: boolean;
  preContract: boolean;
  preContractOut: boolean;
  retiring: boolean;
  status?: string;
  callUps?: number;
  caps: number;
  goals: number;
  inCurrentSquad?: boolean;
  rating?: number;
  motmPoints?: number;
  ratingDisplay?: number;
  imagePath?: string;
  saved?: boolean;
  edited?: boolean;
  remove?: boolean;
  accentSeverity?: string;
}

export interface EndOfSeasonCupFinalsTableRowObj {
  cupFinal: string;
  teams?: TeamObj[];
  homeTeam?: string;
  homeTeamObj?: string;
  homeTeamImg?: any;
  homeTeamStyle?: string;
  awayTeam?: string;
  awayTeamObj?: string;
  awayTeamImg?: any;
  awayTeamStyle?: string;
  homeScore?: number;
  awayScore?: number;
  penaltyWinner?: string;
  editable: boolean;
}

export interface EndOfSeasonLeagueTableRowObj {
  id: number;
  pos: number;
  teamName: string;
  teamImagePath?: string;
  teamCssStyles?: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  editable: boolean;
  draggableOrder?: boolean;
}

export interface EndOfSeasonObj {
  careerID: number;
  year: number;
  leagueTable: EndOfSeasonLeagueTableRowObj[];
  cupFinals: EndOfSeasonCupFinalsTableRowObj[];
}

export interface HeadToHeadTeamResultObj {
  id: number;
  team: string;
  teamImagePath?: string;
  teamCountryCode: string;
  teamCssStyles?: string;
  gamesPlayed: number;
  wins: number;
  draws: number;
  losses: number;
  goalsScored: number;
  goalsAgainst: number;
  goalsTotal: number;
  goalDifference: number;
  points: number;
  avgGoalsScored: number;
  avgGoalsAgainst: number;
  avgGoalDifference: number;
  avgPoints: number;
  resultMeterObj: any[];
  goalsMeterObj: any[];
}

export interface HeadToHeadPlayerTeamGoalDictObj {
  key: string;
  value: HeadToHeadPlayerTeamGoalObj[];
}

export interface HeadToHeadPlayerTeamGoalObj {
  id: number;
  playerID: number;
  playerName: string;
  position: string;
  playerImagePath: string;
  team: string;
  teamImagePath?: string;
  teamCountryCode: string;
  teamCssStyles?: string;
  goals: number;
}

export interface HeadToHeadPlayerTeamGoalTeamTiededObj {
  team: string;
  teamImagePath?: string;
  teamCssStyles?: string;
  goals: number;
}

export interface HeadToHeadPlayerTeamGoalTidiedObj {
  playerId: number;
  playerName: string;
  position: string;
  posId: number;
  playerImagePath: string;
  totalGoals: number;
  accentSeverity?: string;
  teams: HeadToHeadPlayerTeamGoalTeamTiededObj[];
  meterObj: any[];
}

export interface InternationalsFixtureObj {
  id: number;
  competition: string;
  order?: number;
  venue?: string;
  versusTeam?: string;
  versusTeamObj?: any;
  versusTeamStyle?: string;
  result?: string;
  ourScore?: number;
  versusScore?: number;
  penalties?: boolean;
  formation?: string;
  squad?: string;
  scorers?: string;
  playGame?: boolean;
  added?: boolean;
  edited: boolean;
  showBin?: boolean;
  remove?: boolean;
  competitions?: string[];
  teams?: TeamObj[];
}

export interface InternationalsObj {
  id: number;
  careerID: number;
  year: number;
  countryCode: string;
  team: string;
  teamCSSStyles?: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  formation?: string;
  pendingChanges: CurrentSeasonChangesObj;
  squad: InternationalsPlayerObj[];
  gameStats: CurrentSeasonLeagueStatsObj;
  cups: CupObj[];
  fixtures: InternationalsFixtureObj[];
  teamPlayerStats?: TeamPlayerStatsObj[];
}

export interface InternationalsPlayerObj {
  id: number;
  player: string;
  position: string;
  posId?: number;
  currentClub?: string;
  currentClubImgPath?: string;
  callUps: number;
  caps: number;
  newCaps: number;
  goals: number;
  newGoals: number;
  rating?: number;
  ratingDisplay?: number;
  imagePath?: string;
  saved?: boolean;
  edited?: boolean;
  accentSeverity?: string;
  inCurrentSquad: boolean;
}

export interface LeagueObj {
  id?: number;
  country: string;
  countryCode: string;
  league: string;
  numberOfGames: number;
  female?: boolean;
  imgPath?: string;
}

export interface MoneyLogObj {
  id: number;
  year: number;
  spent: number;
  spentDisplay: string;
  received: number;
  receivedDisplay: string;
  profit?: number;
  profitDisplay?: string;
}

export interface OfficialPlayerDataObj {
  id: number;
  name: string;
  photoUrl: string;
  nationality: string;
  flagUrl: string;
  position: string;
  ogClub: string;
  gender: string;
}

export interface PlayerPicObj {
  name: string;
  photo: string;
  photoBig: string;
  nationality: string;
  flag: string;
  position: string;
  posId: number;
  ogClub: string;
  gender: string;
  accentSeverity?: string;
  loanedIn?: boolean;
  loanedOut?: boolean;
  retiring?: boolean;
}

export interface PlayerSeasonStatObj {
  name: string;
  imagePath: string;
  year: number;
  caps: number;
  goals: number;
}

export interface PlayerStatObj {
  id: number;
  name: string;
  pos: string;
  posId?: number;
  imagePath: string;
  caps: number[];
  goals: number[];
  internationalCaps: number[];
  internationalGoals: number[];
  totalCaps: number;
  totalGoals: number;
  totalInternationalCaps: number;
  totalInternationalGoals: number;
  accentSeverity?: string;
}

export interface PlayerStatTileObj {
  id: number;
  name: string;
  pos: string;
  posId?: number;
  imagePath: string;
  caps: number[];
  goals: number[];
  internationalCaps: number[];
  internationalGoals: number[];
  totalCaps: number;
  totalGoals: number;
  totalInternationalCaps: number;
  totalInternationalGoals: number;
  accentSeverity?: string;
  detailTable: any[];
  detailTxt: string;
}

export interface ShortcutKeyOptions {
  keys: string;
  event: any;
}

export interface TeamDictionaryObj {
  country: string;
  countryCode: string;
  female?: boolean;
  teams: TeamObj[];
}

export interface HomeHeroObj {
  heroAvailable: boolean;
  clubName?: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  playerName?: string;
  playerImagePath?: string;
}

export interface TeamObj {
  id?: number;
  country?: string;
  countryCode: string;
  team: string;
  cssStyles?: string;
  primaryColour?: string;
  secondaryColour?: string;
  tertiaryColour?: string;
  female?: boolean;
  imgPath?: string;
  teamCountryCombo?: string;
  initialStartingLeagueID?: number;
  initialStartingLeagueName?: string;
}

export interface TeamPlayerStatsObj {
  playerId: number;
  team: string;
  caps: number;
  goals: number;
  rating?: number;
}

export interface TransferLogObj {
  id?: number;
  year: number;
  rawDate: string;
  date?: string;
  status: string;
  statusSeverity?: string;
  player: string;
  playerImagePath?: string;
  fromClub: string;
  toClub: string;
  feeDisplay: string;
  fee: number;
}

export interface TrophyCabinetObj {
  countryCode: string;
  flagImgPath: string;
  cupName: string;
  compulsory: boolean;
  wins: number;
  bestPlaced: number;
  bestPlacedDisplay: string;
}
