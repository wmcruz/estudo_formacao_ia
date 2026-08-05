import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PostSearchComponent } from '../../../components/post-search/post-search.component';
import { PostTableComponent } from '../../../components/post-table/post-table.component';
import { PostService } from '../../../services/post.service';

@Component({
  selector: 'app-posts-page',
  standalone: true,
  imports: [CommonModule, PostSearchComponent, PostTableComponent],
  templateUrl: './posts-page.component.html',
  styleUrl: './posts-page.component.css'
})
export class PostsPageComponent implements OnInit {
  private readonly postService = inject(PostService);

  readonly posts = this.postService.posts;
  readonly tableLoading = this.postService.tableLoading;
  readonly tableError = this.postService.tableError;
  readonly searchedPost = this.postService.searchedPost;
  readonly searchLoading = this.postService.searchLoading;
  readonly searchError = this.postService.searchError;

  ngOnInit(): void {
    this.postService.loadPosts();
  }

  onSearch(id: number): void {
    this.postService.searchPost(id);
  }
}
