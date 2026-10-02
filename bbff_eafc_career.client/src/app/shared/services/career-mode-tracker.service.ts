//External Modules
import { EventEmitter, Injectable } from "@angular/core";
import { CurrentSeasonObj, InternationalsObj } from "../../app.classes";

@Injectable()
export class CareerModeTrackerService {

  //Declare variables
  id!: number;
  name!: string;
  status: string = "not started";
  year!: number;
  currency!: string;
  internationalObj!: InternationalsObj;
  seasonObj!: CurrentSeasonObj;
  newPlayerModel = new EventEmitter();
  editClubModal = new EventEmitter();
  editPositionModal = new EventEmitter();
  loanToPermanentModal = new EventEmitter();
  removePlayerModal = new EventEmitter();
  resultsModal = new EventEmitter();
  updateSquad = new EventEmitter();
  tileModal = new EventEmitter();
  prePopulatePlayersModal = new EventEmitter();

  getCareerModeId() {
    return this.id;
  }

  getCareerModeName() {
    return this.name;
  }

  getCareerStatus() {
    return this.status;
  }

  getCareerModeYear() {
    return this.year;
  }

  getCareerModeCurrency() {
    return this.currency;
  }

  getCareerModeInternationalObj() {
    return this.internationalObj;
  }

  getCareerModeSeasonObj() {
    return this.seasonObj;
  }

  setCareerModeId(id: number) {
    this.id = id;
  }

  setCareerModeName(name: string) {
    this.name = name;
  }

  setCareerStatus(status: string) {
    this.status = status.toLowerCase();
  }

  setCareerYear(year: number) {
    this.year = year;
  }

  setCareerCurrency(currency: string) {
    this.currency = currency;
  }

  setCareerInternationalObj(internationalObj: InternationalsObj) {
    this.internationalObj = internationalObj;
  }

  setCareerSeasonObj(seasonObj: CurrentSeasonObj) {
    this.seasonObj = seasonObj;
  }

  triggerNewPlayerModal(event: any) {
    this.newPlayerModel.emit(event);
  }

  triggerEditClubModal(event: any) {
    this.editClubModal.emit(event);
  }

  triggerEditPositionModal(event: any) {
    this.editPositionModal.emit(event);
  }

  triggerLoanToPermanentModal(event: any) {
    this.loanToPermanentModal.emit(event);
  }

  triggerRemovePlayerModal(event: any) {
    this.removePlayerModal.emit(event);
  }

  triggerResultsModal(event: any) {
    this.resultsModal.emit(event);
  }

  triggerSquadChange() {
    this.updateSquad.emit();
  }

  triggerTileModal(event: any) {
    this.tileModal.emit(event);
  }

  triggerPrePopulatePlayersModal(event: any) {
    this.prePopulatePlayersModal.emit(event);
  }
}
