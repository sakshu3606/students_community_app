import { Component, OnInit } from '@angular/core';
import { ResourceService } from '../../environment';

@Component({
  selector: 'app-books',
  templateUrl: './books.component.html',
  styleUrls: ['./books.component.scss']
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  loading = true;
  error = false;
  searchTerm = '';
  
  constructor(private resourceService: ResourceService) { }
  
  ngOnInit(): void {
    this.loadBooks();
  }
  
  loadBooks() {
    this.loading = true;
    this.resourceService.getBooks()
      .subscribe(
        data => {
          this.books = data;
          this.loading = false;
        },
        error => {
          console.error('Error loading books', error);
          this.error = true;
          this.loading = false;
        }
      );
  }
  
  searchBooks() {
    if (this.searchTerm.trim() === '') {
      this.loadBooks();
      return;
    }
    
    this.loading = true;
    this.resourceService.searchBooks(this.searchTerm)
      .subscribe(
        data => {
          this.books = data;
          this.loading = false;
        },
        error => {
          console.error('Error searching books', error);
          this.error = true;
          this.loading = false;
        }
      );
  }
}
