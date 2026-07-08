import { Component, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-table',
  standalone: true,
  imports: [CommonModule, MatTableModule, MatPaginatorModule],
  templateUrl: './post-table.component.html',
  styleUrl: './post-table.component.css'
})
export class PostTableComponent {
  posts = input<Post[]>([]);
  totalElements = input<number>(0);
  pageSize = input<number>(10);
  pageIndex = input<number>(0);
  pageChange = output<PageEvent>();

  displayedColumns: string[] = ['id', 'userId', 'title'];
  dataSource = new MatTableDataSource<Post>([]);

  constructor() {
    effect(() => {
      this.dataSource.data = this.posts();
    });
  }

  onPageChange(event: PageEvent) {
    this.pageChange.emit(event);
  }
}
