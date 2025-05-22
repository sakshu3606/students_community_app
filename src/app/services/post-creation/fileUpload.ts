import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';

export interface UploadEvent {
  type: 'progress' | 'complete' | 'error';
  progress?: number;
  url?: string;
  error?: any;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private apiUrl = '/api/files'; // Assuming there's a file upload endpoint
  
  constructor(private http: HttpClient) {}
  
  /**
   * Upload a file with progress tracking
   */
  uploadFile(file: File): Observable<UploadEvent> {
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Create a subject to emit custom upload events
    const uploadSubject = new Subject<UploadEvent>();
    
    // Create a request that reports progress
    const req = new HttpRequest('POST', `${this.apiUrl}/upload`, formData, {
      reportProgress: true
    });
    
    // Execute the request
    this.http.request(req)
      .subscribe({
        next: (event: HttpEvent<any>) => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            // Calculate and emit upload progress
            const progress = Math.round(100 * event.loaded / event.total);
            uploadSubject.next({ type: 'progress', progress });
          } else if (event.type === HttpEventType.Response) {
            // Emit completion event with the URL
            if (event.body && event.body.url) {
              uploadSubject.next({ 
                type: 'complete', 
                url: event.body.url 
              });
              uploadSubject.complete();
            } else {
              // If response doesn't have expected format
              uploadSubject.next({ 
                type: 'error', 
                error: 'Invalid server response' 
              });
              uploadSubject.complete();
            }
          }
        },
        error: (err) => {
          // Emit error event
          uploadSubject.next({ 
            type: 'error', 
            error: err 
          });
          uploadSubject.complete();
        }
      });
    
    return uploadSubject.asObservable();
  }
  
  /**
   * Delete a file
   */
  deleteFile(fileUrl: string): Observable<any> {
    // Extract filename from URL
    const filename = fileUrl.split('/').pop();
    
    if (!filename) {
      return new Observable(observer => {
        observer.error('Invalid file URL');
        observer.complete();
      });
    }
    
    return this.http.delete(`${this.apiUrl}/delete/${filename}`);
  }
}