# Folder Structure

These conventions define where code belongs in this project. Agents and contributors must follow this layout when adding or moving files in the backend (`back-end/`) and frontend (`front-end/`).

---

## Backend (`back-end/src/main/java/com/json/place/holder/back_end/`)

The backend follows a layer-based package structure to segregate responsibilities and maintain a clean separation of concerns.

```
com/json/place/holder/back_end/
├── BackEndApplication.java   # Spring Boot Application entrypoint
├── controller/               # HTTP layer — parses REST inputs and returns DTO responses
├── service/                  # Business logic — processes data, validates, and orchestrates
├── repository/               # Data persistence — Spring Data repositories (entities interaction)
├── model/                    # Domain Layer — JPA entities/database mapping models
├── dto/                      # Data Transfer Objects — request and response structures
├── exception/                # Exception handling — global error handling and custom exceptions
└── config/                   # Configuration classes — security, CORS, beans
```

### Layer responsibilities

| Package | Responsibility | Must NOT contain |
|---------|----------------|------------------|
| `controller/` | Validate HTTP requests, parse query parameters, invoke services, and return responses | Business logic, direct DB calls, external HTTP fetches, entity/model persistence details |
| `service/` | Business decisions, validations, mapping between entity and DTO, orchestration | Web-layer classes (`HttpServletRequest`, status codes), raw DB calls (bypassing repositories) |
| `repository/` | DB query execution, custom query definitions | Business logic, controller response formatting |
| `model/` | DB schema mappings, JPA relationships, fields configuration | Controller mapping logic, business orchestrations |
| `dto/` | Input/Output contract representations for the endpoints | DB JPA annotations, business logic |

### Dependency direction

```
controller  →  service  →  repository
    ↓             ↓             ↓
   dto          model         model
```

*Lower layers (like repository and model) must never import from upper layers (like service and controller).*

### Examples

#### Controller — HTTP layer only
```java
// ❌ BAD — Service logic and API call orchestrated inside Controller
@RestController
@RequestMapping("/api/posts")
public class PostController {
    @GetMapping("/{id}")
    public ResponseEntity<Post> getPostById(@PathVariable Long id) {
        // Direct fetch from external API inside controller
        String url = "https://jsonplaceholder.typicode.com/posts/" + id;
        Post post = restTemplate.getForObject(url, Post.class);
        return ResponseEntity.ok(post);
    }
}

// ✅ GOOD — Controller delegates to Service layer and maps to DTO
@RestController
@RequestMapping("/api/posts")
public class PostController {
    private final PostService postService;

    public PostController(PostService postService) {
        this.postService = postService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<PostDto> getPostById(@PathVariable Long id) {
        PostDto postDto = postService.fetchPostById(id);
        return ResponseEntity.ok(postDto);
    }
}
```

#### Service — business rules
```java
// ❌ BAD — Service method references HttpServletResponse directly
@Service
public class PostService {
    public void respondWithPost(HttpServletResponse response, Long id) throws IOException {
        response.setStatus(200);
        response.getWriter().write("{\"id\":" + id + "}");
    }
}

// ✅ GOOD — Service logic uses domain classes, and returns a DTO
@Service
public class PostService {
    private final PostRepository postRepository;

    public PostService(PostRepository postRepository) {
        this.postRepository = postRepository;
    }

    public PostDto fetchPostById(Long id) {
        PostEntity post = postRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Post not found with id " + id));
        return new PostDto(post.getId(), post.getTitle(), post.getBody());
    }
}
```

---

## Frontend (`front-end/src/app/`)

The frontend Angular project uses a feature/layer-based structure inside the `app/` folder.

```
front-end/src/app/
├── app.component.ts      # Root component
├── app.config.ts         # Global configuration (routing, HTTP client, providers)
├── app.routes.ts         # Route declarations
├── pages/                # Container components (represents full screens / routed views)
│   └── posts-dashboard/  # Example: posts dashboard screen container
├── components/           # Reusable presentation UI components (tables, search bars)
│   └── post-table/       # Example: post listing presentation table component
├── services/             # HTTP Client services & global state management
└── models/               # TypeScript models & interface definitions
```

### Layer responsibilities

| Folder | Responsibility | Must NOT contain |
|--------|----------------|------------------|
| `pages/` | Routed container views, state orchestration, binding service data to inputs | Presentational UI internals, direct CSS grid/flex formatting for children, direct HTTP logic |
| `components/` | Reusable visual widgets, UI presentation using `@Input` & `@Output` | Stateful API invocations (directly injecting services for state), route logic |
| `services/` | HTTP/API endpoint communications (`HttpClient`), global/shared state signals | HTML template markup, styling, component lifecycles |
| `models/` | Type definitions and interfaces representing payload structures | Component files, services logic |

### Dependency direction

```
app.routes  →  pages  →  components
                 ↓          ↓
              services    models
```

### Examples

#### Pages — screen containers
```typescript
// ❌ BAD — Screen page component directly fetches data via HttpClient and renders table HTML markup
@Component({
  selector: 'app-posts-dashboard-page',
  template: `
    <div class="container">
      <table>
        <tr *ngFor="let post of posts"><td>{{post.title}}</td></tr>
      </table>
    </div>
  `
})
public class PostsDashboardPageComponent implements OnInit {
  posts: any[] = [];
  constructor(private http: HttpClient) {}
  ngOnInit() {
    this.http.get<any[]>('/api/posts').subscribe(data => this.posts = data);
  }
}

// ✅ GOOD — Page delegates data retrieving to service, visual display to reusable table component
@Component({
  selector: 'app-posts-dashboard-page',
  template: `
    <div class="container">
      <app-post-search-bar (search)="onSearch($event)"></app-post-search-bar>
      <app-post-table [posts]="posts()" [loading]="isLoading()"></app-post-table>
    </div>
  `
})
public class PostsDashboardPageComponent implements OnInit {
  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(false);

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.loadPosts();
  }

  private loadPosts() {
    this.isLoading.set(true);
    this.postService.getPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      }
    });
  }

  public onSearch(id: number) {
    // search implementation
  }
}
```

#### Components — presentational widgets only
```typescript
// ✅ GOOD — Presentation component accepting inputs, generating events, no service integration
@Component({
  selector: 'app-post-table',
  templateUrl: './post-table.component.html',
  styleUrls: ['./post-table.component.css']
})
public class PostTableComponent {
  @Input() public posts: Post[] = [];
  @Input() public loading: boolean = false;
  @Output() public selectPost = new EventEmitter<number>();

  public onRowClick(postId: number) {
    this.selectPost.emit(postId);
  }
}
```

#### Services — plain API communication
```typescript
// ✅ GOOD — Service handles API call and exposes clean Observable/Signal
@Injectable({
  providedIn: 'root'
})
public class PostService {
  private readonly apiUrl = 'http://localhost:8080/api/posts';

  constructor(private http: HttpClient) {}

  public getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>(this.apiUrl);
  }
}
```

---

## File naming and structure conventions

- **Java Backend**:
  - Class/Interface files should use `UpperCamelCase` and end with the layer suffix: `PostController.java`, `PostService.java`, `PostRepository.java`, `PostEntity.java`, `PostDto.java`.
  - Package names should be all lowercase: `controller`, `service`, `repository`, `model`, `dto`.

- **Angular Frontend**:
  - Angular filenames should be in `kebab-case` and include the component type suffix:
    - Components: `post-table.component.ts`, `post-table.component.html`, `post-table.component.css`
    - Services: `post.service.ts`
    - Models: `post.model.ts`
    - Routing/Config: `app.routes.ts`, `app.config.ts`

---

## Summary checklist

Before adding or shifting code files, verify:

- [ ] Java controller endpoints live in the `controller` package and return DTOs.
- [ ] Business logic and domain object conversions reside in the `service` package.
- [ ] Database access relies strictly on JPA entities in `model` and interfaces in `repository`.
- [ ] Angular pages under `pages/` handle container state and page-level layouts.
- [ ] Shared, presentational markup stays inside `components/` using `@Input()` / `@Output()`.
- [ ] Angular services under `services/` communicate via `HttpClient` (returning clean Observables/Signals).
- [ ] File names use matching prefixes/suffixes conforming to either Java `UpperCamelCase` (with suffix) or Angular `kebab-case.suffix.ts`.
