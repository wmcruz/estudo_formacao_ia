import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { PostSearchBarComponent } from '../../components/post-search-bar/post-search-bar.component';
import { PostDetailComponent } from '../../components/post-detail/post-detail.component';
import { PostTableComponent } from '../../components/post-table/post-table.component';

@Component({
  selector: 'app-posts-dashboard',
  standalone: true,
  imports: [CommonModule, PostSearchBarComponent, PostDetailComponent, PostTableComponent],
  templateUrl: './posts-dashboard.component.html',
  styleUrl: './posts-dashboard.component.css'
})
export class PostsDashboardComponent implements OnInit {
  private readonly postService = inject(PostService);

  public allPosts = signal<Post[]>([]);
  public isLoadingAllPosts = signal<boolean>(true);
  public currentPost = signal<Post | null>(null);
  public isLoading = signal<boolean>(false);
  public hasError = signal<boolean>(false);
  public errorMessage = signal<string>('');

  public ngOnInit(): void {
    this.loadAllPosts();
  }

  private loadAllPosts(): void {
    this.isLoadingAllPosts.set(true);
    this.postService.getAllPosts().subscribe({
      next: (posts) => {
        this.allPosts.set(posts);
        this.isLoadingAllPosts.set(false);
      },
      error: () => {
        this.isLoadingAllPosts.set(false);
      }
    });
  }

  public onSearch(postId: number): void {
    this.isLoading.set(true);
    this.hasError.set(false);
    this.currentPost.set(null);
    this.postService.getPostById(postId).subscribe({
      next: (post) => this.handleSuccess(post),
      error: () => this.handleError()
    });
  }

  private handleSuccess(post: Post): void {
    this.currentPost.set(post);
    this.isLoading.set(false);
  }

  private handleError(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
    this.errorMessage.set('Post not found. Please try a different ID.');
  }
}
