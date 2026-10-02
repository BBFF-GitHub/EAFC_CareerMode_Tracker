//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TableModule } from 'primeng/table';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CareerObj } from '../../../../app.classes';

@Component({
  selector: 'load-existing-career-modal',
  templateUrl: './load-existing-career-modal.template.html',
  styleUrls: ['../../../../../styles.css', './load-existing-career-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, ProgressSpinnerModule, TableModule]
})

export class LoadExistingCareerModalComponent {

  //Declare array variables
  savedGames!: CareerObj[];

  //Declare other variables
  loading: boolean = false;
  baseUrl: string;

  constructor(private cmTrackerService: CareerModeTrackerService, private http: HttpClient, private messageService: MessageService,
    private router: Router, @Inject('BASE_URL') baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  ngOnInit() {
    this.loading = true;
    this.http.get<CareerObj[]>(this.baseUrl + "career").subscribe(result => {
      this.savedGames = result;
      this.loading = false;
    }, error => console.error(error));
  }

  openCareerMode(id: number) {
    this.cmTrackerService.setCareerModeId(id);
    this.cmTrackerService.setCareerModeName(this.savedGames.filter(x => x.id == id)[0].name);
    this.cmTrackerService.setCareerStatus(this.savedGames.filter(x => x.id == id)[0].currentSeason ?? "");
    this.cmTrackerService.setCareerCurrency(this.savedGames.filter(x => x.id == id)[0].currencySymbol ?? "");
    this.router.navigate(["career-mode/hub"]);
  }

  deleteCareerMode(id: number) {
    this.http.delete(this.baseUrl + "career", { params: { careerId: id } }).subscribe(result => {
      if (result) {
        this.messageService.add({ severity: "success", summary: "Success!", detail: "The selected career mode has been deleted!" });
        this.ngOnInit();
      } else {
        this.messageService.add({ severity: "error", summary: "Error!", detail: "There was an issue deleting the selected career mode!" });
      }
    });
  }
}
