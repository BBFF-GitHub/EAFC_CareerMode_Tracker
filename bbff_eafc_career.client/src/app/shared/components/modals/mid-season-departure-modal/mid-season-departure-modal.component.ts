//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'mid-season-departure-modal',
  templateUrl: './mid-season-departure-modal.template.html',
  styleUrls: ['../../../../../styles.css', './mid-season-departure-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule]
})

export class MidSeasonDepartureModalComponent {

  //Declare input and output variables
  @Input() currentTeamName!: string;
  @Output() departureReasonEmit = new EventEmitter<string>();

  chooseReason(reason: string) { this.departureReasonEmit.emit(reason); }
}
