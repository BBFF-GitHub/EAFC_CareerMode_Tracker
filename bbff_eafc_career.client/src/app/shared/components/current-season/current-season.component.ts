//External Modules
import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, HostListener, Inject, Input, Output, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { ContextMenu, ContextMenuModule } from 'primeng/contextmenu';
import { DialogModule } from 'primeng/dialog';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuItem, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { AddNewPlayerModalComponent } from '../modals/add-new-player-modal/add-new-player-modal.component';
import { AuthenticClubModalComponent } from '../modals/authentic-club-modal/authentic-club-modal.component';
import { CareerModeTrackerService } from '../../services/career-mode-tracker.service';
import { ChangePositionModalComponent } from '../modals/change-position-modal/change-position-modal.component';
import {
  CurrentSeasonFixtureObj, CurrentSeasonLeagueStatsObj, CurrentSeasonObj, CurrentSeasonSquadPlayerObj, EndOfSeasonCupFinalsTableRowObj,
  EndOfSeasonLeagueTableRowObj, EndOfSeasonObj, TeamObj, TransferLogObj
} from '../../../app.classes';
import { FiveFourOneViewComponent } from '../formations/five-four-one-view/five-four-one-view.component';
import { FormattingService } from '../../services/formatting.service';
import { FourFiveOneViewComponent } from '../formations/four-five-one-view/four-five-one-view.component';
import { FourFourOneOneViewComponent } from '../formations/four-four-one-one-view/four-four-one-one-view.component';
import { FourFourTwoViewComponent } from '../formations/four-four-two-view/four-four-two-view.component';
import { FourOneFourOneViewComponent } from '../formations/four-one-four-one-view/four-one-four-one-view.component';
import { FourOneTwoOneTwoViewComponent } from '../formations/four-one-two-one-two-view/four-one-two-one-two-view.component';
import { FourOneThreeTwoViewComponent } from '../formations/four-one-three-two-view/four-one-three-two-view.component';
import { FourThreeThreeViewComponent } from '../formations/four-three-three-view/four-three-three-view.component';
import { FourTwoFourViewComponent } from '../formations/four-two-four-view/four-two-four-view.component';
import { FourTwoThreeOneViewComponent } from '../formations/four-two-three-one-view/four-two-three-one-view.component';
import { GenerateResultModalComponent } from '../modals/generate-result-modal/generate-result-modal.component';
import { LoanToPermanentModalComponent } from '../modals/loan-to-permanent-modal/loan-to-permanent-modal.component';
import { MiscViewComponent } from '../formations/misc-view/misc-view.component';
import { PrePopulatePlayersModalComponent } from '../modals/pre-populate-players-modal/pre-populate-players-modal.component';
import { RemovePlayerModalComponent } from '../modals/remove-player-modal/remove-player-modal.component';
import { StayAtClubModalComponent } from '../modals/stay-at-club-modal/stay-at-club-modal.component';
import { StickOrTwistModalComponent } from '../modals/stick-or-twist-modal/stick-or-twist-modal.component';
import { MidSeasonDepartureModalComponent } from '../modals/mid-season-departure-modal/mid-season-departure-modal.component';
import { TeamsService } from '../../services/teams.service';
import { TeamShirtComponent } from '../team-shirt/team-shirt.component';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'current-season',
  templateUrl: './current-season.template.html',
  styleUrls: ['../../../../styles.css', './current-season.styles.css'],
  standalone: true,
  imports: [AddNewPlayerModalComponent, AuthenticClubModalComponent, AvatarModule, ButtonModule, ChangePositionModalComponent, CommonModule, ContextMenuModule,
    DialogModule, FiveFourOneViewComponent, FormsModule, FourFiveOneViewComponent, FourFourOneOneViewComponent, FourFourTwoViewComponent, FourOneFourOneViewComponent,
    FourOneTwoOneTwoViewComponent, FourOneThreeTwoViewComponent, FourThreeThreeViewComponent, FourTwoFourViewComponent, FourTwoThreeOneViewComponent, GenerateResultModalComponent,
    InputNumberModule,  LoanToPermanentModalComponent, MidSeasonDepartureModalComponent, MiscViewComponent, PrePopulatePlayersModalComponent, ProgressSpinnerModule, RadioButtonModule, RemovePlayerModalComponent,
    SelectModule, StayAtClubModalComponent, StickOrTwistModalComponent, TableModule, TabsModule, TagModule, TeamShirtComponent, TooltipModule]
})

export class CurrentSeasonComponent {

  //Declare input and output variables
  @Input() careerId!: number;
  @Input() year!: number;
  @Input() fromOverview: boolean = false;
  @Output() overviewBackEmit = new EventEmitter<any>();
  @Output() switchModeEmit = new EventEmitter<any>();

  //Declare context menu variable
  @ViewChild('#cm') contextMenu!: ContextMenu;

  //Squad List View table - rows-per-page is computed from available space, not fixed
  @ViewChild('squadListDiv') squadListDiv!: ElementRef;
  squadListRows: number = 8;

  //Declare array variables
  formations: string[] = ["Select a Formation", "4-1-2-1-2 Narrow", "4-1-2-1-2 Wide", "4-1-3-2", "4-1-4-1", "4-2-3-1", "4-2-4", "4-3-3 Attack", "4-3-3 Defend", "4-3-3 Flat",
    "4-3-3 Mixed", "4-4-1-1", "4-4-2", "4-5-1 Attack", "4-5-1 Defend", "5-4-1"];
  venues: string[] = ["", "H", "A", "N"];
  positions!: string[];
  teams!: TeamObj[];
  allTeams: TeamObj[] = [];
  leagueStats!: CurrentSeasonLeagueStatsObj[];
  topScorers!: CurrentSeasonSquadPlayerObj[];
  menuItems!: MenuItem[];
  transferLog: TransferLogObj[] = [];
  endOfSeasonLeagueTable: EndOfSeasonLeagueTableRowObj[] = [];
  endOfSeasonCupsTable: EndOfSeasonCupFinalsTableRowObj[] = [];

  //Declare other variables
  activeTab: number = 0;
  seasonObj!: CurrentSeasonObj;
  selectedPlayer!: CurrentSeasonSquadPlayerObj;
  teamImg!: string;
  loading: boolean = true;
  saving: boolean = false;
  pendingChanges: boolean = false;
  endOfSeason: boolean = false;
  startNewSeason: boolean = false;
  enableEOSBtn: boolean = true;
  enableSNSBtn: boolean = false;
  menuShowing: boolean = false;
  baseUrl: string;
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;
  showModal: boolean = false;
  modalMode: string = "";
  modalHeader: string = "";
  midSeasonMove: boolean = false;
  midSeasonDepartureReason?: string;
  modalParam!: any;
  modalOrder: number = 0;
  nextGameIndex: number = -1;

  constructor(private cmTrackerService: CareerModeTrackerService, private formatService: FormattingService, private http: HttpClient,
    private messageService: MessageService, private teamsService: TeamsService, private utilities: UtilitiesService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  ngOnInit() {
    this.loading = true;
    this.populateFullMenuList();

    this.http.get<CurrentSeasonObj>(this.baseUrl + "currentseason", { params: { careerId: this.careerId, year: this.year } }).subscribe(result => {
      this.seasonObj = result;
      this.endOfSeason = this.seasonObj.fixtures.filter(x => x.result?.length == 0).length == 0;
      this.startNewSeason = this.endOfSeason && this.areAwardsDone();
      this.seasonObj.teamPlayerStats = [];
      this.leagueStats = [this.seasonObj.leagueStats];
      this.topScorers = this.utilities.sortSquadByTopScorer(this.seasonObj.squad);
      this.setPositionsList(true);
      this.getTeamsFromCountry(result.customTeam);
      this.seasonObj.squad.forEach(p => {
        p.posId = this.formatService.workOutPosId(p.position);
        p.accentSeverity = this.formatService.workOutAccentColour(p.position);
      });
      this.seasonObj.squad = this.utilities.sortSquadByPosThenCaps(this.seasonObj.squad);
      this.showFixtureDeleteBtn();
      this.cmTrackerService.setCareerSeasonObj(this.seasonObj);
      this.transferLog = [];

      //TO IMPLEMENT
      if (this.seasonObj.formation?.length == 0 && this.seasonObj.squad?.length == 0)
      {
        this.showModal = true;
        this.cmTrackerService.triggerPrePopulatePlayersModal({});
        this.modalMode = "pre-populate-players-modal";
        this.modalHeader = "Pre-Populate Players";
      }
    });
  }

  getTeamsFromCountry(customTeam: boolean) {
    this.loading = true;
    if (this.teamsService.allTeams.length > 0) {
      let localSelection = this.teamsService.allTeams.filter(x => x.countryCode == this.seasonObj.countryCode && (x.female ?? false) == (this.seasonObj.female ?? false));
      this.teams = [...localSelection];
      this.allTeams = [...this.teamsService.allTeams.filter(x => x.countryCode != "INT" && (x.female ?? false) == (this.seasonObj.female ?? false))];
      if (customTeam)
        this.teamImg = "./assets/eafc_custom_team_logo.png";
      else
        this.teamImg = "./assets/logos/" + localSelection[0].country?.toLowerCase() + "/" + this.seasonObj.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      this.sortOutVersusTeamsInFixtures();
      this.loading = false;
    } else {
      this.teamsService.getAllTeams().add(() => {
        let localSelection = this.teamsService.allTeams.filter(x => x.countryCode == this.seasonObj.countryCode && (x.female ?? false) == (this.seasonObj.female ?? false));
        this.teams = [...localSelection];
        this.allTeams = [...this.teamsService.allTeams.filter(x => x.countryCode != "INT" && (x.female ?? false) == (this.seasonObj.female ?? false))];
        if (customTeam)
          this.teamImg = "./assets/eafc_custom_team_logo.png";
        else
          this.teamImg = "./assets/logos/" + localSelection[0].country?.toLowerCase() + "/" + this.seasonObj.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
        this.sortOutVersusTeamsInFixtures();
        this.loading = false;
      });
    }
  }

  sortOutVersusTeamsInFixtures() {
    this.nextGameIndex = this.seasonObj.fixtures.filter(x => x.result?.length == 0).length == 0 ? -1 : this.seasonObj.fixtures.filter(x => x.result?.length == 0)[0].id;
    this.seasonObj.fixtures.forEach(f => {
      f.versusTeamObj = this.allTeams.filter(x => x.team == f.versusTeam)[0];
      if (!f.competition.startsWith("UEFA") && !f.competition.startsWith("Conmebol"))
        f.teams = this.teams;
      else
        f.teams = this.allTeams;
    });

    //Populate league table placeholder
    if (this.startNewSeason) {
      let leagueTableDone = this.seasonObj.endOfSeasonResults !== undefined && this.seasonObj.endOfSeasonResults?.leagueTable.length > 0;
      let cupFinalsDone = this.seasonObj.endOfSeasonResults !== undefined && this.seasonObj.endOfSeasonResults?.cupFinals.length > 0;

      if (this.seasonObj.endOfSeasonResults !== undefined && this.seasonObj.endOfSeasonResults?.leagueTable.length > 0) {
        this.endOfSeasonLeagueTable = this.seasonObj.endOfSeasonResults?.leagueTable;
        this.endOfSeasonLeagueTable.forEach(lt => {
          lt.goalDifference = lt.goalsScored - lt.goalsAgainst;
          lt.points = (3 * lt.wins) + lt.draws;
        });
      }
      else
        this.populateInitialLeagueStandingsList();

      if (this.seasonObj.endOfSeasonResults !== undefined && this.seasonObj.endOfSeasonResults?.cupFinals.length > 0) {
        this.endOfSeasonCupsTable = this.seasonObj.endOfSeasonResults?.cupFinals;
      } else
        this.populateCupFinalsList();

      if (leagueTableDone && cupFinalsDone) {
        this.enableEOSBtn = false;
        this.enableSNSBtn = true;
      }
    }
  }

  showFixtureDeleteBtn() {
    this.seasonObj.fixtures.forEach(f => {
      if (f.result !== undefined && f.result.length > 0)
        f.showBin = false;
      else {
        if (f.competition.startsWith('UEFA'))
          f.showBin = true;
        else if (f.competition == "1A Pro League" && this.seasonObj.fixtures.filter(x => x.competition == f.competition).indexOf(f) > 30)
          f.showBin = true;
        else if (f.competition.endsWith("Cup"))
          f.showBin = true;
        else
          f.showBin = false;
      }
    });
  }

  checkCupTeam(cup: any, home: boolean) {
    if (home) {
      cup.homeTeam = cup.homeTeamObj.team;
      cup.homeTeamImg = cup.homeTeamObj.imgPath;
      cup.homeTeamStyle = cup.homeTeamObj.cssStyles;
    } else {
      cup.awayTeam = cup.awayTeamObj.team;
      cup.awayTeamImg = cup.awayTeamObj.imgPath;
      cup.awayTeamStyle = cup.awayTeamObj.cssStyles;
    }
  }

  checkVersusTeam(fixture: any) {
    fixture.versusTeam = fixture.versusTeamObj.team;
    fixture.edited = true;
    this.setPendingChanges('fixture-edit');
  }

  setPositionsList(fromLoad: boolean = false) {
    switch (this.seasonObj.formation) {
      case "4-1-2-1-2 Narrow":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "CM", "CAM", "ST"];
        break;
      case "4-1-2-1-2 Wide":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "RM", "LM", "CAM", "ST"];
        break;
      case "4-1-3-2":
      case "4-1-4-1":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "RM", "CM", "LM", "ST"];
        break;
      case "4-2-3-1":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "RAM", "CAM", "LAM", "ST"];
        break;
      case "4-2-4":
      case "4-3-3 Flat":
        this.positions = ["GK", "RB", "CB", "LB", "CM", "RW", "ST", "LW"];
        break;
      case "4-3-3 Attack":
        this.positions = ["GK", "RB", "CB", "LB", "CM", "CAM", "RW", "ST", "LW"];
        break;
      case "4-3-3 Defend":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "CM", "RW", "ST", "LW"];
        break;
      case "4-3-3 Mixed":
        this.positions = ["GK", "RB", "CB", "LB", "CDM", "CAM", "RW", "ST", "LW"];
        break;
      case "4-4-2":
      case "4-5-1 Defend":
        this.positions = ["GK", "RB", "CB", "LB", "RM", "CM", "LM", "ST"];
        break;
      case "4-4-1-1":
      case "4-5-1 Attack":
        this.positions = ["GK", "RB", "CB", "LB", "RM", "CM", "LM", "CAM", "ST"];
        break;
      case "5-4-1":
        this.positions = ["GK", "RB", "CB", "LB", "RM", "CM", "LM", "ST"];
        break;
      default:
        this.positions = [];
        break;
    }

    if (!fromLoad) this.setPendingChanges('basic');
  }

  areAwardsDone() {
    if (this.seasonObj.seasonAwards.bestPlayer == undefined || this.seasonObj.seasonAwards.bestPlayer == null || this.seasonObj.seasonAwards.bestPlayer.length == 0)
      return false;

    return true;
  }

  getScorers(fixture: CurrentSeasonFixtureObj) {
    let comma = /\,/gi;
    return fixture.scorers?.replace(comma, "<br />");
  }

  populateFullMenuList() {
    this.menuItems = [
      { label: 'Change Position', icon: 'pi pi-map-marker', command: () => { this.editPlayerPos(this.selectedPlayer); } },
      { label: 'Retiring End of Season', icon: 'pi pi-clock', command: () => { this.retiringPlayer(this.selectedPlayer); } },
      { label: 'Promote from Youth Squad', icon: 'pi pi-map-marker', command: () => { this.promoteFromYouthSquad(this.selectedPlayer); } },
      { label: 'Transfer List', icon: 'pi pi-list', command: () => { this.addToList(this.selectedPlayer); } },
      { label: 'Loan List', icon: 'pi pi-list', command: () => { this.addToList(this.selectedPlayer, false); } },
      { label: 'Remove from Transfer List', icon: 'pi pi-list', command: () => { this.removeFromList(this.selectedPlayer); } },
      { label: 'Remove from Loan List', icon: 'pi pi-list', command: () => { this.removeFromList(this.selectedPlayer, false); } },
      { label: 'Make Loan Permanent', icon: 'pi pi-arrows-h', command: () => { this.makeLoanPermament(this.selectedPlayer); } },
      { label: 'End Loan', icon: 'pi pi-times-circle', command: () => { this.endLoan(this.selectedPlayer); } },
      { label: 'Sell', icon: 'pi pi-money-bill', command: () => { this.removePlayer(this.selectedPlayer, "Sell"); } },
      { label: 'Loan Out', icon: 'pi pi-money-bill', command: () => { this.removePlayer(this.selectedPlayer, "Loan"); } },
      { label: 'Terminate Contract', icon: 'pi pi-thumbs-down', command: () => { this.removePlayer(this.selectedPlayer, "Terminate"); } },
    ];
    this.menuShowing = false;
  }

  populateMenuListForPlayer() {
    this.populateFullMenuList();
    if (this.selectedPlayer != undefined) this.menuItems = this.getItemMenuOptions();
  }

  getItemMenuOptions(): any {
    let playerMenuList: MenuItem[] = Object.assign([], this.menuItems);

    //Is player in youth squad?
    if (!this.selectedPlayer.youthSquad)
      playerMenuList = playerMenuList.filter(x => x.label != "Promote from Youth Squad");

    //Has player been transfer or loan listed?
    if (this.selectedPlayer.transferListed)
      playerMenuList = playerMenuList.filter(x => x.label != "Transfer List" && x.label != "End Loan" && x.label != "Remove from Loan List" && x.label != "Make Loan Permanent");
    else if (this.selectedPlayer.loanListed)
      playerMenuList = playerMenuList.filter(x => x.label != "Loan List" && x.label != "End Loan" && x.label != "Remove from Transfer List" && x.label != "Make Loan Permanent");
    else
      playerMenuList = playerMenuList.filter(x => x.label != "Remove from Transfer List" && x.label != "Remove from Loan List");

    //Is player either loaned in or out?
    if (this.selectedPlayer.loanedIn)
      playerMenuList = playerMenuList.filter(x => x.label != "Transfer List" && x.label != "Loan List" && x.label != "Sell" && x.label != "Loan Out"
        && x.label != "Terminate Contract");
    else if (this.selectedPlayer.loanedOut)
      playerMenuList = playerMenuList.filter(x => x.label != "Change Position" && x.label != "Transfer List" && x.label != "Loan List" && x.label != "Loan Out"
        && x.label != "Terminate Contract" && x.label != "Make Loan Permanent");
    else
      playerMenuList = playerMenuList.filter(x => x.label != "End Loan" && x.label != "Make Loan Permanent");

    //Is player joining us, or leaving us, at the end of the season?
    if (this.selectedPlayer.preContract || this.selectedPlayer.preContractOut)
      playerMenuList = playerMenuList.filter(x => x.label != "Change Position" && x.label != "Retiring End of Season" && x.label != "Transfer List"
        && x.label != "Loan List" && x.label != "Sell" && x.label != "Loan Out" && x.label != "Terminate Contract" && x.label != "Make Loan Permanent");
    else if (this.selectedPlayer.retiring)
      playerMenuList = playerMenuList.filter(x => x.label != "Retiring End of Season" && x.label != "Transfer List" && x.label != "Loan List" && x.label != "Make Loan Permanent");

    this.menuShowing = true;
    return playerMenuList;
  }

  populateCupFinalsList() {
    this.endOfSeasonCupsTable = [];
    let forbbidenCups = ["Community Shield", "Supercup", "Trophée des Champions"];

    this.seasonObj.seasonCups.filter(x => forbbidenCups.indexOf(x.cupName) == -1).forEach(x => {
      let ourTeamInFinal = x.cupProgress == "Winners" || x.cupProgress == "Runners-Up";
      let ourFinalScore = null;
      if (ourTeamInFinal) {
        let cupFinals = this.seasonObj.fixtures.filter(y => y.competition == x.cupName && y.venue == "N");
        ourFinalScore = cupFinals[cupFinals.length - 1];
      };

      this.endOfSeasonCupsTable.push({
        cupFinal: x.cupName + " Final", teams: x.cupName.startsWith("UEFA") || x.cupName.startsWith("Conmebol") ? this.allTeams : this.teams,
        homeTeam: ourTeamInFinal ? this.seasonObj.team : "", homeTeamImg: ourTeamInFinal ? this.teamImg : "",
        homeTeamStyle: ourTeamInFinal ? this.seasonObj.teamCSSStyles : "", awayTeam: ourFinalScore == null ? "" : ourFinalScore.versusTeam,
        awayTeamImg: ourFinalScore == null ? "" : ourFinalScore.versusTeamObj.imgPath, awayTeamStyle: ourFinalScore == null ? "" : ourFinalScore.versusTeamStyle,
        homeScore: ourFinalScore == null ? 0 : ourFinalScore.ourScore, awayScore: ourFinalScore == null ? 0 : ourFinalScore.versusScore, penaltyWinner: "",
        editable: !ourTeamInFinal
      });
    });

    this.populateEuropeCupFinalsList();
    this.populateAmericaCupFinalsList();
  }

  populateAmericaCupFinalsList() {
    if (this.teamsService.isAmericanTeam(this.seasonObj.countryCode, true)) {
      //Libertadores
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "Conmebol Libertadores Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "Conmebol Libertadores Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "",
          awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }

      //Sudamericana
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "Conmebol Sudamericana Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "Conmebol Sudamericana Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "",
          awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }

      //Recopa
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "Conmebol Recopa Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "Conmebol Recopa Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "", awayTeamImg: "",
          awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }
    }
  }

  populateEuropeCupFinalsList() {
    if (this.teamsService.isEuropeanTeam(this.seasonObj.countryCode, true)) {
      //Champions League
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "UEFA Champions League Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "UEFA Champions League Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "",
          awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }

      //Europa League
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "UEFA Europa League Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "UEFA Europa League Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "",
          awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }

      //Europa Conference League
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "UEFA Europa Conference League Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "UEFA Europa Conference League Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "",
          awayTeam: "", awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }

      //Super Cup
      if (this.endOfSeasonCupsTable.filter(x => x.cupFinal == "UEFA Super Cup Final").length == 0) {
        this.endOfSeasonCupsTable.push({
          cupFinal: "UEFA Super Cup Final", teams: this.allTeams, homeTeam: "", homeTeamImg: "", homeTeamStyle: "", awayTeam: "",
          awayTeamImg: "", awayTeamStyle: "", homeScore: 0, awayScore: 0, penaltyWinner: "", editable: true
        });
      }
    }
  }

  populateInitialLeagueStandingsList() {
    this.endOfSeasonLeagueTable = [];
    let draggable = this.utilities.checkIsDraggableLeagueOrder(this.seasonObj.league);

    //Add our name
    this.endOfSeasonLeagueTable.push({
      id: 1, pos: 1, teamName: this.seasonObj.team.toUpperCase(), teamImagePath: this.teamImg, teamCssStyles: this.seasonObj.teamCSSStyles,
      gamesPlayed: this.seasonObj.leagueStats.gamesPlayed, wins: this.seasonObj.leagueStats.wins, draws: this.seasonObj.leagueStats.draws,
      losses: this.seasonObj.leagueStats.losses, goalsScored: this.seasonObj.leagueStats.goalsScored,
      goalsAgainst: this.seasonObj.leagueStats.goalsAgainst, goalDifference: this.seasonObj.leagueStats.goalDifference,
      points: this.seasonObj.leagueStats.points, editable: false, draggableOrder: draggable
    });

    //Add the other teams
    let otherTeamsInit = [...new Set(this.seasonObj.fixtures.filter(x => this.utilities.checkIsLeagueGame(x)).map(item => item.versusTeam))];
    let otherTeamsFinal: any[] = [];
    otherTeamsInit.forEach(oti => {
      let teamObj = this.teams.filter(t => t.team == oti)[0];
      otherTeamsFinal.push({ teamName: oti, teamImg: teamObj.imgPath, teamStyle: teamObj.cssStyles });
    });
    otherTeamsFinal.sort((a, b) => a.teamName.localeCompare(b.teamName)).forEach((otf, i) => {
      this.endOfSeasonLeagueTable.push({
        id: i + 2, pos: i + 2, teamName: otf.teamName, teamImagePath: otf.teamImg, teamCssStyles: otf.teamStyle, gamesPlayed: 0,
        wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsAgainst: 0, goalDifference: 0, points: 0, editable: true, draggableOrder: draggable
      });
    });
  }

  tidyUpLeagueStandings(id: number, prop: string, draggable: boolean) {
    //Adjust specific team
    let team = this.endOfSeasonLeagueTable.filter(x => x.id == id)[0];
    switch (prop.toLowerCase()) {
      case "w":
      case "d":
        if (draggable) team.gamesPlayed = team.wins + team.draws + team.losses;
        else team.losses = team.gamesPlayed - team.wins - team.draws;
        team.points = (3 * team.wins) + team.draws;
        break;
      case "l":
        if (draggable) team.gamesPlayed = team.wins + team.draws + team.losses;
        break;
      case "gf":
      case "ga":
        team.goalDifference = team.goalsScored - team.goalsAgainst;
        break;
    }

    //Sort table
    if (!draggable) this.endOfSeasonLeagueTable = this.utilities.sortLeagueOrder(this.endOfSeasonLeagueTable);
    this.endOfSeasonLeagueTable.forEach((lt, i) => { lt.pos = i + 1; });
  }

  addNewPlayer(setting: any) {
    this.modalParam = setting.code;
    this.modalOrder = setting.order;
    this.showModal = true;
    this.cmTrackerService.triggerNewPlayerModal({ setting: setting.code, order: setting.order });
    this.modalMode = "add-new-player-modal";
    this.modalHeader = "Add New Player";
  }

  confirmNewPlayer(newPlayerDeets: any) {
    let newPlayer = Object.assign({}, newPlayerDeets.player);
    newPlayer.accentSeverity = this.formatService.workOutAccentColour(newPlayer.position);
    this.seasonObj.squad.push(newPlayer);

    if (newPlayerDeets.transfer !== undefined) {
      let trans = newPlayerDeets.transfer;
      let yr = this.cmTrackerService.getCareerModeYear();

      if (newPlayerDeets.transfer.type == "Pre-Contract") {
        newPlayer.transferListed = false;
        newPlayer.loanListed = false;
        newPlayer.preContract = true;
        trans.date = this.getPreContractTransferDate();
        yr += 1;
      }

      this.transferLog.push({
        year: yr, rawDate: trans.date, date: "", status: "In", player: newPlayer.player,
        playerImagePath: newPlayer.imagePath, fromClub: trans.fromClub.team, toClub: this.seasonObj.team,
        fee: this.getFeeFigure(trans.type, trans.amount), feeDisplay: this.getFeeDisplayFigure(trans.type, trans.amount)
      });
      this.setPendingChanges("transfer");
    }

    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-new");
    this.showModal = false;
  }

  makeLoanPermament(player: CurrentSeasonSquadPlayerObj) {
    this.modalParam = { player: player };
    this.showModal = true;
    this.cmTrackerService.triggerLoanToPermanentModal({ player: player });
    this.modalMode = "loan-to-permanent-modal";
    this.modalHeader = "Make " + player.player + "'s Loan Permanent";
  }

  confirmLoadToPermanentMove(deets: any) {
    let player = this.seasonObj.squad.filter(x => x.id == deets.player.id)[0];
    let trans = deets.transfer;
    let yr = this.cmTrackerService.getCareerModeYear();

    player.loanedIn = false;
    player.edited = true;
    this.setPendingChanges("squad-edit");

    this.transferLog.push({
      year: yr, rawDate: trans.date, date: "", status: "In", player: player.player,
      playerImagePath: player.imagePath, fromClub: trans.fromClub.team, toClub: this.seasonObj.team,
      fee: trans.amount, feeDisplay: this.getFeeDisplayFigure("", trans.amount)
    });
    this.setPendingChanges("transfer");

    this.cmTrackerService.triggerSquadChange();
    this.showModal = false;
  }

  removePlayer(player: CurrentSeasonSquadPlayerObj, setting: any) {
    this.modalParam = { player: player, setting: setting };
    this.showModal = true;
    this.cmTrackerService.triggerRemovePlayerModal({ player: player, setting: setting });
    this.modalMode = "remove-player-modal";
    this.modalHeader = "Remove " + player.player;
  }

  confirmRemovePlayer(deets: any) {
    let player = this.seasonObj.squad.filter(x => x.id == deets.player.id)[0];
    let trans = deets.transfer;
    let yr = this.cmTrackerService.getCareerModeYear();

    if (deets.transfer.type == "Permanent") {
      player.transferListed = false;
      player.loanListed = false;
      player.remove = true;
      this.setPendingChanges("squad-remove");
    } else if (deets.transfer.type.toLowerCase().indexOf("loan") > -1) {
      player.transferListed = false;
      player.loanListed = false;
      player.loanedOut = true;
      player.edited = true;
      this.setPendingChanges("squad-edit");
    } else if (deets.transfer.type == "Pre-Contract") {
      player.transferListed = false;
      player.loanListed = false;
      player.preContractOut = true;
      player.edited = true;
      trans.date = this.getPreContractTransferDate();
      yr += 1;
      this.setPendingChanges("squad-edit");
    } else if (deets.transfer.type == "Terminate") {
      player.transferListed = false;
      player.loanListed = false;
      player.remove = true;
      this.setPendingChanges("squad-remove");
    }

    this.transferLog.push({
      year: yr, rawDate: trans.date, date: "", status: "Out", player: player.player,
      playerImagePath: player.imagePath, fromClub: this.seasonObj.team, toClub: trans.toClub == "FREE AGENT" ? trans.toClub : trans.toClub.team,
      fee: this.getFeeFigure(trans.type, trans.amount), feeDisplay: this.getFeeDisplayFigure(trans.type, trans.amount)
    });
    this.setPendingChanges("transfer");

    this.cmTrackerService.triggerSquadChange();
    this.showModal = false;
  }

  getFeeDisplayFigure(type: string, amount: number) {
    switch (type.toLowerCase()) {
      case "pre-contract":
        return "0";
      case "short-term loan":
        return "Loan (short-term)";
      case "1-year loan":
        return "Loan (1-year)";
      case "2-year loan":
        return "Loan (2-year)";
    }

    return amount.toLocaleString("en-US");
  }

  getFeeFigure(type: string, amount: number) {
    switch (type.toLowerCase()) {
      case "pre-contract":
        return 0;
      case "short-term loan":
        return -1;
      case "1-year loan":
        return -2;
      case "2-year loan":
        return -3;
    }

    return amount;
  }

  getPreContractTransferDate() {
    let yr = this.cmTrackerService.getCareerModeYear();
    let actualYr = 2025 + yr;
    return new Date(actualYr, 6, 1);
  }

  editPlayerPos(player: CurrentSeasonSquadPlayerObj) {
    if (player.loanedOut || player.preContract)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player currently not in your active squad!" });
    else {
      this.modalParam = player;
      this.showModal = true;
      this.cmTrackerService.triggerEditPositionModal(player);
      this.modalMode = "change-position-modal";
      this.modalHeader = "Change " + player.player + "'s Position";
    }
  }

  confirmPosChange(changes: any) {
    let player = changes.player;
    let oldPos = changes.oldPos;

    //Get new position index
    let orderNums: number[] = this.seasonObj.squad.filter(x => x.id != player.id && x.position == player.position && !x.loanedOut && !x.transferListed && !x.loanListed && !x.youthSquad && !x.preContract && !x.preContractOut && !x.remove)
      .map(x => { return x.order == undefined ? 0 : x.order; });
    orderNums = orderNums.sort((a, b) => b - a);
    let newPosIndex = orderNums.length == 0 ? 1 : orderNums[0] + 1;

    //Update player in squad
    player.order = newPosIndex;
    this.seasonObj.squad.filter(x => x.id == player.id)[0] = player;

    //Update old position indexes
    this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, oldPos)).forEach((p, i) => {
      if (p.order != (i + 1)) p.edited = true;
      p.order = i + 1;
    });

    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-edit");
    this.showModal = false;
  }

  confirmReorder(players: any) {
    if (players.changes) {
      let squad: CurrentSeasonSquadPlayerObj[] = players.squad;
      squad.forEach(p => {
        this.seasonObj.squad.filter(x => x.id == p.id)[0] = p;
      });
      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-edit");
    }
  }

  addToList(player: CurrentSeasonSquadPlayerObj, transferList: boolean = true) {
    if (player.loanedIn)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player loaned in to your club!" });
    else if (player.loanedOut || player.preContract)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player currently not in your active squad!" });
    else if (player.preContractOut)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player already set to leave in the summer!" });
    else {
      player.transferListed = transferList;
      player.loanListed = !transferList;
      player.edited = true;

      //Update player's position indexes
      this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, player.position)).forEach((p, i) => {
        if (p.order != (i + 1)) p.edited = true;
        p.order = i + 1;
      });

      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-edit");
    }
  }

  removeFromList(player: CurrentSeasonSquadPlayerObj, transferList: boolean = true) {
    if (player.loanedIn)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player loaned in to your club!" });
    else if (player.loanedOut || player.preContract)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player currently not in your active squad!" });
    else if (player.preContractOut)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on a player already set to leave in the summer!" });
    else {
      if (transferList) player.transferListed = false;
      else player.loanListed = false;
      player.edited = true;

      //Update player's position indexes
      this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, player.position)).forEach((p, i) => {
        if (p.order != (i + 1)) p.edited = true;
        p.order = i + 1;
      });

      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-edit");
    }
  }

  promoteFromYouthSquad(player: CurrentSeasonSquadPlayerObj) {
    if (!player.youthSquad)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action as the player isn't part of the Youth Squad!" });
    else {
      player.youthSquad = false;
      player.edited = true;

      //Update player's position indexes
      this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, player.position)).forEach((p, i) => {
        if (p.order != (i + 1)) p.edited = true;
        p.order = i + 1;
      });

      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-edit");
    }
  }

  retiringPlayer(player: CurrentSeasonSquadPlayerObj) {
    player.retiring = true;
    player.edited = true;
    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-edit");
  }

  endLoan(player: CurrentSeasonSquadPlayerObj) {
    if (!player.loanedIn && !player.loanedOut)
      this.messageService.add({ severity: "error", summary: "Can't do that!", detail: "You can't perform that action on players neither loaned in or loaned out!" });
    else if (player.loanedIn) {
      let edited = false;
      player.loanedIn = false;
      player.remove = true;

      //Update player's position indexes
      this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, player.position)).forEach((p, i) => {
        if (p.order != (i + 1)) {
          edited = true;
          p.edited = true;
        }
        p.order = i + 1;
      });

      this.cmTrackerService.triggerSquadChange();
      if (edited) this.setPendingChanges("squad-edit");
      this.setPendingChanges("squad-remove");
    } else if (player.loanedOut) {
      player.loanedOut = false;

      //Update player's position indexes
      this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.seasonObj.squad, player.position)).forEach((p, i) => {
        if (p.order != (i + 1)) p.edited = true;
        p.order = i + 1;
      });

      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-edit");
    }
  }

  generateResults(fixture: CurrentSeasonFixtureObj) {
    this.modalParam = fixture;
    this.showModal = true;
    this.cmTrackerService.triggerResultsModal(fixture);
    this.modalMode = "generate-result-modal";
    this.modalHeader = "Generate Results for Game #" + fixture.order;
  }

  confirmResult(results: any) {
    //Update fixtures list
    this.seasonObj.fixtures.filter(x => x.id == results.fixture.id)[0] = results.fixture;
    this.setPendingChanges("fixture-edit");

    //Update league stats
    let fixtureList = this.seasonObj.fixtures.filter(x => x.competition == results.fixture.competition);
    if (this.utilities.checkIsLeagueGame(results.fixture))
      this.updateLeagueStats(results.fixture);
    else if ((this.utilities.checkIsKnockoutGame(results.fixture, fixtureList) && results.fixture.result == "L") || results.fixture.venue == "N") {
      if ((results.fixture.competition == "FA Cup" && fixtureList.filter(x => x.competition == "FA Cup" && x.venue == "N").length > 1) || results.fixture.result == "L") {
        fixtureList.filter(x => x.result?.length == 0).forEach(f => f.remove = true);
        this.seasonObj.seasonCups.filter(x => x.cupName == results.fixture.competition)[0].out = true;
        if (results.fixture.venue == "N") {
          if (results.fixture.competition == "FA Cup" && fixtureList.filter(x => x.competition == "FA Cup" && x.venue == "N").length == 1)
            this.seasonObj.seasonCups.filter(x => x.cupName == results.fixture.competition)[0].cupProgress = "Semi-Finals";
          else
            this.seasonObj.seasonCups.filter(x => x.cupName == results.fixture.competition)[0].cupProgress = results.fixture.result == "W" ? "Winners" : "Runners-Up";

          this.setPendingChanges("cup");
        }
        this.reorderFixtures();
        this.setPendingChanges("fixture-remove");
      }
    }

    //Update player stats
    this.updatePlayerStats(results.players, results.fixture.versusTeam);

    //Close modal
    this.showModal = false;
  }

  addFixture() {
    // Get fixture order
    let order: number = 0;
    if (this.seasonObj.fixtures !== undefined && this.seasonObj.fixtures[this.seasonObj.fixtures.length - 1]) {
      let temp = this.seasonObj.fixtures[this.seasonObj.fixtures.length - 1];
      order = temp.order ?? -1;
      order++;
    }

    // Get list of competitions
    let compNames = [...new Set(this.seasonObj.fixtures.map(f => f.competition))];
    if (compNames.filter(x => x.indexOf("1A Pro League") > -1).length > 0)
      compNames.push("1A Pro League Play-Offs");
    else if (compNames.filter(x => x.indexOf("EFL ") > -1).length > 0)
      compNames.push(`${compNames.filter(x => x.startsWith("EFL"))[0]} Play-Offs`);

    // Push to Fixtures list
    this.seasonObj.fixtures.push({
      id: 0, competition: "", competitions: compNames, order: order, result: "", scorers: "", venue: "",
      versusTeam: "", versusTeamStyle: "", added: true, edited: false, teams: this.allTeams
    });
    this.setPendingChanges('fixture-add');
  }

  editFixture(fixture: any) {
    this.seasonObj.fixtures.filter(x => x.id == fixture.id)[0].edited = true;
    this.setPendingChanges('fixture-edit');
  }

  removeFixture(fixture: any) {
    this.seasonObj.fixtures.filter(x => x.id == fixture.id)[0].remove = true;
    this.reorderFixtures();
    this.setPendingChanges("fixture-remove");
  }

  updateLeagueStats(fixture: CurrentSeasonFixtureObj) {
    this.seasonObj.leagueStats.gamesPlayed += 1;
    if (fixture.result == "W") this.seasonObj.leagueStats.wins += 1;
    else if (fixture.result == "L") this.seasonObj.leagueStats.losses += 1;
    else this.seasonObj.leagueStats.draws += 1;

    this.seasonObj.leagueStats.goalsScored += fixture.ourScore ?? 0;
    this.seasonObj.leagueStats.goalsAgainst += fixture.versusScore ?? 0;
    this.seasonObj.leagueStats.goalDifference = this.seasonObj.leagueStats.goalsScored - this.seasonObj.leagueStats.goalsAgainst;
    this.seasonObj.leagueStats.points = (this.seasonObj.leagueStats.wins * 3) + this.seasonObj.leagueStats.draws;

    this.leagueStats = [this.seasonObj.leagueStats];
    this.setPendingChanges("stat");
  }

  updatePlayerStats(playerList: any[], team: string) {
    //Man of the Match points for this fixture: rank by rating, top 4 score
    //5/3/2/1. Ties broken by array order rather than a shared rank - not
    //specified, so kept simple rather than inventing a tie-breaking rule.
    let motmPointsTable = [5, 3, 2, 1];
    let rankedByRating = [...playerList].sort((a, b) => b.rating - a.rating);
    rankedByRating.forEach((p, i) => { p.motmPointsThisGame = i < motmPointsTable.length ? motmPointsTable[i] : 0; });

    playerList.forEach(p => {
      let player = this.seasonObj.squad.filter(x => x.id == p.player.id)[0];
      player.caps += 1;
      player.goals += p.goals;
      player.rating += p.rating;
      player.motmPoints = (player.motmPoints ?? 0) + p.motmPointsThisGame;
      player.ratingDisplay = player.rating !== undefined ? Math.round((player.rating / player.caps) * 100) / 100 : 0;
      player.edited = true;
      this.seasonObj.teamPlayerStats?.push({ playerId: p.player.id, team: team, caps: 1, goals: p.goals, rating: p.rating });
    });
    this.topScorers = this.utilities.sortSquadByTopScorer(this.seasonObj.squad);
    this.seasonObj.squad = this.utilities.sortSquadByPosThenCaps(this.seasonObj.squad);
    this.setPendingChanges("squad-edit");
    this.setPendingChanges("team-stats");
  }

  setPendingChanges(section: string) {
    this.pendingChanges = true;

    switch (section.toLowerCase()) {
      case "awards":
        this.seasonObj.pendingChanges.seasonAwardsChanges = true;
        break;
      case "basic":
        this.seasonObj.pendingChanges.basicChanges = true;
        break;
      case "cup":
        this.seasonObj.pendingChanges.cupChanges = true;
        break;
      case "fixture-add":
        this.seasonObj.pendingChanges.fixtureAdd = true;
        break;
      case "fixture-edit":
        this.seasonObj.pendingChanges.fixtureChanges = true;
        break;
      case "fixture-remove":
        this.seasonObj.pendingChanges.fixtureRemovals = true;
        break;
      case "pos":
        this.seasonObj.pendingChanges.leaguePosChanges = true;
        break;
      case "squad-edit":
        this.seasonObj.pendingChanges.squadChanges = true;
        break;
      case "squad-new":
        this.seasonObj.pendingChanges.squadAdditions = true;
        break;
      case "squad-remove":
        this.seasonObj.pendingChanges.squadRemovals = true;
        break;
      case "stat":
        this.seasonObj.pendingChanges.leagueStatChanges = true;
        break;
      case "team-stats":
        this.seasonObj.pendingChanges.teamPlayerStatsChanges = true;
        break;
      case "transfer":
        this.seasonObj.pendingChanges.transferLogUpdate = true;
        break;
    }
  }

  save() {
    if (this.pendingChanges) {
      this.reorderFixtures();

      this.saving = true;
      this.seasonObj.transfers = this.transferLog;
      this.seasonObj.leaguePos.forEach(x => {
        x.team = this.seasonObj.team;
        x.cssStyles = this.seasonObj.teamCSSStyles;
      });

      this.http.put<boolean>(this.baseUrl + "currentseason", this.seasonObj).subscribe(result => {
        this.messageService.add({ severity: "success", summary: "Success!", detail: "Your changes have been successfully saved!" });
        this.saving = false;
        this.resetPendingChanges();
      }, error => {
        console.log("ERROR!", error);
      });
    }
  }

  endSeason() {
    let eosObj: EndOfSeasonObj = {
      careerID: this.seasonObj.careerID, year: this.seasonObj.year,
      leagueTable: this.endOfSeasonLeagueTable, cupFinals: this.endOfSeasonCupsTable
    };

    //Add validation
    let valid = true;
    for (var lt = 0; lt < eosObj.leagueTable.length; lt++) {
      if (eosObj.leagueTable[lt].goalsScored == 0 && eosObj.leagueTable[lt].goalsAgainst == 0) {
        valid = false;
        break;
      }
    }
    if (valid) {
      for (var cf = 0; cf < eosObj.cupFinals.length; cf++) {
        if (eosObj.cupFinals[cf].homeTeam == undefined || eosObj.cupFinals[cf].homeTeam == null || eosObj.cupFinals[cf].homeTeam?.length == 0) {
          valid = false;
          break;
        } else if (eosObj.cupFinals[cf].awayTeam == undefined || eosObj.cupFinals[cf].awayTeam == null || eosObj.cupFinals[cf].awayTeam?.length == 0) {
          valid = false;
          break;
        } else if (eosObj.cupFinals[cf].homeScore == eosObj.cupFinals[cf].awayScore &&
          (eosObj.cupFinals[cf].penaltyWinner == undefined || eosObj.cupFinals[cf].penaltyWinner == null || eosObj.cupFinals[cf].penaltyWinner?.length == 0)) {
          valid = false;
          break;
        }
      }
    }

    if (!valid)
      this.messageService.add({ severity: "error", summary: "Validation Failed!", detail: "You can't end the season until the league table and cup finals are fully populated!" });
    else {
      this.saving = true;
      this.http.put<boolean>(this.baseUrl + "careerhub", eosObj).subscribe(result => {
        this.messageService.add({ severity: "success", summary: "Success!", detail: "Your changes have been successfully saved!" });
        this.saving = false;
        this.enableEOSBtn = false;
        this.enableSNSBtn = true;
      }, error => {
        console.log("ERROR!", error);
      });
    }
  }

  startBrandNewSeason() {
    this.showModal = true;
    this.modalMode = "stick-or-twist-modal";
    this.modalHeader = "Start New Season";
  }

  leaveClub() {
    this.showModal = true;
    this.modalMode = "mid-season-departure-modal";
    this.modalHeader = "Leaving " + this.seasonObj.team;
  }

  chooseDepartureReason(reason: string) {
    this.midSeasonDepartureReason = reason;
    this.midSeasonMove = true;
    this.modalMode = "authentic-club-modal";
    this.modalHeader = "Find a New Club";
  }

  prepForNewSeason(stay: boolean) {
    this.showModal = false;
    if (stay) {
      this.modalMode = "stay-at-club-modal";
      this.modalHeader = "Stay at " + this.seasonObj.team;
      this.showModal = true;
    } else {
      this.midSeasonMove = false;
      this.midSeasonDepartureReason = undefined;
      this.modalMode = "authentic-club-modal";
      this.modalHeader = "Move to New Club";
      this.showModal = true;
    }
  }

  reorderFixtures() {
    this.seasonObj.fixtures.filter(x => !x.remove).forEach((f, i) => {
      if (f.order != i + 1) f.edited = true;
      f.order = i + 1;
      this.setPendingChanges("fixture-edit");
    })
  }

  confirmPrePopulation(deets: any) {
    deets.players.forEach((p: any) => {
      p.accentSeverity = this.formatService.workOutAccentColour(p.position);
      this.seasonObj.squad.push(p);
      this.cmTrackerService.triggerSquadChange();
      this.setPendingChanges("squad-new");
    });

    this.showModal = false;
    this.save();
  }

  resetPendingChanges() {
    this.pendingChanges = false;
    this.ngOnInit();
  }

  backToHistory() {
    if (this.overviewBackEmit != undefined) this.overviewBackEmit.emit();
  }

  switchToInternationalView() {
    if (this.switchModeEmit != undefined) this.switchModeEmit.emit();
  }

  changeTab(tabNum: any) {
    this.activeTab = tabNum;

    if (tabNum == 1) {
      //Panel is hidden (display:none) until Angular finishes showing it - wait a tick so
      //clientHeight reads the real, visible size rather than 0
      setTimeout(() => this.calculateSquadListRows(), 0);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.activeTab == 1) this.calculateSquadListRows();
  }

  calculateSquadListRows() {
    if (!this.squadListDiv) return;

    const estimatedRowHeight = 56; //avatar + tags + padding, at this component's normal (non-smaller-text) size
    const estimatedHeaderHeight = 48;
    const estimatedPaginatorHeight = 48;

    const availableHeight = this.squadListDiv.nativeElement.clientHeight - estimatedHeaderHeight - estimatedPaginatorHeight;
    const rows = Math.floor(availableHeight / estimatedRowHeight) - 2;

    //Never fewer than 4 - a page with 1-2 rows on a very short screen would defeat the point of paging at all
    this.squadListRows = Math.max(4, rows);
  }
}
