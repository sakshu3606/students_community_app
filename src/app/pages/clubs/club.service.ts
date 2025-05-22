import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, of } from 'rxjs';
import { map, catchError, retry } from 'rxjs/operators';

// Interface matching the component's Club interface
export interface Club {
  clubId?: number;
  firstname: string;
  lastname: string;
  description: string;
  createdAt?: Date;
  category?: string;
  isOnline?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private baseUrl = 'http://localhost:8080/api/clubs';

  constructor(private http: HttpClient) { }

  // Get all clubs from backend
  getAllClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/all`).pipe(
      retry(1),
      map(clubs => clubs.map(club => this.processIncomingClub(club))),
      catchError(this.handleError)
    );
  }

  // Get club by ID
  getClubById(id: number): Observable<Club> {
    return this.http.get<Club>(`${this.baseUrl}/${id}`).pipe(
      retry(1),
      map(club => this.processIncomingClub(club)),
      catchError(this.handleError)
    );
  }

  // Create new club
  createClub(club: Club): Observable<Club> {
    return this.http.post<Club>(`${this.baseUrl}/create`, club).pipe(
      map(createdClub => this.processIncomingClub(createdClub)),
      catchError(this.handleError)
    );
  }

  // Update club
  updateClub(id: number, club: Club): Observable<Club> {
    return this.http.put<Club>(`${this.baseUrl}/update/${id}`, club).pipe(
      map(updatedClub => this.processIncomingClub(updatedClub)),
      catchError(this.handleError)
    );
  }

  // Delete club
  deleteClub(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/delete/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  // Search clubs by query
  searchClubs(query: string): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/search`, {
      params: { query }
    }).pipe(
      retry(1),
      map(clubs => clubs.map(club => this.processIncomingClub(club))),
      catchError(error => {
        console.error('Search error:', error);
        // Fall back to client-side filtering
        return this.getAllClubs().pipe(
          map(allClubs => this.filterClubsByQuery(allClubs, query))
        );
      })
    );
  }

  // Filter clubs by category
  getClubsByCategory(category: string): Observable<Club[]> {
    if (category === 'All') {
      return this.getAllClubs();
    }
    
    return this.http.get<Club[]>(`${this.baseUrl}/category/${category}`).pipe(
      retry(1),
      map(clubs => clubs.map(club => this.processIncomingClub(club))),
      catchError(error => {
        console.error('Category filter error:', error);
        // Fall back to client-side filtering
        return this.getAllClubs().pipe(
          map(allClubs => allClubs.filter(club => 
            club.category?.toLowerCase() === category.toLowerCase()
          ))
        );
      })
    );
  }

  // Get online clubs only
  getOnlineClubs(): Observable<Club[]> {
    return this.http.get<Club[]>(`${this.baseUrl}/online`).pipe(
      retry(1),
      map(clubs => clubs.map(club => this.processIncomingClub(club))),
      catchError(error => {
        console.error('Online clubs error:', error);
        // Fall back to client-side filtering
        return this.getAllClubs().pipe(
          map(allClubs => allClubs.filter(club => club.isOnline === true))
        );
      })
    );
  }

  // Error handling method
  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'Unknown error occurred';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    console.error(errorMessage);
    return throwError(() => new Error(errorMessage));
  }

  // Process incoming club data from the server
  private processIncomingClub(club: Club): Club {
    // Ensure createdAt is a Date object
    if (club.createdAt && typeof club.createdAt === 'string') {
      club.createdAt = new Date(club.createdAt);
    }
    
    // Derive category from description if not provided
    if (!club.category) {
      club.category = this.getCategoryFromDescription(club.description);
    }
    
    // Determine if online if not provided
    if (club.isOnline === undefined) {
      club.isOnline = this.determineIfOnline(club.description);
    }
    
    return club;
  }

  // Filter clubs by search query (for client-side fallback)
  private filterClubsByQuery(clubs: Club[], query: string): Club[] {
    const lowercaseQuery = query.toLowerCase();
    return clubs.filter(club => 
      club.firstname.toLowerCase().includes(lowercaseQuery) ||
      club.lastname.toLowerCase().includes(lowercaseQuery) ||
      club.description.toLowerCase().includes(lowercaseQuery)
    );
  }

  // Helper method to determine category from description
  private getCategoryFromDescription(description: string): string {
    const categories = ['Music', 'Sports', 'Academic', 'Arts', 'Technology', 'Social', 'Other'];
    
    // Look for category keywords in the description
    for (const category of categories) {
      if (description.toLowerCase().includes(category.toLowerCase())) {
        return category;
      }
    }
    
    return 'Other'; // Default category
  }

  // Helper method to determine if club is online from description
  private determineIfOnline(description: string): boolean {
    const onlineKeywords = ['online', 'virtual', 'remote', 'digital'];
    return onlineKeywords.some(keyword => 
      description.toLowerCase().includes(keyword)
    );
  }
}