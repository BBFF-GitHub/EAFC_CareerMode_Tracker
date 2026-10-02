//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { CareerOverviewObj, CupObj } from '../../app.classes';
import { TeamShirtComponent } from '../../shared/components/team-shirt/team-shirt.component';
import { TeamsService } from '../../shared/services/teams.service';
import { UtilitiesService } from '../../shared/services/utilities.service';

@Component({
  selector: 'career-mode-overview',
  templateUrl: './career-mode-overview.template.html',
  styleUrls: ['../../../styles.css', './career-mode-overview.styles.css'],
  standalone: true,
  imports: [CommonModule, ProgressSpinnerModule, TableModule, TeamShirtComponent, TooltipModule]
})

export class CareerModeOverviewComponent {

  //Declare array variables
  overviewRows!: CareerOverviewObj[];
  totalRow!: CareerOverviewObj;

  //Declare other variables
  baseUrl: string;
  loading: boolean = true;
  spaceRegex = /\ /gi;
  slashRegax = /\//gi;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private router: Router, private teamsService: TeamsService,
    private utilities: UtilitiesService, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let cmid = this.cmTrackerService.getCareerModeId();
    if (cmid == undefined || cmid == 0)
      this.router.navigate(["/"]);

    this.getOverviewTable();
  }

  getOverviewTable() {
    this.loading = true;
    this.http.get<CareerOverviewObj[]>(this.baseUrl + "careeroverview", { params: { careerId: this.cmTrackerService.getCareerModeId() } }).subscribe(result => {
      result.forEach(r => {
        if (r.completed && r.leaguePos !== undefined) {
          r.leaguePosDisplay = this.utilities.getSuffix(r.leaguePos);
          r.viewSeasonHistory = true;
        }

        if (r.team !== undefined && r.team.length > 0 && r.team != "-") {
          if (r.year !== undefined && r.year > 15) {
            r.teamImagePath = "./assets/logos/international/" + r.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
          } else {
            let country = this.teamsService.getCountryFromCode(r.countryCode ?? "");
            if (country !== undefined && country.length > 0) {
              r.teamImagePath = "./assets/logos/" + country.toLowerCase() + "/" + r.team.toLowerCase().replace(this.spaceRegex, "_").replace(this.slashRegax, "_") + ".png";
            }
          }
        }

        r.goalDifference = r.goalsScored == undefined || r.goalsAgainst == undefined ? 0 : r.goalsScored - r.goalsAgainst;
        r.cupWinners = r.cups == undefined ? [] : r.cups.filter(x => x.cupProgress == 'Winners');
        r.cupRunnersUp = r.cups == undefined ? [] : r.cups.filter(x => x.cupProgress == 'Runners-Up');
        r.cupTooltip = this.createOverviewCupTooltip(r.cups !== undefined ? r.cups : []);
      });
      this.overviewRows = result;
      this.totalRow = {
        gamesPlayed: result.reduce((sum, current) => sum + (current.gamesPlayed !== undefined ? current.gamesPlayed : 0), 0),
        wins: result.reduce((sum, current) => sum + (current.wins !== undefined ? current.wins : 0), 0),
        draws: result.reduce((sum, current) => sum + (current.draws !== undefined ? current.draws : 0), 0),
        losses: result.reduce((sum, current) => sum + (current.losses !== undefined ? current.losses : 0), 0),
        goalsScored: result.reduce((sum, current) => sum + (current.goalsScored !== undefined ? current.goalsScored : 0), 0),
        goalsAgainst: result.reduce((sum, current) => sum + (current.goalsAgainst !== undefined ? current.goalsAgainst : 0), 0),
        goalDifference: this.overviewRows.reduce((sum, current) => sum + (current.goalDifference !== undefined ? current.goalDifference : 0), 0),
        leagueWins: result.filter(x => x.leaguePos == 1).length,
        cupWins: result.reduce((sum, current) => sum + (current.cupWinners !== undefined ? current.cupWinners.length : 0), 0)
      };
      this.loading = false;
    });
  }

  createOverviewCupTooltip(cups: CupObj[]) {
    let cupTooltipTxt = "";

    cups.forEach((c, i) => {
      if (i > 0) cupTooltipTxt += "\n";
      cupTooltipTxt += c.cupName + ": " + c.cupProgress
    });

    return cupTooltipTxt;
  }

  viewSeasonHistory(year: number) {
    this.router.navigate(["career-mode/season-history/" + year]);
  }
}
