import { Injectable, inject, signal, Signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { Post } from '../models/post.model';
import { ErrorResponse } from '../models/error-response.model';

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private readonly apiUrl = 'http://localhost:8080/api/posts';
  private readonly http = inject(HttpClient);

  private readonly postsState = signal<Post[]>([]);
  private readonly tableLoadingState = signal(false);
  private readonly tableErrorState = signal<string | null>(null);
  private readonly searchedPostState = signal<Post | null>(null);
  private readonly searchLoadingState = signal(false);
  private readonly searchErrorState = signal<string | null>(null);

  readonly posts: Signal<Post[]> = this.postsState.asReadonly();
  readonly tableLoading: Signal<boolean> = this.tableLoadingState.asReadonly();
  readonly tableError: Signal<string | null> = this.tableErrorState.asReadonly();
  readonly searchedPost: Signal<Post | null> = this.searchedPostState.asReadonly();
  readonly searchLoading: Signal<boolean> = this.searchLoadingState.asReadonly();
  readonly searchError: Signal<string | null> = this.searchErrorState.asReadonly();

  private readonly ERROR_MESSAGES: Record<string, string> = {
    POST_NOT_FOUND: 'Post não encontrado',
    INVALID_POST_ID: 'ID do post deve ser um número inteiro positivo',
    EXTERNAL_API_ERROR: 'Não foi possível se comunicar com o serviço externo. Tente novamente.',
    UNKNOWN_ERROR: 'Ocorreu um erro inesperado. Tente novamente.'
  };

  getFriendlyMessage(error: ErrorResponse): string {
    const code = error?.error?.code;
    return this.ERROR_MESSAGES[code] ?? this.ERROR_MESSAGES['UNKNOWN_ERROR'];
  }

  getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl).pipe(
      catchError(this.handleError)
    );
  }

  getPostById(id: number): Observable<Post> {
    return this.http.get<Post>(`${this.apiUrl}/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  loadPosts(): void {
    this.tableLoadingState.set(true);
    this.tableErrorState.set(null);
    this.getPosts().subscribe({
      next: (posts) => this.applyPosts(posts),
      error: (error) => this.applyTableError(error)
    });
  }

  searchPost(id: number): void {
    this.searchLoadingState.set(true);
    this.searchErrorState.set(null);
    this.searchedPostState.set(null);
    this.getPostById(id).subscribe({
      next: (post) => this.applySearchResult(post),
      error: (error) => this.applySearchError(error)
    });
  }

  private applyPosts(posts: Post[]): void {
    this.postsState.set(posts);
    this.tableLoadingState.set(false);
  }

  private applyTableError(error: ErrorResponse): void {
    this.tableErrorState.set(this.getFriendlyMessage(error));
    this.tableLoadingState.set(false);
  }

  private applySearchResult(post: Post): void {
    this.searchedPostState.set(post);
    this.searchLoadingState.set(false);
  }

  private applySearchError(error: ErrorResponse): void {
    this.searchErrorState.set(this.getFriendlyMessage(error));
    this.searchLoadingState.set(false);
  }

  private handleError(error: HttpErrorResponse) {
    let errorResponse: ErrorResponse;

    if (error.error && error.error.error) {
      errorResponse = error.error as ErrorResponse;
    } else {
      errorResponse = {
        error: {
          code: 'UNKNOWN_ERROR',
          message: 'An unknown error occurred'
        }
      };
    }

    return throwError(() => errorResponse);
  }
}
