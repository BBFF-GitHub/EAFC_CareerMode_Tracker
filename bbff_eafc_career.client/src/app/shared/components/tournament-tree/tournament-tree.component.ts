//External Modules
import { Component, Input } from '@angular/core';

@Component({
  selector: 'tournament-tree',
  templateUrl: './tournament-tree.template.html',
  styleUrls: ['../../../../styles.css', './tournament-tree.styles.css']
})

export class TournamentTreeComponent {

  //Declare input and output variables
  @Input() cupData!: any[];

  //Declare tournament tree-related variables
  rounds: string[] = [];
  fixtures: any[] = [];

  ngOnInit() {
    for (var i = this.cupData.length; i > 0; i--) {
      if (i == this.cupData.length)
        this.rounds.unshift("Final");
      else if (i == this.cupData.length - 1)
        this.rounds.unshift("Semi-Finals");
      else if (i == this.cupData.length - 2)
        this.rounds.unshift("Quarter-Finals");
      else
        this.rounds.unshift("Round " + i);

      this.fixtures.unshift(this.cupData[i - 1].fixtures);
    }
  }

}
