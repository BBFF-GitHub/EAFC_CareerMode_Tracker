//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Subscription } from 'rxjs';

//Internal Modules
import { CurrentSeasonSquadPlayerObj } from '../../../../app.classes';
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { PlayerTableComponent } from '../player-table/player-table.component';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'four-one-two-one-two-view',
  templateUrl: './four-one-two-one-two-view.template.html',
  styleUrls: ['../../../../../styles.css', '../formations.styles.css'],
  standalone: true,
  imports: [CommonModule, PlayerTableComponent]
})

export class FourOneTwoOneTwoViewComponent {

  //Declare input and output variables
  @Input() squad!: CurrentSeasonSquadPlayerObj[];
  @Input() wide: boolean = false;
  @Input() fromOverview: boolean = false;
  @Output() addPlayerEmit = new EventEmitter<any>();
  @Output() reorderEmit = new EventEmitter<any>();

  //Declare array variables
  gkList!: CurrentSeasonSquadPlayerObj[];
  rbList!: CurrentSeasonSquadPlayerObj[];
  cbList!: CurrentSeasonSquadPlayerObj[];
  lbList!: CurrentSeasonSquadPlayerObj[];
  cdmList!: CurrentSeasonSquadPlayerObj[];
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
    this.cdmList = this.filterSquadList("CDM");
    this.camList = this.filterSquadList("CAM");
    this.stList = this.filterSquadList("ST");

    if (this.wide) {
      this.rmList = this.filterSquadList("RM");
      this.lmList = this.filterSquadList("LM");
    } else {
      this.cmList = this.filterSquadList("CM");
    }
  }

  filterSquadList(pos: string) {
    let temp = this.utilities.filterSquad(this.squad, pos);
    return this.utilities.sortSquadByOrder(temp);
  }

  addPlayer(setting: any) { this.addPlayerEmit.emit(setting); }

  finishReorder(players: any) { this.reorderEmit.emit(players); }
}
