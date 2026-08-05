import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { SimpleChange } from '@angular/core';
import { PostTableComponent } from './post-table.component';
import { Post } from '../../models/post.model';

describe('PostTableComponent', () => {
  let component: PostTableComponent;
  let fixture: ComponentFixture<PostTableComponent>;

  const mockPost: Post = {
    userId: 1,
    id: 1,
    title: 'Test Post Title',
    body: 'Test Post Body'
  };

  const createMockPosts = (count: number): Post[] => {
    return Array.from({ length: count }, (_, i) => ({
      userId: 1,
      id: i + 1,
      title: `Title ${i + 1}`,
      body: `Body ${i + 1}`
    }));
  };

  const setPosts = (posts: Post[]): void => {
    component.posts = posts;
    component.ngOnChanges({
      posts: new SimpleChange(null, posts, true)
    });
    fixture.detectChanges();
  };

  const getRowIds = (): number[] => {
    const rows = fixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    return Array.from(rows).map((row: any) => {
      const cell = row.querySelector('td.mat-column-id');
      return Number(cell.textContent.trim());
    });
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostTableComponent],
      providers: [provideAnimations()]
    }).compileComponents();

    fixture = TestBed.createComponent(PostTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('24: should render table with posts', () => {
    setPosts([mockPost]);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Post Title');
  });

  it('26: should render paginator for 20 posts', () => {
    setPosts(createMockPosts(20));

    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
  });

  it('27: paginator should start with 10 items per page (P-03)', () => {
    setPosts(createMockPosts(20));

    expect(component.paginator).toBeTruthy();
    expect(component.paginator.pageSize).toBe(10);
  });

  it('28: should show posts 11-20 after navigating to page 2 (P-04)', async () => {
    setPosts(createMockPosts(25));

    await fixture.whenStable();

    component.paginator.nextPage();
    fixture.detectChanges();

    expect(getRowIds()).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
  });

  it('29: pageSizeOptions should include 10, 25 and 50', () => {
    setPosts(createMockPosts(50));

    expect(component.paginator.pageSizeOptions).toEqual([10, 25, 50]);
  });

  it('30: changing pageSize to 25 should render 25 rows immediately', async () => {
    setPosts(createMockPosts(25));

    await fixture.whenStable();

    component.paginator._changePageSize(25);
    fixture.detectChanges();

    expect(getRowIds()).toEqual(Array.from({ length: 25 }, (_, i) => i + 1));
  });

  it('31: should render empty table message when no posts', () => {
    setPosts([]);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum post encontrado');
  });

  it('32: should have correct table headers', () => {
    setPosts([mockPost]);

    const headers = fixture.nativeElement.querySelectorAll('th');
    const headerTexts = Array.from(headers).map((h: any) => h.textContent.trim());
    expect(headerTexts).toEqual(['ID', 'User ID', 'Título', 'Body']);
  });

  it('BUG-01: should link paginator when posts are set before view init', async () => {
    const freshFixture = TestBed.createComponent(PostTableComponent);
    const freshComponent = freshFixture.componentInstance;
    freshFixture.componentRef.setInput('posts', createMockPosts(100));

    freshFixture.detectChanges();
    await freshFixture.whenStable();

    expect(freshComponent.dataSource.paginator).toBe(freshComponent.paginator);
    expect(freshComponent.paginator.length).toBe(100);
    const rows = freshFixture.nativeElement.querySelectorAll('tr.mat-mdc-row');
    expect(rows.length).toBe(10);
    const firstRowId = Number(
      freshFixture.nativeElement.querySelector('td.mat-column-id').textContent.trim()
    );
    expect(firstRowId).toBe(1);
  });

  it('BUG-01: should paginate when posts arrive asynchronously after view init', async () => {
    fixture.detectChanges();
    await fixture.whenStable();

    fixture.componentRef.setInput('posts', createMockPosts(25));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.dataSource.paginator).toBe(component.paginator);
    expect(component.paginator.length).toBe(25);
    expect(getRowIds()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('should show loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('should hide loading spinner when loading is false', () => {
    component.loading = false;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeFalsy();
  });
});
