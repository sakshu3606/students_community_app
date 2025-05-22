// contribution.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ContributionService {
  // Use a relative URL to avoid cross-origin issues
  private apiUrl = '/api/contributions';

  constructor(private http: HttpClient) { }

  submitContribution(contributionData: any): Observable<any> {
    // Log the data being sent
    console.log('Submitting contribution data:', contributionData);
    
    // For development purposes, use a mock response if API isn't ready
    // Comment this out when your API is ready
    return of({ success: true, message: 'Contribution submitted successfully' }).pipe(
      tap(() => console.log('Mock submission successful'))
    );
    
    // Uncomment this when your API is ready
    /*
    return this.http.post<any>(this.apiUrl, contributionData).pipe(
      tap(response => console.log('API Response:', response)),
      catchError(this.handleError)
    );
    */
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    console.error('API Error:', error);
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
    
    // You could also display this error in the UI
    return throwError(() => new Error(errorMessage));
  }
}