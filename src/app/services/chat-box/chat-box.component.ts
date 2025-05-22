import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, OnDestroy, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Subscription } from 'rxjs';
import { NavigationService } from '../../navigation/navigation.service';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  department?: string;
  isFriend?: boolean;
  isOnline?: boolean;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

@Component({
  selector: 'app-chatbox',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './chat-box.component.html',
  styleUrls: ['./chat-box.component.css']
})
export class ChatboxComponent implements OnInit, OnDestroy {
  @Input() currentUser!: User;
  @Input() users: User[] = [];
  @Input() messages: Message[] = [];
  @Input() activeChatUser: User | null = null;
  
  isOpen: boolean = false;
  
  @Output() closeChat = new EventEmitter<void>();
  @Output() openChat = new EventEmitter<User>();
  @Output() sendNewMessage = new EventEmitter<string>();
  
  newMessage: string = '';
  private subscriptions: Subscription[] = [];
  
  constructor(private chatService: NavigationService) {}
  
  ngOnInit(): void {
    // Subscribe to chat panel state changes
    this.subscriptions.push(
      this.chatService.chatPanelOpen$.subscribe((isOpen: boolean) => {
        this.isOpen = isOpen;
      })
    );
  }
  
  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
  
  selectUser(user: User): void {
    this.openChat.emit(user);
  }
  
  onCloseChat(): void {
    this.closeChat.emit();
  }
  
  onToggleChatPanel(): void {
    this.chatService.toggleChatPanel();
  }
  
  onSendMessage(): void {
    if (this.newMessage.trim()) {
      this.sendNewMessage.emit(this.newMessage);
      this.newMessage = '';
    }
  }
  
  getMessagesForUser(userId: string): Message[] {
    return this.messages.filter(message =>
      (message.senderId === userId && message.receiverId === this.currentUser.id) ||
      (message.senderId === this.currentUser.id && message.receiverId === userId)
    ).sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
  }
  
  isUserOnline(userId: string): boolean {
    const user = this.users.find(u => u.id === userId);
    return user?.isOnline || false;
  }
  
  formatMessageTime(date: Date): string {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}