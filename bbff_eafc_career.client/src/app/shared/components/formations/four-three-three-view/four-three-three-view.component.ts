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
  selector: 'four-three-three-view',
  templateUrl: './four-three-three-view.template.html',
  styleUrls: ['../../../../../styles.css', '../formations.styles.css'],
  standalone: true,
  imports: [CommonModule, PlayerTableComponent]
})

export class FourThreeThreeViewComponent {

  //Declare input and output variables
  @Input() squad!: CurrentSeasonSquadPlayerObj[];
  @Input() mode!: string;
  @Input() fromOverview: boolean = false;
  @Output() addPlayerEmit = new EventEmitter<any>();
  @Output() reorderEmit = new EventEmitter<any>();

  //Declare array variables
  gkList!: CurrentSeasonSquadPlayerObj[];
  rbList!: CurrentSeasonSquadPlayerObj[];
  cbList!: CurrentSeasonSquadPlayerObj[];
  lbList!: CurrentSeasonSquadPlayerObj[];
  cdmList!: CurrentSeasonSquadPlayerObj[];
  cmList!: CurrentSeasonSquadPlayerObj[];
  camList!: CurrentSeasonSquadPlayerObj[];
  rwList!: CurrentSeasonSquadPlayerObj[];
  stList!: CurrentSeasonSquadPlayerObj[];
  lwList!: CurrentSeasonSquadPlayerObj[];

  //Declare other variables
  attack: boolean = false;
  holding: boolean = false;
  middle: boolean = false;
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
    this.setMode();

    //HERE
    this.gkList = this.filterSquadList("GK");
    this.rbList = this.filterSquadList("RB");
    this.cbList = this.filterSquadList("CB");
    this.lbList = this.filterSquadList("LB");
    this.rwList = this.filterSquadList("RW");
    this.stList = this.filterSquadList("ST");
    this.lwList = this.filterSquadList("LW");

    if (this.holding)
      this.cdmList = this.filterSquadList("CDM");
    if (this.middle)
      this.cmList = this.filterSquadList("CM");
    if (this.attack)
      this.camList = this.filterSquadList("CAM");
  }

  setMode() {
    if (this.mode == "4-3-3 Attack") {
      this.attack = true;
      this.holding = false;
      this.middle = true;
    } else if (this.mode == "4-3-3 Defend") {
      this.attack = false;
      this.holding = true;
      this.middle = true;
    } else if (this.mode == "4-3-3 Flat") {
      this.attack = false;
      this.holding = false;
      this.middle = true;
    } else {
      this.attack = true;
      this.holding = true;
      this.middle = false;
    }
  }

  filterSquadList(pos: string) {
    let temp = this.utilities.filterSquad(this.squad, pos);
    return this.utilities.sortSquadByOrder(temp);
  }

  addPlayer(setting: any) { this.addPlayerEmit.emit(setting); }

  finishReorder(players: any) { this.reorderEmit.emit(players); }
}
