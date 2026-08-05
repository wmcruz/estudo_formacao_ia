import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PostsPageComponent } from './posts-page.component';
import { PostService } from '../../../services/post.service';
import { Post } from '../../../models/post.model';

describe('PostsPageComponent', () => {
  let component: PostsPageComponent;
  let fixture: ComponentFixture<PostsPageComponent>;
  let service: PostService;
  let httpMock: HttpTestingController;

  const mockPosts: Post[] = [
    { userId: 1, id: 1, title: 'Title 1', body: 'Body 1' },
    { userId: 1, id: 2, title: 'Title 2', body: 'Body 2' }
  ];

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
      imports: [PostsPageComponent],
      providers: [
        provideAnimations(),
        provideHttpClient(),
        provideHttpClientTesting(),
        PostService
      ]
    }).compileComponents();

    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(PostsPageComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('35: should load posts on initialization', () => {
    fixture.detectChanges();

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);

    expect(component.posts()).toEqual(mockPosts);
    expect(component.tableLoading()).toBeFalse();
  });

  it('36: should render post-search and post-table components', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    const searchElement = fixture.nativeElement.querySelector('app-post-search');
    const tableElement = fixture.nativeElement.querySelector('app-post-table');
    expect(searchElement).toBeTruthy();
    expect(tableElement).toBeTruthy();
  });

  it('37: should handle individual post search success', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    component.onSearch(1);
    const searchReq = httpMock.expectOne('http://localhost:8080/api/posts/1');
    expect(searchReq.request.method).toBe('GET');
    searchReq.flush(mockPosts[0]);

    expect(component.searchedPost()).toEqual(mockPosts[0]);
    expect(component.searchError()).toBeNull();
    expect(component.searchLoading()).toBeFalse();
  });

  it('38: should display "Post não encontrado" when search returns POST_NOT_FOUND', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    component.onSearch(999);
    const notFoundError = {
      error: {
        code: 'POST_NOT_FOUND',
        message: 'Post with ID 999 was not found'
      }
    };
    httpMock.expectOne('http://localhost:8080/api/posts/999')
      .flush(notFoundError, { status: 404, statusText: 'Not Found' });

    expect(component.searchedPost()).toBeNull();
    expect(component.searchError()).toEqual('Post não encontrado');
    expect(component.searchLoading()).toBeFalse();
  });

  it('39: should display friendly PT-BR message when search returns INVALID_POST_ID', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    component.onSearch(0);
    const invalidIdError = {
      error: {
        code: 'INVALID_POST_ID',
        message: 'Post ID must be a positive integer'
      }
    };
    httpMock.expectOne('http://localhost:8080/api/posts/0')
      .flush(invalidIdError, { status: 400, statusText: 'Bad Request' });

    expect(component.searchError()).toEqual('ID do post deve ser um número inteiro positivo');
    expect(component.searchLoading()).toBeFalse();
  });

  it('40: should display friendly PT-BR message when search returns EXTERNAL_API_ERROR', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    component.onSearch(1);
    const serverError = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };
    httpMock.expectOne('http://localhost:8080/api/posts/1')
      .flush(serverError, { status: 502, statusText: 'Bad Gateway' });

    expect(component.searchError()).toEqual('Não foi possível se comunicar com o serviço externo. Tente novamente.');
    expect(component.searchLoading()).toBeFalse();
  });

  it('41: should display friendly tableError when loadPosts fails with EXTERNAL_API_ERROR', () => {
    fixture.detectChanges();
    const serverError = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };
    httpMock.expectOne('http://localhost:8080/api/posts')
      .flush(serverError, { status: 502, statusText: 'Bad Gateway' });

    expect(component.tableError()).toEqual('Não foi possível se comunicar com o serviço externo. Tente novamente.');
    expect(component.tableLoading()).toBeFalse();
  });

  it('42: should clear tableError and set posts on successful listing', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(mockPosts);

    expect(component.tableError()).toBeNull();
    expect(component.posts()).toEqual(mockPosts);
    expect(component.tableLoading()).toBeFalse();
  });

  it('BUG-01: should paginate the table in the real page flow with 100 posts', () => {
    fixture.detectChanges();
    httpMock.expectOne('http://localhost:8080/api/posts').flush(createMockPosts(100));
    fixture.detectChanges();

    const table = fixture.nativeElement.querySelector('app-post-table');
    const rows = table.querySelectorAll('tr.mat-mdc-row');
    const paginatorLength = table.querySelector('mat-paginator');

    expect(rows.length).toBe(10);
    expect(paginatorLength).toBeTruthy();
    expect(table.textContent).toContain('1');
    expect(table.textContent).not.toContain('Title 11');
  });
});
