// profile.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private apiUrl = 'https://api.example.com';
  
  constructor(private http: HttpClient) { }
  
  updateUserProfile(userId: string, userData: any): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${userId}`, userData);
  }
  
  toggleEventAttendance(userId: string, eventId: number, attending: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/events/${eventId}/attendance`, { 
      userId, 
      attending 
    });
  }
  
  toggleClubMembership(userId: string, clubId: number, joined: boolean): Observable<any> {
    return this.http.post(`${this.apiUrl}/clubs/${clubId}/membership`, { 
      userId, 
      joined 
    });
  }
}