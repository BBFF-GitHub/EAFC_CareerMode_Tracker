//External Modules
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'wizard-steps',
  templateUrl: './wizard-steps.template.html',
  styleUrls: ['./wizard-steps.styles.css'],
  standalone: true,
  imports: [CommonModule]
})

export class WizardStepsComponent {

  //Declare input variables
  @Input() steps!: string[];
  @Input() currentStep!: number; //1-indexed, matching each modal's existing "stage" numbering

  stepState(index: number) {
    let stepNumber = index + 1;
    if (stepNumber < this.currentStep) return "done";
    if (stepNumber == this.currentStep) return "current";
    return "upcoming";
  }
}
