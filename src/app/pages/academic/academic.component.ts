// academic.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ContributeComponent } from '../../models/contribute/contribute.component';
import { ChatboxComponent } from '../../services/chat-box/chat-box.component';

interface Event {
  id: number;
  title: string;
  organizer: string;
  startDate: Date;
  endDate: Date;
  venue: string;
  time: string;
  registerDeadline: Date;
  attendees: number;
  attending: boolean;
  imageUrl: string;
}

// Add missing User interface
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

// Add missing Message interface
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-academic',
  standalone: true,
  imports: [
    CommonModule, 
    FormsModule,
    ContributeComponent,
    ChatboxComponent,
    RouterModule
  ],
  templateUrl: './academic.component.html',
  styleUrls: ['./academic.component.css']
})
export class AcademicComponent implements OnInit {
  events: Event[] = [];
  filteredEvents: Event[] = [];
  timeFilter: string = 'all';
  showContributionSection: boolean = false;
  
  // Add missing chat-related properties
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
  
  // Add sample users for chat
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
  
  // Add sample messages
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

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.loadEvents();
    this.filterEvents();
  }

  loadEvents(): void {
    this.events = [
      {
        id: 1,
        title: 'Code Jam',
        organizer: 'Computing Club',
        startDate: new Date(2025, 3, 18),
        endDate: new Date(2025, 3, 19),
        venue: 'Engineering Building',
        time: '2 PM',
        registerDeadline: new Date(2025, 3, 17, 23, 59),
        attendees: 24,
        attending: false,
        imageUrl: '/assets/images/code-event.jpg'
      },
      {
        id: 2,
        title: 'Literary Fest',
        organizer: 'Literary Society',
        startDate: new Date(2025, 4, 5),
        endDate: new Date(2025, 4, 7),
        venue: 'Main Auditorium',
        time: '10 AM',
        registerDeadline: new Date(2025, 4, 3, 18, 0),
        attendees: 45,
        attending: false,
        imageUrl: '/assets/images/literary-event.jpg'
      }
    ];
  }

  filterEvents(): void {
    const today = new Date();
    const endOfWeek = new Date();
    endOfWeek.setDate(today.getDate() + (7 - today.getDay()));

    switch (this.timeFilter) {
      case 'today':
        this.filteredEvents = this.events.filter(event =>
          event.startDate.toDateString() === today.toDateString());
        break;
      case 'thisWeek':
        this.filteredEvents = this.events.filter(event =>
          event.startDate >= today && event.startDate <= endOfWeek);
        break;
      case 'thisYear':
        this.filteredEvents = this.events.filter(event =>
          event.startDate.getFullYear() === today.getFullYear());
        break;
      case 'all':
      default:
        this.filteredEvents = [...this.events];
        break;
    }

    this.filteredEvents.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
  }

  onFilterChange(filter: string): void {
    this.timeFilter = filter;
    this.filterEvents();
  }

  toggleAttendance(event: Event): void {
    event.attending = !event.attending;
    if (event.attending) {
      event.attendees++;
    } else {
      event.attendees--;
    }
  }

  formatDateRange(startDate: Date, endDate: Date): string {
    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric', month: 'long', year: 'numeric'
    };
    const start = startDate.toLocaleDateString('en-US', options);
    const end = endDate.toLocaleDateString('en-US', options);
    return `${start} - ${end}`;
  }

  isUpcoming(event: Event): boolean {
    const today = new Date();
    return event.startDate >= today;
  }

  onContributeClick(): void {
    this.showContributionSection = true;
    setTimeout(() => {
      const section = document.querySelector('.contribution-section');
      section?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
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