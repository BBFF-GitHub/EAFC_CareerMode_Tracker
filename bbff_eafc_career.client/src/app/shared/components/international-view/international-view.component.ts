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
import { MenuItem, MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { AddNewPlayerModalComponent } from '../modals/add-new-player-modal/add-new-player-modal.component';
import { CareerModeTrackerService } from '../../services/career-mode-tracker.service';
import { ChangeClubModalComponent } from '../modals/change-club-modal/change-club-modal.component';
import { ChangePositionModalComponent } from '../modals/change-position-modal/change-position-modal.component';
import { CountryObj, CurrentSeasonFixtureObj, CurrentSeasonLeagueStatsObj, InternationalsObj, InternationalsPlayerObj, TeamObj } from '../../../app.classes';
import { FormattingService } from '../../services/formatting.service';
import { GenerateResultModalComponent } from '../modals/generate-result-modal/generate-result-modal.component';
import { TeamsService } from '../../services/teams.service';
import { TeamShirtComponent } from '../team-shirt/team-shirt.component';
import { UtilitiesService } from '../../services/utilities.service';

@Component({
  selector: 'international-view',
  templateUrl: './international-view.template.html',
  styleUrls: ['../../../../styles.css', './international-view.styles.css'],
  standalone: true,
  imports: [AddNewPlayerModalComponent, AvatarModule, ButtonModule, ChangeClubModalComponent, ChangePositionModalComponent, CommonModule, ContextMenuModule,
    DialogModule, FormsModule, GenerateResultModalComponent, ProgressSpinnerModule, SelectModule, TableModule, TabsModule, TagModule, TeamShirtComponent, TooltipModule]
})

export class InternationalViewComponent {

  //Declare input and output variables
  @Input() careerId!: number;
  @Input() year!: number;
  @Input() fromOverview: boolean = false;
  @Output() overviewBackEmit = new EventEmitter<any>();
  @Output() switchModeEmit = new EventEmitter<any>();

  //Declare context menu variable
  @ViewChild('#cm') contextMenu!: ContextMenu;
  @ViewChild('#cm_gk') contextMenuGK!: ContextMenu;
  @ViewChild('#cm_df') contextMenuDF!: ContextMenu;
  @ViewChild('#cm_mf') contextMenuMF!: ContextMenu;
  @ViewChild('#cm_st') contextMenuST!: ContextMenu;

  //Declare array variables
  formations: string[] = ["", "4-1-2-1-2 Narrow", "4-1-2-1-2 Wide", "4-1-4-1", "4-1-3-2", "4-2-3-1", "4-2-4", "4-3-3 Attack", "4-3-3 Defend", "4-3-3 Flat", "4-3-3 Mixed", "4-4-1-1",
    "4-4-2", "4-5-1 Attack", "4-5-1 Defend", "5-4-1"];
  venues: string[] = ["", "H", "A", "N"];
  positions!: string[];
  teams!: TeamObj[];
  currentSquad: InternationalsPlayerObj[] = [];
  currentSquadGKs: InternationalsPlayerObj[] = [];
  currentSquadDFs: InternationalsPlayerObj[] = [];
  currentSquadMFs: InternationalsPlayerObj[] = [];
  currentSquadSTs: InternationalsPlayerObj[] = [];
  gameStats!: CurrentSeasonLeagueStatsObj[];
  topScorers!: InternationalsPlayerObj[];
  menuItems!: MenuItem[];
  countries!: CountryObj[];

  //Declare other variables
  internationalObj!: InternationalsObj;
  selectedPlayer!: InternationalsPlayerObj;
  selectedCountry!: CountryObj;
  countryImg!: string;
  loading: boolean = true;
  saving: boolean = false;
  pendingChanges: boolean = false;
  menuShowing: boolean = false;
  baseUrl: string;
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;
  showModal: boolean = false;
  modalMode: string = "";
  modalHeader: string = "";
  modalParam!: any;
  modalOrder: number = 0;
  nextGameIndex: number = -1;
  activeTabIndex: number = 0;

  //Squad List View table - rows-per-page is computed from available space, not fixed
  @ViewChild('squadListDiv') squadListDiv!: ElementRef;
  squadListRows: number = 8;

  constructor(private cmTrackerService: CareerModeTrackerService, private formatService: FormattingService, private http: HttpClient,
    private messageService: MessageService, private teamsService: TeamsService, private utilities: UtilitiesService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  ngOnInit() {
    this.loading = true;
    this.populateFullMenuList();

    this.http.get<InternationalsObj>(this.baseUrl + "internationals", { params: { careerId: this.careerId, year: this.year } }).subscribe(result => {
      this.internationalObj = result;
      this.internationalObj.teamPlayerStats = [];

      this.gameStats = [this.internationalObj.gameStats];
      this.setPositionsList(true);
      this.getTeamsFromCountry();
      this.internationalObj.squad.forEach(p => {
        p.posId = this.formatService.workOutPosId(p.position);
        p.accentSeverity = this.formatService.workOutAccentColour(p.position);
        p.currentClubImgPath = p.currentClub ? this.teamsService.getTeamImgFromJustTeamName(p.currentClub) : "";
      });
      this.internationalObj.cups.forEach(c => { c.countryCode = ""; })

      if (this.internationalObj.squad.length == 0) {
        this.topScorers = [];
      } else {
        this.topScorers = this.utilities.sortInternationalSquadByTopScorer(this.internationalObj.squad);
        this.internationalObj.squad = this.utilities.sortInternationalSquadByPosThenCaps(this.internationalObj.squad);
        this.updatePositionLists();
      }

      this.showFixtureDeleteBtn();
      this.cmTrackerService.setCareerInternationalObj(this.internationalObj);
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (this.internationalObj.team == null) {
      if (event.key === 'ArrowLeft') {
        this.moveCountry(-1);
      } else if (event.key === 'ArrowRight') {
        this.moveCountry(1);
      }
    }
  }

  getTeamsFromCountry() {
    this.loading = true;
    if (this.teamsService.allTeams.length > 0) {
      let localSelection = this.teamsService.allTeams.filter(x => x.countryCode == "INT");
      this.teams = [...localSelection];
      if (this.internationalObj.team != null)
        this.countryImg = "./assets/logos/international/" + this.internationalObj.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      this.sortOutVersusTeamsInFixtures();
      this.getCountryListForSelection();
      this.loading = false;
    } else {
      this.teamsService.getAllTeams().add(() => {
        let localSelection = this.teamsService.allTeams.filter(x => x.countryCode == "INT");
        this.teams = [...localSelection];
        if (this.internationalObj.team != null)
          this.countryImg = "./assets/logos/international/" + this.internationalObj.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
        this.sortOutVersusTeamsInFixtures();
        this.getCountryListForSelection();
        this.loading = false;
      });
    }
  }

  getCountryListForSelection() {
    this.countries = [];
    let uniqueCountries = [...new Set(this.teams.map(x => x.team))];
    uniqueCountries.forEach(c => {
      if (c != "") {
        let country = this.teams.filter(x => x.team == c)[0];
        this.countries.push({ country: country.team, countryCode: country.countryCode });
      }
    });
    this.selectedCountry = this.countries[0];
  }

  getCountryImage() {
    return this.selectedCountry.country.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_")
  }

  updatePositionLists() {
    this.currentSquad = this.utilities.sortInternationalSquadByPosThenCaps(this.internationalObj.squad.filter(x => x.inCurrentSquad));
    this.currentSquadGKs = this.currentSquad.filter(x => x.accentSeverity == "warn");
    this.currentSquadDFs = this.currentSquad.filter(x => x.accentSeverity == "danger");
    this.currentSquadMFs = this.currentSquad.filter(x => x.accentSeverity == "success");
    this.currentSquadSTs = this.currentSquad.filter(x => x.accentSeverity == "info");
  }

  sortOutVersusTeamsInFixtures() {
    this.nextGameIndex = this.internationalObj.fixtures.filter(x => x.result?.length == 0).length == 0 ? -1 : this.internationalObj.fixtures.filter(x => x.result?.length == 0)[0].id;
    this.internationalObj.fixtures.forEach(f => {
      f.versusTeamObj = this.teams.filter(x => x.team == f.versusTeam)[0];
      if (f.versusTeamObj !== undefined)
        f.versusTeamObj.imgPath = "./assets/logos/international/" + f.versusTeam?.toString().toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      f.teams = this.teams;
    });
  }

  showFixtureDeleteBtn() {
    this.internationalObj.fixtures.forEach(f => {
      if (f.result !== undefined && f.result.length > 0)
        f.showBin = false;
      else
        f.showBin = true;
    });
  }

  checkVersusTeam(fixture: any) {
    fixture.versusTeam = fixture.versusTeamObj.team;
    fixture.edited = true;
    this.setPendingChanges('fixture-edit');
  }

  setPositionsList(fromLoad: boolean = false) {
    switch (this.internationalObj.formation) {
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
        this.positions = ["GK", "RWB", "RB", "CB", "LB", "LWB", "CDM", "RM", "CM", "LM", "RAM", "CAM", "LAM", "RW", "ST", "LW"];
        break;
    }

    if (!fromLoad) this.setPendingChanges('basic');
  }

  getScorers(fixture: CurrentSeasonFixtureObj) {
    let comma = /\,/gi;
    return fixture.scorers?.replace(comma, "<br />");
  }

  populateFullMenuList() {
    this.menuItems = [
      { label: 'Change Position', icon: 'pi pi-map-marker', command: () => { this.editPlayerPos(this.selectedPlayer); } },
      { label: 'Change Club', icon: 'pi pi-briefcase', command: () => { this.editPlayerCurrentClub(this.selectedPlayer); } },
      { label: 'Add to Current Squad', icon: 'pi pi-thumbs-up', command: () => { this.addPlayerToSquad(this.selectedPlayer); } },
      { label: 'Remove from Current Squad', icon: 'pi pi-thumbs-down', command: () => { this.removePlayer(this.selectedPlayer); } }
    ];
    this.menuShowing = false;
  }

  populateMenuListForPlayer() {
    this.populateFullMenuList();
    if (this.selectedPlayer != undefined) this.menuItems = this.getItemMenuOptions();
  }

  getItemMenuOptions(): any {
    let playerMenuList: MenuItem[] = Object.assign([], this.menuItems);

    //Is player in current squad?
    if (this.selectedPlayer.inCurrentSquad)
      playerMenuList = playerMenuList.filter(x => x.label != "Add to Current Squad");
    else
      playerMenuList = playerMenuList.filter(x => x.label != "Remove from Current Squad");

    this.menuShowing = true;
    return playerMenuList;
  }

  addNewPlayer() {
    this.modalParam = "";
    this.modalOrder = 1;
    this.showModal = true;
    this.cmTrackerService.triggerNewPlayerModal({ setting: "", order: 1, international: true });
    this.modalMode = "add-new-player-modal";
    this.modalHeader = "Add New Player";
  }

  confirmNewPlayer(newPlayerDeets: any) {
    let newPlayer = Object.assign({}, newPlayerDeets.player);
    newPlayer.accentSeverity = this.formatService.workOutAccentColour(newPlayer.position);
    newPlayer.inCurrentSquad = true;
    this.internationalObj.squad.push(newPlayer);
    this.updatePositionLists();

    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-new");
    this.showModal = false;
  }

  addPlayerToSquad(player: InternationalsPlayerObj) {
    this.internationalObj.squad.filter(x => x.id == player.id)[0].inCurrentSquad = true;
    this.internationalObj.squad.filter(x => x.id == player.id)[0].edited = true;
    this.updatePositionLists();
    this.setPendingChanges("squad-edit");
    this.cmTrackerService.triggerSquadChange();
  }

  removePlayer(player: InternationalsPlayerObj) {
    this.internationalObj.squad.filter(x => x.id == player.id)[0].inCurrentSquad = false;
    this.internationalObj.squad.filter(x => x.id == player.id)[0].edited = true;
    this.updatePositionLists();
    this.setPendingChanges("squad-edit");
    this.cmTrackerService.triggerSquadChange();
  }

  editPlayerPos(player: InternationalsPlayerObj) {
    this.modalParam = player;
    this.showModal = true;
    this.cmTrackerService.triggerEditPositionModal(player);
    this.modalMode = "change-position-modal";
    this.modalHeader = "Change " + player.player + "'s Position";
  }

  confirmPosChange(changes: any) {
    let player = changes.player;
    this.internationalObj.squad.filter(x => x.id == player.id)[0] = player;
    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-edit");
    this.showModal = false;
  }

  editPlayerCurrentClub(player: InternationalsPlayerObj) {
    this.modalParam = player;
    this.showModal = true;
    this.cmTrackerService.triggerEditClubModal(player);
    this.modalMode = "change-club-modal";
    this.modalHeader = "Change " + player.player + "'s Current Club";
  }

  confirmClubChange(changes: any) {
    let player = changes.player;
    this.internationalObj.squad.filter(x => x.id == player.id)[0] = player;
    this.internationalObj.squad.filter(x => x.id == player.id)[0].currentClubImgPath = changes.player.currentClub ?
      this.teamsService.getTeamImgFromJustTeamName(changes.player.currentClub) : "";
    this.cmTrackerService.triggerSquadChange();
    this.setPendingChanges("squad-edit");
    this.showModal = false;
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
    this.internationalObj.fixtures.filter(x => x.id == results.fixture.id)[0] = results.fixture;
    this.setPendingChanges("fixture-edit");

    //Update league stats
    let fixtureList = this.internationalObj.fixtures.filter(x => x.competition == results.fixture.competition);
    if ((this.utilities.checkIsKnockoutGame(results.fixture, fixtureList) && results.fixture.result == "L") || results.fixture.venue == "N") {
      if ((results.fixture.competition == "FA Cup" && fixtureList.filter(x => x.competition == "FA Cup" && x.venue == "N").length > 1) || results.fixture.result == "L") {
        fixtureList.filter(x => x.result?.length == 0).forEach(f => f.remove = true);
        this.internationalObj.cups.filter(x => x.cupName == results.fixture.competition)[0].out = true;
        if (results.fixture.venue == "N") {
          if (results.fixture.competition == "FA Cup" && fixtureList.filter(x => x.competition == "FA Cup" && x.venue == "N").length == 1)
            this.internationalObj.cups.filter(x => x.cupName == results.fixture.competition)[0].cupProgress = "Semi-Finals";
          else
            this.internationalObj.cups.filter(x => x.cupName == results.fixture.competition)[0].cupProgress = results.fixture.result == "W" ? "Winners" : "Runners-Up";

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
    if (this.internationalObj.fixtures !== undefined && this.internationalObj.fixtures[this.internationalObj.fixtures.length - 1]) {
      let temp = this.internationalObj.fixtures[this.internationalObj.fixtures.length - 1];
      order = temp.order ?? -1;
      order++;
    }

    // Get list of competitions
    let compNames = [...new Set(this.internationalObj.fixtures.map(f => f.competition))];
    if (compNames.indexOf("Friendly") == -1) compNames.push("Friendly");
    if (compNames.indexOf("FIFA World Cup Qualifiers") == -1) compNames.push("FIFA World Cup Qualifiers");
    if (compNames.indexOf("FIFA World Cup") == -1) compNames.push("FIFA World Cup");
    if (compNames.indexOf("UEFA Euros Qualifiers") == -1) compNames.push("UEFA Euros Qualifiers");
    if (compNames.indexOf("UEFA Euros") == -1) compNames.push("UEFA Euros");
    if (compNames.indexOf("FIFA Confederations Cup") == -1) compNames.push("FIFA Confederations Cup");

    // Push to Fixtures list
    this.internationalObj.fixtures.push({
      id: 0, competition: "", competitions: compNames, order: order, result: "", formation: "", squad: "",
      scorers: "", venue: "", versusTeam: "", versusTeamStyle: "", added: true, edited: false, teams: this.teams
    });
    this.setPendingChanges('fixture-add');
  }

  editFixture(fixture: any) {
    this.internationalObj.fixtures.filter(x => x.id == fixture.id)[0].edited = true;
    this.setPendingChanges('fixture-edit');
  }

  removeFixture(fixture: any) {
    this.internationalObj.fixtures.filter(x => x.id == fixture.id)[0].remove = true;
    this.reorderFixtures();
    this.setPendingChanges("fixture-remove");
  }

  updatePlayerStats(playerList: any[], team: string) {
    playerList.forEach(p => {
      let player = this.internationalObj.squad.filter(x => x.id == p.player.id)[0];
      player.caps += 1;
      player.newCaps = 1;
      player.goals += p.goals;
      player.newGoals = p.goals;
      player.rating += p.rating;
      player.ratingDisplay = player.rating !== undefined ? Math.round((player.rating / player.caps) * 100) / 100 : 0;
      player.edited = true;
      this.internationalObj.teamPlayerStats?.push({ playerId: p.player.id, team: team, caps: 1, goals: p.goals, rating: p.rating });
    });

    this.internationalObj.squad.filter(x => x.inCurrentSquad).forEach(s => {
      s.callUps += 1;
      s.edited = true;
    });

    this.topScorers = this.utilities.sortInternationalSquadByTopScorer(this.internationalObj.squad);
    this.internationalObj.squad = this.utilities.sortInternationalSquadByPosThenCaps(this.internationalObj.squad);
    this.setPendingChanges("squad-edit");
    this.setPendingChanges("team-stats");
  }

  setPendingChanges(section: string) {
    this.pendingChanges = true;

    switch (section.toLowerCase()) {
      case "cup":
        this.internationalObj.pendingChanges.cupChanges = true;
        break;
      case "fixture-add":
        this.internationalObj.pendingChanges.fixtureAdd = true;
        break;
      case "fixture-edit":
        this.internationalObj.pendingChanges.fixtureChanges = true;
        break;
      case "fixture-remove":
        this.internationalObj.pendingChanges.fixtureRemovals = true;
        break;
      case "squad-edit":
        this.internationalObj.pendingChanges.squadChanges = true;
        break;
      case "squad-new":
        this.internationalObj.pendingChanges.squadAdditions = true;
        break;
      case "team-stats":
        this.internationalObj.pendingChanges.teamPlayerStatsChanges = true;
        break;
    }
  }

  save() {
    if (this.pendingChanges) {
      this.reorderFixtures();
      this.saving = true;

      this.http.put<boolean>(this.baseUrl + "internationals", this.internationalObj).subscribe(result => {
        this.messageService.add({ severity: "success", summary: "Success!", detail: "Your changes have been successfully saved!" });
        this.saving = false;
        this.resetPendingChanges();
      }, error => {
        console.log("ERROR!", error);
      });
    }
  }

  reorderFixtures() {
    this.internationalObj.fixtures.filter(x => !x.remove).forEach((f, i) => {
      if (f.order != i + 1) f.edited = true;
      f.order = i + 1;
      this.setPendingChanges("fixture-edit");
    })
  }

  resignJob() {
    if (!confirm("Resign from the " + this.internationalObj.team + " job? This can't be undone - there's no history kept for international jobs the way there is for clubs."))
      return;

    this.http.delete<boolean>(this.baseUrl + "internationals", { params: { careerId: this.careerId } }).subscribe(() => {
      this.pendingChanges = false;
      this.ngOnInit();
    }, error => console.error(error));
  }

  resetPendingChanges() {
    this.pendingChanges = false;
    this.ngOnInit();
  }

  moveCountry(movement: number) {
    //Movement: -1 = back, 1 = forward
    let index = this.countries.map(x => { return x.country }).indexOf(this.selectedCountry.country);
    if (index == 0 && movement == -1) index = this.countries.length - 1;
    else if (index == this.countries.length - 1 && movement == 1) index = 0;
    else if (movement == -1) index -= 1;
    else index += 1;

    this.selectedCountry = this.countries[index];
  }

  randomCountry() {
    let rndCountryNum = Math.floor(Math.random() * this.countries.length) + 1;
    this.selectedCountry = this.countries[rndCountryNum - 1];
  }

  confirmCountry() {
    let saveObj = {
      careerId: this.cmTrackerService.getCareerModeId(), countryCode: this.selectedCountry.countryCode,
      team: this.selectedCountry.country, year: this.cmTrackerService.getCareerModeYear(), cups: [], league: "",
      internationals: true, cssStyles: "",
    };

    this.http.post<void>(this.baseUrl + "careerhub", saveObj).subscribe(() => {
      this.resetPendingChanges();
    }, error => {
      console.log("ERROR!", error);
    });
  }

  backToHistory() {
    if (this.overviewBackEmit != undefined) this.overviewBackEmit.emit();
  }

  switchToClubView() {
    if (this.switchModeEmit != undefined) this.switchModeEmit.emit();
  }

  changeTab(tabNum: any) {
    this.activeTabIndex = tabNum;

    if (tabNum == 0) {
      //Panel is hidden (display:none) until Angular finishes showing it - wait a tick so
      //clientHeight reads the real, visible size rather than 0
      setTimeout(() => this.calculateSquadListRows(), 0);
    }
  }

  @HostListener('window:resize')
  onWindowResize() {
    if (this.activeTabIndex == 0) this.calculateSquadListRows();
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
