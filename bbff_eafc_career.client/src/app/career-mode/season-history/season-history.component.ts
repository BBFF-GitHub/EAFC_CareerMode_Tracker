//External Modules
import { ActivatedRoute, Router } from '@angular/router';
import { Component, Inject } from '@angular/core';

//Internal Modules
import { CareerModeTrackerService } from '../../shared/services/career-mode-tracker.service';
import { CurrentSeasonComponent } from '../../shared/components/current-season/current-season.component';

@Component({
  selector: 'season-history',
  templateUrl: './season-history.template.html',
  styleUrls: ['../../../styles.css', './season-history.styles.css'],
  standalone: true,
  imports: [CurrentSeasonComponent]
})

export class SeasonHistoryComponent {

  //Declare variables
  careerModeId!: number;
  year!: number;
  baseUrl: string;

  constructor(private activatedRoute: ActivatedRoute, private cmTrackerService: CareerModeTrackerService, private router: Router,
    @Inject('BASE_URL') baseUrl: string) { this.baseUrl = baseUrl; }

  ngOnInit() {
    this.careerModeId = this.cmTrackerService.getCareerModeId();
    if (this.careerModeId == undefined || this.careerModeId == 0)
      this.router.navigate(["/"]);

    this.activatedRoute.params.subscribe(x => {
      this.year = x['yr'];
    });
  }

  backToOverview() {
    this.router.navigate(["/career-mode/overview"]);
  }
}
