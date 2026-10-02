//External Modules
import { Component, Input } from '@angular/core';

//Fallback colours used until a team has been migrated to the new colour columns,
//or if a colour is missing for any other reason - a plain grey kit rather than a broken swatch.
const FALLBACK_PRIMARY = '#4B5563';
const FALLBACK_SECONDARY = '#9CA3AF';
const FALLBACK_TERTIARY = '#1F2937';

@Component({
  selector: 'team-shirt',
  templateUrl: './team-shirt.template.html',
  styleUrls: ['./team-shirt.styles.css'],
  standalone: true
})

export class TeamShirtComponent {

  //Declare input variables
  @Input() primary?: string;
  @Input() secondary?: string;
  @Input() tertiary?: string;
  @Input() size: number = 48;
  @Input() teamName?: string;

  //Kit is drawn on a 72x58 viewBox - keep width/height in that ratio whatever size is requested
  get width() { return this.size; }
  get height() { return Math.round(this.size * (58 / 72)); }

  get fillPrimary() { return this.primary || FALLBACK_PRIMARY; }
  get fillSecondary() { return this.secondary || FALLBACK_SECONDARY; }
  get fillTertiary() { return this.tertiary || FALLBACK_TERTIARY; }

  get ariaLabel() { return this.teamName ? `${this.teamName} kit` : 'Team kit'; }
}
