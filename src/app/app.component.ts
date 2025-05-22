// app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChatboxComponent } from './services/chat-box/chat-box.component';
import { NavigationService } from './navigation/navigation.service';

// Define User and Message interfaces at the component level for use
interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ChatboxComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  // Mock data
  currentUser: User = {
    id: '1',
    name: 'Current User',
    username: 'currentuser',
    avatar: 's3.png',
    isOnline: true
  };

  users: User[] = [
    {
      id: '2',
      name: 'John Doe',
      username: 'johndoe',
      avatar: 'avatar1.png',
      department: 'Computer Science',
      isOnline: true
    },
    {
      id: '3',
      name: 'Jane Smith',
      username: 'janesmith',
      avatar: 'avatar2.png',
      department: 'Mathematics',
      isOnline: false
    }
  ];

  messages: Message[] = [];
  activeChatUser: User | null = null;

  constructor(private chatService: NavigationService) {}

  ngOnInit(): void {
    // Initialize any data if needed
  }

  onOpenChat(user: User): void {
    this.activeChatUser = user;
  }

  onCloseChat(): void {
    this.activeChatUser = null;
  }

  onSendMessage(message: string): void {
    if (this.activeChatUser) {
      const newMessage: Message = {
        id: Date.now().toString(),
        senderId: this.currentUser.id,
        receiverId: this.activeChatUser.id,
        content: message,
        timestamp: new Date(),
        read: false
      };
      this.messages.push(newMessage);
    }
  }
}