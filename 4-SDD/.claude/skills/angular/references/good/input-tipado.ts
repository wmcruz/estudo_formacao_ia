<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, input, output } from '@angular/core';

interface Column {
  key: string;
  label: string;
  width?: string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  template: `
    <table>
      <tr *ngFor="let item of data()">
        <td *ngFor="let col of columns()">{{ item[col.key] }}</td>
      </tr>
    </table>
    <button (click)="action.emit(selectedItem())" [disabled]="!selectedItem()">
      {{ actionLabel() }}
    </button>
  `
})
export class DataTableComponent<T extends Record<string, unknown>> {
  public data = input.required<T[]>();
  public columns = input.required<Column[]>();
  public actionLabel = input('Ação');
  public action = output<T>();

  public selectedItem = signal<T | null>(null);
}
