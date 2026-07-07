import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostDetailComponent } from './post-detail.component';
import { Post } from '../../models/post.model';
import { By } from '@angular/platform-browser';

describe('PostDetailComponent', () => {
  let component: PostDetailComponent;
  let fixture: ComponentFixture<PostDetailComponent>;

  const mockPost: Post = {
    id: 1,
    userId: 1,
    title: 'sample title',
    body: 'sample body content'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostDetailComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PostDetailComponent);
    component = fixture.componentInstance;
    component.post = mockPost;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the post title', () => {
    // Arrange & Act
    const titleEl = fixture.debugElement.query(By.css('.post-card__title'));

    // Assert
    expect(titleEl.nativeElement.textContent).toContain('sample title');
  });

  it('should render the post body', () => {
    // Arrange & Act
    const bodyEl = fixture.debugElement.query(By.css('.post-card__content'));

    // Assert
    expect(bodyEl.nativeElement.textContent).toContain('sample body content');
  });

  it('should display the post id badge', () => {
    // Arrange & Act
    const badgeEl = fixture.debugElement.query(By.css('.badge-value'));

    // Assert
    expect(badgeEl.nativeElement.textContent).toContain('#1');
  });
});
