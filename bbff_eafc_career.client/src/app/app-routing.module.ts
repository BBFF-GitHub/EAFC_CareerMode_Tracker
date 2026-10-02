//External Modules
import { Routes } from '@angular/router';

//Internal Modules
import { CareerModeDashboardComponent } from './career-mode/dashboard/career-mode-dashboard.component';
import { CareerModeHeadToHeadComponent } from './career-mode/head-to-head/career-mode-head-to-head.component';
import { CareerModeHubComponent } from './career-mode/hub/career-mode-hub.component';
import { CareerModeOverviewComponent } from './career-mode/overview/career-mode-overview.component';
import { CareerModePlayerStatsComponent } from './career-mode/player-stats/career-mode-player-stats.component';
import { CareerModeTransfersComponent } from './career-mode/transfers/career-mode-transfers.component';
import { HomeComponent } from './home/home.component';
import { SeasonHistoryComponent } from './career-mode/season-history/season-history.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'career-mode/hub', component: CareerModeHubComponent },
  { path: 'career-mode/dashboard', component: CareerModeDashboardComponent },
  { path: 'career-mode/overview', component: CareerModeOverviewComponent },
  { path: 'career-mode/season-history/:yr', component: SeasonHistoryComponent },
  { path: 'career-mode/player-stats', component: CareerModePlayerStatsComponent },
  { path: 'career-mode/head-to-head', component: CareerModeHeadToHeadComponent },
  { path: 'career-mode/transfers', component: CareerModeTransfersComponent },
];
