import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';

export interface Poll {
  id?: number;
  user?: any;
  question: string;
  option1: string;
  option2: string;
  option1Votes: number;
  option2Votes: number;
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PollingService {
  private baseUrl = 'http://localhost:8080/api/polls';

  constructor(private http: HttpClient) { }

  // Get all polls
  getAllPolls(): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.baseUrl}/all`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Get polls by user
  getPollsByUser(userId: number): Observable<Poll[]> {
    return this.http.get<Poll[]>(`${this.baseUrl}/user/${userId}`).pipe(
      retry(1),
      catchError(this.handleError)
    );
  }

  // Create new poll
  createPoll(poll: Poll): Observable<Poll> {
    return this.http.post<Poll>(`${this.baseUrl}/create`, poll).pipe(
      catchError(this.handleError)
    );
  }

  // Update poll
  updatePoll(pollId: number, poll: Poll): Observable<Poll> {
    return this.http.put<Poll>(`${this.baseUrl}/${pollId}`, poll).pipe(
      catchError(this.handleError)
    );
  }

  // Delete poll
  deletePoll(pollId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${pollId}`).pipe(
      catchError(this.handleError)
    );
  }

  // Vote for an option
  voteForOption(pollId: number, optionIndex: number): Observable<Poll> {
    return this.http.post<Poll>(`${this.baseUrl}/${pollId}/vote`, { optionIndex }).pipe(
      catchError(this.handleError)
    );
  }

  private handleError(error: HttpErrorResponse) {
    let errorMessage = 'An unknown error occurred';
    
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
}