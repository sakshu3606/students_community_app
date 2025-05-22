// events.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ChatboxComponent } from '../../services/chat-box/chat-box.component';

// Updated Event interface to match template requirements
interface Event {
  id: number;
  eventId?: number; // Added to match template references
  title: string;
  organizer: string | { username: string }; // Updated to handle both string and object
  startDate: Date;
  endDate: Date;
  venue: string;
  time: string;
  registerDeadline: Date;
  attendees: number;
  attending: boolean;
  imageUrl: string;
  description: string; // Added missing field from template
  eventDate: Date; // Added to match template
  createdAt: Date; // Added to match template
}

// User interface
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

// Message interface
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [FormsModule, 
    ReactiveFormsModule, 
    CommonModule,
    ChatboxComponent
  ],
  templateUrl: './events.component.html',
  styleUrls: ['./events.component.css']
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  timeFilter: string = 'all';
  showCreateForm: boolean = false;
  showEditForm: boolean = false;
  eventForm: FormGroup;
  editingEventId: number | null = null;
  nextId: number = 1;
  selectedEvent: Event | null = null; // Added missing property

  // Chat-related properties
  currentUser: User = {
    id: 'user1',
    name: 'Sakshi Parate',
    username: 'sakshi_p',
    avatar: 's3.png',
    department: 'Computer Science',
    isFriend: false,
    isOnline: true
  };
  
  activeChatUser: User | null = null;
  
  // Sample users for chat
  users: User[] = [
    {
      id: 'user2',
      name: 'John Doe',
      username: 'john_d',
      avatar: 'avatar1.jpg',
      department: 'Computer Science',
      isFriend: true,
      isOnline: true
    },
    {
      id: 'user3',
      name: 'Jane Smith',
      username: 'jane_s',
      avatar: 'avatar2.jpg',
      department: 'Psychology',
      isFriend: true,
      isOnline: false
    }
  ];
  
  // Sample messages
  messages: Message[] = [
    {
      id: 'msg1',
      senderId: 'user2',
      receiverId: 'user1',
      content: 'Hey, do you have notes from today?',
      timestamp: new Date(2025, 3, 15, 14, 30),
      read: true
    },
    {
      id: 'msg2',
      senderId: 'user1',
      receiverId: 'user2',
      content: 'Yes, I can share them with you later!',
      timestamp: new Date(2025, 3, 15, 14, 35),
      read: true
    },
    {
      id: 'msg3',
      senderId: 'user3',
      receiverId: 'user1',
      content: 'Are you attending the literary fest?',
      timestamp: new Date(2025, 3, 15, 16, 45),
      read: false
    }
  ];

  constructor(private fb: FormBuilder) {
    this.eventForm = this.createEventForm();
  }

  ngOnInit(): void {
    this.loadEvents();
    this.filterEvents();
  }

  createEventForm(): FormGroup {
    const today = new Date();
    return this.fb.group({
      title: ['', Validators.required],
      organizer: ['', Validators.required],
      startDate: [today.toISOString().split('T')[0], Validators.required],
      endDate: [today.toISOString().split('T')[0], Validators.required],
      venue: ['', Validators.required],
      time: ['', Validators.required],
      registerDeadline: [today.toISOString().split('T')[0], Validators.required],
      imageUrl: ['eventdefault.jpg'],
      description: ['', Validators.required] // Added to match template
    });
  }

  loadEvents(): void {
    // In a real application, this would load from a service or API
    this.events = [
      {
        id: 1,
        eventId: 1, // Added to match template references
        title: 'Code Jam',
        organizer: { username: 'Computing Club' }, // Updated to match template format
        startDate: new Date(2025, 3, 18), // April
        endDate: new Date(2025, 3, 19),
        venue: 'Engineering Building',
        time: '2 PM',
        registerDeadline: new Date(2025, 3, 17, 23, 59),
        attendees: 24,
        attending: false,
        imageUrl: 'codeevent.jpg',
        description: 'A competitive programming event for all students. Solve coding problems and win prizes!', // Added to match template
        eventDate: new Date(2025, 3, 18), // Added to match template
        createdAt: new Date(2025, 3, 1) // Added to match template
      },
      {
        id: 2,
        eventId: 2, // Added to match template references
        title: 'Literary Fest',
        organizer: { username: 'Literary Society' }, // Updated to match template format
        startDate: new Date(2025, 4, 5), // May
        endDate: new Date(2025, 4, 7),
        venue: 'Main Auditorium',
        time: '10 AM',
        registerDeadline: new Date(2025, 4, 3, 18, 0),
        attendees: 45,
        attending: false,
        imageUrl: 'literary.jpg',
        description: 'Three days of literary events including poetry readings, book discussions, and writing workshops.', // Added to match template
        eventDate: new Date(2025, 4, 5), // Added to match template
        createdAt: new Date(2025, 3, 15) // Added to match template
      }
    ];
    this.nextId = Math.max(...this.events.map(e => e.id)) + 1;
  }

  filterEvents(): void {
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    switch (this.timeFilter) {
      case 'today':
        this.filteredEvents = this.events.filter(event =>
          event.startDate.toDateString() === today.toDateString()
        );
        break;

      case 'thisWeek':
        this.filteredEvents = this.events.filter(event =>
          event.startDate >= today && event.startDate <= endOfWeek
        );
        break;

      case 'thisMonth':
        this.filteredEvents = this.events.filter(event =>
          event.startDate.getMonth() === today.getMonth() &&
          event.startDate.getFullYear() === today.getFullYear()
        );
        break;

      case 'thisYear':
        this.filteredEvents = this.events.filter(event =>
          event.startDate.getFullYear() === today.getFullYear()
        );
        break;

      case 'all':
      default:
        this.filteredEvents = [...this.events];
        break;
    }

    // Sort by date (earliest first)
    this.filteredEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  onFilterChange(filter: string): void {
    this.timeFilter = filter;
    this.filterEvents();
  }

  toggleAttendance(event: Event | null): void {
    // Added null check for selectedEvent usage
    if (event) {
      event.attending = !event.attending;
      event.attendees += event.attending ? 1 : -1;
    }
  }

  // Added missing method used in template
  isAttending(event: Event | null): boolean {
    return event ? event.attending : false;
  }

  // Added missing method used in template
  canEditEvent(event: Event): boolean {
    // Simplified implementation - in real app, would check user permissions
    return true;
  }

  formatDateRange(startDate: Date, endDate: Date): string {
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'long', year: 'numeric' };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  }

  isUpcoming(event: Event): boolean {
    const today = new Date();
    return event.startDate >= today;
  }

  // CRUD operations
  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.eventForm.reset();
      this.showEditForm = false;
    }
  }

  submitEvent(): void {
    if (this.eventForm.invalid) {
      // Log which validations are failing
      this.logFormErrors();
      return;
    }
  
    const formValue = this.eventForm.value;
    const startDate = new Date(formValue.startDate);
    
    // Make sure dates are properly parsed
    const newEvent: Event = {
      id: this.nextId,
      eventId: this.nextId, // Added to match template references
      title: formValue.title,
      organizer: { username: formValue.organizer }, // Updated to match template format
      startDate: startDate,
      endDate: new Date(formValue.endDate),
      venue: formValue.venue,
      time: formValue.time,
      registerDeadline: new Date(formValue.registerDeadline),
      attendees: 0,
      attending: false,
      imageUrl: formValue.imageUrl || 'eventdefault.jpg',
      description: formValue.description || '', // Added to match template
      eventDate: startDate, // Added to match template
      createdAt: new Date() // Added to match template
    };
    
    this.nextId++;
    this.events.push(newEvent);
    this.filterEvents();
    this.showCreateForm = false;
    this.eventForm.reset();
  }

  deleteEvent(eventId: number): void {
    if (eventId && confirm('Are you sure you want to delete this event?')) {
      this.events = this.events.filter(event => event.eventId !== eventId);
      this.filterEvents();
    }
  }

  startEditEvent(event: Event): void {
    this.showEditForm = true;
    this.showCreateForm = false;
    this.editingEventId = event.id;
    
    // Get organizer username from object if needed
    const organizerName = typeof event.organizer === 'string' 
      ? event.organizer 
      : event.organizer.username;
    
    this.eventForm.setValue({
      title: event.title,
      organizer: organizerName,
      startDate: this.formatDateForInput(event.startDate),
      endDate: this.formatDateForInput(event.endDate),
      venue: event.venue,
      time: event.time,
      registerDeadline: this.formatDateForInput(event.registerDeadline),
      imageUrl: event.imageUrl,
      description: event.description || '' // Added to match template
    });
  }

  formatDateForInput(date: Date): string {
    return date.toISOString().substring(0, 10);
  }

  updateEvent(): void {
    if (this.eventForm.invalid || this.editingEventId === null) {
      return;
    }

    const formValue = this.eventForm.value;
    const eventIndex = this.events.findIndex(e => e.id === this.editingEventId);
    const startDate = new Date(formValue.startDate);
    
    if (eventIndex !== -1) {
      const updatedEvent: Event = {
        ...this.events[eventIndex],
        title: formValue.title,
        organizer: { username: formValue.organizer }, // Updated to match template format
        startDate: startDate,
        endDate: new Date(formValue.endDate),
        venue: formValue.venue,
        time: formValue.time,
        registerDeadline: new Date(formValue.registerDeadline),
        imageUrl: formValue.imageUrl || this.events[eventIndex].imageUrl,
        description: formValue.description || '', // Added to match template
        eventDate: startDate // Added to match template
      };

      this.events[eventIndex] = updatedEvent;
      this.filterEvents();
      this.cancelEdit();
    }
  }

  cancelEdit(): void {
    this.showEditForm = false;
    this.editingEventId = null;
    this.eventForm.reset();
  }

  // Debugging method
  logFormErrors(): void {
    const formControls = this.eventForm.controls;
    console.log("Form valid:", this.eventForm.valid);
    Object.keys(formControls).forEach(key => {
      const control = formControls[key];
      console.log(`Field ${key}: valid=${control.valid}, errors=`, control.errors);
    });
  }

  // Chat-related methods
  openChat(user: User): void {
    this.activeChatUser = user;
    // Mark messages from this user as read
    this.messages.forEach(message => {
      if (message.senderId === user.id && message.receiverId === this.currentUser.id && !message.read) {
        message.read = true;
      }
    });
  }

  closeChat(): void {
    this.activeChatUser = null;
  }

  sendMessageFromChatbox(content: string): void {
    if (content.trim() && this.activeChatUser) {
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        senderId: this.currentUser.id,
        receiverId: this.activeChatUser.id,
        content: content,
        timestamp: new Date(),
        read: false
      };
      this.messages.push(newMessage);
      
      // In a real app, this would trigger a notification or socket event
      // Simulate a response after a brief delay for demo purposes
      if (Math.random() > 0.5 && this.activeChatUser.isOnline) {
        setTimeout(() => {
          const responseMessage: Message = {
            id: `msg${Date.now()}`,
            senderId: this.activeChatUser!.id,
            receiverId: this.currentUser.id,
            content: this.getAutoResponse(),
            timestamp: new Date(),
            read: true
          };
          this.messages.push(responseMessage);
        }, 2000 + Math.random() * 3000);
      }
    }
  }

  // Helper function to generate auto responses for demo
  private getAutoResponse(): string {
    const responses = [
      "Sure, that sounds good!",
      "I'll get back to you on that.",
      "That's interesting. Tell me more.",
      "I'm a bit busy right now, can we chat later?",
      "Thanks for letting me know!",
      "👍",
      "Great idea!",
      "I was thinking the same thing.",
      "When's the deadline for this?",
      "Let's meet up to discuss this further."
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  }

  // Check if a user has unread messages
  hasUnreadMessages(userId: string): boolean {
    return this.messages.some(message => 
      message.senderId === userId && 
      message.receiverId === this.currentUser.id && 
      !message.read
    );
  }

  // Get the latest message between current user and specified user
  getLatestMessagePreview(userId: string): string {
    const messagesWithUser = this.getMessagesForUser(userId);
    if (messagesWithUser.length === 0) return 'No messages yet';
    
    const latestMessage = messagesWithUser[messagesWithUser.length - 1];
    const preview = latestMessage.content.substring(0, 25);
    return preview.length < latestMessage.content.length ? `${preview}...` : preview;
  }

  // Get timestamp of latest message
  getLatestMessageTime(userId: string): string {
    const messagesWithUser = this.getMessagesForUser(userId);
    if (messagesWithUser.length === 0) return '';
    
    const latestMessage = messagesWithUser[messagesWithUser.length - 1];
    return this.formatMessageTime(latestMessage.timestamp);
  }

  getMessagesForUser(userId: string): Message[] {
    return this.messages.filter(message => 
      (message.senderId === userId && message.receiverId === this.currentUser.id) ||
      (message.senderId === this.currentUser.id && message.receiverId === userId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }

  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}