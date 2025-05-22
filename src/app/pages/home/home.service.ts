import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Observable, throwError, of, Subject } from 'rxjs';
import { catchError, map, tap, retry, finalize } from 'rxjs/operators';

// Define a type for paginated response
export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  last: boolean;
  first: boolean;
}

export interface Post {
  postId: number;
  user: {
    userId: number;
    username?: string;
  };
  title: string;
  content: string;
  likes: number;
  createdAt: string | Date; // Backend uses createdAt instead of timestamp
  updatedAt?: string | Date;
  imageUrl?: string;
  tags?: string[];
  category?: string;
  visibility?: string;
  comments?: Comment[];
  hasLiked?: boolean;
}

export interface Comment {
  id: number;
  postId: number;
  userId: number;
  content: string;
  timestamp: string | Date;
}

// Interface for legacy backend format (for mapping)
interface BackendPost {
  postId: number;
  userId?: number; // Legacy format might use this
  user?: {
    userId: number;
    username?: string;
  };
  title?: string;
  content: string;
  likes?: number;
  createdAt?: string | Date;
  timestamp?: string | Date; // Legacy format
  updatedAt?: string | Date;
  imageUrl?: string;
  tags?: string[];
  category?: string;
  visibility?: string;
  comments?: Comment[];
  hasLiked?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  private apiUrl = 'http://localhost:8080/api/posts';
  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };
  
  // Error subject for error handling
  private errorSubject = new Subject<string>();
  public errors$ = this.errorSubject.asObservable();
  
  constructor(private http: HttpClient) { }
  
  getAllPosts(): Observable<Post[]> {
    console.log('Fetching all posts from:', `${this.apiUrl}/all`);
    
    return this.http.get<BackendPost[]>(`${this.apiUrl}/all`)
      .pipe(
        tap(posts => {
          console.log('Received posts:', posts);
          if (!posts || posts.length === 0) {
            console.log('No posts received from backend');
          } else {
            console.log(`Successfully retrieved ${posts.length} posts`);
          }
        }),
        map(posts => this.processPostData(posts)),
        catchError(error => {
          console.error('Error fetching posts:', error);
          if (error.status) {
            console.error(`HTTP Error: ${error.status} - ${error.statusText}`);
          }
          
          this.errorSubject.next('Failed to load posts. Please try again later.');
          return throwError(() => new Error(`Failed to fetch posts: ${error.message}`));
        }),
        retry(2),
        // Fix: Remove the catchFailure operator and use a standard catchError
        catchError(() => {
          console.error('All retries failed. Returning empty array.');
          return of([]);
        })
      );
  }
  
  // Process backend post format to match frontend expectations
  processPostData(posts: BackendPost[]): Post[] {
    if (!Array.isArray(posts)) {
      console.error('Expected posts to be an array, got:', typeof posts);
      return [];
    }
    
    return posts.map(post => {
      // Handle either backend format (userId or user.userId)
      const user = post.user || { userId: post.userId || 1 };
      
      // Transform the backend post structure to match frontend expectations
      const processedPost: Post = {
        postId: post.postId,
        user: user,
        title: post.title || '',
        content: post.content,
        likes: post.likes || 0,
        // Use createdAt if available, fall back to timestamp for legacy compatibility
        createdAt: this.convertToDate(post.createdAt || post.timestamp),
        updatedAt: post.updatedAt ? this.convertToDate(post.updatedAt) : undefined,
        hasLiked: post.hasLiked || false,
        tags: post.tags || [],
        category: post.category || '',
        visibility: post.visibility || 'public',
        imageUrl: post.imageUrl || ''
      };
      
      return processedPost;
    });
  }
  
  // Helper to convert string dates to Date objects
  private convertToDate(dateStr: string | Date | undefined): Date {
    if (!dateStr) return new Date(); // Default to current date if no date provided
    
    if (typeof dateStr === 'string') {
      return new Date(dateStr);
    }
    return dateStr;
  }
  
  // Get posts by user ID
  getPostsByUser(userId: number): Observable<Post[]> {
    return this.http.get<BackendPost[]>(`${this.apiUrl}/user/${userId}`).pipe(
      map(posts => this.processPostData(posts)),
      catchError(this.handleError<Post[]>(`getPostsByUser id=${userId}`, []))
    );
  }
  
  // Add likePost method that was missing
  likePost(postId: number): Observable<Post> {
    return this.http.post<BackendPost>(`${this.apiUrl}/${postId}/like`, {}, this.httpOptions).pipe(
      map(post => this.processPostData([post])[0]),
      catchError(this.handleError<Post>(`likePost id=${postId}`))
    );
  }
  
  // Add createPost method that was missing
  createPost(
    userId: number, 
    content: string, 
    title?: string, 
    tags?: string[], 
    category?: string, 
    visibility?: string, 
    imageUrl?: string
  ): Observable<Post> {
    const newPost = {
      userId,
      content,
      title: title || '',
      tags: tags || [],
      category: category || '',
      visibility: visibility || 'public',
      imageUrl: imageUrl || ''
    };
    
    return this.http.post<BackendPost>(`${this.apiUrl}/create`, newPost, this.httpOptions).pipe(
      map(post => this.processPostData([post])[0]),
      catchError(this.handleError<Post>('createPost'))
    );
  }
  
  // Get paginated posts
  getPaginatedPosts(page: number = 0, size: number = 10): Observable<PaginatedResponse<Post>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
      
    return this.http.get<PaginatedResponse<BackendPost>>(`${this.apiUrl}/paginated`, { params }).pipe(
      map(response => {
        // Process the content array while preserving pagination metadata
        return {
          ...response,
          content: this.processPostData(response.content)
        };
      }),
      catchError(this.handleError<PaginatedResponse<Post>>('getPaginatedPosts', {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: size,
        number: page,
        last: true,
        first: true
      }))
    );
  }
  
  // Get more posts (for pagination/infinite scroll)
  getMorePosts(lastPostId: number): Observable<Post[]> {
    const params = new HttpParams().set('after', lastPostId.toString());
    
    return this.http.get<any>(`${this.apiUrl}/paginated`, { params }).pipe(
      map(response => {
        // Handle both direct array and paginated response formats
        if (response && typeof response === 'object' && 'content' in response) {
          return this.processPostData(response.content);
        }
        // If the response is directly an array
        return this.processPostData(response);
      }),
      catchError(this.handleError<Post[]>('getMorePosts', []))
    );
  }
  
  // Error handler
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: HttpErrorResponse): Observable<T> => {
      console.error(`${operation} failed:`, error);
      
      // Let the app keep running by returning an empty result
      return of(result as T);
    };
  }
}