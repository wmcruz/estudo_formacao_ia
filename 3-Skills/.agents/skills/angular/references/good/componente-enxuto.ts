<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, OnInit, inject, signal } from '@angular/core';

@Component({
  selector: 'app-post-dashboard',
  standalone: true,
  template: `
    <app-post-form (saved)="onSaved()"></app-post-form>
    <app-post-table
      [posts]="posts()"
      [loading]="isLoading()"
      (delete)="onDelete($event)"
    ></app-post-table>
    <app-error-banner *ngIf="hasError()" [message]="errorMessage()"></app-error-banner>
  `
})
export class PostDashboardComponent implements OnInit {
  private readonly postService = inject(PostService);
  private readonly notificationService = inject(NotificationService);

  public posts = signal<Post[]>([]);
  public isLoading = signal(false);
  public hasError = signal(false);
  public errorMessage = signal('');

  ngOnInit() {
    this.isLoading.set(true);
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.hasError.set(true);
        this.errorMessage.set('Falha ao carregar posts');
        this.isLoading.set(false);
      }
    });
  }

  public onDelete(id: number): void {
    this.postService.deletePost(id).subscribe({
      next: () => {
        this.posts.update(list => list.filter(p => p.id !== id));
        this.notificationService.success('Post excluído');
      },
      error: () => this.notificationService.error('Erro ao excluir')
    });
  }

  public onSaved(): void {
    this.notificationService.success('Post criado');
  }
}
