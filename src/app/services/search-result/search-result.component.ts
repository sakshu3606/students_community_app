import { Injectable, Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { BehaviorSubject, Observable, Subscription } from 'rxjs';
import { map, catchError, finalize } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'post' | 'user' | 'club' | 'event' | 'academic';
  url: string;
  imageUrl?: string;
  author?: {
    name: string;
    avatar: string;
  };
  createdAt?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SearchService {
  private searchResultsSubject = new BehaviorSubject<SearchResult[]>([]);
  private isSearchingSubject = new BehaviorSubject<boolean>(false);

  searchResults$ = this.searchResultsSubject.asObservable();
  isSearching$ = this.isSearchingSubject.asObservable();

  constructor(private http: HttpClient) {}

  search(query: string): void {
    if (!query.trim()) {
      this.searchResultsSubject.next([]);
      return;
    }

    this.isSearchingSubject.next(true);

    this.http.get<SearchResult[]>(`/api/search?q=${encodeURIComponent(query)}`)
      .pipe(
        catchError(error => {
          console.error('Search error:', error);
          return [];
        }),
        finalize(() => this.isSearchingSubject.next(false))
      )
      .subscribe(results => {
        console.log('Search results received:', results);
        this.searchResultsSubject.next(results);
      });
  }
}

@Component({
  selector: 'app-search-results',
  standalone: true,
  imports: [CommonModule, 
    RouterModule,
    HttpClientModule
  ],
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultsComponent implements OnInit, OnDestroy {
  results: SearchResult[] = [];
  filteredResults: SearchResult[] = [];
  currentQuery: string = '';
  isSearching: boolean = false;
  activeFilter: string = 'all';

  private subscriptions = new Subscription();

  filters = [
    { label: 'All', value: 'all' },
    { label: 'Posts', value: 'post' },
    { label: 'Users', value: 'user' },
    { label: 'Clubs', value: 'club' },
    { label: 'Events', value: 'event' },
    { label: 'Academic', value: 'academic' }
  ];

  constructor(
    private searchService: SearchService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.route.queryParams.subscribe(params => {
        const query = params['q'];
        if (query) {
          this.currentQuery = query;
          this.searchService.search(query);
        }
      })
    );

    this.subscriptions.add(
      this.searchService.searchResults$.subscribe(results => {
        this.results = results;
        this.applyFilter(this.activeFilter);
      })
    );

    this.subscriptions.add(
      this.searchService.isSearching$.subscribe(isSearching => {
        this.isSearching = isSearching;
      })
    );
  }

  applyFilter(filter: string): void {
    this.activeFilter = filter;

    if (filter === 'all') {
      this.filteredResults = this.results;
    } else {
      this.filteredResults = this.results.filter(result => result.type === filter);
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
