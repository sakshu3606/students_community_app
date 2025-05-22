// Create this file as auth.service.ts in your services folder

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  role: string[];
  profilePicUrl: string;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = 'http://localhost:8080/api';
  
  constructor(private http: HttpClient) { }
  
  login(email: string, password: string): Observable<LoginResponse> {
    const loginData: LoginRequest = { email, password };
    const headers = new HttpHeaders().set('Content-Type', 'application/json');
    
    return this.http.post<LoginResponse>(`${this.API_URL}/auth/login`, loginData, { headers })
      .pipe(
        tap(response => {
          console.log('Login successful:', response);
        })
      );
  }
  
  saveUserData(userData: LoginResponse, rememberMe: boolean): void {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    // Store user data
    storage.setItem('currentUser', JSON.stringify(userData));
    
    // Store auth token if available
    if (userData.token) {
      storage.setItem('auth_token', userData.token);
    }
  }
  
  getUserRole(): string[] | null {
    const userData = this.getCurrentUser();
    return userData ? userData.role : null;
  }
  
  getCurrentUser(): LoginResponse | null {
    // Try to get from sessionStorage first, then localStorage
    const userStr = sessionStorage.getItem('currentUser') || localStorage.getItem('currentUser');
    return userStr ? JSON.parse(userStr) : null;
  }
  
  getAuthToken(): string | null {
    return sessionStorage.getItem('auth_token') || localStorage.getItem('auth_token');
  }
  
  logout(): void {
    // Clear both storages to ensure complete logout
    sessionStorage.removeItem('currentUser');
    sessionStorage.removeItem('auth_token');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('auth_token');
  }
  
  isLoggedIn(): boolean {
    return !!this.getCurrentUser();
  }
}