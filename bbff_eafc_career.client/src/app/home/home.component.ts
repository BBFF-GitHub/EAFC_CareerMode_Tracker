//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';

//Internal Modules
import { CreateNewCareerModalComponent } from '../shared/components/modals/create-new-career-modal/create-new-career-modal.component';
import { LoadExistingCareerModalComponent } from '../shared/components/modals/load-existing-career-modal/load-existing-career-modal.component';
import { ImportPlayerDataModalComponent } from '../shared/components/modals/import-player-data-modal/import-player-data-modal.component';
import { HomeHeroObj } from '../app.classes';

@Component({
  selector: 'app-home',
  templateUrl: './home.template.html',
  styleUrls: ['../../styles.css', './home.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, CreateNewCareerModalComponent, DialogModule, ImportPlayerDataModalComponent, LoadExistingCareerModalComponent]
})

export class HomeComponent {

  //Declare array variables
  coverStars: CoverStarObj[] = [
    { name: "Alex Morgan", path: "./assets/homepage/morgan-home.png" },
    { name: "Cole Palmer", path: "./assets/homepage/palmer-home.png" },
    { name: "Endrick", path: "./assets/homepage/endrick-home.png" },
    { name: "Jamal Musiala", path: "./assets/homepage/musiala-home.png" },
    { name: "Jude Bellingham", path: "./assets/homepage/bellingham-home.png" },
    { name: "Virgil van Dijk", path: "./assets/homepage/van-dijk-home.png" },
    { name: "Zlatan Ibrahimovic", path: "./assets/homepage/zlatan-home.png" }
  ];

  //Declare other variables
  chosenStar!: CoverStarObj;
  hero?: HomeHeroObj;
  showImportPlayerDataLink: boolean = false;
  showModal: boolean = false;
  modalMode: string = "";
  modalHeader: string = "";
  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    let rndNum = Math.floor(Math.random() * this.coverStars.length) + 1;
    this.chosenStar = this.coverStars[rndNum - 1];

    //Default cover-star hero shows immediately; swapped for the career hero if one comes back
    this.http.get<HomeHeroObj>(this.baseUrl + "home").subscribe(result => {
      if (result?.heroAvailable) this.hero = result;
    }, error => console.error(error));

    //A once-off action - only offered while the table is genuinely empty, rather than
    //sitting there permanently inviting an accidental re-import over real career data
    this.http.get<number>(this.baseUrl + "officialplayerdata/count").subscribe(result => {
      this.showImportPlayerDataLink = (result === 0);
    }, error => console.error(error));
  }

  createNewCareer() {
    this.showModal = true;
    this.modalMode = "create-new-career-modal";
    this.modalHeader = "Create New Career Mode";
  }

  loadExistingCareer() {
    this.showModal = true;
    this.modalMode = "load-existing-career-modal";
    this.modalHeader = "Load Existing Career Mode";
  }

  openImportPlayerData() {
    this.showModal = true;
    this.modalMode = "import-player-data-modal";
    this.modalHeader = "Import Player Data";
  }
}

interface CoverStarObj {
  name: string;
  path: string;
}
