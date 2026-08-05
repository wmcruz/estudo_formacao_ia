import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { PostService } from './post.service';
import { Post } from '../models/post.model';
import { ErrorResponse } from '../models/error-response.model';

describe('PostService', () => {
  let service: PostService;
  let httpMock: HttpTestingController;

  const mockPost: Post = {
    userId: 1,
    id: 1,
    title: 'Test Title',
    body: 'Test Body'
  };

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('getPosts() should emit array of Post[] on success', () => {
    service.getPosts().subscribe(posts => {
      expect(posts.length).toBe(1);
      expect(posts).toEqual([mockPost]);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    expect(req.request.method).toBe('GET');
    req.flush([mockPost]);
  });

  it('getPosts() should emit error on HTTP 502', () => {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };

    service.getPosts().subscribe({
      next: () => fail('should have failed with the 502 error'),
      error: (error: ErrorResponse) => {
        expect(error.error.code).toBe('EXTERNAL_API_ERROR');
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    req.flush(errorResponse, { status: 502, statusText: 'Bad Gateway' });
  });

  it('getPostById(1) should emit object Post with id=1 on success', () => {
    service.getPostById(1).subscribe(post => {
      expect(post).toEqual(mockPost);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts/1');
    expect(req.request.method).toBe('GET');
    req.flush(mockPost);
  });

  it('getPostById(999) should emit error with status 404', () => {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'POST_NOT_FOUND',
        message: 'Post with ID 999 was not found'
      }
    };

    service.getPostById(999).subscribe({
      next: () => fail('should have failed with the 404 error'),
      error: (error: ErrorResponse) => {
        expect(error.error.code).toBe('POST_NOT_FOUND');
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts/999');
    req.flush(errorResponse, { status: 404, statusText: 'Not Found' });
  });

  it('getPostById(1) should emit error on HTTP 502', () => {
    const errorResponse: ErrorResponse = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };

    service.getPostById(1).subscribe({
      next: () => fail('should have failed with the 502 error'),
      error: (error: ErrorResponse) => {
        expect(error.error.code).toBe('EXTERNAL_API_ERROR');
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts/1');
    req.flush(errorResponse, { status: 502, statusText: 'Bad Gateway' });
  });

  it('getFriendlyMessage(POST_NOT_FOUND) should return "Post não encontrado"', () => {
    // Arrange
    const errorResponse: ErrorResponse = {
      error: { code: 'POST_NOT_FOUND', message: 'Post with ID 999 was not found' }
    };

    // Act
    const message = service.getFriendlyMessage(errorResponse);

    // Assert
    expect(message).toBe('Post não encontrado');
  });

  it('getFriendlyMessage(INVALID_POST_ID) should return "ID do post deve ser um número inteiro positivo"', () => {
    // Arrange
    const errorResponse: ErrorResponse = {
      error: { code: 'INVALID_POST_ID', message: 'Post ID must be a positive integer' }
    };

    // Act
    const message = service.getFriendlyMessage(errorResponse);

    // Assert
    expect(message).toBe('ID do post deve ser um número inteiro positivo');
  });

  it('getFriendlyMessage(EXTERNAL_API_ERROR) should return friendly communication error message', () => {
    // Arrange
    const errorResponse: ErrorResponse = {
      error: { code: 'EXTERNAL_API_ERROR', message: 'Failed to communicate with external API' }
    };

    // Act
    const message = service.getFriendlyMessage(errorResponse);

    // Assert
    expect(message).toBe('Não foi possível se comunicar com o serviço externo. Tente novamente.');
  });

  it('getFriendlyMessage with unknown code should return UNKNOWN_ERROR fallback', () => {
    // Arrange
    const errorResponse: ErrorResponse = {
      error: { code: 'FOO', message: 'msg' }
    };

    // Act
    const message = service.getFriendlyMessage(errorResponse);

    // Assert
    expect(message).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('getFriendlyMessage without error should return generic UNKNOWN_ERROR message', () => {
    // Arrange
    const errorResponse = {} as ErrorResponse;

    // Act
    const message = service.getFriendlyMessage(errorResponse);

    // Assert
    expect(message).toBe('Ocorreu um erro inesperado. Tente novamente.');
  });

  it('handleError should preserve the backend error envelope', () => {
    // Arrange
    const errorResponse: ErrorResponse = {
      error: {
        code: 'EXTERNAL_API_ERROR',
        message: 'Failed to communicate with external API'
      }
    };

    // Act & Assert
    service.getPosts().subscribe({
      next: () => fail('should have failed with the 502 error'),
      error: (error: ErrorResponse) => {
        expect(error).toEqual(errorResponse);
      }
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    req.flush(errorResponse, { status: 502, statusText: 'Bad Gateway' });
  });
});
