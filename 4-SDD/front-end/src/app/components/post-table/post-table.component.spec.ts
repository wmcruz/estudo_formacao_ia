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
    component.posts = [mockPost];
    component.ngOnChanges({
      posts: new SimpleChange(null, component.posts, true)
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Test Post Title');
  });

  it('25: should render empty table message when no posts', () => {
    component.posts = [];
    component.ngOnChanges({
      posts: new SimpleChange(null, component.posts, true)
    });
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Nenhum post encontrado');
  });

  it('26: should render paginator for 20 posts', () => {
    component.posts = createMockPosts(20);
    component.ngOnChanges({
      posts: new SimpleChange(null, component.posts, true)
    });
    fixture.detectChanges();

    const paginator = fixture.nativeElement.querySelector('mat-paginator');
    expect(paginator).toBeTruthy();
  });

  it('27: should paginate correctly when navigating pages', () => {
    component.posts = createMockPosts(25);
    component.ngOnChanges({
      posts: new SimpleChange(null, component.posts, true)
    });
    fixture.detectChanges();

    expect(component.dataSource.paginator).toBeTruthy();
    expect(component.dataSource.data.length).toBe(25);
  });

  it('28: should have correct table headers', () => {
    component.posts = [mockPost];
    component.ngOnChanges({
      posts: new SimpleChange(null, component.posts, true)
    });
    fixture.detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th');
    const headerTexts = Array.from(headers).map((h: any) => h.textContent.trim());
    expect(headerTexts).toEqual(['ID', 'User ID', 'Título', 'Body']);
  });

  it('29: should show loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });

  it('30: should hide loading spinner when loading is false', () => {
    component.loading = false;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeFalsy();
  });
});
