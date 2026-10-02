//External Modules
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';

//Internal Modules
import { CurrentSeasonSquadPlayerObj } from '../../../../app.classes';
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { PlayerTableComponent } from '../player-table/player-table.component';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'four-four-one-one-view',
  templateUrl: './four-four-one-one-view.template.html',
  styleUrls: ['../../../../../styles.css', '../formations.styles.css'],
  standalone: true,
  imports: [PlayerTableComponent]
})

export class FourFourOneOneViewComponent {

  //Declare input and output variables
  @Input() squad!: CurrentSeasonSquadPlayerObj[];
  @Input() fromOverview: boolean = false;
  @Output() addPlayerEmit = new EventEmitter<any>();
  @Output() reorderEmit = new EventEmitter<any>();

  //Declare array variables
  gkList!: CurrentSeasonSquadPlayerObj[];
  rbList!: CurrentSeasonSquadPlayerObj[];
  cbList!: CurrentSeasonSquadPlayerObj[];
  lbList!: CurrentSeasonSquadPlayerObj[];
  rmList!: CurrentSeasonSquadPlayerObj[];
  cmList!: CurrentSeasonSquadPlayerObj[];
  lmList!: CurrentSeasonSquadPlayerObj[];
  camList!: CurrentSeasonSquadPlayerObj[];
  stList!: CurrentSeasonSquadPlayerObj[];

  //Declare other variables
  updateSquadEvent!: Subscription;

  constructor(private cmTrackerService: CareerModeTrackerService, private utilities: UtilitiesService) { }

  ngOnInit() {
    this.splitSquadIntoLists();

    this.updateSquadEvent = this.cmTrackerService.updateSquad.subscribe(() => {
      this.splitSquadIntoLists();
    });
  }

  ngOnDestroy() {
    if (this.updateSquadEvent !== undefined) this.updateSquadEvent.unsubscribe();
  }

  splitSquadIntoLists() {
    this.gkList = this.filterSquadList("GK");
    this.rbList = this.filterSquadList("RB");
    this.cbList = this.filterSquadList("CB");
    this.lbList = this.filterSquadList("LB");
    this.rmList = this.filterSquadList("RM");
    this.cmList = this.filterSquadList("CM");
    this.lmList = this.filterSquadList("LM");
    this.camList = this.filterSquadList("CAM");
    this.stList = this.filterSquadList("ST");      
  }

  filterSquadList(pos: string) {
    let temp = this.utilities.filterSquad(this.squad, pos);
    return this.utilities.sortSquadByOrder(temp);
  }

  addPlayer(setting: any) { this.addPlayerEmit.emit(setting); }

  finishReorder(players: any) { this.reorderEmit.emit(players); }
}
