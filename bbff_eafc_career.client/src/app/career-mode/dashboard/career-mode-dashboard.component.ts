//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ChartModule } from 'primeng/chart';
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { ChartsService } from '../../shared/services/charts.service';
import {
  CareerOverviewObj, CupObj, CurrentSeasonLeaguePosObj, HeadToHeadPlayerTeamGoalObj, HeadToHeadTeamResultObj, PlayerSeasonStatObj,
  PlayerStatObj, TransferLogObj, TrophyCabinetObj
} from '../../app.classes';
import { TableTileModalComponent } from '../../shared/components/modals/table-tile-modal/table-tile-modal.component';
import { TeamDashboardTileComponent } from '../../shared/components/team-dashboad-tile/team-dashboard-tile.component';
import { TeamsService } from '../../shared/services/teams.service';
import { TrophyCabinetModalComponent } from '../../shared/components/modals/trophy-cabinet-modal/trophy-cabinet-modal.component';
import { UtilitiesService } from '../../shared/services/utilities.service';

@Component({
  selector: 'career-mode-dashboard',
  templateUrl: './career-mode-dashboard.template.html',
  styleUrls: ['../../../styles.css', './career-mode-dashboard.styles.css'],
  standalone: true,
  imports: [AvatarModule, ChartModule, CommonModule, DialogModule, ProgressSpinnerModule, TableTileModalComponent, TeamDashboardTileComponent,
    TrophyCabinetModalComponent]
})

export class CareerModeDashboardComponent {

  //Declare chart data variables
  resultSummaryData: any;
  goalSummaryData: any;
  moneyLogChartData: any;
  leaguePosGWData: any;
  leaguePosSeasonData: any;

  //Declare chart option variables
  resultSummaryOptions: any;
  goalSummaryOptions: any;
  moneyLogChartOptions: any;
  leaguePosGWOptions: any;
  leaguePosSeasonOptions: any;

  //Declare dashboard lists
  allPlayers: PlayerStatObj[] = [];
  allTimeAppsList: PlayerStatObj[] = [];
  allTimeGoalsList: PlayerStatObj[] = [];
  allTimeGoalsVsTeamList: HeadToHeadPlayerTeamGoalObj[] = [];
  mostSeasonAppsList: PlayerSeasonStatObj[] = [];
  mostSeasonGoalsList: PlayerSeasonStatObj[] = [];
  gameWeekPositionList: CurrentSeasonLeaguePosObj[] = [];
  leaguePositionList: CareerOverviewObj[] = [];
  trophyCabinet: TrophyCabinetObj[] = [];

  //Declare dashboard variables
  careerOverviewRow!: CareerOverviewObj;
  mostGPTeam!: HeadToHeadTeamResultObj;
  mostWinsTeam!: HeadToHeadTeamResultObj;
  mostDrawsTeam!: HeadToHeadTeamResultObj;
  mostLossesTeam!: HeadToHeadTeamResultObj;
  mostPointsTeam!: HeadToHeadTeamResultObj;
  mostPPGTeam!: HeadToHeadTeamResultObj;
  mostGFTeam!: HeadToHeadTeamResultObj;
  mostGATeam!: HeadToHeadTeamResultObj;
  bestGDTeam!: HeadToHeadTeamResultObj;
  mostGFPGTeam!: HeadToHeadTeamResultObj;
  mostGAPGTeam!: HeadToHeadTeamResultObj;
  bestGDPGTeam!: HeadToHeadTeamResultObj;
  totalMoneySpent: number = 0;
  totalMoneyReceived: number = 0;
  finalProfit: number = 0;
  finalProfitDisplay: string = "";
  totalGames: number = 0;
  leagueWins: number = 0;
  domesticCupWins: number = 0;
  promotions: number = 0;
  relegations: number = 0;
  europeanCupWins: number = 0;
  americanCupWins: number = 0;
  internationalCupWins: number = 0;

  //Declare modal variables
  showModal: boolean = false;
  modalMode: string = "";
  modalHeader: string = "";
  tileHeader: string = "";
  tileProp: string = "";

  //Declare other variables
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;
  careerId!: number;
  year!: number;
  loading: boolean = false;
  cancelled: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private charts: ChartsService, private http: HttpClient, private router: Router,
    private teamsService: TeamsService, private utilities: UtilitiesService, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let cmid = this.cmTrackerService.getCareerModeId();
    if (cmid == undefined || cmid == 0)
      this.router.navigate(["/"]);

    this.careerId = cmid;
    this.year = this.cmTrackerService.getCareerModeYear();
    this.setupDashboard();
  }

  setupDashboard() {
    this.loading = true;

    this.getPlayerStats().add(() => {
      if (!this.cancelled) {
        this.getPlayerHeadToHeadStats().add(() => {
          if (!this.cancelled) {
            this.getCareerOverviewStats().add(() => {
              this.getTransferStats().add(() => {
                this.getTeamHeadToHeadStats().add(() => {
                  if (!this.cancelled) {
                    this.getLeaguePosStats().add(() => {
                      this.haveWeGotEnoughData();
                      this.loading = false;
                    });
                  }
                  else this.loading = false;
                });
              });
            });
          }
          else this.loading = false;
        });
      }
      else this.loading = false;
    });
  }

  getCareerOverviewStats(): Subscription {
    return this.http.get<CareerOverviewObj[]>(this.baseUrl + "careeroverview", { params: { careerId: this.cmTrackerService.getCareerModeId() } }).subscribe(result => {
      result.forEach(r => {
        if (r.team != "-") {
          r.teamImagePath = "./assets/logos/" + (r.countryCode == "INT" ? "international" : this.teamsService.getCountryFromCode(r.countryCode !== undefined ? r.countryCode : "").toLowerCase())
            + "/" + r.team?.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
          r.leaguePosDisplay = r.leaguePos == 0 ? "In Progress" : r.leaguePos?.toString();
        }
      });

      this.leaguePositionList = result;
      this.careerOverviewRow = {
        wins: result.reduce((sum, current) => sum + (current.wins !== undefined ? current.wins : 0), 0),
        draws: result.reduce((sum, current) => sum + (current.draws !== undefined ? current.draws : 0), 0),
        losses: result.reduce((sum, current) => sum + (current.losses !== undefined ? current.losses : 0), 0),
        goalsScored: result.reduce((sum, current) => sum + (current.goalsScored !== undefined ? current.goalsScored : 0), 0),
        goalsAgainst: result.reduce((sum, current) => sum + (current.goalsAgainst !== undefined ? current.goalsAgainst : 0), 0)
      };
      this.getTrophyCabinet();

      this.setupResultsSummaryChart();
      this.setupGoalsSummaryChart();
      this.setupLeaguePosSeasonChart();
    });
  }

  getLeaguePosStats(): Subscription {
    return this.http.get<CurrentSeasonLeaguePosObj[]>(this.baseUrl + "leagueposition", { params: { careerId: this.careerId } }).subscribe(result => {
      this.gameWeekPositionList = result;

      this.setupLeaguePosGWChart();
    });
  }

  getPlayerHeadToHeadStats(): Subscription {
    return this.http.get<HeadToHeadPlayerTeamGoalObj[]>(this.baseUrl + "playerheadtohead", { params: { careerId: this.careerId } }).subscribe(result => {
      this.allTimeGoalsVsTeamList = result.sort((a, b) => b.goals - a.goals).slice(0, 5);
      let temp = this.allTimeGoalsVsTeamList.filter(x => x.goals == 0);
      if (this.allTimeGoalsVsTeamList.filter(x => x.goals == 0).length > 0) this.cancelled = true;
      else {
        this.allTimeGoalsVsTeamList.forEach(p => {
          p.teamImagePath = "./assets/logos/" + (p.teamCountryCode == "INT" ? "international" : this.teamsService.getCountryFromCode(p.teamCountryCode).toLowerCase())
            + "/" + p.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
        });
      }
    });
  }

  getPlayerStats(): Subscription {
    return this.http.get<PlayerStatObj[]>(this.baseUrl + "playerstats", { params: { careerId: this.careerId, year: this.year } }).subscribe(result => {
      if (result.length == 0) this.cancelled = true;
      else {
        result.forEach(p => {
          p.totalCaps = p.totalCaps + p.totalInternationalCaps;
          p.totalGoals = p.totalGoals + p.totalInternationalGoals;

          for (var i = 0; i < p.caps.length; i++) {
            this.mostSeasonAppsList.push({
              name: p.name, imagePath: p.imagePath, year: i + 1, goals: 0,
              caps: (p.caps[i] != undefined ? p.caps[i] : 0) + (p.internationalCaps[i] != undefined ? p.internationalCaps[i] : 0)
            });
            this.mostSeasonGoalsList.push({
              name: p.name, imagePath: p.imagePath, year: i + 1, caps: 0,
              goals: (p.goals[i] != undefined ? p.goals[i] : 0) + (p.internationalGoals[i] != undefined ? p.internationalGoals[i] : 0)
            });
          }
        });
        this.allPlayers = result;
        this.allTimeAppsList = result.sort((a, b) => b.totalCaps - a.totalCaps).slice(0, 5);
        this.allTimeGoalsList = result.sort((a, b) => b.totalGoals - a.totalGoals).slice(0, 5);
        this.mostSeasonAppsList = this.mostSeasonAppsList.sort((a, b) => b.caps - a.caps).slice(0, 3);
        this.mostSeasonGoalsList = this.mostSeasonGoalsList.sort((a, b) => b.goals - a.goals).slice(0, 3);
      }
    });
  }

  getTeamHeadToHeadStats(): Subscription {
    return this.http.get<HeadToHeadTeamResultObj[]>(this.baseUrl + "teamheadtohead", { params: { careerId: this.careerId } }).subscribe(result => {
      if (result.length < 5) this.cancelled = true;
      else {
        result.forEach(r => {
          r.teamImagePath = "./assets/logos/" + (r.teamCountryCode == "INT" ? "international" : this.teamsService.getCountryFromCode(r.teamCountryCode).toLowerCase())
            + "/" + r.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
        });

        //let tempResults: HeadToHeadTeamResultObj[] = Object.assign([], result);
        this.mostGPTeam = this.getTeamStatForH2H("gamesPlayed", result);
        this.mostWinsTeam = this.getTeamStatForH2H("wins", result);
        this.mostDrawsTeam = this.getTeamStatForH2H("draws", result);
        this.mostLossesTeam = this.getTeamStatForH2H("losses", result);
        this.mostGFTeam = this.getTeamStatForH2H("goalsScored", result);
        this.mostGATeam = this.getTeamStatForH2H("goalsAgainst", result);
        this.bestGDTeam = this.getTeamStatForH2H("goalDifference", result);
        this.mostGFPGTeam = this.getTeamStatForH2H("avgGoalsScored", result);
        this.mostGAPGTeam = this.getTeamStatForH2H("avgGoalsAgainst", result);
        this.bestGDPGTeam = this.getTeamStatForH2H("avgGoalDifference", result);
        this.mostPointsTeam = this.getTeamStatForH2H("points", result);
        this.mostPPGTeam = this.getTeamStatForH2H("avgPoints", result);
      }
    });
  }

  getTeamStatForH2H(prop: string, results: HeadToHeadTeamResultObj[]): any {
    let tempResults: HeadToHeadTeamResultObj[] = Object.assign([], results);
    switch (prop.toLowerCase()) {
      case "gamesplayed":
        return tempResults.sort((a, b) => b.gamesPlayed - a.gamesPlayed).slice(0, 1)[0];
      case "wins":
        return tempResults.sort((a, b) => b.wins - a.wins).slice(0, 1)[0];
      case "draws":
        return tempResults.sort((a, b) => b.draws - a.draws).slice(0, 1)[0];
      case "losses":
        return tempResults.sort((a, b) => b.losses - a.losses).slice(0, 1)[0];
      case "goalsscored":
        return tempResults.sort((a, b) => b.goalsScored - a.goalsScored).slice(0, 1)[0];
      case "goalsagainst":
        return tempResults.sort((a, b) => b.goalsAgainst - a.goalsAgainst).slice(0, 1)[0];
      case "goaldifference":
        return tempResults.sort((a, b) => b.goalDifference - a.goalDifference).slice(0, 1)[0];
      case "avggoalsscored":
        return tempResults.sort((a, b) => b.avgGoalsScored - a.avgGoalsScored).slice(0, 1)[0];
      case "avggoalsagainst":
        return tempResults.sort((a, b) => b.avgGoalsAgainst - a.avgGoalsAgainst).slice(0, 1)[0];
      case "avggoaldifference":
        return tempResults.sort((a, b) => b.avgGoalDifference - a.avgGoalDifference).slice(0, 1)[0];
      case "points":
        return tempResults.sort((a, b) => b.points - a.points).slice(0, 1)[0];
      case "avgpoints":
        return tempResults.sort((a, b) => b.avgPoints - a.avgPoints).slice(0, 1)[0];
      default:
        return null;
;
    }
  }

  getTransferStats(): Subscription {
    return this.http.get<TransferLogObj[]>(this.baseUrl + "transferlog", { params: { careerId: this.careerId } }).subscribe(result => {
      result.forEach(t => {
        if (t.fee > 0) {
          if (t.status == "In") this.totalMoneySpent += t.fee;
          else this.totalMoneyReceived += t.fee;
        }
      });
      this.finalProfit = this.totalMoneyReceived - this.totalMoneySpent;
      this.finalProfitDisplay = this.cmTrackerService.getCareerModeCurrency() + this.finalProfit.toLocaleString("en-US");

      this.setupMoneyLogChart();
    });
  }

  getTrophyCabinet() {
    this.leaguePositionList.filter(x => x.team != "-").forEach(lp => {
      this.getTrophyCabinetLeagueData(lp);
      if (lp.cups !== undefined && lp.cups !== null)
        lp.cups?.forEach(c => this.getTrophyCabinetCupData(c, lp.countryCode ?? ""));
    });
  }

  getTrophyCabinetCupData(cup: CupObj, countryCode: string) {
    //Get cup data
    if (cup.cupName.startsWith("UEFA")) countryCode = "UEFA";
    if (this.trophyCabinet.filter(x => x.cupName == cup.cupName).length == 0)
      this.trophyCabinet.push({
        cupName: cup.cupName, countryCode: countryCode, flagImgPath: "./assets/flags/" + countryCode + "_flag.jpg",
        compulsory: false, wins: 0, bestPlaced: 0, bestPlacedDisplay: ""
      });

    let cupCheck = this.trophyCabinet.filter(x => x.cupName == cup.cupName)[0];
    if (cup.cupProgress !== undefined && cup.cupProgress !== null && cup.cupProgress != "In Progress") {
      if (cup.cupProgress == "Winners") {
        cupCheck.wins += 1;
        if (countryCode == "UEFA") this.europeanCupWins += 1;
        else if (countryCode == "Conmebol") this.americanCupWins += 1;
        else this.domesticCupWins += 1;
      }
      let cupBestPlaced = this.getTrophyCabinetCupProgressCheck(cup.cupProgress);
      if (cupCheck.bestPlaced == 0 || cupCheck.bestPlaced < cupBestPlaced) {
        cupCheck.bestPlaced = cupBestPlaced;
        cupCheck.bestPlacedDisplay = cup.cupProgress;
      }
    }
  }

  getTrophyCabinetCupProgressCheck(result: string) {
    switch (result.toLowerCase()) {
      case "round 1":
      case "qualifying round":
        return 1;
      case "round 2":
      case "group stage":
        return 2;
      case "round 3":
      case "eliminator":
        return 3;
      case "round 4":
        return 4;
      case "round 5":
      case "last 16":
        return 5;
      case "round 6":
      case "quarter-finals":
        return 6;
      case "semi-finals":
        return 7;
      case "runners-up":
        return 8;
      case "winners":
        return 9;
      default:
        return 0;
    }
  }

  getTrophyCabinetLeagueData(season: CareerOverviewObj) {
    //Get league data
    if (season.league != "-" && this.trophyCabinet.filter(x => x.cupName == season.league).length == 0)
      this.trophyCabinet.push({
        cupName: season.league ?? "", countryCode: season.countryCode ?? "", flagImgPath: "./assets/flags/" + season.countryCode + "_flag.jpg",
        compulsory: true, wins: 0, bestPlaced: 0, bestPlacedDisplay: ""
      });

    let cupCheck = this.trophyCabinet.filter(x => x.cupName == season.league)[0];
    if (season.leaguePos !== undefined && season.leaguePos !== null && season.leaguePos != 0) {
      if (season.leaguePos == 1) {
        cupCheck.wins += 1;
        this.leagueWins += 1;
      }
      if (cupCheck.bestPlaced == 0 || cupCheck.bestPlaced > season.leaguePos) {
        cupCheck.bestPlaced = season.leaguePos;
        cupCheck.bestPlacedDisplay = this.utilities.getSuffix(season.leaguePos);
      }
      if (this.utilities.checkIsPromoted(season.league !== undefined ? season.league : "", season.leaguePos))
        this.promotions += 1;
    }
  }

  haveWeGotEnoughData() {
    if (this.allTimeAppsList.length < 5 || this.allTimeGoalsList.length < 5 || this.allTimeGoalsVsTeamList.length < 5 ||
      this.mostSeasonAppsList.length < 3 || this.mostSeasonGoalsList.length < 3)
      this.cancelled = true;
  }

  setupGoalsSummaryChart() {
    let xData = [{ label: 'Total GF', bgColor: '#00B050', data: [this.careerOverviewRow.goalsScored] },
    { label: 'Total GA', bgColor: '#FF0000', data: [this.careerOverviewRow.goalsAgainst] }];

    this.goalSummaryData = this.charts.buildBarChart([''], xData, []);
    this.goalSummaryOptions = this.charts.getStackedBarChartOptions(this.careerOverviewRow.goalsScored !== undefined && this.careerOverviewRow.goalsAgainst !== undefined ?
      this.careerOverviewRow.goalsScored + this.careerOverviewRow.goalsAgainst : 0, true);
  }

  setupLeaguePosGWChart() {
    let labelData: string[] = [];
    let graphData: any[] = [];
    const teams = [...new Set(this.gameWeekPositionList.map(gwp => gwp.team))];

    teams.forEach(t => {
      let style = this.gameWeekPositionList.filter(gwp => gwp.team == t)[0].cssStyles;
      let bgColor = style?.split(";")[0].replace("background-color: ", "");
      graphData.push({ label: t, color: bgColor, data: [] });
    });

    this.gameWeekPositionList.forEach(gwp => {
      labelData.push("Y" + gwp.year + " G" + gwp.gameWeek);

      graphData.filter(x => x.label == gwp.team)[0].data.push(gwp.position);
      graphData.filter(x => x.label != gwp.team).forEach(gd => {
        gd.data.push(null);
      });
    });

    this.leaguePosGWData = this.charts.buildLineChart(labelData, graphData);
    this.leaguePosGWOptions = this.charts.getLineChartOptions(1, 24, true);
  }

  setupLeaguePosSeasonChart() {
    let labelData: string[] = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y10', 'Y11', 'Y12', 'Y13', 'Y14', 'Y15'];
    let leaguePosData: any[] = [];
    this.leaguePositionList.forEach(lp => {
      if (lp.leaguePos == 0) leaguePosData.push(null);
      else leaguePosData.push(lp.leaguePos);
    });

    this.leaguePosSeasonData = this.charts.buildLineChart(labelData, [{ label: "Season", color: "#00FF00", data: leaguePosData }]);
    this.leaguePosSeasonOptions = this.charts.getLineChartOptions(1, 24, true);
  }

  setupMoneyLogChart() {
    let yData = [{ label: 'Money Spent', bgColor: '#000000', data: [this.totalMoneySpent] },
    { label: 'Money Received', bgColor: '#FF0000', data: [this.totalMoneyReceived] }];

    this.moneyLogChartData = this.charts.buildBarChart(["Total"], [], yData);
    this.moneyLogChartOptions = this.charts.getBarChartOptions(this.totalMoneySpent > this.totalMoneyReceived ? this.totalMoneySpent : this.totalMoneyReceived, true);
  }

  setupResultsSummaryChart() {
    let donutData = [{ data: this.careerOverviewRow.wins, bgColor: "#00B050", hoverBGColor: "#005C2A" },
      { data: this.careerOverviewRow.draws, bgColor: "#FFC000", hoverBGColor: "#926F00" },
      { data: this.careerOverviewRow.losses, bgColor: "#FF0000", hoverBGColor: "#AC0000" }]

    if (this.careerOverviewRow.wins !== undefined && this.careerOverviewRow.draws !== undefined && this.careerOverviewRow.losses !== undefined)
      this.totalGames = this.careerOverviewRow.wins + this.careerOverviewRow.draws + this.careerOverviewRow.losses;

    this.resultSummaryData = this.charts.buildDonutChart(['Wins', 'Draws', 'Losses'], donutData);
    this.resultSummaryOptions = this.charts.getDonutChartOptions(true);
  }

  expandTile(tile: string) {
    this.showModal = true;
    this.tileHeader = tile;

    if (tile == "Most Appearances") {
      this.modalHeader = "Most Appearances";
      this.modalMode = "table-tile-modal";
      this.tileProp = "totalCaps";
    } else if (tile == "Most Goals") {
      this.modalHeader = "Most Goals";
      this.modalMode = "table-tile-modal";
      this.tileProp = "totalGoals";
    } else if (tile == "Trophy Cabinet") {
      this.modalHeader = "Trophy Cabinet";
      this.modalMode = "trophy-cabinet-modal";
    }

    this.cmTrackerService.triggerTileModal({ header: this.modalHeader, prop: this.tileProp });
  }

}
