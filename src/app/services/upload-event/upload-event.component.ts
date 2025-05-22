import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfigService } from '../config/config.component';

export interface UploadProgressEvent {
  type: 'progress';
  progress: number;
}

export interface UploadCompleteEvent {
  type: 'complete';
  url: string;
}

export type UploadEvent = UploadProgressEvent | UploadCompleteEvent;

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  constructor(
    private http: HttpClient,
    private configService: ConfigService
  ) {}

  uploadFile(file: File): Observable<UploadEvent> {
    // Create a new subject to emit our custom events
    const subject = new Subject<UploadEvent>();
    
    // Create form data
    const formData = new FormData();
    formData.append('file', file);
    
    // Create a request with reportProgress option
    const req = new HttpRequest('POST', `${this.configService.apiUrl}/uploads`, formData, {
      reportProgress: true
    });
    
    // Send the request and subscribe to events
    this.http.request(req).subscribe({
      next: (event: HttpEvent<any>) => {
        // Handle upload progress
        if (event.type === HttpEventType.UploadProgress && event.total) {
          const progress = Math.round(100 * event.loaded / event.total);
          subject.next({ type: 'progress', progress });
        }
        
        // Handle response
        if (event.type === HttpEventType.Response) {
          if (event.body && event.body.url) {
            subject.next({ type: 'complete', url: event.body.url });
            subject.complete();
          }
        }
      },
      error: (error) => {
        console.error('Upload error:', error);
        subject.error(error);
      }
    });
    
    return subject.asObservable();
  }
}