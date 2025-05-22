import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PostCreationComponent } from '../post-creation/post-creation.component';
import { RouterModule } from '@angular/router';
import { Post, PostService } from '../post-creation/postService';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-post-list',
  standalone: true,
  imports: [CommonModule, FormsModule, PostCreationComponent, RouterModule],
  templateUrl: './post-list.component.html',
  styleUrls: ['./post-list.component.css']
})
export class PostListComponent implements OnInit, OnDestroy {
  posts: Post[] = [];
  filteredPosts: Post[] = [];
  searchQuery: string = '';
  currentPage: number = 0;
  pageSize: number = 10;
  totalPages: number = 0;
  totalElements: number = 0;
  loading: boolean = true;
  errorMessage: string = '';
  showCreatePostModal: boolean = false;
  showSuccessNotification: boolean = false;
  notificationMessage: string = '';
  currentUserId: number;
  selectedFilter: 'all' | 'following' | 'top' | 'my' = 'all';
  
  // Subscriptions
  private postsSubscription?: Subscription;
  private loadingSubscription?: Subscription;
  private errorSubscription?: Subscription;
  
  constructor(private postService: PostService) {
    // Get current user ID - replace with your auth mechanism
    const storedUser = localStorage.getItem('currentUser');
    this.currentUserId = storedUser ? JSON.parse(storedUser).userId : 1;
  }
  
  ngOnInit(): void {
    // Subscribe to service observables
    this.postsSubscription = this.postService.posts$.subscribe(posts => {
      this.posts = posts;
      this.applyFilters();
    });
    
    this.loadingSubscription = this.postService.loading$.subscribe(loading => {
      this.loading = loading;
    });
    
    this.errorSubscription = this.postService.error$.subscribe(error => {
      this.errorMessage = error;
      if (error) {
        setTimeout(() => this.errorMessage = '', 5000);
      }
    });
    
    // Initial posts load
    this.loadPosts();
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    if (this.postsSubscription) {
      this.postsSubscription.unsubscribe();
    }
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
    if (this.errorSubscription) {
      this.errorSubscription.unsubscribe();
    }
  }
  
  loadPosts(): void {
    switch(this.selectedFilter) {
      case 'top':
        this.loadTopPosts();
        break;
      case 'my':
        this.loadMyPosts();
        break;
      case 'following':
        this.loadFollowingPosts();
        break;
      case 'all':
      default:
        this.loadAllPosts();
        break;
    }
  }
  
  loadAllPosts(): void {
    this.postService.getPaginatedPosts(this.currentPage, this.pageSize).subscribe({
      next: (response) => {
        this.totalPages = response.totalPages;
        this.totalElements = response.totalElements;
      },
      error: () => {
        // Error handling is done via service error$ observable
      }
    });
  }
  
  loadTopPosts(): void {
    this.postService.getTopLikedPosts().subscribe({
      error: () => {
        // Error handling is done via service error$ observable
      }
    });
  }
  
  loadMyPosts(): void {
    this.postService.getPostsByUser(this.currentUserId).subscribe({
      error: () => {
        // Error handling is done via service error$ observable
      }
    });
  }
  
  loadFollowingPosts(): void {
    // This would require a separate API endpoint or filtering logic
    // For now, we'll use the same as all posts
    this.loadAllPosts();
  }
  
  applyFilters(): void {
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      this.filteredPosts = this.posts.filter(post => 
        post.title?.toLowerCase().includes(query) || 
        post.content.toLowerCase().includes(query) ||
        post.user.username.toLowerCase().includes(query)
      );
    } else {
      this.filteredPosts = [...this.posts];
    }
  }
  
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.postService.searchPosts(this.searchQuery).subscribe({
        error: () => {
          // Error handling is done via service error$ observable
        }
      });
    } else {
      this.loadPosts();
    }
  }
  
  changePage(offset: number): void {
    const newPage = this.currentPage + offset;
    if (newPage >= 0 && newPage < this.totalPages) {
      this.currentPage = newPage;
      this.loadPosts();
    }
  }
  
  likePost(post: Post): void {
    this.postService.likePost(post.postId).subscribe({
      next: () => {
        this.showNotification('Post liked!');
      },
      error: () => {
        // Error handling is done via service error$ observable
      }
    });
  }
  
  deletePost(post: Post): void {
    if (confirm('Are you sure you want to delete this post?')) {
      this.postService.deletePost(post.postId).subscribe({
        next: () => {
          this.showNotification('Post deleted successfully');
        },
        error: () => {
          // Error handling is done via service error$ observable
        }
      });
    }
  }
  
  openCreatePostModal(): void {
    this.showCreatePostModal = true;
    document.body.style.overflow = 'hidden';
  }
  
  closeCreatePostModal(): void {
    this.showCreatePostModal = false;
    document.body.style.overflow = 'auto';
  }
  
  onPostCreated(post: Post): void {
    this.showNotification('Post created successfully!');
    // No need to manually update posts as it's handled by the BehaviorSubject
  }
  
  showNotification(message: string): void {
    this.notificationMessage = message;
    this.showSuccessNotification = true;
    setTimeout(() => {
      this.closeNotification();
    }, 3000);
  }
  
  closeNotification(): void {
    this.showSuccessNotification = false;
  }
  
  setFilter(filter: 'all' | 'following' | 'top' | 'my'): void {
    this.selectedFilter = filter;
    this.currentPage = 0;
    this.loadPosts();
  }
  
  isMyPost(post: Post): boolean {
    return post.user.userId === this.currentUserId;
  }
  
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleString();
  }
}