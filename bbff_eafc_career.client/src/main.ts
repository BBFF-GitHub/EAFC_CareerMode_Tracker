//External Modules
import { bootstrapApplication } from '@angular/platform-browser';
import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';

//PrimeNG Modules
import { MessageService } from 'primeng/api';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

//Internal Modules
import { AppComponent } from './app/app.component';
import { AppModule } from './app/app.module';
import { CareerModeTrackerService } from './app/shared/services/career-mode-tracker.service';
import { ChartsService } from './app/shared/services/charts.service';
import { environment } from './environments/environment';
import { FormattingService } from './app/shared/services/formatting.service';
import { PlayerPicService } from './app/shared/services/player-pic.service';
import { routes } from './app/app-routing.module';
import { TeamsService } from './app/shared/services/teams.service';
import { UtilitiesService } from './app/shared/services/utilities.service';

export function getBaseUrl() {
  return document.getElementsByTagName('base')[0].href;
}

const providers = [
  { provide: 'BASE_URL', useFactory: getBaseUrl, deps: [] }
];

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic(providers).bootstrapModule(AppModule)
  .catch(err => console.log(err));

bootstrapApplication(AppComponent, {
  providers: [CareerModeTrackerService, ChartsService, FormattingService, MessageService, PlayerPicService, TeamsService, UtilitiesService,
    provideAnimations(), provideHttpClient(), provideRouter(routes),
    providePrimeNG({
      theme: { preset: Aura, options: { darkModeSelector: '.app-dark' } },
      ripple: true
    })
  ]
}).catch(err => console.error(err));
