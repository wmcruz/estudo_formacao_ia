---
name: tests
description: Use when implementing unit tests only — JUnit 5 + Mockito for Java backend services, Jasmine + Karma for Angular components/services, AAA (Arrange/Act/Assert) structure, HttpTestingController for Angular HTTP mocking, test isolation rules, and file naming conventions for test files.
---

# Testing Standards

Every feature, bug fix, or behavior change in this project **must** include unit tests. Contributors must write tests to ensure correctness before considering any work complete.

---

## 1. Required coverage

Write unit tests for both the backend (Java + JUnit 5 + Mockito) and frontend (Angular + Jasmine + Karma).

| Layer | What to test | Tooling |
|-------|--------------|---------|
| `service` (Java) | Business rules, validations, mappings, logic flows | JUnit 5 + Mockito |
| `services` (Angular) | HTTP request parameters, payload mappings, and HTTP state | `HttpTestingController` |
| `components` (Angular) | User interaction events, property bindings, and component DOM render | Jasmine + TestBed |

Run unit tests after making changes:

```bash
cd back-end && ./mvnw test
cd front-end && ng test --watch=false
```

---

## 2. Unit test structure

Test a single module in isolation. Mock or stub all external dependencies.

### Java Service Unit Test (Mockito)
```java
// back-end/src/test/java/com/json/place/holder/back_end/service/PostServiceTest.java
package com.json.place.holder.back_end.service;

import static org.mockito.Mockito.*;
import static org.assertj.core.api.Assertions.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.Optional;

@ExtendWith(MockitoExtension.class)
class PostServiceTest {

    @Mock
    private PostRepository postRepository;

    @InjectMocks
    private PostService postService;

    @Test
    void fetchPostById_shouldReturnPostDto_whenPostExists() {
        PostEntity post = new PostEntity(1L, "Sample Title", "Body content");
        when(postRepository.findById(1L)).thenReturn(Optional.of(post));

        PostDto result = postService.fetchPostById(1L);

        assertThat(result).isNotNull();
        assertThat(result.title()).isEqualTo("Sample Title");
        verify(postRepository, times(1)).findById(1L);
    }
}
```

---

## 3. Structure tests with Arrange / Act / Assert

Structure your tests using the **Arrange/Act/Assert (AAA)** style. Keep each phase distinct.

```typescript
// ✅ GOOD — Jasmine Spec following AAA
it('should correctly format post title uppercase', () => {
  // Arrange
  const pipe = new FormatTitlePipe();
  const rawTitle = 'hello world';

  // Act
  const result = pipe.transform(rawTitle);

  // Assert
  expect(result).toBe('HELLO WORLD');
});
```

```typescript
// ❌ BAD — Mixed logic, overlapping acts, hard to determine what broke
it('checks formatting and logic', () => {
  const pipe = new FormatTitlePipe();
  expect(pipe.transform('hello')).toBe('HELLO');
  const otherResult = pipe.transform('world');
  expect(otherResult).toBe('WORLD');
});
```

---

## 4. Tests must not depend on each other

Each test case must execute independently. Do not carry over state or expect tests to execute in a specific order.

- **Java**: Mockito extensions reinitialize mocks before every test execution. Do not use static variables to hold state across test methods.
- **Angular/Jasmine**: Configure a clean `TestBed` within a `beforeEach` block. Ensure services or properties are re-instantiated.

---

## 5. Stub external dependencies

Do not make real calls to external APIs (such as jsonplaceholder.typicode.com) or databases inside unit tests.
- **Java**: Stub dependencies with Mockito mocks.
- **Angular**: Mock HTTP calls using Angular's `HttpTestingController`.

---

## 6. File naming and location

- **Java Backend**: Place tests within `src/test/java` directory, mirroring the exact folder/package path of the tested class. End the filename with `Test.java` (e.g. `PostServiceTest.java`).
- **Angular Frontend**: Place test files right next to the code files they cover. End filenames with `.spec.ts` (e.g. `post-table.component.spec.ts`).

---

## 7. Angular component and service tests

### Angular Service Test with HttpTestingController
```typescript
// front-end/src/app/services/post.service.spec.ts
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

  it('should fetch posts from endpoint', () => {
    const mockPosts: Post[] = [{ id: 1, userId: 1, title: 'Test Post', body: 'Test Body' }];

    service.getPosts().subscribe(posts => {
      expect(posts.length).toBe(1);
      expect(posts).toEqual(mockPosts);
    });

    const req = httpMock.expectOne('http://localhost:8080/api/posts');
    expect(req.request.method).toBe('GET');
    req.flush(mockPosts);
  });
});
```

### Angular Component Test
```typescript
// front-end/src/app/components/post-table/post-table.component.spec.ts
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostTableComponent } from './post-table.component';

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

  it('should render posts inside a table', () => {
    component.posts = [{ id: 1, userId: 1, title: 'Sample Title', body: 'Sample Body' }];

    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const tableCell = compiled.querySelector('td');
    expect(tableCell?.textContent).toContain('Sample Title');
  });
});
```

---

## Summary checklist

Before submitting code, verify:

- [ ] New or changed code features have automated unit tests.
- [ ] Tests follow the Arrange / Act / Assert structure.
- [ ] Tests are execution order independent.
- [ ] All external HTTP integrations and database layers are mocked/stubbed.
- [ ] `./mvnw test` passes in `back-end/` and `ng test --watch=false` passes in `front-end/`.
