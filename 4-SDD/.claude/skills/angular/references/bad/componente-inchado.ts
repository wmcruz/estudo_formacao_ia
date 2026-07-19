<critical>
Esta é uma REFERENCE da skill Angular. Você DEVE carregá-la e processá-la obrigatoriamente sempre que a skill for ativada.
</critical>

import { Component, OnInit, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

interface Post {
  id: number;
  title: string;
  body: string;
  userId: number;
}

@Component({
  selector: 'app-post-dashboard',
  standalone: true,
  template: `
    <div>
      <h1>{{ pageTitle }}</h1>
      <form [formGroup]="postForm">
        <input formControlName="title" />
        <textarea formControlName="body"></textarea>
        <button (click)="submitPost()">Salvar</button>
      </form>
      <div *ngFor="let post of filteredPosts">
        <h3>{{ formatTitle(post.title) }}</h3>
        <p>{{ post.body }}</p>
        <button (click)="deletePost(post.id)">Excluir</button>
      </div>
      <div *ngIf="hasError" class="error">{{ errorMessage }}</div>
    </div>
  `
})
export class PostDashboardComponent implements OnInit {
  public posts: Post[] = [];
  public filteredPosts: Post[] = [];
  public hasError = false;
  public errorMessage = '';
  public pageTitle = 'Dashboard de Posts';
  public postForm: FormGroup;
  public isLoading = signal(false);

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private router: Router
  ) {
    this.postForm = this.fb.group({
      title: ['', Validators.required],
      body: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.isLoading.set(true);
    this.http.get<Post[]>('http://localhost:8080/api/posts')
      .pipe(
        map(posts => posts.filter(p => p.userId === 1)),
        catchError(err => {
          this.hasError = true;
          this.errorMessage = 'Falha ao carregar posts';
          this.toastr.error('Erro de conexão');
          return of([]);
        })
      )
      .subscribe(posts => {
        this.posts = posts;
        this.filteredPosts = posts;
        this.isLoading.set(false);
      });
  }

  public formatTitle(title: string): string {
    return title.trim().toUpperCase();
  }

  public submitPost(): void {
    if (this.postForm.invalid) return;
    this.http.post('http://localhost:8080/api/posts', this.postForm.value)
      .subscribe({
        next: () => {
          this.toastr.success('Post criado');
          this.router.navigate(['/posts']);
        },
        error: () => {
          this.toastr.error('Erro ao salvar');
        }
      });
  }

  public deletePost(id: number): void {
    this.http.delete(`http://localhost:8080/api/posts/${id}`)
      .subscribe({
        next: () => {
          this.posts = this.posts.filter(p => p.id !== id);
          this.filteredPosts = this.filteredPosts.filter(p => p.id !== id);
          this.toastr.success('Post excluído');
        },
        error: () => {
          this.toastr.error('Erro ao excluir');
        }
      });
  }
}
