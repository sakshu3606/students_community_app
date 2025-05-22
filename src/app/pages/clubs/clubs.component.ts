import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ChatboxComponent } from '../../services/chat-box/chat-box.component';
import { HttpClientModule } from '@angular/common/http';
import { ClubService } from './club.service';
import { finalize } from 'rxjs/operators';

// Update Club interface to match backend model
export interface Club {
  clubId?: number;
  firstname: string;
  lastname: string;
  description: string;
  createdAt?: Date;
}

// User interface for chat functionality
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

// Message interface for chat functionality
interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-clubs',
  imports: [
    FormsModule,
    CommonModule,
    ChatboxComponent,
    HttpClientModule
  ],
  providers: [ClubService],
  templateUrl: './clubs.component.html',
  styleUrls: ['./clubs.component.css']
})
export class ClubsComponent implements OnInit {
  clubs: Club[] = [];
  filteredClubs: Club[] = [];
  categories: string[] = ['Music', 'Sports', 'Academic', 'Arts', 'Technology', 'Social', 'Other'];
  selectedCategory: string = 'All';
  showOnlineOnly: boolean = false;
  showCreateForm: boolean = false;
  showEditForm: boolean = false;
  searchQuery: string = '';
  isLoading: boolean = false;
  error: string | null = null;
  
  newClub: Club = this.getEmptyClub();
  editingClub: Club = this.getEmptyClub();
  
  constructor(private clubService: ClubService) { }

  ngOnInit(): void {
    this.loadClubs();
  }

  loadClubs(): void {
    this.isLoading = true;
    this.error = null;
    
    this.clubService.getAllClubs()
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (data) => {
          this.clubs = data;
          this.filteredClubs = [...this.clubs];
        },
        error: (err) => {
          console.error('Error loading clubs:', err);
          this.error = 'Failed to load clubs. Please try again later.';
          
          // Fall back to mock data if API fails
          this.loadMockClubs();
        }
      });
  }

  loadMockClubs(): void {
    // Mock data - fallback when API is not available
    this.clubs = [
      {
        clubId: 1,
        firstname: 'Music',
        lastname: 'Club',
        description: 'A club for music lovers of all genres. We organize concerts, jam sessions, and music appreciation events.',
        createdAt: new Date(2023, 5, 15)
      },
      {
        clubId: 2,
        firstname: 'Coding',
        lastname: 'Club',
        description: 'Learn programming, build projects, and participate in hackathons with like-minded tech enthusiasts.',
        createdAt: new Date(2023, 3, 22)
      },
      {
        clubId: 3,
        firstname: 'Debate',
        lastname: 'Club',
        description: 'Enhance your public speaking skills and critical thinking through structured debates and discussions.',
        createdAt: new Date(2023, 1, 10)
      }
    ];
    this.filteredClubs = [...this.clubs];
  }

  getEmptyClub(): Club {
    return {
      firstname: '',
      lastname: '',
      description: ''
    };
  }

  filterClubs(): void {
    this.filteredClubs = this.clubs.filter(club => {
      // Filter by search query only (removing category and online filters)
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        return club.firstname.toLowerCase().includes(query) || 
               club.lastname.toLowerCase().includes(query) ||
               club.description.toLowerCase().includes(query);
      }
      
      return true;
    });
  }

  toggleCreateForm(): void {
    this.showCreateForm = !this.showCreateForm;
    if (this.showCreateForm) {
      this.newClub = this.getEmptyClub();
      this.showEditForm = false;
    }
  }

  openEditForm(club: Club): void {
    this.editingClub = { ...club };
    this.showEditForm = true;
    this.showCreateForm = false;
  }

  closeEditForm(): void {
    this.showEditForm = false;
  }

  createClub(): void {
    if (this.validateClub(this.newClub)) {
      this.isLoading = true;
      
      this.clubService.createClub(this.newClub)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (createdClub) => {
            this.clubs.push(createdClub);
            this.filterClubs();
            this.toggleCreateForm();
          },
          error: (err) => {
            console.error('Error creating club:', err);
            alert('Failed to create club. Please try again.');
          }
        });
    }
  }

  updateClub(): void {
    if (this.validateClub(this.editingClub) && this.editingClub.clubId !== undefined) {
      this.isLoading = true;
      
      this.clubService.updateClub(this.editingClub.clubId, this.editingClub)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (updatedClub) => {
            const index = this.clubs.findIndex(club => club.clubId === updatedClub.clubId);
            if (index !== -1) {
              this.clubs[index] = updatedClub;
              this.filterClubs();
              this.closeEditForm();
            }
          },
          error: (err) => {
            console.error('Error updating club:', err);
            alert('Failed to update club. Please try again.');
          }
        });
    }
  }

  deleteClub(clubId: number | undefined): void {
    if (clubId === undefined) {
      alert('Cannot delete club: Invalid club ID');
      return;
    }
    
    if (confirm('Are you sure you want to delete this club?')) {
      this.isLoading = true;
      
      this.clubService.deleteClub(clubId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: () => {
            this.clubs = this.clubs.filter(club => club.clubId !== clubId);
            this.filterClubs();
          },
          error: (err) => {
            console.error('Error deleting club:', err);
            alert('Failed to delete club. Please try again.');
          }
        });
    }
  }

  validateClub(club: Club): boolean {
    if (!club.firstname || club.firstname.trim() === '') {
      alert('Please enter a club first name');
      return false;
    }
    
    if (!club.lastname || club.lastname.trim() === '') {
      alert('Please enter a club last name');
      return false;
    }
    
    if (!club.description || club.description.trim() === '') {
      alert('Please enter a club description');
      return false;
    }
    
    return true;
  }

  search(): void {
    // If search query is not empty and is at least 3 characters, fetch from API
    if (this.searchQuery.trim().length >= 3) {
      this.isLoading = true;
      this.clubService.searchClubs(this.searchQuery)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (results) => {
            this.clubs = results;
            this.filterClubs();
          },
          error: (err) => {
            console.error('Error searching clubs:', err);
            // Fall back to client-side filtering only
            this.filterClubs();
          }
        });
    } else {
      // Just apply client-side filtering for short queries
      this.filterClubs();
    }
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.loadClubs(); // Reload all clubs from server
  }

  // Chat-related properties and methods below remain unchanged
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

  hasUnreadMessages(userId: string): boolean {
    return this.messages.some(message => 
      message.senderId === userId && 
      message.receiverId === this.currentUser.id && 
      !message.read
    );
  }

  getLatestMessagePreview(userId: string): string {
    const messagesWithUser = this.getMessagesForUser(userId);
    if (messagesWithUser.length === 0) return 'No messages yet';
    
    const latestMessage = messagesWithUser[messagesWithUser.length - 1];
    const preview = latestMessage.content.substring(0, 25);
    return preview.length < latestMessage.content.length ? `${preview}...` : preview;
  }

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