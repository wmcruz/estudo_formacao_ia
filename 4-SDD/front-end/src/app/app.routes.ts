import { Routes } from '@angular/router';
import { PostsPageComponent } from './pages/posts/posts-page/posts-page.component';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  { path: 'posts', component: PostsPageComponent }
];
