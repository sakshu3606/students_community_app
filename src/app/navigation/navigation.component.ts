// 1. First, update the NavigationComponent to import ChatboxComponent
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, Subject, Subscription } from 'rxjs';

import { PostCreationComponent } from '../services/post-creation/post-creation.component';
import { SearchDropdownComponent } from '../services/search-dropdown/search-dropdown.component';
import { SearchResult, SearchService } from '../services/search-dropdown/search.services';
import { NavigationService } from './navigation.service';
import { ChatboxComponent } from '../services/chat-box/chat-box.component';
import { Post } from '../services/post-creation/postService'; 

@Component({
  selector: 'app-navigation',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    PostCreationComponent,
    SearchDropdownComponent,
    ChatboxComponent // Add ChatboxComponent to imports
  ],
  templateUrl: './navigation.component.html',
  styleUrls: ['./navigation.component.css']
})
export class NavigationComponent implements OnInit, OnDestroy {
  isSidebarCollapsed = false;
  isMobileView = false;
  isMobileSidebarOpen = false;
  searchQuery = '';
  notificationCount = 3;
  unreadMessages = 2;
  showCreatePostModal = false;
  isChatOpen = false; // Add this to track chat state

  searchResults: SearchResult[] = [];
  isSearching = false;
  showSearchResults = false;
  private searchSubject = new Subject<string>();
  private subscriptions: Subscription[] = [];

  // Sample data for chatbox
  currentUser = {
    id: '1',
    name: 'Sakshi Parate',
    username: 'sakshiparate',
    avatar: 's3.png',
  };
  
  chatUsers = [
    { id: '2', name: 'John Doe', username: 'johndoe', avatar: 'avatar1.png', isOnline: true },
    { id: '3', name: 'Jane Smith', username: 'janesmith', avatar: 'avatar2.png', isOnline: false }
  ];
  
  chatMessages = [];
  activeChatUser = null;

  user = {
    name: 'Sakshi Parate',
    avatar: 's3.png',
    role: 'Student'
  };

  navItems = [
    { icon: 'home', label: 'Home', route: '/main-app-compo/home' },
    { icon: 'school', label: 'Academic', route: '/main-app-compo/academic' },
    { icon: 'groups', label: 'Clubs', route: '/main-app-compo/clubs' },
    { icon: 'event', label: 'Events', route: '/main-app-compo/events' },
    { icon: 'poll', label: 'Polling', route: '/main-app-compo/polling' }
  ];

  constructor(
    private router: Router,
    private searchService: SearchService,
    private navService: NavigationService
  ) {
    this.checkScreenSize();
  
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(query => {
      this.performSearch(query);
    });
  }
  
  @HostListener('window:resize')
  checkScreenSize() {
    const wasInMobileView = this.isMobileView;
    this.isMobileView = window.innerWidth < 768;
  
    if (this.isMobileView) {
      this.isSidebarCollapsed = true; // collapse in mobile
      this.navService.setSidebar(false);
    } else {
      this.isSidebarCollapsed = false; // default to open in desktop
      this.isMobileSidebarOpen = false;
      this.navService.setSidebar(true); // ensure open state
    }
  }
  
  ngOnInit() {
    this.subscriptions.push(
      this.navService.sidebarOpen$.subscribe((isOpen: boolean) => {
        if (this.isMobileView) {
          this.isMobileSidebarOpen = isOpen;
        } else {
          this.isSidebarCollapsed = !isOpen; // Sync state if needed
        }
      }),
      
      // Add subscription to chatPanel status
      this.navService.chatPanelOpen$.subscribe((isOpen: boolean) => {
        this.isChatOpen = isOpen;
      })
    );
  
    // Set default open state for sidebar on init
    if (!this.isMobileView) {
      this.isSidebarCollapsed = false;
      this.navService.setSidebar(true);
    }
  }
  
  ngOnDestroy() {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  toggleSidebar() {
    // NavigationService will handle the chat panel closing automatically
    this.navService.toggleSidebar();
  }
  
  // Helper method to toggle chat panel
  toggleChat() {
    this.navService.toggleChatPanel();
  }

  closeMobileSidebar() {
    if (this.isMobileView) {
      this.navService.setSidebar(false);
    }
  }

  // Chat event handlers
  handleCloseChat() {
    this.activeChatUser = null;
  }
  
  handleOpenChat(user: any) {
    this.activeChatUser = user;
  }
  
  handleSendMessage(message: string) {
    // Implement message sending logic if needed
    console.log('Sending message:', message);
  }

  onSearchInputChange() {
    this.searchSubject.next(this.searchQuery);
    this.searchService.updateSearchQuery(this.searchQuery);
  }

  performSearch(query: string) {
    if (!query.trim()) {
      this.searchResults = [];
      this.showSearchResults = false;
      return;
    }

    this.isSearching = true;
    this.searchService.search(query).subscribe(results => {
      this.searchResults = results;
      this.isSearching = false;
      this.showSearchResults = true;
    });
  }

  clearSearch() {
    this.searchQuery = '';
    this.searchResults = [];
    this.showSearchResults = false;
    this.searchService.clearSearch();
  }

  openCreatePostModal() {
    this.showCreatePostModal = true;
  }

  closeCreatePostModal() {
    this.showCreatePostModal = false;
  }

  handleNewPost(newPost: any) {
    console.log('New post created:', newPost);
    this.closeCreatePostModal();
    if (!this.router.url.includes('/home')) {
      this.router.navigate(['/main-app-compo/home']);
    }
  }

  openNotifications() {
    console.log('Opening notifications');
    this.notificationCount = 0;
  }

  logout() {
    console.log('Logging out');
    this.router.navigate(['/login']);
  }

  onSearch() {
    console.log('Searching for:', this.searchQuery);
    // Implement your search logic here
  }

  isPostModalOpen = false;

  openPostModal(): void {
    this.isPostModalOpen = true;
  }

  closePostModal(): void {
    this.isPostModalOpen = false;
  }

  handlePostCreated(post: Post): void {
    console.log('Post created from navigation component:', post);
    // Handle post creation (e.g., navigate to the post, show notification, etc.)
    this.isPostModalOpen = false;
  }
}