import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

// Auth-related components
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ForgetPasswordComponent } from './password/forget-password/forget-password.component';
import { ResetPasswordComponent } from './password/reset-password/reset-password.component';

// Profile & Search-related components
import { ProfileComponent } from './services/profile/profile.component';
import { SearchResultsComponent } from './services/search-result/search-result.component';

// Contribute component
import { ContributeComponent } from './models/contribute/contribute.component';

// Main app components
import { MainAppCompoComponent } from './main-app-compo/main-app-compo.component';
import { HomeComponent } from './pages/home/home.component';
import { AcademicComponent } from './pages/academic/academic.component';
import { ClubsComponent } from './pages/clubs/clubs.component';
import { EventsComponent } from './pages/events/events.component';
import { PollingComponent } from './pages/polling/polling.component';

export const routes: Routes = [
  // 🔐 Auth routes
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forget-password', component: ForgetPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },

  // 👤 Profile route
  { path: 'profile', component: ProfileComponent },

  // 🔎 Global search route
  { path: 'search', component: SearchResultsComponent },

  // Contribute routes
  { path: 'contribute', component: ContributeComponent },
  { path: 'academic/contribute', component: ContributeComponent },

  // 📦 Main app routes
  {
    path: 'main-app-compo',
    loadComponent: () =>
      import('./main-app-compo/main-app-compo.component').then(m => m.MainAppCompoComponent),
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      {
        path: 'home',
        loadComponent: () =>
          import('./pages/home/home.component').then(m => m.HomeComponent)
      },
      {
        path: 'academic',
        loadComponent: () =>
          import('./pages/academic/academic.component').then(m => m.AcademicComponent)
      },
      {
        path: 'clubs',
        loadComponent: () =>
          import('./pages/clubs/clubs.component').then(m => m.ClubsComponent)
      },
      {
        path: 'events',
        loadComponent: () =>
          import('./pages/events/events.component').then(m => m.EventsComponent)
      },
      {
        path: 'polling',
        loadComponent: () =>
          import('./pages/polling/polling.component').then(m => m.PollingComponent)
      },
      // Added from second routing module
      { path: 'polls', component: PollingComponent }
    ]
  },
  
  // Direct polls route from the second module
  { path: 'polls', component: PollingComponent },

  // 🚫 Fallback for unmatched routes
  { path: '**', redirectTo: 'login' },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }