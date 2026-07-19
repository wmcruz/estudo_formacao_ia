<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, Input } from '@angular/core';

interface User {
  name: string;
  role: string;
  createdAt: string;
}

@Component({
  selector: 'app-user-card',
  standalone: true,
  template: `
    <div>
      <h2>{{ formatName(user.name) }}</h2>
      <span class="badge" [style.background]="getRoleColor(user.role)">
        {{ user.role }}
      </span>
      <small>{{ daysSinceCreation(user.createdAt) }} dias atrás</small>
      <div *ngIf="hasPermission(user.role)">Ações disponíveis</div>
    </div>
  `
})
export class UserCardComponent {
  @Input() public user!: User;

  public formatName(name: string): string {
    return name.split(' ').map(n => n.charAt(0).toUpperCase() + n.slice(1)).join(' ');
  }

  public getRoleColor(role: string): string {
    const colors: Record<string, string> = { admin: '#ff0000', user: '#00ff00', guest: '#cccccc' };
    return colors[role] || '#000000';
  }

  public daysSinceCreation(date: string): number {
    return Math.floor((Date.now() - new Date(date).getTime()) / 86400000);
  }

  public hasPermission(role: string): boolean {
    return role === 'admin' || role === 'user';
  }
}
