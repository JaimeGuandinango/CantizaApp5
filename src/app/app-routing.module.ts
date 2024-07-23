import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'sign-in',
    pathMatch: 'full',
  },
  {
    path: 'sign-in',
    loadComponent: () => import('./modules/auth/sign-in/sign-in.page').then( m => m.SignInPage)
  },
  {
    path: 'list',
    loadComponent: () => import('./modules/cantiza/list/list.page').then( m => m.ListPage)
  },
  {
    path: 'register',
    loadComponent: () => import('./modules/cantiza/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'register/:id',
    loadComponent: () => import('./modules/cantiza/register/register.page').then( m => m.RegisterPage)
  },
  {
    path: 'history',
    loadComponent: () => import('./modules/cantiza/history/history.page').then( m => m.HistoryPage)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
