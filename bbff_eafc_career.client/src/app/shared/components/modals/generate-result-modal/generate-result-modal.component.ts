//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonFixtureObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';
import { TeamShirtComponent } from '../../team-shirt/team-shirt.component';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'generate-result-modal',
  templateUrl: './generate-result-modal.template.html',
  styleUrls: ['../../../../../styles.css', './generate-result-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, FormsModule, InputNumberModule, RadioButtonModule, SelectModule, TeamShirtComponent]
})

export class GenerateResultModalComponent {

  //Declare input and output variables
  @Input() fixtureInit!: CurrentSeasonFixtureObj;
  @Input() ourTeam!: string;
  @Input() ourTeamCss!: string;
  @Input() squad!: any[];
  @Input() formation!: string;
  @Input() international: boolean = false;
  @Output() resultEmit = new EventEmitter<any>();

  //Declare result display variables
  homeTeam: string = "";
  homeCss: string = "";
  homeLogo: string = "";
  homePrimary: string = "";
  homeSecondary: string = "";
  homeTertiary: string = "";
  homeScore: number = 0;
  awayTeam: string = "";
  awayCss: string = "";
  awayLogo: string = "";
  awayPrimary: string = "";
  awaySecondary: string = "";
  awayTertiary: string = "";
  awayScore: number = 0;
  players: any[] = [];
  includePenalties: boolean = false;
  penaltyWinner: string = "";
  validResults: boolean = false;
  invalidReasons: string = "";

  //Declare other variables
  fixture!: CurrentSeasonFixtureObj;
  loading: boolean = false;
  generateResultModalEvent!: Subscription;
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;

  constructor(private cmTrackerService: CareerModeTrackerService, private teamsService: TeamsService, private utilities: UtilitiesService) { }

  ngOnInit() {
    this.freshModal(this.fixtureInit);

    this.generateResultModalEvent = this.cmTrackerService.resultsModal.subscribe(x => {
      this.freshModal(x);
    });
  }

  ngOnDestroy() {
    if (this.generateResultModalEvent !== undefined) this.generateResultModalEvent.unsubscribe();
  }

  freshModal(fixture: CurrentSeasonFixtureObj) {
    let seasonObj = this.international ? this.cmTrackerService.getCareerModeInternationalObj() : this.cmTrackerService.getCareerModeSeasonObj();
    this.includePenalties = !this.utilities.checkIsLeagueGame(fixture) && !fixture.competition.toLowerCase().startsWith("friendly")
      && !fixture.competition.toLowerCase().startsWith("uefa") && !fixture.competition.toLowerCase().startsWith("conmebol")
    this.fixture = fixture;
    this.homeScore = 0;
    this.awayScore = 0;

    if (this.fixture.venue == "A") {    
      this.homeTeam = this.fixture.versusTeam ?? "";
      this.homeCss = this.fixture.versusTeamStyle ?? "";
      this.homeLogo = this.fixture.versusTeamObj.imgPath;
      this.homePrimary = this.fixture.versusTeamObj.primaryColour ?? "";
      this.homeSecondary = this.fixture.versusTeamObj.secondaryColour ?? "";
      this.homeTertiary = this.fixture.versusTeamObj.tertiaryColour ?? "";
      this.awayTeam = this.ourTeam;
      this.awayCss = seasonObj.teamCSSStyles ?? "";
      this.awayPrimary = seasonObj.primaryColour ?? "";
      this.awaySecondary = seasonObj.secondaryColour ?? "";
      this.awayTertiary = seasonObj.tertiaryColour ?? "";
      this.awayLogo = "./assets/logos/" + (this.international ? "international" : this.teamsService.getCountryFromCode(seasonObj.countryCode).toLowerCase()) + "/" +
        this.ourTeam.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
    } else {
      this.homeTeam = this.ourTeam;
      this.homeCss = seasonObj.teamCSSStyles ?? "";
      this.homePrimary = seasonObj.primaryColour ?? "";
      this.homeSecondary = seasonObj.secondaryColour ?? "";
      this.homeTertiary = seasonObj.tertiaryColour ?? "";
      this.homeLogo = "./assets/logos/" + (this.international ? "international" : this.teamsService.getCountryFromCode(seasonObj.countryCode).toLowerCase()) + "/" +
        this.ourTeam.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
      this.awayTeam = this.fixture.versusTeam ?? "";
      this.awayCss = this.fixture.versusTeamStyle ?? "";
      this.awayLogo = this.fixture.versusTeamObj.imgPath;
      this.awayPrimary = this.fixture.versusTeamObj.primaryColour ?? "";
      this.awaySecondary = this.fixture.versusTeamObj.secondaryColour ?? "";
      this.awayTertiary = this.fixture.versusTeamObj.tertiaryColour ?? "";
    }

    switch (this.formation) {
      case "4-1-2-1-2 Narrow":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CM", "CAM", "ST", "ST"]);
        break;
      case "4-1-2-1-2 Wide":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "RM", "LM", "CAM", "ST", "ST"]);
        break;
      case "4-1-3-2":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "RM", "CM", "LM", "ST", "ST"]);
        break;
      case "4-1-4-1":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "RM", "CM", "CM", "LM", "ST"]);
        break;
      case "4-2-3-1":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "CDM", "RAM", "CAM", "LAM", "ST"]);
        break;
      case "4-2-4":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CM", "CM", "RW", "ST", "ST", "LW"]);
        break;
      case "4-3-3 Attack":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CM", "CM", "CAM", "RW", "ST", "LW"]);
        break;
      case "4-3-3 Defend":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "CM", "CM", "RW", "ST", "LW"]);
        break;
      case "4-3-3 Flat":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CM", "CM", "CM", "RW", "ST", "LW"]);
        break;
      case "4-3-3 Mixed":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "CDM", "CAM", "CAM", "RW", "ST", "LW"]);
        break;
      case "4-4-1-1":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "CAM", "ST"]);
        break;
      case "4-4-2":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "LM", "ST", "ST"]);
        break;
      case "4-5-1 Attack":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "RM", "CM", "LM", "CAM", "CAM", "ST"]);
        break;
      case "4-5-1 Defend":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "LB", "RM", "CM", "CM", "CM", "LM", "ST"]);
        break;
      case "5-4-1":
        this.resetPlayersList(["GK", "RB", "CB", "CB", "CB", "LB", "RM", "CM",  "CM", "LM", "ST"]);
        break;
    }
  }

  resetPlayersList(positions: string[]) {
    this.players = [];

    positions.forEach(pos => {
      let options = this.utilities.sortSquadByOrder(this.utilities.filterSquad(this.squad, pos, true));
      if (this.international) options = options.filter(x => x.inCurrentSquad);
      this.players.push({ pos: pos, player: "", options: options, goals: 0, rating: 0, deleteable: false });
    });

    let options = this.squad.filter(x => !x.loanedOut && !x.transferListed && !x.loanListed && !x.preContract && !x.preContractOut && !x.remove);
    if (this.international) options = options.filter(x => x.inCurrentSquad);
    for (var i = 1; i <= (this.international && this.fixture.competition.toLowerCase().startsWith("friendly") ? 9 : this.fixture.competition.toLowerCase().startsWith("community") ? 6 : 5); i++) {
      this.players.push({ pos: "SUB", player: "", options: options, goals: 0, rating: 0, deleteable: true });
    }

    this.validateResults();
  }

  removeSub(index: number) {
    this.players.splice(index, 1);
  }

  //Groups of players by formation. Extracted directly from the real formation-view
  //components (e.g. four-two-three-one-view.template.html) rather than assumed -
  //each formation's rows only depend on which UNIQUE position codes appear, not how
  //many players share each one. Each player slot still gets its own card (e.g. 5-4-1's
  //three CBs render as three separate CB cards side by side, not one shared list) -
  //this map only decides which row each code's card(s) belong to.
  formationRowsMap: { [key: string]: string[][] } = {
    "4-1-2-1-2 Narrow": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["CM"], ["CAM"], ["ST"]],
    "4-1-2-1-2 Wide": [["GK"], ["RB", "CB", "LB"], ["RM", "CDM", "LM"], ["CAM"], ["ST"]],
    "4-1-3-2": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["RM", "CM", "LM"], ["ST"]],
    "4-1-4-1": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["RM", "CM", "LM"], ["ST"]],
    "4-2-3-1": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["RAM", "CAM", "LAM"], ["ST"]],
    "4-2-4": [["GK"], ["RB", "CB", "LB"], ["CM"], ["RW", "ST", "LW"]],
    "4-3-3 Attack": [["GK"], ["RB", "CB", "LB"], ["CM"], ["CAM"], ["RW", "ST", "LW"]],
    "4-3-3 Defend": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["CM"], ["RW", "ST", "LW"]],
    "4-3-3 Flat": [["GK"], ["RB", "CB", "LB"], ["CM"], ["RW", "ST", "LW"]],
    "4-3-3 Mixed": [["GK"], ["RB", "CB", "LB"], ["CDM"], ["CAM"], ["RW", "ST", "LW"]],
    "4-4-1-1": [["GK"], ["RB", "CB", "LB"], ["RM", "CM", "LM"], ["CAM"], ["ST"]],
    "4-4-2": [["GK"], ["RB", "CB", "LB"], ["RM", "CM", "LM"], ["ST"]],
    "4-5-1 Attack": [["GK"], ["RB", "CB", "LB"], ["RM", "CM", "LM"], ["CAM"], ["ST"]],
    "4-5-1 Defend": [["GK"], ["RB", "CB", "LB"], ["RM", "CM", "LM"], ["ST"]],
    "5-4-1": [["GK"], ["RB", "CB", "LB"], ["RM", "CM", "LM"], ["ST"]]
  };

  positionColours: { [key: string]: string } = {
    "GK": "pos-gk-background",
    "RB": "pos-df-background", "CB": "pos-df-background", "LB": "pos-df-background",
    "CDM": "pos-mf-background", "CM": "pos-mf-background", "CAM": "pos-mf-background",
    "RM": "pos-mf-background", "LM": "pos-mf-background", "RAM": "pos-mf-background", "LAM": "pos-mf-background",
    "RW": "pos-st-background", "LW": "pos-st-background", "ST": "pos-st-background"
  };

  get formationRows(): string[][] {
    return this.formationRowsMap[this.formation] ?? [];
  }

  getPlayersForPosition(pos: string) {
    return this.players.filter(p => !p.deleteable && p.pos == pos);
  }

  validateResults() {
    //Check scores
    if (this.homeScore < 0 || this.awayScore < 0) {
      this.invalidReasons = this.homeScore < 0 && this.awayScore < 0 ? "Both scores are invalid!" : this.homeScore < 0 ? "Home score is invalid!" : "Away score is invalid!";
      this.validResults = false;
    }
    //Check squad spot numbers
    else if (this.players.filter(x => x.pos != "SUB" && (x.player.length > 0 || (x.player.player !== undefined && x.player.player.length > 0))).length < 11) {
      this.invalidReasons = "Not enough players selected to play!";
      this.validResults = false;
    } else {
      //Check duplicate squad spots
      let selectedPlayers = this.players.filter(x => x.player.player !== undefined && x.player.player.length > 0).map(x => { return x.player.player });
      let duplicates = selectedPlayers.filter((item, index) => selectedPlayers.indexOf(item) !== index);
      if (duplicates.length > 0) {
        this.invalidReasons = "Duplicate players in player slots: " + duplicates.join(", ");
        this.validResults = false;
      } else {
        this.invalidReasons = "";
        this.validResults = true;
      }
    }
  }

  saveResults() {
    this.fixture.edited = true;
    if (this.fixture.venue == "A") {
      this.fixture.ourScore = this.awayScore;
      this.fixture.versusScore = this.homeScore;
      this.fixture.result = (this.awayScore > this.homeScore) || this.penaltyWinner == "Away" ? "W" : (this.homeScore > this.awayScore) || this.penaltyWinner == "Home" ? "L" : "D";
    } else {
      this.fixture.ourScore = this.homeScore;
      this.fixture.versusScore = this.awayScore;
      this.fixture.result = (this.homeScore > this.awayScore) || this.penaltyWinner == "Home" ? "W" : (this.awayScore > this.homeScore) || this.penaltyWinner == "Away" ? "L" : "D";
    }

    //Get scorers
    this.players = this.players.filter(x => x.player.player !== undefined && x.player.player.length > 0);
    let scorers = this.players.filter(x => x.goals > 0).sort((a, b) => b.goals - a.goals)
      .map(x => { return x.player.player + (x.goals > 1 ? " x" + x.goals : "") });
    this.fixture.scorers = scorers.join(", ");

    if (this.international) {
      let players = this.players.map(x => { return x.pos + ": " + x.player.player + "(" + x.rating + ")" });
      this.fixture.formation = this.formation;
      this.fixture.squad = players.join(", ");
    }

    this.resultEmit.emit({ fixture: this.fixture, players: this.players });
  }
}

