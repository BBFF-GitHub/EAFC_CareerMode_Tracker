//External Modules
import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { MessageModule } from 'primeng/message';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

@Component({
  selector: 'import-player-data-modal',
  templateUrl: './import-player-data-modal.template.html',
  styleUrls: ['../../../../../styles.css', './import-player-data-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, MessageModule, ProgressSpinnerModule]
})

export class ImportPlayerDataModalComponent {

  selectedFile?: File;
  currentCount?: number;
  importedCount?: number;
  loading: boolean = false;
  errorMessage?: string;
  baseUrl: string;

  constructor(private http: HttpClient, @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.http.get<number>(this.baseUrl + "officialplayerdata/count").subscribe(result => {
      this.currentCount = result;
    }, error => console.error(error));
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) this.selectedFile = input.files[0];
  }

  upload() {
    if (!this.selectedFile) return;

    this.loading = true;
    this.errorMessage = undefined;

    let formData = new FormData();
    formData.append("file", this.selectedFile);

    this.http.post<{ imported: number }>(this.baseUrl + "officialplayerdata/import", formData).subscribe(result => {
      this.importedCount = result.imported;
      this.currentCount = result.imported;
      this.loading = false;
    }, error => {
      this.errorMessage = error.status === 409
        ? "Player data already exists - this is a once-off import. Clear the OfficialPlayerData table first if you need to replace it."
        : "Import failed - check the file is a CSV in the Name,Photo,Nationality,Flag,Position,OGClub,Gender format.";
      this.loading = false;
      console.error(error);
    });
  }
}
