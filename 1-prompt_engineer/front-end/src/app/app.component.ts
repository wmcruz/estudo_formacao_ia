import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostService } from './services/post.service';
import { Post } from './models/post.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit {
  title = 'Post Explorer';
  
  posts: Post[] = [];
  searchId: string = '';
  selectedPost: Post | null = null;
  searchError: string | null = null;
  loading: boolean = false;
  isSearched: boolean = false;

  constructor(private postService: PostService) {}

  ngOnInit(): void {
    this.loadAllPosts();
  }

  loadAllPosts(): void {
    this.loading = true;
    this.searchError = null;
    this.postService.getAllPosts().subscribe({
      next: (data) => {
        this.posts = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error fetching posts:', err);
        this.searchError = 'Não foi possível carregar os posts do servidor backend. Certifique-se de que o backend está em execução na porta 8080.';
        this.loading = false;
      }
    });
  }

  searchPost(): void {
    const trimmedId = this.searchId.trim();
    if (!trimmedId) {
      this.clearSearch();
      return;
    }

    const id = parseInt(trimmedId, 10);
    if (isNaN(id) || id <= 0) {
      this.searchError = 'Por favor, insira um número inteiro de ID de post válido (ex: 1, 2, 10).';
      this.selectedPost = null;
      this.isSearched = true;
      return;
    }

    this.loading = true;
    this.searchError = null;
    this.isSearched = true;

    this.postService.getPostById(id).subscribe({
      next: (data) => {
        this.selectedPost = data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error searching post:', err);
        if (err.status === 404) {
          this.searchError = `O post com o ID ${id} não foi encontrado.`;
        } else {
          this.searchError = 'Ocorreu um erro ao buscar o post do backend. Verifique o servidor.';
        }
        this.selectedPost = null;
        this.loading = false;
      }
    });
  }

  clearSearch(): void {
    this.searchId = '';
    this.selectedPost = null;
    this.searchError = null;
    this.isSearched = false;
    this.loadAllPosts();
  }

  selectPost(post: Post): void {
    this.selectedPost = post;
    this.searchId = post.id.toString();
    this.isSearched = true;
    this.searchError = null;
  }
}
