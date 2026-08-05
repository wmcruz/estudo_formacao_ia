import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideAnimations } from '@angular/platform-browser/animations';
import { PostSearchComponent } from './post-search.component';
import { Post } from '../../models/post.model';

describe('PostSearchComponent', () => {
  let component: PostSearchComponent;
  let fixture: ComponentFixture<PostSearchComponent>;

  const mockPost: Post = {
    userId: 1,
    id: 5,
    title: 'Searched Post Title',
    body: 'Searched Post Body'
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PostSearchComponent],
      providers: [provideAnimations()]
    }).compileComponents();
    
    fixture = TestBed.createComponent(PostSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('31: should render number input field', () => {
    const input = fixture.nativeElement.querySelector('input[type="number"]');
    expect(input).toBeTruthy();
  });

  it('33: should apply the Material theme color to the primary button', () => {
    component.searchId = 5;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button.mat-mdc-raised-button.mat-primary');
    const style = getComputedStyle(button);

    expect(style.backgroundColor).toBe('rgb(63, 81, 181)');
  });

  it('34: should render the input with the ID do Post label', () => {
    const label = fixture.nativeElement.querySelector('label[for="mat-input-0"], mat-label');
    expect(fixture.nativeElement.textContent).toContain('ID do Post');
  });

  it('32: should render search button', () => {
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Buscar');
  });

  it('33: should emit search event when onSearch is triggered', () => {
    spyOn(component.search, 'emit');
    component.searchId = 5;
    component.onSearch();
    expect(component.search.emit).toHaveBeenCalledWith(5);
  });

  it('34: should display searched post details', () => {
    component.post = mockPost;
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Searched Post Title');
    expect(compiled.textContent).toContain('ID: 5 | User ID: 1');
  });

  it('35: should display error message when provided', () => {
    component.errorMessage = 'Post não encontrado';
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Post não encontrado');
  });

  it('36: should hide post result when errorMessage is present', () => {
    component.post = null;
    component.errorMessage = 'Post não encontrado';
    fixture.detectChanges();

    const card = fixture.nativeElement.querySelector('.result-container');
    expect(card).toBeFalsy();
  });

  it('37: should disable button when searchId is empty or zero', () => {
    component.searchId = null;
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button');
    expect(button.disabled).toBeTrue();
  });

  it('38: should show loading spinner when loading is true', () => {
    component.loading = true;
    fixture.detectChanges();

    const spinner = fixture.nativeElement.querySelector('mat-spinner');
    expect(spinner).toBeTruthy();
  });
});
