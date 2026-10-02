//External Modules
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

//PrimeNG Modules
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';

//Internal Modules
import { CurrentSeasonSquadPlayerObj } from '../../../../app.classes';

@Component({
  selector: 'player-table',
  templateUrl: './player-table.template.html',
  styleUrls: ['../../../../../styles.css', '../formations.styles.css'],
  standalone: true,
  imports: [CommonModule, InputNumberModule, TableModule, TooltipModule]
})

export class PlayerTableComponent {

  //Declare input and output variables
  @Input() squadList!: CurrentSeasonSquadPlayerObj[];
  @Input() title!: string;
  @Input() code!: string;
  @Input() cssClass!: string;
  @Input() fromOverview: boolean = false;
  @Output() addPlayerEmit = new EventEmitter<any>();
  @Output() reorderEmit = new EventEmitter<any>();

  //Declare other variables
  reorderMode: boolean = false;

  finishReorder() {
    this.squadList.forEach((s, i) => {
      if (s.order != i + 1) s.edited = true;
      s.order = i + 1;
    });
    this.reorderMode = false;
    this.reorderEmit.emit({ squad: this.squadList, changes: this.squadList.filter(x => x.edited).length > 0 });
  }

  addPlayer() {
    let orderNums: number[] = this.squadList.map(x => { return x.order == undefined ? 0 : x.order; });
    orderNums = orderNums.sort((a, b) => b - a);
    this.addPlayerEmit.emit({ code: this.code, order: orderNums.length == 0 ? 1 : orderNums[0] + 1 });
  }
}
