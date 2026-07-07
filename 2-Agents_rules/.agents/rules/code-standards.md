# Code Standards

These standards apply to all code in this project (backend Java + Spring Boot, frontend Angular + TypeScript). Agents and contributors must follow them when writing or reviewing code.

## 1. Write all code in English

Use English for identifiers, comments, commit messages, and user-facing API routes/messages.

### Angular (TypeScript)
```typescript
// ❌ BAD
const statusDoPost = 'ativo';
// retorna se o post esta ativo

// ✅ GOOD
const postStatus = 'active';
// returns whether the post is active
```

### Java
```java
// ❌ BAD
public class PostagemController {
    private String tituloPostagem;
}

// ✅ GOOD
public class PostController {
    private String postTitle;
}
```

---

## 2. Methods must have at most 30 lines

Keep methods and functions focused on a single responsibility. Extract helper methods when logic grows.

### Angular (TypeScript)
```typescript
// ❌ BAD — Service method does too much in one function (HTTP call, notification, logging, and mapping)
public loadPostDetails(postId: number): void {
  this.http.get<Post>(`/api/posts/${postId}`).subscribe({
    next: (post) => {
      if (!post.title) {
        this.toastr.warning('Post has no title');
        this.hasWarning = true;
      } else {
        this.hasWarning = false;
      }
      this.currentPost = {
        id: post.id,
        title: post.title.toUpperCase(),
        body: post.body,
        fetchedAt: new Date()
      };
      this.logger.info('Post loaded', postId);
    },
    error: (err) => {
      this.logger.error('Failed to load post', err);
      this.toastr.error('Error loading post');
    }
  });
}

// ✅ GOOD — Small, focused methods with single responsibilities
public loadPostDetails(postId: number): void {
  this.http.get<Post>(`/api/posts/${postId}`).subscribe({
    next: (post) => this.handlePostSuccess(post),
    error: (err) => this.handlePostError(err)
  });
}

private handlePostSuccess(post: Post): void {
  this.checkPostTitle(post.title);
  this.currentPost = this.mapToPostDetails(post);
  this.logger.info('Post loaded successfully', post.id);
}

private checkPostTitle(title: string): void {
  this.hasWarning = !title;
  if (this.hasWarning) {
    this.toastr.warning('Post has no title');
  }
}

private mapToPostDetails(post: Post): PostDetails {
  return {
    id: post.id,
    title: post.title.toUpperCase(),
    body: post.body,
    fetchedAt: new Date()
  };
}

private handlePostError(err: any): void {
  this.logger.error('Failed to load post', err);
  this.toastr.error('Error loading post');
}
```

### Java
```java
// ❌ BAD — Controller/Service method handles orchestration, validation, domain creation, mapping, and responses
@PostMapping
public ResponseEntity<PostResponse> createPost(@RequestBody PostDto dto) {
    if (dto.getTitle() == null || dto.getTitle().isEmpty()) {
        return ResponseEntity.badRequest().build();
    }
    if (postRepository.existsByTitle(dto.getTitle())) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
    Post post = new Post();
    post.setTitle(dto.getTitle());
    post.setBody(dto.getBody());
    post.setUserId(dto.getUserId());
    post.setCreatedAt(LocalDateTime.now());
    Post savedPost = postRepository.save(post);
    
    PostResponse response = new PostResponse();
    response.setId(savedPost.getId());
    response.setTitle(savedPost.getTitle());
    response.setBody(savedPost.getBody());
    return ResponseEntity.status(HttpStatus.CREATED).body(response);
}

// ✅ GOOD — Clean delegate structure
@PostMapping
public ResponseEntity<PostResponse> createPost(@Valid @RequestBody PostDto dto) {
    if (postRepository.existsByTitle(dto.getTitle())) {
        return ResponseEntity.status(HttpStatus.CONFLICT).build();
    }
    Post savedPost = postService.savePost(dto);
    return ResponseEntity.status(HttpStatus.CREATED).body(mapToResponse(savedPost));
}

private PostResponse mapToResponse(Post post) {
    return new PostResponse(post.getId(), post.getTitle(), post.getBody());
}
```

---

## 3. Avoid more than 3 parameters

Prefer using interfaces/objects in TypeScript or records/DTOs in Java when passing more data.

### Angular (TypeScript)
```typescript
// ❌ BAD
updatePost(id: number, title: string, body: string, userId: number) {
  // ...
}

// ✅ GOOD
export interface UpdatePostPayload {
  title: string;
  body: string;
  userId: number;
}

updatePost(id: number, payload: UpdatePostPayload) {
  // ...
}
```

### Java
```java
// ❌ BAD
public void updatePost(Long id, String title, String body, Long userId) {
    // ...
}

// ✅ GOOD
public record PostUpdateRequest(
    String title,
    String body,
    Long userId
) {}

public void updatePost(Long id, PostUpdateRequest request) {
    // ...
}
```

---

## 4. Do not nest if/else beyond 2 levels

Use early returns, guard clauses, or extract complex checks to helper methods.

### Angular (TypeScript)
```typescript
// ❌ BAD
validatePost(post: Post) {
  if (post) {
    if (post.title) {
      if (post.body) {
        return true;
      } else {
        return false;
      }
    } else {
      return false;
    }
  } else {
    return false;
  }
}

// ✅ GOOD
validatePost(post: Post): boolean {
  if (!post || !post.title || !post.body) {
    return false;
  }
  return true;
}
```

### Java
```java
// ❌ BAD
public void processPost(Post post) {
    if (post != null) {
        if (post.getTitle() != null && !post.getTitle().isEmpty()) {
            if (post.getStatus() == PostStatus.PENDING) {
                publishPost(post);
            } else {
                throw new IllegalStateException("Post is not pending");
            }
        } else {
            throw new IllegalArgumentException("Post title is empty");
        }
    }
}

// ✅ GOOD
public void processPost(Post post) {
    if (post == null) {
        return;
    }
    if (post.getTitle() == null || post.getTitle().isEmpty()) {
        throw new IllegalArgumentException("Post title is empty");
    }
    if (post.getStatus() != PostStatus.PENDING) {
        throw new IllegalStateException("Post is not pending");
    }
    publishPost(post);
}
```

---

## 5. Avoid switch/case

Prefer lookups (Map or Dictionary) in TypeScript and polymorphism or Enum-based behaviors in Java.

### Angular (TypeScript)
```typescript
// ❌ BAD
getPostCategoryColor(category: string) {
  switch (category) {
    case 'news':
      return 'bg-blue-500';
    case 'tutorials':
      return 'bg-green-500';
    case 'events':
      return 'bg-purple-500';
    default:
      return 'bg-gray-500';
  }
}

// ✅ GOOD
private readonly CATEGORY_COLORS: Record<string, string> = {
  news: 'bg-blue-500',
  tutorials: 'bg-green-500',
  events: 'bg-purple-500'
};

getPostCategoryColor(category: string): string {
  return this.CATEGORY_COLORS[category] ?? 'bg-gray-500';
}
```

### Java
```java
// ❌ BAD
public double calculatePriorityScore(PostPriority priority) {
    switch (priority) {
        case HIGH:
            return 10.0;
        case MEDIUM:
            return 5.0;
        case LOW:
            return 1.0;
        default:
            return 0.0;
    }
}

// ✅ GOOD (Using Enum properties and behaviors)
public enum PostPriority {
    HIGH(10.0),
    MEDIUM(5.0),
    LOW(1.0),
    DEFAULT(0.0);

    private final double score;

    PostPriority(double score) {
        this.score = score;
    }

    public double getScore() {
        return score;
    }
}

public double calculatePriorityScore(PostPriority priority) {
    PostPriority safePriority = (priority != null) ? priority : PostPriority.DEFAULT;
    return safePriority.getScore();
}
```

---

## 6. Methods and functions must start with a verb

Names must describe an action clearly.

### Angular (TypeScript)
```typescript
// ❌ BAD
postDetails() { /* ... */ }
spinner() { /* ... */ }

// ✅ GOOD
getPostDetails() { /* ... */ }
showSpinner() { /* ... */ }
```

### Java
```java
// ❌ BAD
public void postList() { /* ... */ }
public boolean validation() { /* ... */ }

// ✅ GOOD
public List<Post> fetchAllPosts() { /* ... */ }
public boolean validatePostData() { /* ... */ }
```

---

## 7. Use clear, objective variable names

Avoid arbitrary abbreviations, single-letter variables (except for standard loop indices like `i`), and vague names.

### Angular (TypeScript)
```typescript
// ❌ BAD
const p = this.posts[0];
const temp = this.pSrv.get(1);

// ✅ GOOD
const featuredPost = this.posts[0];
const selectedPost = this.postService.getPostById(1);
```

### Java
```java
// ❌ BAD
List<Post> lst = repo.findAll();
Post p = lst.get(0);
int d = calcDays();

// ✅ GOOD
List<Post> allPosts = postRepository.findAll();
Post latestPost = allPosts.get(0);
int daysSinceCreation = calculateDaysSinceCreation();
```

---

## 8. File naming and single-responsibility structures

- **Java**: Maintain one public class, interface, or enum per file. The filename must match the class/interface/enum name exactly.
- **Angular**: Maintain one component, service, interface, or pipe per file. Use kebab-case naming with suffix matching the element type (e.g., `post-list.component.ts`, `post.service.ts`, `post.model.ts`).

---

## Summary checklist

Before submitting code, verify:

- [ ] Identifiers, comments, API paths, and documentation are in English.
- [ ] No method or function exceeds 30 lines.
- [ ] No method or function has more than 3 parameters (use DTOs, records, interfaces).
- [ ] If/else nesting does not exceed 2 levels (use guard clauses).
- [ ] No `switch/case` is used (use lookup maps or enum properties/polymorphism).
- [ ] Every method/function name begins with a verb.
- [ ] Variable and class names are descriptive and clear.
- [ ] Only one main class/component/interface is declared per file, following standard naming conventions.
