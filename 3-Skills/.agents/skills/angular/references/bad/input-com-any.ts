<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <table>
      <tr *ngFor="let item of data">
        <td *ngFor="let col of columns">{{ item[col] }}</td>
      </tr>
    </table>
    <button (click)="onAction.emit(selectedItem)">Ação</button>
  `
})
export class DataTableComponent {
  @Input() public data: any[] = [];
  @Input() public columns: string[] = [];
  @Input() public config: any;
  @Output() public onAction = new EventEmitter<any>();

  public selectedItem: any;
}
