//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { MeterGroupModule } from 'primeng/metergroup';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { ChartsService } from '../../shared/services/charts.service';
import { FormattingService } from '../../shared/services/formatting.service';
import { HeadToHeadPlayerTeamGoalObj, HeadToHeadPlayerTeamGoalTidiedObj, HeadToHeadTeamResultObj } from '../../app.classes';
import { TeamsService } from '../../shared/services/teams.service';

@Component({
  selector: 'career-mode-head-to-head',
  templateUrl: './career-mode-head-to-head.template.html',
  styleUrls: ['../../../styles.css', './career-mode-head-to-head.styles.css'],
  standalone: true,
  imports: [AvatarModule, CommonModule, MeterGroupModule, ProgressSpinnerModule, TableModule, TabsModule, TagModule]
})

export class CareerModeHeadToHeadComponent {

  //Declare array variables
  teamResults: HeadToHeadTeamResultObj[] = [];
  teamColumns: HeadToHeadTeamResultObj[] = [];
  teamPieResultsData: { [name: string]: any } = {};
  playerGoalsList: HeadToHeadPlayerTeamGoalTidiedObj[] = [];

  //Declare chart option variables
  teamPieResultsOptions: any;

  //Declare other variables
  teamSearch: string = "";
  maxGoals: number = 0;
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;
  careerId!: number;
  loading: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private charts: ChartsService, private formatService: FormattingService,
    private http: HttpClient, private router: Router,
    private teamsService: TeamsService, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let cmid = this.cmTrackerService.getCareerModeId();
    if (cmid == undefined || cmid == 0)
      this.router.navigate(["/"]);

    this.careerId = cmid;
    this.populateHeadToHeadLists();
  }

  populateHeadToHeadLists() {
    this.loading = true;

    this.http.get<HeadToHeadTeamResultObj[]>(this.baseUrl + "teamheadtohead", { params: { careerId: this.careerId } }).subscribe(result => {
      //Team head-to-head
      this.teamResults = result;
      this.teamResults.forEach(tr => {
        tr.teamImagePath = "./assets/logos/" + (tr.teamCountryCode == "INT" ? "international" : this.teamsService.getCountryFromCode(tr.teamCountryCode).toLowerCase())
          + "/" + tr.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
        tr.goalsTotal = tr.goalsScored + tr.goalsAgainst;

        //Populate meters
        tr.resultMeterObj = [{ label: 'Wins', color: '#00B050', value: tr.wins },
          { label: 'Draws', color: '#FFC000', value: tr.draws },
          { label: 'Losses', color: '#FF0000', value: tr.losses }];
        tr.goalsMeterObj = [{ label: 'Goals For', color: '#00B050', value: tr.goalsScored },
          { label: 'Goals Against', color: '#FF0000', value: tr.goalsAgainst }];

        //Populate pie charts
        let donutData = [{ data: tr.wins, bgColor: "#00B050", hoverBGColor: "#005C2A" },
          { data: tr.draws, bgColor: "#FFC000", hoverBGColor: "#926F00" },
          { data: tr.losses, bgColor: "#FF0000", hoverBGColor: "#AC0000" }];
        this.teamPieResultsData[tr.team] = this.charts.buildDonutChart(['Wins', 'Draws', 'Losses'], donutData);
      });
      this.teamPieResultsOptions = this.charts.getDonutChartOptions(true);

      //Player head-to-head
      this.teamColumns = Object.assign([], this.teamResults);
      this.teamColumns = this.teamColumns.sort((a, b) => a.team.localeCompare(b.team));
      this.http.get<HeadToHeadPlayerTeamGoalObj[]>(this.baseUrl + "playerheadtohead", { params: { careerId: this.careerId } }).subscribe(result => {
        this.playerGoalsList = [];
        result = result.filter(x => x.goals > 0);

        result.forEach(p => {
          if (this.playerGoalsList.filter(x => x.playerId == p.playerID).length == 0) {
            this.playerGoalsList.push({
              playerId: p.playerID, playerName: p.playerName, playerImagePath: p.playerImagePath,
              position: p.position, posId: this.formatService.workOutPosId(p.position),
              accentSeverity: this.formatService.workOutAccentColour(p.position),
              totalGoals: 0, teams: [], meterObj: []
            })
          }
          this.playerGoalsList.filter(x => x.playerId == p.playerID)[0].teams.push({
            team: p.team, teamCssStyles: p.teamCssStyles, teamImagePath: p.teamImagePath, goals: p.goals
          });
          this.playerGoalsList.filter(x => x.playerId == p.playerID)[0].totalGoals += p.goals;
        });
        
        //Sort & create Meter widget
        this.playerGoalsList.sort((first, second) => { return second.totalGoals - first.totalGoals });
        this.playerGoalsList.forEach(pgl => {
          pgl.teams.forEach(pglt => {
            pgl.meterObj.push({
              label: pglt.team, color: this.formatService.findBackgroundColour(pglt.teamCssStyles),
              value: pglt.goals, icon: pglt.teamImagePath
            });
          });
        });
        this.maxGoals = this.playerGoalsList.length > 0 ? this.playerGoalsList[0].totalGoals : 0;
        this.loading = false;
      });
    });
  }

  viewTeamResultsModal(teamName: string) {
    //OPNE MODAL
  }
}
