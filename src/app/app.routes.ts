import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/testing', pathMatch: 'full' },
  { 
    path: 'testing', 
    loadComponent: () => import('./components/typewriter-testing/typewriter-testing.component').then(m => m.TypewriterTestingComponent) 
  },
  { path: '**', redirectTo: '/testing' }
];