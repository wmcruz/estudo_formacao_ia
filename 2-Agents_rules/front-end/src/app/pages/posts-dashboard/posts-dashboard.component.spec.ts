import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostsDashboardComponent } from './posts-dashboard.component';
import { PostService } from '../../services/post.service';
import { Post } from '../../models/post.model';
import { of, throwError } from 'rxjs';

describe('PostsDashboardComponent', () => {
  let component: PostsDashboardComponent;
  let fixture: ComponentFixture<PostsDashboardComponent>;
  let postServiceSpy: jasmine.SpyObj<PostService>;

  beforeEach(async () => {
    postServiceSpy = jasmine.createSpyObj('PostService', ['getAllPosts', 'getPostById']);
    postServiceSpy.getAllPosts.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [PostsDashboardComponent],
      providers: [{ provide: PostService, useValue: postServiceSpy }]
    }).compileComponents();

    fixture = TestBed.createComponent(PostsDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load all posts on init', () => {
    expect(postServiceSpy.getAllPosts).toHaveBeenCalled();
  });

  it('should set currentPost after successful search', () => {
    // Arrange
    const mockPost: Post = { id: 1, userId: 1, title: 'Test', body: 'Body' };
    postServiceSpy.getPostById.and.returnValue(of(mockPost));

    // Act
    component.onSearch(1);
    fixture.detectChanges();

    // Assert
    expect(component.currentPost()).toEqual(mockPost);
    expect(component.isLoading()).toBeFalse();
    expect(component.hasError()).toBeFalse();
  });

  it('should set hasError when search fails', () => {
    // Arrange
    postServiceSpy.getPostById.and.returnValue(throwError(() => new Error('Not Found')));

    // Act
    component.onSearch(999);
    fixture.detectChanges();

    // Assert
    expect(component.hasError()).toBeTrue();
    expect(component.isLoading()).toBeFalse();
    expect(component.currentPost()).toBeNull();
  });
});
