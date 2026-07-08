import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Post } from '../../models/post.model';
import { PostService } from '../../services/post.service';
import { PostSearchBarComponent } from '../../components/post-search-bar/post-search-bar.component';
import { PostTableComponent } from '../../components/post-table/post-table.component';
import { PostDetailComponent } from '../../components/post-detail/post-detail.component';
import { MatIconModule } from '@angular/material/icon';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-posts-dashboard',
  standalone: true,
  imports: [CommonModule, MatIconModule, PostSearchBarComponent, PostTableComponent, PostDetailComponent],
  templateUrl: './posts-dashboard.component.html',
  styleUrl: './posts-dashboard.component.css'
})
export class PostsDashboardComponent implements OnInit {
  private readonly postService = inject(PostService);

  posts = signal<Post[]>([]);
  totalElements = signal(0);
  pageSize = signal(10);
  pageIndex = signal(0);
  currentPost = signal<Post | null>(null);
  isLoading = signal(false);
  error = signal<string | null>(null);

  ngOnInit() {
    this.loadPosts();
  }

  private loadPosts() {
    this.postService.getPosts(this.pageIndex(), this.pageSize()).subscribe({
      next: (page) => {
        this.posts.set(page.content);
        this.totalElements.set(page.totalElements);
      }
    });
  }

  onPageChange(event: PageEvent) {
    this.pageIndex.set(event.pageIndex);
    this.pageSize.set(event.pageSize);
    this.loadPosts();
  }

  onSearchPost(id: number) {
    this.isLoading.set(true);
    this.error.set(null);
    this.currentPost.set(null);
    this.postService.getPostById(id).subscribe({
      next: (post) => {
        this.currentPost.set(post);
        this.isLoading.set(false);
      },
      error: () => {
        this.error.set('Post not found');
        this.isLoading.set(false);
      }
    });
  }
}
