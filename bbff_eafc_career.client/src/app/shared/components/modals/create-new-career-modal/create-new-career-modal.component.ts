//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { BadgeModule } from 'primeng/badge';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CareerObj, CurrencyObj } from '../../../../app.classes';

@Component({
  selector: 'create-new-career-modal',
  templateUrl: './create-new-career-modal.template.html',
  styleUrls: ['../../../../../styles.css', './create-new-career-modal.styles.css'],
  standalone: true,
  imports: [BadgeModule, ButtonModule, CommonModule, FormsModule, SelectModule]
})

export class CreateNewCareerModalComponent {

  //Declare arrays
  currencies!: CurrencyObj[];

  //Declare variables
  saveName!: string;
  saveCurrency!: any;
  validName: boolean = false;
  validCurrency: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private messageService: MessageService,
    private router: Router, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.currencies = [
      { name: "Pound Sterling (£)", value: "£" },
      { name: "US Dollars ($)", value: "$" },
      { name: "Euros (€)", value: "€" }];
    this.saveCurrency = this.currencies[0];
    this.validCurrency = true;
  }

  validateName() {
    this.validName = this.saveName !== undefined && this.saveName.trim().length > 0;
  }

  validateCurrency() {
    this.validCurrency = this.saveCurrency.value.trim().length > 0;
  }

  setCurrency(value: string) {
    this.saveCurrency = this.currencies.filter(x => x.value == value)[0];
    this.validateCurrency();
  }

  saveNewCareer() {
    let careerObj: CareerObj = { name: this.saveName, currencySymbol: this.saveCurrency.value, lastSaved: "", currentSeason: "" };
    this.http.post<number>(this.baseUrl + "career", careerObj).subscribe(result => {
      this.cmTrackerService.setCareerModeId(result);
      this.cmTrackerService.setCareerModeName(this.saveName);
      this.router.navigate(["career-mode/hub"]);
    }, error => {
      console.log("ERROR!", error);
    });
  }
}

