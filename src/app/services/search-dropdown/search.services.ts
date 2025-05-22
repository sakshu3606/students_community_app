import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, BehaviorSubject } from 'rxjs';
import { catchError, map, tap, debounceTime, switchMap } from 'rxjs/operators';

export interface SearchResult {
  id: string;
  type: 'post' | 'user' | 'club' | 'event' | 'academic';
  title: string;
  description: string;
  imageUrl?: string;
  author?: {
    id: string;
    name: string;
    avatar: string;
  };
  createdAt?: Date;
  url: string;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private apiUrl = 'api/search'; // Replace with your actual API endpoint
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  public searchResults$ = this.searchResultsSubject.asObservable();
  private searchQuerySubject = new BehaviorSubject<string>('');
  public searchQuery$ = this.searchQuerySubject.asObservable();
  private isSearchingSubject = new BehaviorSubject<boolean>(false);
  public isSearching$ = this.isSearchingSubject.asObservable();

  constructor(private http: HttpClient) {
    // Setup debounced search
    this.searchQuery$.pipe(
      debounceTime(300), // Wait 300ms after the last event before emitting
      tap(() => this.isSearchingSubject.next(true)),
      switchMap(query => {
        if (!query || query.trim() === '') {
          return of([]);
        }
        return this.searchApi(query);
      })
    ).subscribe(results => {
      this.searchResultsSubject.next(results);
      this.isSearchingSubject.next(false);
    });
  }

  // Updates the search query
  updateSearchQuery(query: string): void {
    this.searchQuerySubject.next(query);
  }

  // Clear search results
  clearSearch(): void {
    this.searchQuerySubject.next('');
    this.searchResultsSubject.next([]);
  }

  // Perform the actual API call
  private searchApi(query: string): Observable<SearchResult[]> {
    return this.http.get<SearchResult[]>(`${this.apiUrl}?q=${encodeURIComponent(query)}`).pipe(
      catchError(error => {
        console.error('Error performing search:', error);
        return of([]);
      })
    );
  }

  // Method for performing direct searches (not debounced)
  search(query: string): Observable<SearchResult[]> {
    this.isSearchingSubject.next(true);
    this.searchQuerySubject.next(query);
    return this.searchApi(query).pipe(
      tap(results => {
        this.searchResultsSubject.next(results);
        this.isSearchingSubject.next(false);
      })
    );
  }
}