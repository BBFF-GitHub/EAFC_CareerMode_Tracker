//External Modules
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

//Internal Modules
import { HeadToHeadTeamResultObj } from '../../../app.classes';

@Component({
  selector: 'team-dashboard-tile',
  templateUrl: './team-dashboard-tile.template.html',
  styleUrls: ['../../../../styles.css', './team-dashboard-tile.styles.css'],
  standalone: true,
  imports: [CommonModule]
})

export class TeamDashboardTileComponent {

  //Declare input variables
  @Input() team!: HeadToHeadTeamResultObj;
  @Input() title!: string;
  @Input() prop: string = "id";
  @Input() small: boolean = false;

  getValue() {
    if (this.team == undefined || this.prop == undefined) return 0;
    else {
      switch (this.prop.toLowerCase()) {
        case "gamesplayed":
          return this.team.gamesPlayed;
        case "wins":
          return this.team.wins;
        case "draws":
          return this.team.draws;
        case "losses":
          return this.team.losses;
        case "goalsscored":
          return this.team.goalsScored;
        case "goalsagainst":
          return this.team.goalsAgainst;
        case "goaldifference":
          return (this.team.goalDifference > 0 ? "+" : "") + this.team.goalDifference;
        case "avggoalsscored":
          return this.team.avgGoalsScored;
        case "avggoalsagainst":
          return this.team.avgGoalsAgainst;
        case "avggoaldifference":
          return (this.team.avgGoalDifference > 0 ? "+" : "") + this.team.avgGoalDifference;
        case "points":
          return this.team.points;
        case "avgpoints":
          return this.team.avgPoints;
        default:
          return 0;
      }
    }
  }

}
