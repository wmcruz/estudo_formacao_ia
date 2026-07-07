import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../models/post.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PostService]
    });
    service = TestBed.inject(PostService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch all posts from endpoint', () => {
    const mockPosts: Post[] = [
      { id: 1, userId: 1, title: 'Post 1', body: 'Body 1' },
      { id: 2, userId: 1, title: 'Post 2', body: 'Body 2' }
    ];

    service.getAllPosts().subscribe(posts => {
      expect(posts.length).toBe(2);
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });

  it('should fetch post by id from endpoint', () => {
    const mockPost: Post = { id: 1, userId: 1, title: 'Test Post', body: 'Test Body' };

    service.getPostById(1).subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockPost);
  });
});
