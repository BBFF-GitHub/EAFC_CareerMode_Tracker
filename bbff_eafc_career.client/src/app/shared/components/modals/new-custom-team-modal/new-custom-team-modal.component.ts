//External Modules
import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { ColorPickerModule } from 'primeng/colorpicker';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CountryObj, CupObj, LeagueObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';
import { TeamShirtComponent } from '../../team-shirt/team-shirt.component';
import { WizardStepsComponent } from '../../wizard-steps/wizard-steps.component';

@Component({
  selector: 'new-custom-team-modal',
  templateUrl: './new-custom-team-modal.template.html',
  styleUrls: ['../../../../../styles.css', './new-custom-team-modal.styles.css'],
  standalone: true,
  imports: [CheckboxModule, ColorPickerModule, CommonModule, FormsModule, InputTextModule, MessageModule, ProgressSpinnerModule, SelectModule, TeamShirtComponent, WizardStepsComponent]
})

export class NewCustomTeamModalComponent {

  //Declare arrays
  countries!: CountryObj[];
  leagues!: LeagueObj[];
  filteredLeagues!: LeagueObj[];
  cups!: CupObj[];
  compulsoryCups: CupObj[] = [];
  optionalCups: CupObj[] = [];
  selectedOptionalCups: CupObj[] = [];

  //Declare colour variables - same three-colour model used for every other team in the app
  primaryColour: string = "#FFFFFF";
  secondaryColour: string = "#000000";
  tertiaryColour: string = "#000000";

  //Declare variables
  stage: number = 1;
  selectedFemale: boolean = false;
  teamName!: string;
  selectedCountry!: CountryObj;
  selectedLeague!: LeagueObj;
  validCupSelection: boolean = true;
  validName: boolean = false;
  loading: boolean = false;
  baseUrl: string;
  spaceRegex = /\ /gi;
  dotRegex = /\./gi;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private router: Router,
    private teamsService: TeamsService, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  ngOnInit() {
    this.stage = 1;
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.moveLeft();
    } else if (event.key === 'ArrowRight') {
      this.moveRight();
    }
  }

  chooseGender(female: boolean) {
    this.selectedFemale = female;
    this.nextStep(1);
  }

  loadLeaguesForGender() {
    this.loading = true;

    this.http.get<LeagueObj[]>(this.baseUrl + "league", { params: { female: this.selectedFemale } }).subscribe(result => {
      result.forEach(r => {
        r.imgPath = "./assets/leagues/" + r.country.toLowerCase().replace(this.spaceRegex, "_") + "_" + r.league.toLowerCase().replace(this.spaceRegex, "_").replace(this.dotRegex, "_") + ".jpg";
      })
      this.leagues = result;
      this.getCountryList();
      this.loading = false;
    }, error => console.error(error));
  }

  getCountryList() {
    this.countries = [];
    let uniqueCountries = [...new Set(this.leagues.map(x => x.country))];
    uniqueCountries.forEach(c => {
      let country = this.leagues.filter(x => x.country == c)[0];
      this.countries.push({ country: country.country, countryCode: country.countryCode });
    });
    this.selectedCountry = this.countries[0];
  }

  getLeagues() {
    this.loading = true;
    this.filteredLeagues = this.leagues.filter(x => x.countryCode == this.selectedCountry.countryCode);
    this.selectedLeague = this.filteredLeagues[0];
    this.loading = false;
  }

  getCupCompetitions() {
    this.loading = true;

    this.http.get<CupObj[]>(this.baseUrl + "cup", { params: { countryCode: this.selectedCountry.countryCode } }).subscribe(result => {
      this.cups = result;
      this.compulsoryCups = this.cups.filter(x => x.compulsory);
      this.optionalCups = this.cups.filter(x => !x.compulsory);

      if (this.isEuropeanTeam()) {
        this.optionalCups.push({ cupName: "UEFA Champions League", numberOfGames: 13, compulsory: false },
          { cupName: "UEFA Europa League", numberOfGames: 15, compulsory: false },
          { cupName: "UEFA Europa Conference League", numberOfGames: 15, compulsory: false },
          { cupName: "UEFA Super Cup", numberOfGames: 1, compulsory: false });
      } else if (this.isAmericanTeam()) {
        this.optionalCups.push({ cupName: "Conmebol Libertadores", numberOfGames: 13, compulsory: false },
          { cupName: "Conmebol Sudamericana", numberOfGames: 16, compulsory: false },
          { cupName: "Conmebol Recopa", numberOfGames: 1, compulsory: false });
      }

      this.loading = false;
    }, error => console.error(error));
  }

  validateTeamName() {
    this.validName = this.teamName !== undefined && this.teamName.trim().length > 0 && this.teamName.trim().length < 38;
  }

  finishSelection() {
    let cups = this.compulsoryCups;
    this.selectedOptionalCups.forEach(soc => { cups.push(soc); });
    cups.forEach(c => {
      c.cupProgress = "";
      c.countryCode = c.cupName.startsWith("UEFA") ? "-" : c.cupName.startsWith("CONM") ? "-" : this.selectedCountry.countryCode;
    });

    let saveObj = {
      team: this.teamName, primaryColour: this.primaryColour, secondaryColour: this.secondaryColour, tertiaryColour: this.tertiaryColour,
      careerId: this.cmTrackerService.getCareerModeId(), countryCode: this.selectedCountry.countryCode, league: this.selectedLeague.league,
      female: this.selectedFemale, cups: cups, year: this.cmTrackerService.getCareerModeYear()
    };

    this.http.post<void>(this.baseUrl + "careerhub", saveObj).subscribe(() => {
      if (saveObj.year == undefined)
        this.cmTrackerService.setCareerStatus("Year 1");

      this.router.navigateByUrl('/').then(() => {
        this.router.navigate(["career-mode/hub"]);
      });
    }, error => {
      console.log("ERROR!", error);
    });
  }

  isAmericanTeam() { return this.teamsService.isAmericanTeam(this.selectedCountry.country, false); }

  isEuropeanTeam() { return this.teamsService.isEuropeanTeam(this.selectedCountry.country, false); }

  moveLeft() {
    if (this.stage == 3) this.moveCountry(-1);
    else if (this.stage == 4) this.moveLeague(-1);
  }

  moveRight() {
    if (this.stage == 3) this.moveCountry(1);
    else if (this.stage == 4) this.moveLeague(1);
  }

  moveCountry(movement: number) {
    //Movement: -1 = back, 1 = forward
    let index = this.countries.map(x => { return x.country }).indexOf(this.selectedCountry.country);
    if (index == 0 && movement == -1) index = this.countries.length - 1;
    else if (index == this.countries.length - 1 && movement == 1) index = 0;
    else if (movement == -1) index -= 1;
    else index += 1;

    this.selectedCountry = this.countries[index];
  }

  moveLeague(movement: number) {
    //Movement: -1 = back, 1 = forward
    let index = this.filteredLeagues.map(x => { return x.league }).indexOf(this.selectedLeague.league);
    if (index == 0 && movement == -1) index = this.filteredLeagues.length - 1;
    else if (index == this.filteredLeagues.length - 1 && movement == 1) index = 0;
    else if (movement == -1) index -= 1;
    else index += 1;

    this.selectedLeague = this.filteredLeagues[index];
  }

  validateCupSelection() {
    let cups = this.selectedOptionalCups.map(x => { return x.cupName });
    if ((this.selectedLeague.league == "Premier League" || this.selectedLeague.league == "EFL Championship") && cups.indexOf("Papa John's Trophy") > -1)
      this.validCupSelection = false;
    else if (cups.indexOf("UEFA Champions League") > -1 && cups.indexOf("UEFA Europa League") > -1)
      this.validCupSelection = false;
    else if (cups.indexOf("UEFA Champions League") > -1 && cups.indexOf("UEFA Europa Conference League") > -1)
      this.validCupSelection = false;
    else if (cups.indexOf("UEFA Europa League") > -1 && cups.indexOf("UEFA Europa Conference League") > -1)
      this.validCupSelection = false;
    else if ((cups.indexOf("UEFA Europa League") > -1 || cups.indexOf("UEFA Europa Conference League") > -1) && cups.indexOf("UEFA Super Cup") > -1)
      this.validCupSelection = false;
    else
      this.validCupSelection = true;
  }

  previousStep(stage: number) {
    this.stage = stage - 1;
  }

  nextStep(stage: number) {
    this.stage = stage + 1;

    switch (this.stage) {
      case 2:
        this.loadLeaguesForGender();
        break;
      case 4:
        this.getLeagues();
        break;
      case 5:
        this.getCupCompetitions();
        break;
    }
  }
}
