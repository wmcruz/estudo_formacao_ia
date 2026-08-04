import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostSearchComponent } from '../../../components/post-search/post-search.component';
import { PostTableComponent } from '../../../components/post-table/post-table.component';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { ErrorResponse } from '../../../models/error-response.model';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [CommonModule, PostSearchComponent, PostTableComponent],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.css'
})
export class PostsPageComponent implements OnInit {
  private postService = inject(PostService);

  // Table State
  posts: Post[] = [];
  tableLoading = false;
  tableError: string | null = null;

  // Search State
  searchedPost: Post | null = null;
  searchLoading = false;
  searchError: string | null = null;

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.tableLoading = true;
    this.tableError = null;

    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.tableLoading = false;
      },
      error: (err: ErrorResponse) => {
        this.tableError = err.error?.message || 'Erro ao carregar a lista de posts';
        this.tableLoading = false;
      }
    });
  }

  onSearch(id: number): void {
    this.searchLoading = true;
    this.searchError = null;
    this.searchedPost = null;

    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.searchedPost = post;
        this.searchLoading = false;
      },
      error: (err: ErrorResponse) => {
        if (err.error?.code === 'POST_NOT_FOUND') {
          this.searchError = 'Post não encontrado';
        } else {
          this.searchError = err.error?.message || 'Erro ao buscar o post';
        }
        this.searchLoading = false;
      }
    });
  }
}
