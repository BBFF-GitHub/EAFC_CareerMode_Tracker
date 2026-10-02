//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonSquadPlayerObj, TeamObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'loan-to-permanent-modal',
  templateUrl: './loan-to-permanent-modal.template.html',
  styleUrls: ['../../../../../styles.css', './loan-to-permanent-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, DatePickerModule, FormsModule, InputNumberModule, ProgressSpinnerModule, SelectModule]
})

export class LoanToPermanentModalComponent {

  //Declare input and output variables
  @Input() player!: CurrentSeasonSquadPlayerObj;
  @Output() permanentEmit = new EventEmitter<any>();

  //Declare array variables
  bigPhoto!: string;
  allClubs: TeamObj[] = [];
  fromClub!: TeamObj;
  transferDate!: any;
  transferAmount: number = 0;
  loadingTeams: boolean = false;
  newModalEvent!: Subscription;
  currency: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private teamsService: TeamsService, private utilities: UtilitiesService) {
    this.currency = this.cmTrackerService.getCareerModeCurrency();
  }

  ngOnInit() {
    this.freshModal(this.player);

    this.newModalEvent = this.cmTrackerService.removePlayerModal.subscribe(x => {
      this.freshModal(x.player);
    });
  }

  ngOnDestroy() {
    if (this.permanentEmit !== undefined) this.permanentEmit.unsubscribe();
  }

  freshModal(player: CurrentSeasonSquadPlayerObj) {
    this.player = player;
    this.bigPhoto = player.imagePath?.replace("_60.", "_240.") ?? "";
    this.transferDate = new Date(this.utilities.getTransferDateYear(this.cmTrackerService.getCareerModeYear()), 6, 1);
    this.getTransferDetails();
  }

  getTransferDetails() {
    if (this.allClubs.length > 0) return;

    this.loadingTeams = true;
    if (this.teamsService.allTeams.length > 0) {
      this.teamsService.allTeams.forEach(t => {
        t.teamCountryCombo = t.country + " - " + t.team;
        this.allClubs.push(t);
      });
      setTimeout(() => this.loadingTeams = false, 1000);
    }
    else {
      this.teamsService.getAllTeams().add(() => {
        this.teamsService.allTeams.forEach(t => {
          t.teamCountryCombo = t.country + " - " + t.team;
          this.allClubs.push(t);
        });
        setTimeout(() => this.loadingTeams = false, 1000);
      });
    }
  }

  makePlayerPermanent() {
    let transferObj = {
      fromClub: this.fromClub !== undefined ? this.fromClub : "FREE AGENT", date: this.transferDate,
      type: "Permanent", amount: this.transferAmount
    };
    this.permanentEmit.emit({ player: this.player, transfer: transferObj });
  }

}
