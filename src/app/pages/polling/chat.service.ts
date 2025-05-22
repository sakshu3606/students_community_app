// services/chat.service.ts
import { Injectable } from '@angular/core';
import { Message, User } from './user.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private currentUser: User = {
    id: 'user1',
    name: 'Sakshi Parate',
    username: 'sakshi_p',
    avatar: 's3.png',
    department: 'Computer Science',
    isFriend: false,
    isOnline: true
  };
  
  private users: User[] = [
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
  
  private messages: Message[] = [
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

  constructor() { }

  getCurrentUser(): User {
    return this.currentUser;
  }

  getUsers(): User[] {
    return this.users;
  }

  getMessages(): Message[] {
    return this.messages;
  }

  openChat(event: any, currentUser: User, users: User[], messages: Message[]): User | null {
    let activeChatUser: User | null = null;
    
    // If the event contains a user property
    if (event && event.user) {
      activeChatUser = event.user;
    } 
    // If the event is a user ID string
    else if (typeof event === 'string') {
      const userId = event;
      const user = users.find(u => u.id === userId);
      if (user) {
        activeChatUser = user;
      }
    }
    // If the event is already a User object
    else if (event && event.id && event.name && event.username) {
      activeChatUser = event;
    }
    
    // Mark messages from this user as read if we've found an activeChatUser
    if (activeChatUser) {
      messages.forEach(message => {
        if (message.senderId === activeChatUser!.id && 
            message.receiverId === currentUser.id && 
            !message.read) {
          message.read = true;
        }
      });
    }
    
    return activeChatUser;
  }

  sendMessage(content: string, currentUser: User, activeChatUser: User, messages: Message[]): void {
    if (content.trim()) {
      const newMessage: Message = {
        id: `msg${Date.now()}`,
        senderId: currentUser.id,
        receiverId: activeChatUser.id,
        content: content,
        timestamp: new Date(),
        read: false
      };
      messages.push(newMessage);
      
      // Simulate a response after a brief delay for demo purposes
      if (Math.random() > 0.5 && activeChatUser.isOnline) {
        setTimeout(() => {
          const responseMessage: Message = {
            id: `msg${Date.now()}`,
            senderId: activeChatUser.id,
            receiverId: currentUser.id,
            content: this.getAutoResponse(),
            timestamp: new Date(),
            read: true
          };
          messages.push(responseMessage);
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
}