import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ConfigService } from '../config/config.component';

export interface Post {
  id?: string;
  title: string;
  content: string;
  authorId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  imageUrl?: string;
  tags: string[];
  category: 'club' | 'general' | 'academic' | 'event' | 'poll';
  visibility: 'public' | 'friends' | 'private';
  likes?: number;
  comments?: number;
  shares?: number;
}

export interface CreatePostRequest {
  title: string;
  content: string;
  imageUrl?: string;
  tags: string[];
  visibility: 'public' | 'friends' | 'private';
  category: 'general' | 'academic' | 'event' | 'club' | 'poll';
}

@Injectable({
  providedIn: 'root'
})
export class PostService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  createPost(postData: CreatePostRequest): Observable<Post> {
    return this.http.post<any>(`${this.configService.apiUrl}/posts`, postData)
      .pipe(
        map(response => this.transformPostResponse(response)),
        catchError(error => {
          console.error('Error creating post:', error);
          return throwError(() => new Error('Failed to create post. Please try again.'));
        })
      );
  }

  getPosts(category?: string, page: number = 1, limit: number = 10): Observable<Post[]> {
    let url = `${this.configService.apiUrl}/posts?page=${page}&limit=${limit}`;
    if (category) {
      url += `&category=${category}`;
    }

    return this.http.get<any>(url)
      .pipe(
        map(response => response.posts.map((post: any) => this.transformPostResponse(post))),
        catchError(error => {
          console.error('Error fetching posts:', error);
          return throwError(() => new Error('Failed to load posts. Please try again.'));
        })
      );
  }

  private transformPostResponse(response: any): Post {
    return {
      id: response.id,
      title: response.title,
      content: response.content,
      authorId: response.authorId,
      createdAt: new Date(response.createdAt),
      updatedAt: new Date(response.updatedAt),
      imageUrl: response.imageUrl || '',
      tags: response.tags || [],
      visibility: response.visibility,
      category: response.category,
      likes: response.metrics?.likes || 0,
      comments: response.metrics?.comments || 0,
      shares: response.metrics?.shares || 0
    };
  }
}