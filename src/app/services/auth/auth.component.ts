import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ConfigService } from '../config/config.component';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) { }

  // Unified registration method that handles both individual and club registrations
  register(data: any, type: 'individual' | 'club'): Observable<any> {
    const endpoint = type === 'individual' ? 'users/register' : 'clubs/register';
    return this.http.post(`${this.configService.apiUrl}/${endpoint}`, data)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Login method
  login(credentials: { userId: string; password: string }): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/login`, credentials)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Logout method
  logout(): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/logout`, {})
      .pipe(
        catchError(this.handleError)
      );
  }

  // Get current logged in user information
  getCurrentUser(): Observable<any> {
    return this.http.get(`${this.configService.apiUrl}/auth/me`)
      .pipe(
        catchError(this.handleError)
      );
  }

  // Request password reset
  requestPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/forget-password`, { email })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Reset password with token
  resetPassword(token: string, newPassword: string): Observable<any> {
    return this.http.post(`${this.configService.apiUrl}/auth/reset-password`, { token, newPassword })
      .pipe(
        catchError(this.handleError)
      );
  }

  // Error handling function
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
