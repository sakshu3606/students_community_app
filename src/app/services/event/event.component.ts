import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EventService {
  
  // Mock data for development - remove in production
  private mockEvents = [
    {
      id: 1,
      title: 'Raaga',
      organizer: 'Music Club',
      startDate: '2021-10-31',
      endDate: '2021-11-01',
      venue: 'Online',
      time: '11',
      description: 'A musical night filled with classical and modern performances by our talented students.',
      imageUrl: 'assets/images/music-event.jpg',
      attendees: 8,
      isAttending: false
    },
    {
      id: 2,
      title: 'Tech Symposium',
      organizer: 'Tech Club',
      startDate: '2021-11-15',
      endDate: '2021-11-16',
      venue: 'Main Auditorium',
      time: '9',
      description: 'Annual technology symposium featuring keynote speakers, workshops, and project showcases.',
      imageUrl: 'assets/images/tech-event.jpg',
      attendees: 45,
      isAttending: false
    },
    {
      id: 3,
      title: 'Art Exhibition',
      organizer: 'Fine Arts Club',
      startDate: '2021-12-05',
      endDate: '2021-12-07',
      venue: 'Exhibition Hall',
      time: '10',
      description: 'A showcase of student artwork including paintings, sculptures, and digital art.',
      imageUrl: 'assets/images/art-event.jpg',
      attendees: 22,
      isAttending: false
    }
  ];
  
  constructor(private http: HttpClient) { }
  
  getEvents(): Observable<any[]> {
    // For development - use mock data
    return of(this.mockEvents);
    
    // For production with actual API
    // return this.http.get<any[]>(`${this.apiUrl}/events`);
  }
  
  createEvent(eventData: any): Observable<any> {
    // For development
    const newEvent = {
      id: this.mockEvents.length + 1,
      ...eventData,
      attendees: 0,
      isAttending: false
    };
    this.mockEvents.push(newEvent);
    return of(newEvent);
    
    // For production
    // return this.http.post<any>(`${this.apiUrl}/events`, eventData);
  }
  
  updateEvent(id: number, eventData: any): Observable<any> {
    // For development
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      const attendees = this.mockEvents[index].attendees;
      const isAttending = this.mockEvents[index].isAttending;
      this.mockEvents[index] = { ...eventData, id, attendees, isAttending };
    }
    return of(this.mockEvents[index]);
    
    // For production
    // return this.http.put<any>(`${this.apiUrl}/events/${id}`, eventData);
  }
  
  deleteEvent(id: number): Observable<any> {
    // For development
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEvents.splice(index, 1);
    }
    return of(null);
    
    // For production
    // return this.http.delete<any>(`${this.apiUrl}/events/${id}`);
  }
  
  updateEventAttendance(id: number, isAttending: boolean): Observable<any> {
    // For development
    const index = this.mockEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      this.mockEvents[index].isAttending = isAttending;
    }
    return of(null);
    
    // For production
    // return this.http.patch<any>(`${this.apiUrl}/events/${id}/attendance`, { isAttending });
  }
}

// Update app.module.ts to include the EventsComponent
// In your app.module.ts, add:
/*
import { EventsComponent } from './components/events/events.component';

@NgModule({
  declarations: [
    // ... other components
    EventsComponent
  ],
  imports: [
    // ... other imports
    RouterModule.forRoot([
      // ... other routes
      { path: 'events', component: EventsComponent },
    ])
  ],
})
export class AppModule { }
*/