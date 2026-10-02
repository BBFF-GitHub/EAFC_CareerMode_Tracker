//External Modules
import { CommonModule } from '@angular/common';
import { Component, HostListener, Inject, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CupObj, LeagueObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';
import { TeamShirtComponent } from '../../team-shirt/team-shirt.component';

@Component({
  selector: 'stay-at-club-modal',
  templateUrl: './stay-at-club-modal.template.html',
  styleUrls: ['../../../../../styles.css', './stay-at-club-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CheckboxModule, CommonModule, FormsModule, MessageModule, ProgressSpinnerModule, SelectModule, TeamShirtComponent]
})

export class StayAtClubModalComponent {

  //Declare input variables
  @Input() currentTeamName!: string;
  @Input() currentTeamCountryCode!: string;
  @Input() currentTeamPrimary?: string;
  @Input() currentTeamSecondary?: string;
  @Input() currentTeamTertiary?: string;

  //Declare arrays
  leagues!: LeagueObj[];
  filteredLeagues!: LeagueObj[];
  cups!: CupObj[];
  compulsoryCups: CupObj[] = [];
  optionalCups: CupObj[] = [];
  selectedOptionalCups: CupObj[] = [];

  //Declare variables
  stage: number = 1;
  selectedLeague!: LeagueObj;
  selectedCountry!: string;
  validCupSelection: boolean = true;
  loading: boolean = false;
  baseUrl: string;
  spaceRegex = /\ /gi;
  dotRegex = /\./gi;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private router: Router,
    private teamsService: TeamsService, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.stage = 1;
    this.selectedCountry = this.teamsService.getCountryFromCode(this.currentTeamCountryCode);
    this.loading = true;

    this.http.get<LeagueObj[]>(this.baseUrl + "league").subscribe(result => {
      result.forEach(r => {
        r.imgPath = "./assets/leagues/" + r.country.toLowerCase().replace(this.spaceRegex, "_") + "_" + r.league.toLowerCase().replace(this.spaceRegex, "_").replace(this.dotRegex, "_") + ".jpg";
      })
      this.leagues = result;
      this.getLeagues();
      this.loading = false;
    }, error => console.error(error));
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowLeft') {
      this.moveLeft();
    } else if (event.key === 'ArrowRight') {
      this.moveRight();
    }
  }

  getLeagues() {
    this.loading = true;
    this.filteredLeagues = this.leagues.filter(x => x.countryCode == this.currentTeamCountryCode);
    this.selectedLeague = this.filteredLeagues[0];
    this.loading = false;
  }

  getCupCompetitions() {
    this.loading = true;

    this.http.get<CupObj[]>(this.baseUrl + "cup", { params: { countryCode: this.currentTeamCountryCode } }).subscribe(result => {
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

  finishSelection() {
    let cups = this.compulsoryCups;
    this.selectedOptionalCups.forEach(soc => { cups.push(soc); });
    cups.forEach(c => {
      c.cupProgress = "";
      c.countryCode = "";
    });
    let saveObj = {
      careerId: this.cmTrackerService.getCareerModeId(), countryCode: this.currentTeamCountryCode,
      team: this.currentTeamName, league: this.selectedLeague.league, cups: cups, stayWithClub: true
    };

    this.http.post<void>(this.baseUrl + "careerhub", saveObj).subscribe(() => {
      this.router.navigateByUrl('/').then(() => {
        this.router.navigate(["career-mode/hub"]);
      });
    }, error => {
      console.log("ERROR!", error);
    });
  }

  isAmericanTeam() { return this.teamsService.isAmericanTeam(this.currentTeamCountryCode, true); }

  isEuropeanTeam() { return this.teamsService.isEuropeanTeam(this.currentTeamCountryCode, true); }

  moveLeft() {
    if (this.stage == 1) this.moveLeague(-1);
  }

  moveRight() {
    if (this.stage == 1) this.moveLeague(1);
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
        this.getCupCompetitions();
        break;
    }
  }
}
