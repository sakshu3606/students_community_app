// 2. Updated NavigationService with improved toggle logic
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {
  // --- Chat & Sidebar State ---
  private sidebarOpenSubject = new BehaviorSubject<boolean>(true); // Default to open
  sidebarOpen$ = this.sidebarOpenSubject.asObservable();
  
  private chatPanelOpenSubject = new BehaviorSubject<boolean>(false);
  chatPanelOpen$ = this.chatPanelOpenSubject.asObservable();
  
  constructor(private router: Router) {}
  
  // --- Sidebar Methods ---
  setSidebar(isOpen: boolean): void {
    this.sidebarOpenSubject.next(isOpen);
    // If opening sidebar, close chat panel
    if (isOpen) {
      this.chatPanelOpenSubject.next(false);
    } else if (!this.isMobileView()) {
      // If closing sidebar on desktop, open chat panel
      this.chatPanelOpenSubject.next(true);
    }
  }
  
  toggleSidebar(): void {
    const currentState = this.sidebarOpenSubject.getValue();
    this.setSidebar(!currentState); // Use setSidebar to handle related state
  }
  
  // --- Chat Panel Methods ---
  setChatPanel(isOpen: boolean): void {
    this.chatPanelOpenSubject.next(isOpen);
    // If opening chat, close sidebar
    if (isOpen) {
      this.sidebarOpenSubject.next(false);
    } else if (!this.isMobileView()) {
      // If closing chat on desktop, open sidebar
      this.sidebarOpenSubject.next(true);
    }
  }
  
  toggleChatPanel(): void {
    const currentState = this.chatPanelOpenSubject.getValue();
    this.setChatPanel(!currentState); // Use setChatPanel to handle related state
  }
  
  // Helper to determine if in mobile view
  private isMobileView(): boolean {
    return window.innerWidth < 768;
  }
  
  // --- Routing Methods ---
  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }
  
  navigateToHome(): void {
    this.router.navigate(['/main-app-compo']);
  }
  
  navigateTo(path: string): void {
    this.router.navigate([path]);
  }
}