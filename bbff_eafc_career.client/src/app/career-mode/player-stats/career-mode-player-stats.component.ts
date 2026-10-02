//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PriemNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { FormattingService } from '../../shared/services/formatting.service';
import { PlayerStatObj } from '../../app.classes';

@Component({
  selector: 'career-mode-player-stats',
  templateUrl: './career-mode-player-stats.template.html',
  styleUrls: ['../../../styles.css', './career-mode-player-stats.styles.css'],
  standalone: true,
  imports: [AvatarModule, CommonModule, ProgressSpinnerModule, TableModule, TagModule, TooltipModule]
})

export class CareerModePlayerStatsComponent {

  //Declare array variables
  players: PlayerStatObj[] = [];

  //Declare other variables
  careerId!: number;
  year!: number;
  loading: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private formatService: FormattingService, private http: HttpClient,
    private router: Router, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let cmid = this.cmTrackerService.getCareerModeId();
    if (cmid == undefined || cmid == 0)
      this.router.navigate(["/"]);

    this.careerId = cmid;
    this.year = this.cmTrackerService.getCareerModeYear();
    this.populatePlayersList();
  }

  populatePlayersList() {
    this.loading = true;

    this.http.get<PlayerStatObj[]>(this.baseUrl + "playerstats", { params: { careerId: this.careerId, year: this.year } }).subscribe(result => {
      this.players = result;
      this.players.forEach(p => {
        p.totalCaps = p.totalCaps + p.totalInternationalCaps;
        p.totalGoals = p.totalGoals + p.totalInternationalGoals;
        p.posId = this.formatService.workOutPosId(p.pos);
        p.accentSeverity = this.formatService.workOutAccentColour(p.pos);

        for (var i = 0; i < 15; i++) {
          //Sort out caps
          if (p.caps[i] != undefined || p.internationalCaps[i] != undefined) {
            if (p.caps[i] == undefined) p.caps.push(p.internationalCaps[i]);
            else if (p.internationalCaps[i] != undefined) p.caps[i] += p.internationalCaps[i];
          } else
            p.caps.push(0);

          //Sort out goals
          if (p.goals[i] != undefined || p.internationalGoals[i] != undefined) {
            if (p.goals[i] == undefined) p.goals.push(p.internationalGoals[i]);
            else if (p.internationalGoals[i] != undefined) p.goals[i] += p.internationalGoals[i];
          } else
            p.goals.push(0);
        }
      });

      this.players = this.players.sort((a, b) => a.posId == undefined || b.posId == undefined ? 0 : a.posId - b.posId);
      this.loading = false;
    });
  }

  customSort(event: any) {
    console.log(event);
  }

  getWidth(numGoals: number, maxGoals: number) {
    let width = (numGoals / maxGoals) * 100;
    width = width * 0.75;
    return width + "%";
  }
}
