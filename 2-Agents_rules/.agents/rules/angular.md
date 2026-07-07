# Angular Standards

These standards apply to all Angular code in `front-end/` (Angular + TypeScript). Agents and contributors must follow them when writing or reviewing components, directives, services, and pipes.

See also: [code-standards.md](./code-standards.md) and [folder-structure.md](./folder-structure.md).

---

## 1. Use standalone components, directives, and pipes

Do not use legacy `NgModule` modules for grouping declarations. Always set `standalone: true` on your `@Component`, `@Directive`, and `@Pipe` decorators.

```typescript
// ❌ BAD — Requires separate NgModule declaration and imports management
@Component({
  selector: 'app-post-detail',
  templateUrl: './post-detail.component.html'
})
export class PostDetailComponent {}

// ✅ GOOD — Independent component specifying its own imports
@Component({
  selector: 'app-post-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormatDatePipe],
  templateUrl: './post-detail.component.html',
  styleUrl: './post-detail.component.css'
})
export class PostDetailComponent {}
```

---

## 2. Component Class logic must have at most 30 lines

Keep component files focused on the presentation layer. Offload data transformations, HTTP operations, and complex validations to Services or custom Pipes.

```typescript
// ❌ BAD — Component class does HTTP fetching, mappings, error alerts, and state management inline
@Component({ ... })
export class PostDashboardComponent implements OnInit {
  public posts: Post[] = [];
  public hasError = false;

  constructor(private http: HttpClient, private toastr: ToastrService) {}

  ngOnInit() {
    this.http.get<Post[]>('/api/posts').subscribe({
      next: (res) => {
        this.posts = res.map(post => ({
          ...post,
          title: post.title.trim().toUpperCase()
        }));
      },
      error: (err) => {
        this.hasError = true;
        this.toastr.error('Error loading posts');
      }
    });
  }
}

// ✅ GOOD — Small component class delegating orchestration to service
@Component({
  selector: 'app-post-dashboard',
  standalone: true,
  imports: [CommonModule, PostTableComponent],
  template: `<app-post-table [posts]="posts()" [loading]="isLoading()"></app-post-table>`
})
export class PostDashboardComponent implements OnInit {
  public posts = signal<Post[]>([]);
  public isLoading = signal<boolean>(false);

  constructor(private postService: PostService) {}

  ngOnInit() {
    this.isLoading.set(true);
    this.postService.getFormattedPosts().subscribe({
      next: (data) => {
        this.posts.set(data);
        this.isLoading.set(false);
      }
    });
  }
}
```

---

## 3. Declare inputs and outputs explicitly

Provide strict type definitions and specify properties with `@Input()` and `@Output()`. Prefer utilizing modern Angular Signals (`input()` and `output()`) for reactive state binding when applicable.

```typescript
// ❌ BAD — Generically typed configuration object makes inputs unclear
@Component({ ... })
export class PostItemComponent {
  @Input() public config: any;
}

// ✅ GOOD — Explicit, typed inputs and event emitters
@Component({
  selector: 'app-post-item',
  standalone: true,
  templateUrl: './post-item.component.html'
})
export class PostItemComponent {
  @Input({ required: true }) public post!: Post;
  @Input() public isHighlighted = false;
  @Output() public delete = new EventEmitter<number>();

  public onDeleteClick() {
    this.delete.emit(this.post.id);
  }
}
```

---

## 4. Use Dependency Injection (`inject()`) and isolate Services

Always keep UI separate from business layers. Create services with `@Injectable({ providedIn: 'root' })` to handle network requests, mapping, and global states. Use the modern Angular `inject()` function to inject dependencies instead of verbose constructors.

```typescript
// ❌ BAD — Component directly accesses HTTP Client and constructs endpoint paths
@Component({ ... })
export class PostListComponent implements OnInit {
  public posts: Post[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.http.get<Post[]>('http://localhost:8080/api/posts').subscribe(r => this.posts = r);
  }
}

// ✅ GOOD — Service encapsulates HTTP request; component injects service
@Injectable({
  providedIn: 'root'
})
public class PostService {
  private readonly http = inject(HttpClient);

  public getPosts(): Observable<Post[]> {
    return this.http.get<Post[]>('/api/posts');
  }
}

@Component({ ... })
export class PostListComponent implements OnInit {
  private readonly postService = inject(PostService);
  public posts = signal<Post[]>([]);

  ngOnInit() {
    this.postService.getPosts().subscribe(data => this.posts.set(data));
  }
}
```

---

## 5. Never call component methods directly in templates; use `computed()` or Pure Pipes

Do not call methods in template interpolations (e.g. `{{ formatTitle(post) }}`) or directives (e.g. `*ngIf="checkPermissions()"`), as they run on every Single Change Detection (CD) cycle. Memoize computed properties using Angular Signal's `computed()` or declare custom pure `@Pipe`s.

```typescript
// ❌ BAD — formatTitle() method recalculates on every Change Detection event (e.g., hover, scroll)
@Component({
  template: `<h1>{{ formatTitle(post.title) }}</h1>`
})
export class PostHeaderComponent {
  @Input() public post!: Post;

  public formatTitle(title: string): string {
    return title.toUpperCase();
  }
}

// ✅ GOOD — Using Angular Signals and computed()
@Component({
  template: `<h1>{{ formattedTitle() }}</h1>`
})
export class PostHeaderComponent {
  public post = input.required<Post>();

  // Computed signal is only recalculated when post() changes
  public formattedTitle = computed(() => {
    return this.post().title.toUpperCase();
  });
}

// ✅ GOOD — Using standard Pure Pipe
@Pipe({
  name: 'formatTitle',
  standalone: true,
  pure: true // pure is true by default, caching results based on reference inputs
})
export class FormatTitlePipe implements PipeTransform {
  transform(title: string): string {
    return title.toUpperCase();
  }
}
```

---

## Summary checklist

Before submitting Angular code, verify:

- [ ] Components, directives, and pipes are Standalone (`standalone: true`).
- [ ] No component class exceeds 30 lines of code.
- [ ] Inputs (`@Input()`) and Outputs (`@Output()`) are declared with strict typing.
- [ ] HTTP network requests and state management are isolated inside Services.
- [ ] Dependencies are cleanly resolved (prefer using `inject()`).
- [ ] No function calls are bound directly inside templates (use `computed()` signals or Pure Pipes for derived visual values).
