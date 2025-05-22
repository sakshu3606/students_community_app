import { Component, OnInit, OnDestroy, HostListener, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { SearchResult, SearchService } from './search.services';

@Component({
  selector: 'app-search-dropdown',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './search-dropdown.component.html',
  styleUrls: ['./search-dropdown.component.css']
})
export class SearchDropdownComponent implements OnInit, OnDestroy {
  isActive: boolean = false;
  searchQuery: string = '';
  results: SearchResult[] = [];
  isSearching: boolean = false;
  
  private subscriptions = new Subscription();
  
  constructor(
    private searchService: SearchService,
    private router: Router,
    private elementRef: ElementRef
  ) {}
  
  ngOnInit(): void {
    this.subscriptions.add(
      this.searchService.searchQuery$.subscribe(query => {
        this.searchQuery = query;
        this.isActive = query.trim().length > 0;
      })
    );
    
    this.subscriptions.add(
      this.searchService.searchResults$.subscribe(results => {
        this.results = results;
      })
    );
    
    this.subscriptions.add(
      this.searchService.isSearching$.subscribe(isSearching => {
        this.isSearching = isSearching;
      })
    );
  }
  
  getIconForType(type: string): string {
    switch (type) {
      case 'post': return 'description';
      case 'user': return 'person';
      case 'club': return 'groups';
      case 'event': return 'event';
      case 'academic': return 'school';
      default: return 'search';
    }
  }
  
  navigateToResult(result: SearchResult): void {
    this.router.navigateByUrl(result.url);
    this.closeDropdown();
  }
  
  viewAllResults(): void {
    this.closeDropdown();
  }
  
  closeDropdown(): void {
    this.isActive = false;
  }
  
  @HostListener('document:click', ['$event'])
  clickOutside(event: Event): void {
    if (!this.elementRef.nativeElement.contains(event.target)) {
      this.isActive = false;
    }
  }
  
  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
