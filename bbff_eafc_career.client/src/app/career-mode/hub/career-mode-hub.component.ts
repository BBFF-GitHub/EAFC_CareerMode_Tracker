//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { DialogModule } from 'primeng/dialog';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

//Internal Modules
import { AuthenticClubModalComponent } from '../../shared/components/modals/authentic-club-modal/authentic-club-modal.component';
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { CareerObj } from '../../app.classes';
import { CurrentSeasonComponent } from '../../shared/components/current-season/current-season.component';
import { InternationalViewComponent } from '../../shared/components/international-view/international-view.component';
import { NewCustomTeamModalComponent } from '../../shared/components/modals/new-custom-team-modal/new-custom-team-modal.component';

@Component({
  selector: 'career-mode-hub',
  templateUrl: './career-mode-hub.template.html',
  styleUrls: ['../../../styles.css', './career-mode-hub.styles.css'],
  standalone: true,
  imports: [AuthenticClubModalComponent, CommonModule, CurrentSeasonComponent, DialogModule, InternationalViewComponent,
    NewCustomTeamModalComponent, ProgressSpinnerModule]
})

export class CareerModeHubComponent {

  //Declare variables
  careerModeId!: number;
  year!: number;
  newCareer: boolean = true;
  showModal: boolean = false;
  modalMode: string = "";
  modalHeader: string = "";
  loading: boolean = true;
  viewModeClub: boolean = true;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private router: Router,
    @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.loading = true;
    this.careerModeId = this.cmTrackerService.getCareerModeId();
    if (this.careerModeId == undefined || this.careerModeId == 0)
      this.router.navigate(["/"]);

    this.http.get<CareerObj>(this.baseUrl + "careerhub", { params: { careerId: this.careerModeId } }).subscribe(result => {
      if (result.currentSeason == "NOT STARTED" || result.currentSeason == undefined) {
        this.newCareer = true;
        this.loading = false;
      } else {
        this.newCareer = false;
        this.year = 0;
        if (result.currentSeason == "FINISHED") this.year = 16;
        else this.year = Number(result.currentSeason.split(' ')[1]);
        this.cmTrackerService.setCareerYear(this.year);
        this.loading = false;
      }
    });
  }

  startCareer(mode: string) {
    this.showModal = true;
    if (mode == "Authentic Club") {
      this.modalMode = "authentic-club-modal";
      this.modalHeader = "Start with Authentic Club";
    } else {
      this.modalMode = "new-custom-team-modal";
      this.modalHeader = "Start with Custom Team";
    }
  }

  switchView() { this.viewModeClub = !this.viewModeClub; }
}
