<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header>
      <a routerLink="/">Home</a>
      <a routerLink="/posts">Posts</a>
      <a routerLink="/about">Sobre</a>
    </header>
  `
})
export class HeaderComponent {}

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `<footer>&copy; 2026</footer>`
})
export class FooterComponent {}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink],
  template: `
    <nav>
      <a routerLink="/profile">Perfil</a>
      <a routerLink="/settings">Configurações</a>
    </nav>
  `
})
export class SidebarComponent {}
