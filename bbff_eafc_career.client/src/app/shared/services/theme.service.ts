//External Modules
import { Injectable } from '@angular/core';

const STORAGE_KEY = "eafc-theme";

@Injectable({ providedIn: 'root' })
export class ThemeService {

  isDarkMode: boolean = false;

  constructor() {
    let stored = localStorage.getItem(STORAGE_KEY);
    this.isDarkMode = stored === "dark";
    this.applyTheme();
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    localStorage.setItem(STORAGE_KEY, this.isDarkMode ? "dark" : "light");
    this.applyTheme();
  }

  applyTheme() {
    document.documentElement.classList.toggle('app-dark', this.isDarkMode);
  }
}
