import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-search',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatIconModule
  ],
  templateUrl: './post-search.component.html',
  styleUrl: './post-search.component.css'
})
export class PostSearchComponent {
  @Input() post: Post | null = null;
  @Input() errorMessage: string | null = null;
  @Input() loading = false;
  @Output() search = new EventEmitter<number>();

  searchId: number | null = null;

  onSearch(): void {
    if (this.searchId !== null && this.searchId > 0) {
      this.search.emit(this.searchId);
    }
  }
}
