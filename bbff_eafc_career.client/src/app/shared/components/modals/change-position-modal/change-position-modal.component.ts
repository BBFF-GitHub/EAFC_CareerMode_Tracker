//External Modules
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { UtilitiesService } from '../../../services/utilities.service';
import { CurrentSeasonSquadPlayerObj } from '../../../../app.classes';

@Component({
  selector: 'change-position-modal',
  templateUrl: './change-position-modal.template.html',
  styleUrls: ['../../../../../styles.css', './change-position-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, FormsModule, MultiSelectModule, SelectModule]
})

export class ChangePositionModalComponent {

  //Declare input and output variables
  @Input() playerToChange!: CurrentSeasonSquadPlayerObj;
  @Input() positions!: string[];
  @Output() changePlayerEmit = new EventEmitter<any>();

  //Declare array variables
  eligiblePositionOptions!: string[];
  selectedEligiblePositions: string[] = [];

  //Declare other variables
  player!: CurrentSeasonSquadPlayerObj;
  oldPosition!: string;
  bigPhoto!: string;
  loading: boolean = false;
  savingEligiblePositions: boolean = false;
  editPositionModalEvent!: Subscription;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private utilities: UtilitiesService,
    private http: HttpClient, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.freshModal(this.playerToChange);

    this.editPositionModalEvent = this.cmTrackerService.editPositionModal.subscribe(x => {
      this.freshModal(x);
    });
  }

  ngOnDestroy() {
    if (this.editPositionModalEvent !== undefined) this.editPositionModalEvent.unsubscribe();
  }

  freshModal(player: CurrentSeasonSquadPlayerObj) {
    this.player = player;
    this.oldPosition = player.position;
    this.bigPhoto = player.imagePath?.replace("_60.", "_240.") ?? "";
    this.positions = this.positions.filter(x => x != player.position);

    //"Also eligible for" offers every known position bar whichever is currently the primary one
    this.eligiblePositionOptions = this.utilities.allPositions.filter(x => x != player.position);
    this.selectedEligiblePositions = (player.eligiblePositions ?? []).filter(x => x != player.position);
  }

  savePosChange() {
    this.player.edited = true;
    this.changePlayerEmit.emit({ player: this.player, oldPos: this.oldPosition });
    this.saveEligiblePositions();
  }

  saveEligiblePositions() {
    if (this.player.playerID == undefined) return;

    this.savingEligiblePositions = true;
    let saveObj = { playerID: this.player.playerID, positions: [this.player.position, ...this.selectedEligiblePositions] };

    this.http.post<boolean>(this.baseUrl + "playerposition", saveObj).subscribe(() => {
      this.player.eligiblePositions = saveObj.positions;
      this.savingEligiblePositions = false;
    }, error => {
      console.error(error);
      this.savingEligiblePositions = false;
    });
  }
}
