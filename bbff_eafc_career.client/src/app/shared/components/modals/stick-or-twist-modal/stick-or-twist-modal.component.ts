//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'stick-or-twist-modal',
  templateUrl: './stick-or-twist-modal.template.html',
  styleUrls: ['../../../../../styles.css', './stick-or-twist-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule]
})

export class StickOrTwistModalComponent {

  //Declare input and output variables
  @Input() currentTeamName!: string;
  @Input() currentTeamImg!: string;
  @Input() currentTeamStyle!: string;
  @Output() stickOrTwistEmit = new EventEmitter<boolean>();

  constructor() {  }

  makeDecision(stay: boolean) { this.stickOrTwistEmit.emit(stay); }
}
