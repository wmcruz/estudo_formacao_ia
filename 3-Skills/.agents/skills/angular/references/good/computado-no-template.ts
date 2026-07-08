<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, computed, input } from '@angular/core';
import { DatePipe, TitleCasePipe } from '@angular/common';

@Component({
  selector: 'app-user-card',
  standalone: true,
  imports: [DatePipe],
  template: `
    <div>
      <h2>{{ formattedName() }}</h2>
      <span class="badge" [style.background]="roleColor()">
        {{ user().role }}
      </span>
      <small>{{ user().createdAt | date: 'dd/MM/yyyy' }}</small>
      <div *ngIf="canShowActions()">Ações disponíveis</div>
    </div>
  `
})
export class UserCardComponent {
  public user = input.required<User>();

  private readonly roleColors: Record<string, string> = {
    admin: '#ff0000', user: '#00ff00', guest: '#cccccc'
  };

  public formattedName = computed(() =>
    this.user().name
      .split(' ')
      .map(n => n.charAt(0).toUpperCase() + n.slice(1))
      .join(' ')
  );

  public roleColor = computed(() =>
    this.roleColors[this.user().role] || '#000000'
  );

  public canShowActions = computed(() =>
    this.user().role === 'admin' || this.user().role === 'user'
  );
}
