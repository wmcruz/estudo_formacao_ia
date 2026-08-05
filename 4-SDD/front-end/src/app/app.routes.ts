import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/posts', pathMatch: 'full' },
  {
    path: 'posts',
    loadComponent: () => import('./pages/posts/posts-page/posts-page.component').then(m => m.PostsPageComponent)
  }
];
