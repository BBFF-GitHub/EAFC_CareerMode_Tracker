//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonSquadPlayerObj, TeamObj, TransferLogObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'remove-player-modal',
  templateUrl: './remove-player-modal.template.html',
  styleUrls: ['../../../../../styles.css', './remove-player-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, DatePickerModule, FormsModule, InputNumberModule, ProgressSpinnerModule, RadioButtonModule, SelectModule, TooltipModule]
})

export class RemovePlayerModalComponent {

  //Declare input and output variables
  @Input() playerToRemove!: CurrentSeasonSquadPlayerObj;
  @Input() setting!: string;
  @Output() removePlayerEmit = new EventEmitter<any>();

  //Declare array variables
  player!: CurrentSeasonSquadPlayerObj;
  bigPhoto!: string;
  statuses: any[] = [{ status: "Sell/Loan Out", disabled: false }, { status: "Terminate Contract", disabled: false }];
  transferTypes: any[] = [{ type: "Permanent", disabled: false }, { type: "Short-Term Loan", disabled: false }, { type: "1-Year Loan", disabled: false },
  { type: "2-Year Loan", disabled: false }, { type: "Pre-Contract", disabled: false }];
  allClubs: TeamObj[] = [];

  //Declare other variables
  selectedStatus: any;
  toClub!: TeamObj;
  transferDate!: any;
  selectedType: any;
  transferAmount: number = 0;
  loadingTeams: boolean = false;
  newModalEvent!: Subscription;
  currency: string;
  preContractOut: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private teamsService: TeamsService, private utilities: UtilitiesService,
    @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
    this.currency = this.cmTrackerService.getCareerModeCurrency();
  }

  ngOnInit() {
    this.freshModal(this.playerToRemove, this.setting);

    this.newModalEvent = this.cmTrackerService.removePlayerModal.subscribe(x => {
      this.freshModal(x.player, x.setting);
    });
  }

  ngOnDestroy() {
    if (this.removePlayerEmit !== undefined) this.removePlayerEmit.unsubscribe();
  }

  freshModal(player: CurrentSeasonSquadPlayerObj, setting: string) {
    this.player = player;
    this.bigPhoto = player.imagePath?.replace("_60.", "_240.") ?? "";
    this.toClub = { countryCode: "", team: "", cssStyles: "" };
    this.setTransferDate();
    this.selectedType = { type: "" };
    this.transferAmount = 0;
    this.selectedStatus = undefined;
    this.applySetting(setting);
  }

  applySetting(setting: string) {
    switch (setting.toLowerCase()) {
      case "sell":
      case "loan":
        this.selectedStatus = this.statuses.filter(x => x.status == "Sell/Loan Out")[0];
        this.changeStatus();
        break;
      case "terminate":
        this.selectedStatus = this.statuses.filter(x => x.status == "Terminate Contract")[0];
        break;
    }
  }

  changeStatus() {
    let status = this.selectedStatus.status.toLowerCase();
    switch (status) {
      case "sell/loan out":
        this.getTransferDetails();
        break;
    }
  }

  changeType() {
    let type = this.selectedType.type.toLowerCase();
    switch (type) {
      case "pre-contract":
        this.preContractOut = true;
        break;
      default:
        this.preContractOut = false;
        break;
    }
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

  setTransferDate() {
    return this.http.get<TransferLogObj[]>(this.baseUrl + "transferlog", { params: { careerId: this.cmTrackerService.getCareerModeId(), lastTransfer: true } }).subscribe(result => {
      let cmYear = this.utilities.getTransferDateYear(this.cmTrackerService.getCareerModeYear());

      if (result.length == 0)
        this.transferDate = new Date(cmYear, 6, 1);
      else {
        let parts = result[0].date?.split("/");
        if (!parts || (parts && parseInt(parts[2]) == cmYear && parseInt(parts[1]) < 5))
          this.transferDate = new Date(cmYear, 6, 1);
        else
          this.transferDate = new Date(parseFloat(parts[2]), parseInt(parts[1]) - 1, parseFloat(parts[0]));
      }
    });
  }

  removePlayer() {
    let transferObj = {
      toClub: this.toClub !== undefined && this.toClub.team.length > 0 ? this.toClub : "FREE AGENT", date: this.transferDate,
      type: this.selectedType !== undefined && this.selectedType.type.length > 0 ? this.selectedType.type : "Terminate", amount: this.transferAmount
    };
    this.player.preContractOut = this.preContractOut;
    this.removePlayerEmit.emit({ player: this.player, transfer: transferObj });
  }
}
