import { Component } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
  FormsModule
} from '@angular/forms';
import {
  Router,
  RouterModule
} from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from './authentication.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  loginForm: FormGroup;
  isSubmitting = false;
  loginError: string | null = null;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      rememberMe: [false]
    });
  }

  // This method handles the login button click
  onLoginButtonClick(): void {
    // Prevent multiple submissions
    if (this.isSubmitting) {
      return;
    }
    
    // Call the onSubmit method to process the form
    this.onSubmit();
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.loginError = null;

    const { email, password, rememberMe } = this.loginForm.value;

    this.authService.login(email, password)
      .subscribe({
        next: (response) => {
          this.authService.saveUserData(response, rememberMe);

          const roles: string[] = Array.isArray(response?.role)
            ? response.role
            : typeof response?.role === 'string'
              ? [response.role]
              : [];

          this.navigateBasedOnRole(roles);
          this.isSubmitting = false;
        },
        error: (error) => {
          console.error('Login failed:', error);

          if (typeof error.error === 'string') {
            this.loginError = error.error;
          } else if (error.error?.message) {
            this.loginError = error.error.message;
          } else if (error.status === 401) {
            this.loginError = 'Invalid email or password. Please try again.';
          } else if (error.status === 0) {
            this.loginError = 'Unable to connect to server. Please check your internet connection.';
          } else {
            this.loginError = 'Login failed. Please check your credentials.';
          }

          this.isSubmitting = false;
        }
      });
  }

  // Extracted the navigation logic to a separate method for better organization
  navigateBasedOnRole(roles: string[]): void {
    const isClub = roles.includes('CLUB');
    
    if (isClub) {
      this.router.navigate(['/club-dashboard']).then(success => {
        if (!success) {
          console.error('Navigation to club dashboard failed');
        }
      });
    } else {
      let mainRole = '';
      if (roles.length > 0 && typeof roles[0] === 'string') {
        mainRole = roles[0].toLowerCase();
      }

      let targetRoute = '/main-app-compo'; // Default route
      
      switch (mainRole) {
        case 'admin':
          targetRoute = '/main-app-compo';
          break;
        case 'faculty':
          targetRoute = '/main-app-compo';
          break;
        case 'student':
          targetRoute = '/main-app-compo';
          break;
      }
      
      this.router.navigate([targetRoute]).then(success => {
        if (!success) {
          console.error(`Navigation to ${targetRoute} failed`);
        }
      });
    }
  }

  goToRegister(): void {
    this.router.navigate(['/register']).then(success => {
      if (!success) {
        console.error('Navigation to register page failed');
      }
    });
  }
}