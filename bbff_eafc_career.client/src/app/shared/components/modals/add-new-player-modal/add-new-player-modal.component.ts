//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Inject, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Subscription } from 'rxjs';

//PrimeNG Kodules
import { ButtonModule } from 'primeng/button';
import { DatePickerModule } from 'primeng/datepicker';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonSquadPlayerObj, OfficialPlayerDataObj, PlayerPicObj, TeamObj, TransferLogObj } from '../../../../app.classes';
import { PlayerPicService } from '../../../services/player-pic.service';
import { TeamsService } from '../../../services/teams.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'add-new-player-modal',
  templateUrl: './add-new-player-modal.template.html',
  styleUrls: ['../../../../../styles.css', './add-new-player-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, DatePickerModule, FormsModule, InputNumberModule, InputTextModule, ProgressSpinnerModule, RadioButtonModule, SelectModule, ToggleSwitchModule]
})

export class AddNewPlayerModalComponent {

  //Declare input and output variables
  @Input() setting!: string;
  @Input() order!: number;
  @Input() international: boolean = false;
  @Input() positions!: string[];
  @Output() savePlayerEmit = new EventEmitter<any>();

  //Declare array variables
  statuses: any[] = [{ status: "Loaned In", disabled: false }, { status: "Loaned Out", disabled: false },
    { status: "Transfer Listed", disabled: false }, { status: "Loan Listed", disabled: false }, { status: "Youth Squad", disabled: false }];
  playerImages: PlayerPicObj[] = [];
  allClubs: TeamObj[] = [];
  transferTypes: any[] = [{ type: "Permanent", disabled: false }, { type: "Short-Term Loan", disabled: false }, { type: "1-Year Loan", disabled: false },
    { type: "2-Year Loan", disabled: false }, { type: "Pre-Contract", disabled: false }];

  //Declare other variables
  newPlayer!: CurrentSeasonSquadPlayerObj;
  selectedStatus: any;
  selectedPhotoIndex: number = 0;
  transferredIn: boolean = false;
  fromClub!: TeamObj;
  transferDate!: any;
  selectedType: any;
  transferAmount: number = 0;
  loadingPic: boolean = false;
  searchAttempted: boolean = false;
  showAddToDbForm: boolean = false;
  addedToDb: boolean = false;
  addToDbPhoto: string = "";
  addToDbNationality: string = "";
  addToDbFlag: string = "";
  addToDbOgClub: string = "";
  addToDbGender: string = "M";
  loadingTeams: boolean = false;
  validName: boolean = false;
  newModalEvent!: Subscription;
  currency: string;
  preContract: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private playerPicService: PlayerPicService, private teamsService: TeamsService,
    private utilities: UtilitiesService, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
    this.currency = this.cmTrackerService.getCareerModeCurrency();
  }

  ngOnInit() {
    this.freshModal(this.setting, this.order);

    this.newModalEvent = this.cmTrackerService.newPlayerModel.subscribe(x => {
      this.freshModal(x.setting, x.order, x.international);
    });
  }

  ngOnDestroy() {
    if (this.newModalEvent !== undefined) this.newModalEvent.unsubscribe();
  }

  freshModal(setting: string, order: number, international: boolean = false) {
    this.newPlayer = {
      id: 0, player: "", position: "", currentClub: "", order: order, loanedIn: false, loanedOut: false, transferListed: false, loanListed: false,
      youthSquad: false, preContract: false, preContractOut: false, retiring: false, callUps: 0, caps: 0, goals: 0, saved: false
    };

    //Reset transfer figures
    this.transferredIn = false;
    this.fromClub = { countryCode: "", team: "", cssStyles: "" };
    this.selectedType = { type: "" };
    this.transferAmount = 0;
    this.selectedStatus = undefined;
    this.setTransferDate();
    this.transferDate = new Date(this.utilities.getTransferDateYear(this.cmTrackerService.getCareerModeYear()), 6, 1);
    this.playerImages = [];
    this.searchAttempted = false;
    this.showAddToDbForm = false;
    this.addedToDb = false;
    this.addToDbPhoto = "";
    this.addToDbNationality = "";
    this.addToDbFlag = "";
    this.addToDbOgClub = "";
    this.addToDbGender = "M";
    this.applySetting(setting);
  }

  applySetting(setting: string) {
    switch (setting.toLowerCase()) {
      case "gk":
      case "rwb":
      case "rb":
      case "cb":
      case "lb":
      case "lwb":
      case "cdm":
      case "rm":
      case "cm":
      case "lm":
      case "ram":
      case "cam":
      case "lam":
      case "rw":
      case "lw":
      case "cf":
      case "st":
        this.newPlayer.position = setting.toUpperCase();
        break;
      case "loan":
        this.selectedStatus = this.statuses.filter(x => x.status == "Loaned Out")[0];
        this.changeStatus();
        break;
      case "transfer":
        this.selectedStatus = this.statuses.filter(x => x.status == "Transfer Listed")[0];
        this.changeStatus();
        break;
      case "youth":
        this.selectedStatus = this.statuses.filter(x => x.status == "Youth Squad")[0];
        this.changeStatus();
        break;
      case "precontract":
        this.selectedType = this.transferTypes.filter(x => x.type == "Pre-Contract")[0];
        this.changeType();
        break;
    }
  }

  validateName() {
    this.validName = this.newPlayer.player !== undefined && this.newPlayer.player.trim().length > 0;
  }

  changeStatus() {
    let status = this.selectedStatus.status.toLowerCase();
    switch (status) {
      case "loaned in":
        this.newPlayer.loanedIn = true;
        this.newPlayer.loanedOut = false;
        this.newPlayer.transferListed = false;
        this.newPlayer.loanListed = false;
        this.newPlayer.youthSquad = false;
        this.newPlayer.preContract = false;
        break;
      case "loaned out":
        this.newPlayer.loanedIn = false;
        this.newPlayer.loanedOut = true;
        this.newPlayer.transferListed = false;
        this.newPlayer.loanListed = false;
        this.newPlayer.youthSquad = false;
        this.newPlayer.preContract = false;
        break;
      case "transfer listed":
        this.newPlayer.loanedIn = false;
        this.newPlayer.loanedOut = false;
        this.newPlayer.transferListed = true;
        this.newPlayer.loanListed = false;
        this.newPlayer.youthSquad = false;
        this.newPlayer.preContract = false;
        break;
      case "loan listed":
        this.newPlayer.loanedIn = false;
        this.newPlayer.loanedOut = false;
        this.newPlayer.transferListed = false;
        this.newPlayer.loanListed = true;
        this.newPlayer.youthSquad = false;
        this.newPlayer.preContract = false;
        break;
      case "youth squad":
        this.newPlayer.loanedIn = false;
        this.newPlayer.loanedOut = false;
        this.newPlayer.transferListed = false;
        this.newPlayer.loanListed = false;
        this.newPlayer.youthSquad = true;
        this.newPlayer.preContract = false;
        break;
    }
  }

  changeType() {
    let type = this.selectedType.type.toLowerCase();
    switch (type) {
      case "pre-contract":
        this.newPlayer.loanedIn = false;
        this.newPlayer.loanedOut = false;
        this.newPlayer.transferListed = false;
        this.newPlayer.loanListed = false;
        this.newPlayer.youthSquad = false;
        this.newPlayer.preContract = true;
        this.preContract = true;
        break;
      default:
        this.preContract = false;
        break;
    }
  }

  findPlayerImage() {
    this.loadingPic = true;
    this.showAddToDbForm = false;
    this.addedToDb = false;
    this.playerImages = this.playerPicService.getPotentialImages(this.newPlayer.player);
    this.selectedPhotoIndex = 0;
    setTimeout(() => {
      this.loadingPic = false;
      this.searchAttempted = true;
    }, 1000);
  }

  saveToPlayerDatabase() {
    let newEntry: OfficialPlayerDataObj = {
      id: 0, name: this.newPlayer.player, photoUrl: this.addToDbPhoto, nationality: this.addToDbNationality,
      flagUrl: this.addToDbFlag, position: this.newPlayer.position, ogClub: this.addToDbOgClub, gender: this.addToDbGender
    };

    this.http.post<void>(this.baseUrl + "officialplayerdata", newEntry).subscribe(() => {
      this.addedToDb = true;
      this.showAddToDbForm = false;

      //Use what was just entered for this squad-add too, rather than falling back to unknown.png
      if (this.addToDbPhoto.length > 0) {
        this.playerImages = [{
          name: newEntry.name, photo: newEntry.photoUrl, photoBig: newEntry.photoUrl, nationality: newEntry.nationality,
          flag: newEntry.flagUrl, position: newEntry.position, ogClub: newEntry.ogClub, gender: newEntry.gender,
          posId: 0
        }];
        this.selectedPhotoIndex = 0;
      }
    }, error => console.error(error));
  }

  moveImage(movement: number) {
    //Movement: -1 = back, 1 = forward
    let index = this.selectedPhotoIndex;
    if (index == 0 && movement == -1) index = this.playerImages.length - 1;
    else if (index == this.playerImages.length - 1 && movement == 1) index = 0;
    else if (movement == -1) index -= 1;
    else index += 1;

    this.selectedPhotoIndex = index;
  }

  getTransferDetails() {
    if (!this.transferredIn || this.allClubs.length > 0) return;

    this.loadingTeams = true;
    if (this.teamsService.allTeams.length > 0) {
      this.teamsService.allTeams.forEach(t => {
        if (t.country !== t.team) {
          t.teamCountryCombo = t.country + " - " + t.team;
          this.allClubs.push(t);
        }
      });
      this.allClubs.unshift({ id: 0, country: "-", countryCode: "-", team: "FREE AGENT", cssStyles: "", teamCountryCombo: "FREE AGENT" });
      setTimeout(() => this.loadingTeams = false, 1000);
    }
    else {
      this.teamsService.getAllTeams().add(() => {
        this.teamsService.allTeams.forEach(t => {
          if (t.country !== t.team) {
            t.teamCountryCombo = t.country + " - " + t.team;
            this.allClubs.push(t);
          }
        });
        this.allClubs.unshift({ id: 0, country: "-", countryCode: "-", team: "FREE AGENT", cssStyles: "", teamCountryCombo: "FREE AGENT" });
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

  saveNewPlayer() {
    //Construct player image
    if (this.playerImages == undefined || this.playerImages.length == 0)
      this.newPlayer.imagePath = "./assets/players/unknown.png";
    else if (this.playerImages.length == 1)
      this.newPlayer.imagePath = this.playerImages[0].photo;
    else
      this.newPlayer.imagePath = this.playerImages[this.selectedPhotoIndex].photo;

    if (!this.transferredIn) this.savePlayerEmit.emit({ player: this.newPlayer, transfer: undefined });
    else {
      //Construct transfer log object
      let transferObj = { fromClub: this.fromClub, date: this.transferDate, type: this.selectedType.type, amount: this.transferAmount };
      this.savePlayerEmit.emit({ player: this.newPlayer, transfer: transferObj });
    }
  }
}

