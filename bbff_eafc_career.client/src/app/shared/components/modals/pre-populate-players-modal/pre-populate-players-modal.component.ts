//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonSquadPlayerObj, PlayerPicObj } from '../../../../app.classes';
import { FormattingService } from '../../../services/formatting.service';
import { PlayerPicService } from '../../../services/player-pic.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'pre-populate-players-modal',
  templateUrl: './pre-populate-players-modal.template.html',
  styleUrls: ['../../../../../styles.css', './pre-populate-players-modal.styles.css'],
  standalone: true,
  imports: [AvatarModule, ButtonModule, CheckboxModule, CommonModule, FormsModule, ProgressSpinnerModule, TableModule, TagModule]
})

export class PrePopulatePlayersModalComponent {

  //Declare input and output variables
  @Input() countryCode!: string;
  @Input() teamName!: string;
  @Input() female: boolean = false;
  @Output() playerListEmit = new EventEmitter<any>();

  //Declare other variables
  playerImages: PlayerPicObj[] = [];
  selectedPlayerList: PlayerPicObj[] = [];
  finalPlayerList: CurrentSeasonSquadPlayerObj[] = [];
  loading: boolean = false;
  prePopulateModalEvent!: Subscription;

  constructor(private cmTrackerService: CareerModeTrackerService, private formatService: FormattingService,
    private playerPicService: PlayerPicService, private utilities: UtilitiesService) { }

  ngOnInit() {
    this.freshModal();

    this.prePopulateModalEvent = this.cmTrackerService.prePopulatePlayersModal.subscribe(x => {
      this.freshModal();
    });
  }

  ngOnDestroy() {
    if (this.prePopulateModalEvent !== undefined) this.prePopulateModalEvent.unsubscribe();
  }

  freshModal() {
    this.loading = true;
    this.playerImages = this.playerPicService.getPrePopulatedSquad(this.countryCode, this.teamName, this.female ? "F" : "M");
    setTimeout(() => {
      this.playerImages = this.utilities.sortSquadImgsByPos(this.playerImages);
      this.playerImages.forEach(p => {
        p.accentSeverity = this.formatService.workOutAccentColour(p.position);
        p.loanedIn = false;
        p.loanedOut = false;
        p.retiring = false;
      });
      this.loading = false;
    }, 1000);
  }

  addSquad() {
    this.finalPlayerList = [];
    let tempPos = "";
    let tempOrder = 1;

    this.selectedPlayerList.forEach(p => {
      if (p.position != tempPos) {
        tempPos = p.position;
        tempOrder = 1;
      } else tempOrder += 1;

      this.finalPlayerList.push({
        id: 0, imagePath: p.photo, player: p.name, position: p.position, currentClub: "", order: tempOrder, loanedIn: p.loanedIn!, loanedOut: p.loanedOut!, transferListed: false,
        loanListed: false, youthSquad: false, preContract: false, preContractOut: false, retiring: p.retiring!, callUps: 0, caps: 0, goals: 0, saved: false
      });
    });
    this.playerListEmit.emit({ players: this.finalPlayerList });
  }
}

