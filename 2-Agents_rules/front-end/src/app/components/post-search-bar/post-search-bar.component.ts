import { Component, output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-post-search-bar',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './post-search-bar.component.html',
  styleUrl: './post-search-bar.component.css'
})
export class PostSearchBarComponent {
  public search = output<number>();
  public postId = signal<string>('');

  public onSearchSubmit(): void {
    const id = parseInt(this.postId().trim(), 10);
    if (!isNaN(id) && id > 0) {
      this.search.emit(id);
    }
  }
}
