//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

//PrimeNG Modules
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CurrentSeasonAwardsObj, CurrentSeasonSquadPlayerObj } from '../../../../app.classes';
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'misc-view',
  templateUrl: './misc-view.template.html',
  styleUrls: ['../../../../../styles.css', '../formations.styles.css'],
  standalone: true,
  imports: [CommonModule, FormsModule, InputNumberModule, SelectModule]
})

export class MiscViewComponent {

  //Declare input and output variables
  @Input() squad!: CurrentSeasonSquadPlayerObj[];
  @Input() seasonAwards!: CurrentSeasonAwardsObj;
  @Input() finishedSeason: boolean = false;
  @Input() fromOverview: boolean = false;
  @Output() addPlayerEmit = new EventEmitter<any>();
  @Output() awardChangeEmit = new EventEmitter();

  //Declare array variables
  onLoanList!: CurrentSeasonSquadPlayerObj[];
  transferList!: CurrentSeasonSquadPlayerObj[];
  youthSquadList!: CurrentSeasonSquadPlayerObj[];
  preContractList!: CurrentSeasonSquadPlayerObj[];

  //Declare other variables
  squadToFilter!: CurrentSeasonSquadPlayerObj[];
  bestYoungPlayer!: CurrentSeasonSquadPlayerObj;
  topScorer!: CurrentSeasonSquadPlayerObj;
  bestPlaymaker!: CurrentSeasonSquadPlayerObj;
  bestPlayerPos: string = "-";

  constructor(private cmTrackerService: CareerModeTrackerService, private utilities: UtilitiesService) { }

  ngOnInit() {
    this.splitSquadIntoLists();

    this.cmTrackerService.updateSquad.subscribe(() => {
      this.splitSquadIntoLists();
    });
  }

  splitSquadIntoLists() {
    this.squadToFilter = Object.assign([], this.squad);
    this.onLoanList = this.squadToFilter.filter(x => x.loanedOut);
    this.transferList = this.squadToFilter.filter(x => x.transferListed || x.loanListed);
    this.youthSquadList = this.squadToFilter.filter(x => x.youthSquad);
    this.preContractList = this.squadToFilter.filter(x => x.preContract);

    if (this.finishedSeason) this.getAwards();
  }

  getAwards() {
    this.squadToFilter = this.utilities.sortSquadByRating(this.squadToFilter);

    //Set player of the year
    if (this.seasonAwards.bestPlayer !== undefined && this.seasonAwards.bestPlayer?.length == 0) {
      let bestPlayer = this.utilities.sortSquadByRating(this.squadToFilter.filter(x => x.caps > 10))[0];
      this.seasonAwards.bestPlayer = bestPlayer.player;
      this.seasonAwards.bestPlayerRating = bestPlayer.ratingDisplay;
      this.setAwards();
    }
    this.bestPlayerPos = this.squadToFilter.filter(x => x.player == this.seasonAwards.bestPlayer)[0].position;

    //Set young player of the year
    if (this.seasonAwards.bestYoungPlayer !== undefined && this.seasonAwards.bestYoungPlayer?.length > 0)
      this.bestYoungPlayer = this.squad.filter(x => x.player == this.seasonAwards.bestYoungPlayer)[0];

    //Set golden boot winner
    this.topScorer = this.utilities.sortSquadByTopScorer(this.squadToFilter)[0];

    //Set best playmaker
    if (this.seasonAwards.bestPlaymaker !== undefined && this.seasonAwards.bestPlaymaker?.length > 0)
      this.bestPlaymaker = this.squad.filter(x => x.player == this.seasonAwards.bestPlaymaker)[0];

    this.squadToFilter = this.utilities.sortSquadByRating(this.squadToFilter);
  }

  getBestYoungPlayer() {
    this.seasonAwards.bestYoungPlayer = this.bestYoungPlayer.player;
    this.seasonAwards.bestYoungPlayerRating = this.bestYoungPlayer.ratingDisplay;
    this.setAwards();
  }

  getBestPlaymaker() {
    this.seasonAwards.bestPlaymaker = this.bestPlaymaker.player;
    this.setAwards();
  }

  setAwards() { this.awardChangeEmit.emit(); }

  addPlayer(setting: string) { this.addPlayerEmit.emit({ code: setting, order: 0 }); }
}
