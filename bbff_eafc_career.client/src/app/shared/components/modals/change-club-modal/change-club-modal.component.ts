//External Modules
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';

//PrimeNG Modules
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';

//Internal Modules
import { CareerModeTrackerService } from '../../../services/career-mode-tracker.service';
import { CurrentSeasonSquadPlayerObj } from '../../../../app.classes';
import { TeamsService } from '../../../services/teams.service';

@Component({
  selector: 'change-club-modal',
  templateUrl: './change-club-modal.template.html',
  styleUrls: ['../../../../../styles.css', './change-club-modal.styles.css'],
  standalone: true,
  imports: [ButtonModule, FormsModule, SelectModule]
})

export class ChangeClubModalComponent {

  //Declare input and output variables
  @Input() playerToChange!: CurrentSeasonSquadPlayerObj;
  @Output() changePlayerEmit = new EventEmitter<any>();

  //Declare array variables
  teams!: string[];

  //Declare other variables
  player!: CurrentSeasonSquadPlayerObj;
  oldClub!: string;
  bigPhoto!: string;
  loading: boolean = false;
  editClubModalEvent!: Subscription;

  constructor(private cmTrackerService: CareerModeTrackerService, private teamsService: TeamsService) { }

  ngOnInit() {
    this.freshModal(this.playerToChange);

    this.editClubModalEvent = this.cmTrackerService.editClubModal.subscribe(x => {
      this.freshModal(x);
    });
  }

  ngOnDestroy() {
    if (this.editClubModalEvent !== undefined) this.editClubModalEvent.unsubscribe();
  }

  freshModal(player: CurrentSeasonSquadPlayerObj) {
    this.player = player;
    this.oldClub = player.currentClub;
    this.bigPhoto = player.imagePath?.replace("_60.", "_240.") ?? "";
    this.teams = [];
    this.teamsService.allTeams.filter(x => x.countryCode != "INT").forEach(t => {
      this.teams.push(t.team);
    });
  }

  saveClubChange() {
    this.player.edited = true;
    this.changePlayerEmit.emit({ player: this.player, oldClub: this.oldClub });
  }
}

