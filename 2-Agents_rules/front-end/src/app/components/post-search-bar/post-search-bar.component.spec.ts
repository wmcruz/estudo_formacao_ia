import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PostSearchBarComponent } from './post-search-bar.component';
import { By } from '@angular/platform-browser';

describe('PostSearchBarComponent', () => {
  let component: PostSearchBarComponent;
  let fixture: ComponentFixture<PostSearchBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostSearchBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PostSearchBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit search event when valid ID is submitted', () => {
    // Arrange
    spyOn(component.search, 'emit');
    component.postId.set('42');
    fixture.detectChanges();

    // Act
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', { preventDefault: () => {} });

    // Assert
    expect(component.search.emit).toHaveBeenCalledWith(42);
  });

  it('should not emit search event when ID is empty or invalid', () => {
    // Arrange
    spyOn(component.search, 'emit');
    component.postId.set('');
    fixture.detectChanges();

    // Act
    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('submit', { preventDefault: () => {} });

    // Assert
    expect(component.search.emit).not.toHaveBeenCalled();
  });
});
