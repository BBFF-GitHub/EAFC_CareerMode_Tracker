//External Modules
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';

//Internal Modules
import { CareerModeTrackerService } from '../shared/services/career-mode-tracker.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.template.html',
  styleUrls: ['../../styles.css', './nav-menu.styles.css'],
  standalone: true,
  imports: [ButtonModule, CommonModule, RouterModule],
})

export class NavMenuComponent {

  //Declare variables
  isExpanded = false;

  constructor(public cmTrackerService: CareerModeTrackerService) { }

  collapse() {
    this.isExpanded = false;
  }

  toggle() {
    this.isExpanded = !this.isExpanded;
  }
}
