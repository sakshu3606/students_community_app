import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export type PostVisibility = 'PUBLIC' | 'FRIENDS' | 'PRIVATE';
export type PostCategory = 'GENERAL' | 'ACADEMIC' | 'CLUB' | 'EVENT' | 'POLL';

export interface CreatePostRequest {
  title: string;
  content: string;
  tags: string[];
  visibility: PostVisibility;
  category: PostCategory;
  imageUrl: string;
}

export interface Post extends CreatePostRequest {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
  likes: number;
  comments: number;
  liked: boolean;
}

export interface PostsResponse {
  posts: Post[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
}

// Backend pagination response interface to match actual API response
interface BackendPaginationResponse {
  content: Post[];
  totalElements: number;
  number: number;
  totalPages: number;
  // Other pagination fields that might be present in the backend response
}

export interface PostFilters {
  category?: PostCategory;
  visibility?: PostVisibility;
  tags?: string[];
  authorId?: string;
  search?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = '/api/posts';
  
  // Create BehaviorSubjects to track loading state and errors
  private loadingSubject = new BehaviorSubject<boolean>(false);
  private errorSubject = new BehaviorSubject<string>('');
  private postsSubject = new BehaviorSubject<Post[]>([]);
  
  // Expose observables for components to subscribe to
  loading$ = this.loadingSubject.asObservable();
  error$ = this.errorSubject.asObservable();
  posts$ = this.postsSubject.asObservable();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Create a new post - updated to properly match backend controller
   */
  createPost(postData: CreatePostRequest): Observable<Post> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    // Create FormData object to match backend controller's @RequestParam expectations
    const formData = new FormData();
    
    // Match the userId from the current authenticated user
    // For now hardcoding as 1, in a real app you'd get this from AuthService
    formData.append('userId', '1');
    
    // Add required fields
    formData.append('title', postData.title);
    formData.append('content', postData.content);
    formData.append('category', postData.category);
    formData.append('visibility', postData.visibility);
    
    // Convert tags array to JSON string to match backend's expected format
    if (postData.tags && postData.tags.length > 0) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
    
    // Add image URL if available
    if (postData.imageUrl) {
      formData.append('imageUrl', postData.imageUrl);
    }
    
    return this.http.post<Post>(`${this.apiUrl}/create`, formData)
      .pipe(
        tap(newPost => {
          // Update the posts subject with the new post
          const currentPosts = this.postsSubject.getValue();
          this.postsSubject.next([newPost, ...currentPosts]);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to create post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Get a single post by ID
   */
  getPostById(id: string): Observable<Post> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    return this.http.get<Post>(`${this.apiUrl}/${id}`)
      .pipe(
        tap(() => this.loadingSubject.next(false)),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to fetch post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Get posts with pagination and filtering
   */
  getPosts(page: number = 0, limit: number = 10, filters?: PostFilters): Observable<PostsResponse> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', limit.toString());
    
    // Add filters to params if they exist
    if (filters) {
      if (filters.category) {
        params = params.set('category', filters.category);
      }
      if (filters.visibility) {
        params = params.set('visibility', filters.visibility);
      }
      if (filters.tags && filters.tags.length > 0) {
        params = params.set('tag', filters.tags[0]);
      }
      if (filters.authorId) {
        params = params.set('userId', filters.authorId);
      }
      if (filters.search) {
        params = params.set('keyword', filters.search);
      }
    }
    
    return this.http.get<BackendPaginationResponse>(`${this.apiUrl}/paginated`, { params })
      .pipe(
        map(response => {
          // Map backend pagination response to expected frontend format
          return {
            posts: response.content || [],
            totalCount: response.totalElements || 0,
            currentPage: response.number || 0,
            totalPages: response.totalPages || 0
          } as PostsResponse;
        }),
        tap(response => {
          this.postsSubject.next(response.posts);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to fetch posts.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Update an existing post - updated to match backend controller
   */
  updatePost(id: string, postData: Partial<CreatePostRequest>): Observable<Post> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    // Create FormData object to match backend controller's @RequestParam expectations
    const formData = new FormData();
    
    // Add required fields
    if (postData.title) {
      formData.append('title', postData.title);
    }
    
    if (postData.content) {
      formData.append('content', postData.content);
    }
    
    if (postData.category) {
      formData.append('category', postData.category);
    }
    
    if (postData.visibility) {
      formData.append('visibility', postData.visibility);
    }
    
    // Convert tags array to JSON string as expected by backend
    if (postData.tags && postData.tags.length > 0) {
      formData.append('tags', JSON.stringify(postData.tags));
    }
    
    // Add image URL if available
    if (postData.imageUrl) {
      formData.append('imageUrl', postData.imageUrl);
    }
    
    return this.http.put<Post>(`${this.apiUrl}/update/${id}`, formData)
      .pipe(
        tap(updatedPost => {
          // Update the posts subject with the updated post
          const currentPosts = this.postsSubject.getValue();
          const updatedPosts = currentPosts.map(post => 
            post.id === updatedPost.id ? updatedPost : post
          );
          this.postsSubject.next(updatedPosts);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to update post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Delete a post
   */
  deletePost(id: string): Observable<void> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
      .pipe(
        tap(() => {
          // Remove the deleted post from the posts subject
          const currentPosts = this.postsSubject.getValue();
          const updatedPosts = currentPosts.filter(post => post.id !== id);
          this.postsSubject.next(updatedPosts);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to delete post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Like a post
   */
  toggleLike(id: string): Observable<{ liked: boolean, likes: number }> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    return this.http.post<Post>(`${this.apiUrl}/like/${id}`, {})
      .pipe(
        map(post => ({
          liked: true,
          likes: post.likes
        })),
        tap(response => {
          // Update the likes count and liked status in the posts subject
          const currentPosts = this.postsSubject.getValue();
          const updatedPosts = currentPosts.map(post => {
            if (post.id === id) {
              return {
                ...post,
                liked: response.liked,
                likes: response.likes
              };
            }
            return post;
          });
          this.postsSubject.next(updatedPosts);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to like/unlike post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Unlike a post
   */
  unlikePost(id: string): Observable<{ liked: boolean, likes: number }> {
    this.loadingSubject.next(true);
    this.errorSubject.next('');
    
    return this.http.post<Post>(`${this.apiUrl}/unlike/${id}`, {})
      .pipe(
        map(post => ({
          liked: false,
          likes: post.likes
        })),
        tap(response => {
          // Update the likes count and liked status in the posts subject
          const currentPosts = this.postsSubject.getValue();
          const updatedPosts = currentPosts.map(post => {
            if (post.id === id) {
              return {
                ...post,
                liked: response.liked,
                likes: response.likes
              };
            }
            return post;
          });
          this.postsSubject.next(updatedPosts);
          this.loadingSubject.next(false);
        }),
        catchError(error => {
          this.loadingSubject.next(false);
          const errorMessage = error.error?.message || 'Failed to unlike post.';
          this.errorSubject.next(errorMessage);
          throw error;
        })
      );
  }
  
  /**
   * Get popular tags
   */
  getPopularTags(): Observable<{ tag: string, count: number }[]> {
    // Backend doesn't seem to have this endpoint yet, but keeping for future implementation
    return of([]);
  }
  
  /**
   * Clear errors
   */
  clearError(): void {
    this.errorSubject.next('');
  }
  
  /**
   * Reset post state
   */
  resetPosts(): void {
    this.postsSubject.next([]);
  }
}