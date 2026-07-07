import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostTableComponent } from './post-table.component';
import { Post } from '../../models/post.model';

describe('PostTableComponent', () => {
  let component: PostTableComponent;
  let fixture: ComponentFixture<PostTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostTableComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PostTableComponent);
    component = fixture.componentInstance;
  });

  it('should render posts in table rows', () => {
    component.posts = [
      { id: 1, userId: 1, title: 'Sample Title', body: 'Sample Body' }
    ];
    component.loading = false;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const cells = compiled.querySelectorAll('td');
    expect(cells.length).toBe(3);
    expect(cells[0].textContent).toContain('1');
    expect(cells[2].textContent).toContain('Sample Title');
  });

  it('should show loading spinner when loading is true', () => {
    component.posts = [];
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('mat-spinner')).toBeTruthy();
  });

  it('should not show table when loading is true', () => {
    component.posts = [];
    component.loading = true;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.table-container')).toBeFalsy();
  });
});
