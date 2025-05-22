import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatboxComponent } from '../../services/chat-box/chat-box.component';
import { PostService, Post as BackendPost } from './home.service';
import { RouterModule } from '@angular/router';
import { finalize } from 'rxjs/operators';
import { User, UserService } from './userService';

interface Comment {
  id: string;
  userId: string;
  content: string;
  timestamp: Date;
}

interface Post {
  id: string;
  userId: string;
  content: string;
  title?: string;
  image?: string;
  imageUrl?: string;
  timestamp: Date;
  likes: number;
  liked: boolean;
  comments: Comment[];
  showComments?: boolean;
  tags?: string[];
  postId: string;
  // Add missing properties
  visibility: string;
  category: string;
  newComment?: string; // Add this property for two-way binding
}

interface Event {
  id: string;
  title: string;
  image: string;
  dateRange: string;
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
  selector: 'app-home',
  imports: [
    FormsModule,
    CommonModule,
    HttpClientModule,
    ChatboxComponent,
    RouterModule
  ],
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [PostService, UserService]
})
export class HomeComponent implements OnInit {
  currentUser: User = {
    id: '1',
    name: 'Sakshi Parate',
    username: 'Sakshi Parate',
    avatar: '/assets/avatar-default.jpg',
    isOnline: true
  };

  users: User[] = [];
  posts: Post[] = [];
  upcomingEvents: Event[] = [];
  suggestions: User[] = [];
  messages: Message[] = [];
  newComment: { [postId: string]: string } = {};
  newPost: string = '';
  newPostTitle: string = '';
  activeChatUser: User | null = null;
  isLoading: boolean = false;
  isLoadingSuggestions: boolean = false;
  error: string | null = null;

  constructor(
    private postService: PostService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.loadMockUserData();
    this.loadPosts();
  }

  // Added the missing visibility icon method
  getVisibilityIcon(visibility: string): string {
    switch (visibility.toLowerCase()) {
      case 'public':
        return 'public';
      case 'friends':
        return 'people';
      case 'private':
        return 'lock';
      default:
        return 'public';
    }
  }

  // Added the missing textarea resize method
  autoResizeTextarea(event: any): void {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  // Get user by ID
  getUserById(userId: string): User {
    const user = this.users.find(u => u.id === userId);
    if (!user) {
      // Return a default user if no matching user is found
      return {
        id: userId,
        name: 'Unknown User',
        username: 'unknown',
        avatar: '/assets/avatar-default.jpg'
      };
    }
    return user;
  }

  // Handle liking posts
  likePost(post: Post): void {
    // Toggle the liked state for UI feedback
    post.liked = !post.liked;
    
    // Update the likes count accordingly
    if (post.liked) {
      post.likes++;
    } else {
      post.likes--;
    }
    
    // Call the API service to update the like status
    this.postService.likePost(parseInt(post.id)).subscribe({
      next: (updatedPost: BackendPost) => {
        console.log('Post liked/unliked successfully:', updatedPost);
      },
      error: (err: any) => {
        console.error('Error liking/unliking post:', err);
        // Revert the UI changes on error
        post.liked = !post.liked;
        post.likes = post.liked ? post.likes + 1 : post.likes - 1;
      }
    });
  }

  // Add toggleComments method for expanding/collapsing comments
  toggleComments(post: Post): void {
    post.showComments = !post.showComments;
  }

  loadMockUserData(): void {
    // Mock Users - Map IDs to strings to match with backend
    this.users = [
      {
        id: '1',
        name: 'Riddham Suvagiya',
        username: 'riddham',
        avatar: 'assets/images/literary.jpg',
        department: 'B.Tech | ICT-CS',
        isOnline: true
      },
      {
        id: '2',
        name: 'MetalID',
        username: 'metalid',
        avatar: 'assets/images/s3.png',
        department: 'B.Tech | ICT-CS',
        isFriend: true,
        isOnline: false
      },
      {
        id: '3',
        name: 'Manan S',
        username: 'manan',
        avatar: 'assets/images/debate.jpg',
        isOnline: true
      }
    ];

    // Mock Events
    this.upcomingEvents = [
      {
        id: 'event1',
        title: 'Ragga',
        image: 'music.jpg',
        dateRange: 'Oct 31 - Nov 01'
      }
    ];

    // Mock Suggestions
    this.suggestions = [
      this.users.find(user => user.id === '1')!,
      this.users.find(user => user.id === '2')!,
      this.users.find(user => user.id === '3')!
    ];
    
    // Ensure no duplicates
    this.suggestions = this.suggestions.filter((user, index, self) => 
      index === self.findIndex(u => u.id === user.id)
    );

    // Mock Messages
    this.messages = [
      {
        id: 'msg1',
        senderId: '2', // metalid
        receiverId: this.currentUser.id,
        content: 'Hey there! How are you doing?',
        timestamp: new Date('2024-02-25T14:30:00'),
        read: true
      },
      {
        id: 'msg2',
        senderId: this.currentUser.id,
        receiverId: '2', // metalid
        content: 'Hi! I\'m good, thanks for asking. How about you?',
        timestamp: new Date('2024-02-25T14:35:00'),
        read: true
      }
    ];
  }

  loadPosts(): void {
    this.isLoading = true;
    this.error = null;
    
    this.postService.getAllPosts()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          console.log('Posts loading completed');
        })
      )
      .subscribe({
        next: (backendPosts) => {
          // Transform backend posts to UI posts
          this.posts = backendPosts.map(post => this.transformBackendPost(post));
          console.log('Posts loaded in component:', this.posts.length);
          
          // Check if posts are empty even though the request succeeded
          if (this.posts.length === 0) {
            console.log('No posts available to display');
          }
        },
        error: (err) => {
          console.error('Error in component while loading posts:', err);
          this.error = 'Failed to load posts. Please try again.';
          this.posts = [];
        }
      });
  }

  // Add mock posts for testing
  loadMockPosts(): void {
    const mockPosts: Post[] = [
      {
        id: '1',
        postId: '1',
        userId: '1', // Riddham
        content: 'This is a test post content. Just checking if the UI works properly!',
        title: 'Test Post',
        timestamp: new Date(),
        likes: 5,
        liked: false,
        comments: [],
        tags: ['test', 'ui'],
        imageUrl: '',
        showComments: false,
        visibility: 'public',
        category: 'General'
      },
      {
        id: '2',
        postId: '2',
        userId: '2', // metalid
        content: 'Another test post to see multiple posts in the feed.',
        timestamp: new Date(Date.now() - 86400000), // Yesterday
        likes: 12,
        liked: true,
        comments: [
          {
            id: 'c1',
            userId: '3', // manan
            content: 'Great post!',
            timestamp: new Date(Date.now() - 43200000)
          }
        ],
        tags: [],
        imageUrl: '',
        showComments: false,
        visibility: 'friends',
        category: 'Update'
      }
    ];
    
    this.posts = mockPosts;
  }

  // Transform backend post to UI model
  private transformBackendPost(backendPost: BackendPost): Post {
    // Extract userId from user object or use a default
    const userIdStr = backendPost.user?.userId.toString() || '1';
    const postIdStr = backendPost.postId.toString();
    
    // If we have backend comments, process them
    const comments: Comment[] = [];
    if (backendPost.comments && backendPost.comments.length > 0) {
      backendPost.comments.forEach(comment => {
        comments.push({
          id: comment.id.toString(),
          userId: comment.userId.toString(),
          content: comment.content,
          timestamp: new Date(comment.timestamp)
        });
      });
    }
    
    return {
      id: postIdStr,
      postId: postIdStr,
      userId: userIdStr,
      title: backendPost.title || '',
      content: backendPost.content || '',
      image: backendPost.imageUrl || '',
      imageUrl: backendPost.imageUrl || '',
      // Use createdAt as the timestamp or fall back to current date
      timestamp: new Date(backendPost.createdAt || new Date()),
      likes: backendPost.likes || 0,
      liked: backendPost.hasLiked || false,
      comments: comments,
      tags: backendPost.tags || [],
      showComments: false,
      // Add missing properties with default values
      visibility: backendPost.visibility || 'public',
      category: backendPost.category || 'General',
      newComment: ''
    };
  }

  addComment(post: Post): void {
    if (post.newComment && post.newComment.trim()) {
      // In a real implementation, you would call an API endpoint to add a comment
      // For now, just add it to the UI
      const newComment: Comment = {
        id: `comment${Date.now()}`,
        userId: this.currentUser.id,
        content: post.newComment,
        timestamp: new Date()
      };
      post.comments.push(newComment);
      post.newComment = ''; // Clear the comment for this post
    }
  }

  createPost(): void {
    if (this.newPost.trim()) {
      // Convert currentUser.id to a number (assuming it's actually a number stored as string)
      const userId = parseInt(this.currentUser.id) || 1; // Fallback to 1 if parsing fails
      
      this.postService.createPost(
        userId, 
        this.newPost,
        this.newPostTitle,
        [], // tags
        'General', // category
        'public', // visibility
        '' // imageUrl
      ).subscribe({
        next: (createdPost: BackendPost) => {
          // Add the new post to the beginning of the posts array
          this.posts.unshift(this.transformBackendPost(createdPost));
          this.newPost = '';
          this.newPostTitle = '';
        },
        error: (err: any) => {
          console.error('Error creating post:', err);
        }
      });
    }
  }

  sharePost(post: Post): void {
    // In a real app, this would open a share dialog
    alert(`Post shared: ${post.content.substring(0, 30)}...`);
  }

  sendFriendRequest(user: User): void {
    // In a real app, this would send a friend request
    alert(`Friend request sent to ${user.name}`);
    user.isFriend = true;
  }

  formatDate(date: Date): string {
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  }

  // Chat-related methods
  openChat(event: any): void {
    // If the event contains a user property
    if (event && event.user) {
      this.activeChatUser = event.user;
    } 
    // If the event is a user ID string
    else if (typeof event === 'string') {
      const userId = event;
      const user = this.users.find(u => u.id === userId);
      if (user) {
        this.activeChatUser = user;
      }
    }
    // If the event is already a User object
    else if (event && event.id && event.name && event.username) {
      this.activeChatUser = event;
    }
    
    // Mark messages from this user as read
    if (this.activeChatUser) {
      this.messages.forEach(message => {
        if (message.senderId === this.activeChatUser!.id && 
            message.receiverId === this.currentUser.id && 
            !message.read) {
          message.read = true;
        }
      });
    }
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
      
      // Simulate a response for demo purposes
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

  loadMorePosts(): void {
    // Set a loading state for pagination if needed
    this.isLoading = true;
    
    // Get the ID of the last post to use as a cursor for pagination
    const lastPostId = this.posts.length > 0 ? parseInt(this.posts[this.posts.length - 1].id) : 0;
    
    // Call the API with pagination parameters
    this.postService.getMorePosts(lastPostId).subscribe({
      next: (backendPosts) => {
        console.log('Additional posts received:', backendPosts);
        
        if (backendPosts && backendPosts.length > 0) {
          // Transform and append the new posts
          const newPosts = backendPosts.map(bp => this.transformBackendPost(bp));
          this.posts = [...this.posts, ...newPosts];
        } else {
          // Provide feedback that there are no more posts
          console.log('No more posts to load');
          // You could show a notification to the user
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching more posts:', err);
        this.error = 'Failed to load more posts. Please try again.';
        this.isLoading = false;
      }
    });
  }
}