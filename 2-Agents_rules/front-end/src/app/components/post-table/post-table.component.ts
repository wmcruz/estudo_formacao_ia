import { Component, Input, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Post } from '../../models/post.model';

@Component({
  selector: 'app-post-table',
  standalone: true,
  imports: [MatTableModule, MatPaginatorModule, MatProgressSpinnerModule],
  templateUrl: './post-table.component.html',
  styleUrl: './post-table.component.css'
})
export class PostTableComponent implements AfterViewInit, OnChanges {
  @Input({ required: true }) public posts: Post[] = [];
  @Input({ required: true }) public loading = false;

  public readonly displayedColumns: string[] = ['id', 'userId', 'title'];
  public dataSource = new MatTableDataSource<Post>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['posts']) {
      this.dataSource.data = this.posts;
    }
  }
}
