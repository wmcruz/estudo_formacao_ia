import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-post-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post-search-bar.component.html',
  styleUrl: './post-search-bar.component.css'
})
export class PostSearchBarComponent {
  searchPost = output<number>();
  searchValue = signal<string>('');

  onSearchValueChange(value: string | number | null): void {
    this.searchValue.set(value === null ? '' : String(value));
  }

  onSubmit(): void {
    const value = this.searchValue().trim();
    if (value) {
      this.searchPost.emit(Number(value));
    }
  }
}
