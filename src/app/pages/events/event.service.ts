import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface Event {
  id?: number;
  eventId?: number;
  title: string;
  organizer?: string | any;
  startDate: Date;
  endDate?: Date;
  venue?: string;
  time?: string;
  registerDeadline?: Date;
  description?: string;
  attendees?: number;
  attending?: boolean;
  imageUrl?: string;
  eventDate?: Date;
  createdAt?: Date;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private apiUrl = 'http://localhost:8080/api/events'; // Replace with your actual API endpoint

  constructor(private http: HttpClient) {}

  // Get all events with pagination
  getAllEvents(page: number = 0, size: number = 10): Observable<PageResponse<Event>> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get<PageResponse<Event>>(`${this.apiUrl}/all`, { params })
      .pipe(
        catchError(this.handleError<PageResponse<Event>>('getAllEvents', {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: size,
          number: page
        }))
      );
  }

  // Get upcoming events from backend
  getUpcomingEvents(): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/upcoming`)
      .pipe(
        map(events => this.mapBackendEvents(events)),
        catchError(this.handleError<Event[]>('getUpcomingEvents', []))
      );
  }

  // Get event by ID
  getEventById(id: number): Observable<Event> {
    return this.http.get<Event>(`${this.apiUrl}/${id}`)
      .pipe(
        map(event => this.mapBackendEvent(event)),
        catchError(this.handleError<Event>(`getEventById id=${id}`))
      );
  }

  // Create a new event
  createEvent(event: Event, organizerId: number): Observable<Event> {
    // Map frontend event model to backend format
    const backendEvent = {
      title: event.title,
      description: event.description || `${event.title} event by ${event.organizer}`,
      eventDate: event.startDate
    };

    return this.http.post<Event>(`${this.apiUrl}/create?organizerId=${organizerId}`, backendEvent)
      .pipe(
        map(event => this.mapBackendEvent(event)),
        catchError(this.handleError<Event>('createEvent'))
      );
  }

  // Update an event
  updateEvent(id: number, event: Event): Observable<Event> {
    // Map frontend event model to backend format
    const backendEvent = {
      title: event.title,
      description: event.description || `${event.title} event by ${event.organizer}`,
      eventDate: event.startDate
    };
    
    return this.http.put<Event>(`${this.apiUrl}/update/${id}`, backendEvent)
      .pipe(
        map(event => this.mapBackendEvent(event)),
        catchError(this.handleError<Event>('updateEvent'))
      );
  }

  // Delete an event
  deleteEvent(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/delete/${id}`)
      .pipe(
        catchError(this.handleError<void>('deleteEvent'))
      );
  }

  // Search events by title
  searchEvents(keyword: string): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/search?keyword=${keyword}`)
      .pipe(
        map(events => this.mapBackendEvents(events)),
        catchError(this.handleError<Event[]>('searchEvents', []))
      );
  }

  // Get events by date
  getEventsByDate(date: Date): Observable<Event[]> {
    const formattedDate = date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    return this.http.get<Event[]>(`${this.apiUrl}/date?eventDate=${formattedDate}`)
      .pipe(
        map(events => this.mapBackendEvents(events)),
        catchError(this.handleError<Event[]>('getEventsByDate', []))
      );
  }

  // Get events by organizer
  getEventsByOrganizer(organizerId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.apiUrl}/organizer/${organizerId}`)
      .pipe(
        map(events => this.mapBackendEvents(events)),
        catchError(this.handleError<Event[]>('getEventsByOrganizer', []))
      );
  }

  // Helper method to map backend event model to frontend model
  private mapBackendEvent(backendEvent: any): Event {
    return {
      id: backendEvent.eventId,
      eventId: backendEvent.eventId,
      title: backendEvent.title,
      description: backendEvent.description,
      organizer: backendEvent.organizer ? backendEvent.organizer.username : 'Unknown',
      startDate: backendEvent.eventDate ? new Date(backendEvent.eventDate) : new Date(),
      endDate: backendEvent.eventDate ? new Date(backendEvent.eventDate) : new Date(),
      venue: 'TBD',
      time: '12:00 PM',
      registerDeadline: backendEvent.eventDate ? new Date(backendEvent.eventDate) : new Date(),
      attendees: 0,
      attending: false,
      imageUrl: 'eventdefault.jpg',
      eventDate: backendEvent.eventDate ? new Date(backendEvent.eventDate) : undefined,
      createdAt: backendEvent.createdAt ? new Date(backendEvent.createdAt) : undefined
    };
  }

  // Helper method to map an array of backend events to frontend events
  private mapBackendEvents(backendEvents: any[]): Event[] {
    return backendEvents.map(event => this.mapBackendEvent(event));
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(`${operation} failed: ${error.message}`);
      console.error(error);
      // Return empty result to allow app to continue running
      return of(result as T);
    };
  }
}