import { Routes } from '@angular/router';
import { PostsDashboardComponent } from './pages/posts-dashboard/posts-dashboard.component';

export const routes: Routes = [
  { path: '', component: PostsDashboardComponent },
  { path: '**', redirectTo: '' }
];
