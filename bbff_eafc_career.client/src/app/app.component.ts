//External Modules
import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

//PrimeNG Modules
import { ToastModule } from 'primeng/toast';

//Internal Modules
import { NavMenuComponent } from './nav-menu/nav-menu.component';
import { ThemeService } from './shared/services/theme.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.template.html',
  standalone: true,
  imports: [CommonModule, NavMenuComponent, RouterOutlet, ToastModule],
})

export class AppComponent {

  constructor(public router: Router, public themeService: ThemeService) { }

}
