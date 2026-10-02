//External Modules
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { TableModule } from 'primeng/table';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { UtilitiesService } from '../../../services/utilities.service';

@Component({
  selector: 'trophy-cabinet-modal',
  templateUrl: './trophy-cabinet-modal.template.html',
  styleUrls: ['../../../../../styles.css', './trophy-cabinet-modal.styles.css'],
  standalone: true,
  imports: [CommonModule, TableModule]
})

export class TrophyCabinetModalComponent {

  //Declare input and output variables
  @Input() trophyCabinet!: any[];
  @Input() tileHeader!: string;

  //Declare other variables
  openModalEvent!: Subscription;

  constructor(private cmTrackerService: CareerModeTrackerService, private utils: UtilitiesService) { }

  ngOnInit() {
    this.tidyCabinet();

    this.openModalEvent = this.cmTrackerService.tileModal.subscribe(x => {
      this.tileHeader = x.header;
      this.tidyCabinet();
    });
  }

  tidyCabinet() {
    this.trophyCabinet.forEach(tc => {
      if (this.utils.allLeagues.indexOf(tc.cupName) > -1) {
        tc.cupType = "League";
        tc.cupTypeIndex = 0;
      } else if (tc.cupName.startsWith("UEFA")) {
        tc.cupType = "European";
        tc.cupTypeIndex = 2;
      } else if (tc.cupName.startsWith("Conmebol")) {
        tc.cupType = "American";
        tc.cupTypeIndex = 3;
      } else {
        tc.cupType = "Domestic Cup";
        tc.cupTypeIndex = 1;
      }
    });

    this.trophyCabinet = this.trophyCabinet.sort((a, b) => a.cupTypeIndex - b.cupTypeIndex);
  }
}
