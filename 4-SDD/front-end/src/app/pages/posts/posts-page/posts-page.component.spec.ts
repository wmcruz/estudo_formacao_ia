import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { of, throwError } from 'rxjs';
import { PostsPageComponent } from './posts-page.component';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';
import { ErrorResponse } from '../../../models/error-response.model';

describe('PostsPageComponent', () => {
  let component: PostsPageComponent;
  let fixture: ComponentFixture<PostsPageComponent>;
  let mockPostService: jasmine.SpyObj<PostService>;

  const mockPosts: Post[] = [
    { userId: 1, id: 1, title: 'Title 1', body: 'Body 1' },
    { userId: 1, id: 2, title: 'Title 2', body: 'Body 2' }
  ];

  beforeEach(async () => {
    mockPostService = jasmine.createSpyObj('PostService', ['getPosts', 'getPostById']);
    mockPostService.getPosts.and.returnValue(of(mockPosts));
    mockPostService.getPostById.and.returnValue(of(mockPosts[0]));

    await TestBed.configureTestingModule({
      imports: [PostsPageComponent],
      providers: [
        provideAnimations(),
        { provide: PostService, useValue: mockPostService }
      ]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PostsPageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('39: should load posts on initialization', () => {
    fixture.detectChanges();
    expect(mockPostService.getPosts).toHaveBeenCalled();
    expect(component.posts).toEqual(mockPosts);
    expect(component.tableLoading).toBeFalse();
  });

  it('40: should render post-search component', () => {
    fixture.detectChanges();
    const searchElement = fixture.nativeElement.querySelector('app-post-search');
    expect(searchElement).toBeTruthy();
  });

  it('41: should render post-table component', () => {
    fixture.detectChanges();
    const tableElement = fixture.nativeElement.querySelector('app-post-table');
    expect(tableElement).toBeTruthy();
  });

  it('42: should handle individual post search success', () => {
    fixture.detectChanges();
    component.onSearch(1);

    expect(mockPostService.getPostById).toHaveBeenCalledWith(1);
    expect(component.searchedPost).toEqual(mockPosts[0]);
    expect(component.searchError).toBeNull();
    expect(component.searchLoading).toBeFalse();
  });

  it('43: [Regression BUG-01] should display "Post não encontrado" when search returns 404 POST_NOT_FOUND', () => {
    const notFoundError: ErrorResponse = {
      error: {
        code: 'POST_NOT_FOUND',
        message: 'Post with ID 999 was not found'
      }
    };
    mockPostService.getPostById.and.returnValue(throwError(() => notFoundError));

    fixture.detectChanges();
    component.onSearch(999);

    expect(component.searchedPost).toBeNull();
    expect(component.searchError).toEqual('Post não encontrado');
    expect(component.searchLoading).toBeFalse();
  });

  it('44: [Regression BUG-02] should set tableError message when loadPosts fails', () => {
    const serverError: ErrorResponse = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };
    mockPostService.getPosts.and.returnValue(throwError(() => serverError));

    fixture.detectChanges(); // calls loadPosts()

    expect(component.tableError).toEqual('Failed to communicate with external API');
    expect(component.tableLoading).toBeFalse();
  });
});
