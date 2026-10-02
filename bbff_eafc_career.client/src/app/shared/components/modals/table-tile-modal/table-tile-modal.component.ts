//External Modules
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { TableModule } from 'primeng/table';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { PlayerStatTileObj } from '../../../../app.classes';

@Component({
  selector: 'table-tile-modal',
  templateUrl: './table-tile-modal.template.html',
  styleUrls: ['../../../../../styles.css', './table-tile-modal.styles.css'],
  standalone: true,
  imports: [AvatarModule, CommonModule, TableModule]
})

export class TableTileModalComponent {

  //Declare input and output variables
  @Input() players!: any[];
  @Input() overview!: any[];
  @Input() tileHeader!: string;
  @Input() totalProp!: string;

  //Declare other variables
  playersToFilter: PlayerStatTileObj[] = [];
  yearlyTeams: any[] = [];
  openModalEvent!: Subscription;

  constructor(private cmTrackerService: CareerModeTrackerService) { }

  ngOnInit() {
    this.sortPlayers();

    this.openModalEvent = this.cmTrackerService.tileModal.subscribe(x => {
      this.tileHeader = x.header;
      this.totalProp = x.prop;
      this.sortPlayers();
    });
  }

  sortPlayers() {
    this.playersToFilter = this.players;
    if (this.yearlyTeams.length == 0) this.getYearlyTeams();
    this.prepareDetails();

    if (this.tileHeader == "Most Appearances") {
      this.playersToFilter = this.playersToFilter.sort((a, b) => b.totalCaps - a.totalCaps).filter(x => x.totalCaps > 0);
      this.populateDetails("caps");
    } else if (this.tileHeader == "Most Goals") {
      this.playersToFilter = this.playersToFilter.sort((a, b) => b.totalGoals - a.totalGoals).filter(x => x.totalGoals > 0);
      this.populateDetails("goals");
    }
  }

  getYearlyTeams() {
    this.overview.forEach(o => {
      if (o.team !== "-")
        this.yearlyTeams.push({ year: o.year, team: o.team });
    });
  }

  prepareDetails() {
    this.playersToFilter.forEach(p => {
      p.detailTxt = "";
      p.detailTable = [];
      this.yearlyTeams.forEach(yt => {
        if (p.detailTable.filter(x => x.team == yt.team).length == 0)
          p.detailTable.push({ team: yt.team, stat: 0 });
      });
    });
  }

  populateDetails(prop: string) {
    this.playersToFilter.forEach(p => {
      this.yearlyTeams.forEach(yt => {
        p.detailTable.filter(x => x.team == yt.team)[0].stat += this.getPropertyValue(p, prop, yt.year - 1, yt.year);
      });

      p.detailTable = p.detailTable.sort((a, b) => b.stat - a.stat);
      p.detailTable.forEach(pt => {
        if (pt.stat > 0)
          p.detailTxt += (p.detailTxt.length > 0 ? "\n" : "") + pt.team + ": " + pt.stat;
      });
    });
  }

  getPropertyValue(player: PlayerStatTileObj, prop: string, ind: number, yr: number) {
    if (prop == "caps")
      return yr <= 15 ? player.caps[ind] : player.internationalCaps.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    else if (prop == "goals")
      return yr <= 15 ? player.goals[ind] : player.internationalGoals.reduce((accumulator, currentValue) => accumulator + currentValue, 0);

    return 0;
  }
}
