//Angular Modules
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

//PrimeNG Modules
import { MessageService } from 'primeng/api';

//Internal Modules
import { AppComponent } from './app.component';
import { CareerModeTrackerService } from './shared/services/career-mode-tracker.service';
import { ChartsService } from './shared/services/charts.service';
import { FormattingService } from './shared/services/formatting.service';
import { PlayerPicService } from './shared/services/player-pic.service';
import { TeamsService } from './shared/services/teams.service';
import { UtilitiesService } from './shared/services/utilities.service';

@NgModule({
  declarations: [],
  imports: [BrowserModule],
  providers: [CareerModeTrackerService, ChartsService, FormattingService, MessageService, PlayerPicService,
    TeamsService, UtilitiesService],
  bootstrap: [AppComponent]
})

export class AppModule { }
